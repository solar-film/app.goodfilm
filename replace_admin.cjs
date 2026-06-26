const fs = require('fs');

const adminPanelPath = 'src/AdminPanel.jsx';
let content = fs.readFileSync(adminPanelPath, 'utf8');

const targetStr = `        {activeTab === 'portfolio' && (
          <PortfolioManager 
            seriesList={seriesList} 
            modelsList={modelsList}
            portfolioList={portfolioList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('portfolio', id)} 
          />
        )}`;

// Let's just find the end of PortfolioManager block.
const findStr = "onDelete={(id) => handleDelete('portfolio', id)} \n          />\n        )}";

const replacementStr = `onDelete={(id) => handleDelete('portfolio', id)} 
          />
        )}

        {activeTab === 'videos' && (
          <VideoManager 
            seriesList={seriesList} 
            videosList={videosList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('videos', id)} 
          />
        )}`;

if (content.includes(findStr)) {
  content = content.replace(findStr, replacementStr);
  fs.writeFileSync(adminPanelPath, content, 'utf8');
  console.log("Successfully added VideoManager render block.");
} else {
  // Let's try replacing with regex
  const regex = /<PortfolioManager[\s\S]*?\/>\s*\)\}/;
  if (regex.test(content)) {
    content = content.replace(regex, (match) => {
        return match + `\n\n        {activeTab === 'videos' && (
          <VideoManager 
            seriesList={seriesList} 
            videosList={videosList} 
            onRefresh={loadData} 
            onDelete={(id) => handleDelete('videos', id)} 
          />
        )}`;
    });
    fs.writeFileSync(adminPanelPath, content, 'utf8');
    console.log("Successfully added VideoManager render block using Regex.");
  } else {
    console.log("Regex also failed.");
  }
}
