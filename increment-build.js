const fs = require('fs');
const path = require('path');

const infoPath = path.join(__dirname, 'src/common/configs/info.ts');
const fileContent = fs.readFileSync(infoPath, 'utf8');

// Pega o número atual após o "N" (ex: N01-09 -> pega 09)
const buildMatch = fileContent.match(/build: 'N01-(\d+)'/);

if (buildMatch) {
  const currentBuild = parseInt(buildMatch[1]);
  const nextBuild = (currentBuild + 1).toString().padStart(2, '0');
  
  const newContent = fileContent.replace(
    /build: 'N01-\d+'/, 
    `build: 'N01-${nextBuild}'`
  );
  
  fs.writeFileSync(infoPath, newContent);
  console.log(`✅ Build incrementado para: N01-${nextBuild}`);
}