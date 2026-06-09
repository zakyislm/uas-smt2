const fs = require('fs');
const path = require('path');

const replacements = {
    '📦': '<span class="material-symbols-rounded">inventory_2</span>',
    '📊': '<span class="material-symbols-rounded">analytics</span>',
    '➕': '<span class="material-symbols-rounded">add_box</span>',
    '📋': '<span class="material-symbols-rounded">format_list_numbered</span>',
    '🚚': '<span class="material-symbols-rounded">local_shipping</span>',
    '📤': '<span class="material-symbols-rounded">outbox</span>',
    '🔄': '<span class="material-symbols-rounded">sync</span>',
    '↩️': '<span class="material-symbols-rounded">undo</span>',
    '📜': '<span class="material-symbols-rounded">history</span>',
    '📈': '<span class="material-symbols-rounded">trending_up</span>',
    '🔍': '<span class="material-symbols-rounded">search</span>',
    '⇅': '<span class="material-symbols-rounded">sort</span>',
    '🗺️': '<span class="material-symbols-rounded">map</span>',
    '🌐': '<span class="material-symbols-rounded">hub</span>',
    '⏏': '<span class="material-symbols-rounded">logout</span>',
    '⏳': '<span class="material-symbols-rounded">pending_actions</span>',
    '✅': '<span class="material-symbols-rounded">check_circle</span>',
    '💰': '<span class="material-symbols-rounded">payments</span>',
    '⚠️': '<span class="material-symbols-rounded">warning</span>',
    '❌': '<span class="material-symbols-rounded">cancel</span>',
    'ℹ️': '<span class="material-symbols-rounded">info</span>',
    '🚧': '<span class="material-symbols-rounded">construction</span>',
    '🔒': '<span class="material-symbols-rounded">lock</span>',
    '⚖️': '<span class="material-symbols-rounded">scale</span>',
    '📍': '<span class="material-symbols-outlined">location_on</span>',
    '🛤️': '<span class="material-symbols-outlined">route</span>',
    '🗑️': '<span class="material-symbols-outlined">delete</span>',
    '💾': '<span class="material-symbols-outlined">save</span>',
    '✕': '<span class="material-symbols-outlined">close</span>',
    '📭': '<span class="material-symbols-outlined">inbox</span>',
    '👑': '<span class="material-symbols-outlined">admin_panel_settings</span>',
    '⚙': '<span class="material-symbols-outlined">settings</span>',
    '👁': '<span class="material-symbols-outlined">visibility</span>',
    '✏': '<span class="material-symbols-outlined">edit</span>'
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('./frontend/js', function(filePath) {
    if (filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        for (let key in replacements) {
            content = content.split(key).join(replacements[key]);
        }
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated: ' + filePath);
        }
    }
});
