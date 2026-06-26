export function shouldUseNativePdfViewer(navigatorLike) {
  const userAgent = navigatorLike?.userAgent || '';
  const maxTouchPoints = Number(navigatorLike?.maxTouchPoints || 0);
  const isIPadOS = /iPad/i.test(userAgent)
    || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);

  return /iPhone|iPod|Android/i.test(userAgent) || isIPadOS;
}
