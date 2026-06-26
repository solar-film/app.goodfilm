param(
  [Parameter(Mandatory = $true)]
  [string]$RootPath,

  [string]$ApiBaseUrl = 'https://nas.goodfilmshop.com',

  [switch]$Apply
)

$ErrorActionPreference = 'Stop'

function Get-EnvValue([string]$Path, [string]$Name) {
  $line = Get-Content -LiteralPath $Path | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -First 1
  if (-not $line) { throw "$Name was not found in $Path" }
  return (($line -replace "^$([regex]::Escape($Name))=", '').Trim().Trim('"').Trim("'"))
}

function Invoke-AdminJson {
  param(
    [Parameter(Mandatory = $true)][string]$Uri,
    [Parameter(Mandatory = $true)][string]$Method,
    [object]$Body,
    [Parameter(Mandatory = $true)]$Session
  )

  $parameters = @{
    Uri = $Uri
    Method = $Method
    WebSession = $Session
    TimeoutSec = 30
  }
  if ($null -ne $Body) {
    $parameters.ContentType = 'application/json; charset=utf-8'
    $parameters.Body = $Body | ConvertTo-Json -Depth 20 -Compress
  }
  return Invoke-RestMethod @parameters
}

$databasePath = Join-Path $RootPath 'data\database.json'
$envPath = Join-Path $RootPath '.env'
$backupDir = Join-Path $RootPath 'backups'
$sourceDir = Join-Path $RootPath 'public\download\e-catalog'
$targetDir = Join-Path $RootPath 'public\portfolio'

foreach ($requiredPath in @($databasePath, $sourceDir, $targetDir)) {
  if (-not (Test-Path -LiteralPath $requiredPath)) { throw "Required path not found: $requiredPath" }
}

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
if (Test-Path -LiteralPath $envPath) {
  $adminPassword = Get-EnvValue -Path $envPath -Name 'ADMIN_PASSWORD'
  $login = Invoke-AdminJson -Uri "$ApiBaseUrl/auth/login" -Method Post -Body @{ password = $adminPassword } -Session $session
  if (-not $login.authenticated) { throw 'Admin login failed.' }
}

$portfolioResponse = Invoke-AdminJson -Uri "$ApiBaseUrl/portfolio" -Method Get -Body $null -Session $session
$portfolio = @(foreach ($item in $portfolioResponse) { $item })
$samples = @($portfolio | Where-Object { $_.type -eq 'sample' })
$referencedNames = @{}
foreach ($sample in $samples) {
  foreach ($slot in 1..4) {
    $value = $sample.("image$slot")
    if ($value) { $referencedNames[[IO.Path]::GetFileName([string]$value)] = $sample.id }
  }
}

$rows = @()
foreach ($file in Get-ChildItem -LiteralPath $sourceDir -File) {
  $match = [regex]::Match($file.Name, '^(\d+)-sample-[1-4]-\d+\.(jpg|jpeg|png|webp)$', 'IgnoreCase')
  if (-not $match.Success) { continue }
  $rows += [pscustomobject]@{
    Name = $file.Name
    FullName = $file.FullName
    Lead = [int64]$match.Groups[1].Value
    Extension = $file.Extension.ToLowerInvariant()
    Hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
  }
}

if ($rows.Count -eq 0) { throw 'No sample image files were found.' }

$canonicalByHash = @{}
foreach ($group in ($rows | Group-Object Hash)) {
  $preferred = @($group.Group | Where-Object { $referencedNames.ContainsKey($_.Name) } | Sort-Object Lead | Select-Object -First 1)
  $canonical = if ($preferred.Count -gt 0) { $preferred[0] } else { @($group.Group | Sort-Object Lead | Select-Object -First 1)[0] }
  $targetName = "recovered-$($group.Name.Substring(0, 16).ToLowerInvariant())$($canonical.Extension)"
  $canonicalByHash[$group.Name] = [pscustomobject]@{
    Source = $canonical
    TargetName = $targetName
    TargetPath = Join-Path $targetDir $targetName
    Url = "/portfolio/$targetName"
  }
}

$hashByName = @{}
foreach ($row in $rows) { $hashByName[$row.Name] = $row.Hash }

$referencedHashes = @{}
foreach ($name in $referencedNames.Keys) {
  if ($hashByName.ContainsKey($name)) { $referencedHashes[$hashByName[$name]] = $true }
}

$unreferencedHashes = @($canonicalByHash.Keys | Where-Object { -not $referencedHashes.ContainsKey($_) } | Sort-Object)
$duplicateCount = $rows.Count - $canonicalByHash.Count
$plan = [ordered]@{
  originalFiles = $rows.Count
  uniqueImages = $canonicalByHash.Count
  duplicateFiles = $duplicateCount
  existingSampleRecords = $samples.Count
  existingReferencedImages = $referencedHashes.Count
  recoveredRecordsToCreate = $unreferencedHashes.Count
  finalSampleRecords = $samples.Count + $unreferencedHashes.Count
  finalDisplayedImages = $referencedHashes.Count + $unreferencedHashes.Count
}

if (-not $Apply) {
  $plan | ConvertTo-Json
  exit 0
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDatabasePath = Join-Path $backupDir "database-$timestamp-before-sample-dedupe.json"
$manifestPath = Join-Path $backupDir "sample-dedupe-$timestamp-manifest.json"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item -LiteralPath $databasePath -Destination $backupDatabasePath

$manifest = [ordered]@{
  createdAt = (Get-Date).ToString('o')
  plan = $plan
  databaseBackup = $backupDatabasePath
  files = @($rows | Sort-Object Lead | ForEach-Object {
    [ordered]@{
      original = $_.FullName
      hash = $_.Hash
      retainedAs = $canonicalByHash[$_.Hash].TargetPath
    }
  })
}
[IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 10), [Text.UTF8Encoding]::new($false))

$createdIds = [System.Collections.Generic.List[string]]::new()
$updatedOriginals = [System.Collections.Generic.List[object]]::new()
$copiedTargets = [System.Collections.Generic.List[string]]::new()

try {
  foreach ($entry in $canonicalByHash.Values) {
    if (-not (Test-Path -LiteralPath $entry.TargetPath)) {
      Copy-Item -LiteralPath $entry.Source.FullName -Destination $entry.TargetPath
      $copiedTargets.Add($entry.TargetPath)
    }
  }

  foreach ($sample in $samples) {
    $changed = $false
    $updated = [ordered]@{}
    foreach ($property in $sample.PSObject.Properties) { $updated[$property.Name] = $property.Value }
    foreach ($slot in 1..4) {
      $key = "image$slot"
      $value = [string]$sample.$key
      if (-not $value) { continue }
      $name = [IO.Path]::GetFileName($value)
      if (-not $hashByName.ContainsKey($name)) { continue }
      $newUrl = $canonicalByHash[$hashByName[$name]].Url
      if ($value -ne $newUrl) {
        $updated[$key] = $newUrl
        $changed = $true
      }
    }
    if ($changed) {
      $updatedOriginals.Add($sample)
      Invoke-AdminJson -Uri "$ApiBaseUrl/portfolio/$($sample.id)" -Method Put -Body $updated -Session $session | Out-Null
    }
  }

  $index = 0
  foreach ($hash in $unreferencedHashes) {
    $index += 1
    $entry = $canonicalByHash[$hash]
    $id = "recovered-$($hash.Substring(0, 16).ToLowerInvariant())"
    $record = [ordered]@{
      id = $id
      type = 'sample'
      seriesId = ''
      modelId = ''
      title = "Recovered sample pending review #$index"
      label1 = 'Recovered from an existing file; please verify and select the product model.'
      label2 = ''
      label3 = ''
      label4 = ''
      image1 = $entry.Url
      image2 = ''
      image3 = ''
      image4 = ''
      recovered = $true
      recoveredFrom = $entry.Source.Name
      contentHash = $hash
    }
    Invoke-AdminJson -Uri "$ApiBaseUrl/portfolio" -Method Post -Body $record -Session $session | Out-Null
    $createdIds.Add($id)
  }

  foreach ($row in $rows) { Remove-Item -LiteralPath $row.FullName -Force }
} catch {
  foreach ($id in $createdIds) {
    try { Invoke-AdminJson -Uri "$ApiBaseUrl/portfolio/$id" -Method Delete -Body $null -Session $session | Out-Null } catch { }
  }
  foreach ($original in $updatedOriginals) {
    try { Invoke-AdminJson -Uri "$ApiBaseUrl/portfolio/$($original.id)" -Method Put -Body $original -Session $session | Out-Null } catch { }
  }
  foreach ($target in $copiedTargets) {
    try { Remove-Item -LiteralPath $target -Force } catch { }
  }
  throw
}

$finalPortfolioResponse = Invoke-AdminJson -Uri "$ApiBaseUrl/portfolio" -Method Get -Body $null -Session $session
$finalPortfolio = @(foreach ($item in $finalPortfolioResponse) { $item })
$finalSamples = @($finalPortfolio | Where-Object { $_.type -eq 'sample' })
$finalImageCount = 0
foreach ($sample in $finalSamples) {
  foreach ($slot in 1..4) { if ($sample.("image$slot")) { $finalImageCount += 1 } }
}

[ordered]@{
  success = $true
  backup = $backupDatabasePath
  manifest = $manifestPath
  deletedOriginalFiles = $rows.Count
  retainedUniqueFiles = $canonicalByHash.Count
  duplicateFilesRemoved = $duplicateCount
  finalSampleRecords = $finalSamples.Count
  finalDisplayedImages = $finalImageCount
} | ConvertTo-Json
