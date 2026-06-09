// ============================================================
// Reusable Data Table Component
// ============================================================
function renderTable(columns, rows, options = {}) {
    const { emptyMessage = 'Tidak ada data', onRowClick = null } = options;

    if (!rows || rows.length === 0) {
        return `<div class="empty-state">
            <div class="empty-state-icon"><span class="material-icons-outlined">inbox</span></div>
            <div class="empty-state-title">${emptyMessage}</div>
        </div>`;
    }

    let thead = '<tr>';
    for (const col of columns) {
        thead += `<th${col.width ? ` style="width:${col.width}"` : ''}>${col.label}</th>`;
    }
    thead += '</tr>';

    let tbody = '';
    for (const row of rows) {
        const clickAttr = onRowClick ? ` style="cursor:pointer" onclick="${onRowClick}(${row.id || 0})"` : '';
        tbody += `<tr${clickAttr}>`;
        for (const col of columns) {
            const val = col.render ? col.render(row) : (row[col.key] ?? '-');
            tbody += `<td>${val}</td>`;
        }
        tbody += '</tr>';
    }

    return `
    <div class="data-table-wrapper">
        <table class="data-table">
            <thead>${thead}</thead>
            <tbody>${tbody}</tbody>
        </table>
    </div>`;
}
