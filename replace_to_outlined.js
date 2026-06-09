const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('./frontend', function(filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.html')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        
        // Replace class names
        content = content.replace(/material-symbols-rounded/g, 'material-symbols-outlined');
        
        // Ensure FILL is 0 in css
        if (filePath.endsWith('styles.css')) {
            content = content.replace(/'FILL' 1/g, "'FILL' 0");
        }
        
        // Update font family in HTML
        if (filePath.endsWith('index.html')) {
            content = content.replace(/Material\+Symbols\+Rounded/g, 'Material+Symbols+Outlined');
        }

        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated: ' + filePath);
        }
    }
});
