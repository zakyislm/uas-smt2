const fs = require('fs');
const path = require('path');
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}]/gu;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
        else callback(dirPath);
    });
}

walkDir('./frontend', function(filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let match;
        while ((match = emojiRegex.exec(content)) !== null) {
            console.log(`File: ${filePath} Emoji: ${match[0]}`);
        }
    }
});
