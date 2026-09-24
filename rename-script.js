const fs = require('fs');
const path = require('path');

const directory = __dirname; // Current directory

const renameConfig = {
  dirs: [
    { from: 'app/admin/houses', to: 'app/admin/properties' },
    { from: 'app/api/houses', to: 'app/api/properties' },
  ],
  files: [
    { from: 'models/house.ts', to: 'models/property.ts' },
    { from: 'services/house-service.ts', to: 'services/property-service.ts' },
    { from: 'services/renter/renter-house-service.ts', to: 'services/renter/renter-property-service.ts' },
    { from: 'app/admin/properties/hooks/useHouseModal.ts', to: 'app/admin/properties/hooks/usePropertyModal.ts' },
  ]
};

// 1. Rename Directories
renameConfig.dirs.forEach(dir => {
  const fromPath = path.join(directory, dir.from);
  const toPath = path.join(directory, dir.to);
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Renamed dir ${fromPath} to ${toPath}`);
  }
});

// 2. Rename Files
renameConfig.files.forEach(file => {
  const fromPath = path.join(directory, file.from);
  const toPath = path.join(directory, file.to);
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Renamed file ${fromPath} to ${toPath}`);
  }
});

// 3. Find and Replace in all .ts and .tsx files
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

    // Case-sensitive replacements
    content = content.replace(/House/g, 'Property');
    content = content.replace(/house/g, 'property');
    content = content.replace(/HOUSES/g, 'PROPERTIES');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
