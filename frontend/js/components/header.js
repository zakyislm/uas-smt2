// ============================================================
// Header Component
// ============================================================
function renderHeader(title, subtitle) {
    return `
    <header class="header">
        <div>
            <h1 class="header-title">${title}</h1>
            ${subtitle ? `<div class="text-body text-muted" style="font-size:12px;margin-top:-2px">${subtitle}</div>` : ''}
        </div>
        <div class="header-actions">
            <button class="btn btn-secondary btn-sm" onclick="App.saveData()" title="Simpan Data">
                <span class="material-icons-outlined">save</span> Simpan
            </button>
        </div>
    </header>`;
}
