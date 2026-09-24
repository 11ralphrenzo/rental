const fs = require('fs');
const path = require('path');

const directory = __dirname;

function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory() && name !== 'node_modules' && name !== '.next' && name !== '.git') {
      walkSync(filePath, callback);
    }
  });
}

walkSync(directory, function(filePath, stat) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/propertys/g, 'properties');
    content = content.replace(/PROPERTYS/g, 'PROPERTIES');
    content = content.replace(/Propertys/g, 'Properties');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed typo in ${filePath}`);
    }
  }
});
