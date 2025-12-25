const fs = require('fs');
const path = require('path');

// Define which folders to look into and which to ignore
const rootDir = path.join(__dirname, '..'); // Points to web-project root
const extensions = ['.ts', '.js', '.json', '.html', '.css'];
const ignoreDirs = ['node_modules', 'dist', '.git', 'test', 'scripts'];
const outputFile = path.join(__dirname, 'project-bundle.txt');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      if (extensions.includes(path.extname(file))) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

try {
    console.log('Bundling project files...');
    const allFiles = getAllFiles(rootDir);
    let output = '';

    allFiles.forEach(file => {
      const relativePath = path.relative(rootDir, file);
      // Skip the bundle file itself if it exists
      if (file === outputFile) return;
      
      const content = fs.readFileSync(file, 'utf8');
      output += `\n// filepath: ${relativePath}\n${content}\n`;
    });

    fs.writeFileSync(outputFile, output);
    console.log(`Success! Project bundled into: ${outputFile}`);
    console.log('Please open this file, copy all text, and paste it to the AI.');
} catch (err) {
    console.error('Error bundling project:', err);
}
