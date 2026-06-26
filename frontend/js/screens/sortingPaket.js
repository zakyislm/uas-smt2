// ============================================================
// Screen 13: Sorting Paket Widget
// ============================================================
function renderSortingPaketScreen() {
    return `
    ${renderHeader('Sorting Paket', 'Urutkan paket berdasarkan biaya atau dimensi')}
    <div class="content screen-enter" id="sorting-content">
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Sorting Paket</div>
                    <div class="card-subtitle">Menggunakan std::sort (Introsort O(n log n))</div>
                </div>
            </div>
            <div class="tabs" id="sort-tabs">
                <div class="tab active" onclick="doSort('biaya','asc',this)"><span class="material-icons-outlined">payments</span> Biaya <span class="material-icons-outlined" style="font-size:14px">arrow_upward</span></div>
                <div class="tab" onclick="doSort('biaya','desc',this)"><span class="material-icons-outlined">payments</span> Biaya <span class="material-icons-outlined" style="font-size:14px">arrow_downward</span></div>
                <div class="tab" onclick="doSort('berat','asc',this)"><span class="material-icons-outlined">scale</span> Dimensi <span class="material-icons-outlined" style="font-size:14px">arrow_upward</span></div>
                <div class="tab" onclick="doSort('berat','desc',this)"><span class="material-icons-outlined">scale</span> Dimensi <span class="material-icons-outlined" style="font-size:14px">arrow_downward</span></div>
            </div>
            <div id="sort-results">
                <div class="loading-overlay"><div class="loading-spinner"></div></div>
            </div>
        </div>
    </div>`;
}

async function initSortingPaket() {
    doSort('biaya', 'asc', document.querySelector('.tab.active'));
}

async function doSort(by, order, tabEl) {
    // Update active tab
    document.querySelectorAll('#sort-tabs .tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');

    const el = document.getElementById('sort-results');
    el.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';

    try {
        const data = await API.sortPaket(by, order);
        const label = by === 'biaya' ? 'Biaya' : 'Dimensi';
        const dir = order === 'asc' ? 'Ascending' : 'Descending';

        el.innerHTML = `
        <div class="page-subtitle mb-md">Diurutkan berdasarkan ${label} (${dir}) — ${data.length} paket</div>
        ${renderTable(
            [
                { label: '#', render: (r, i) => data.indexOf(r) + 1, width: '40px' },
                { label: 'Resi', key: 'resi' },
                { label: 'Penerima', key: 'nama_penerima' },
                { label: 'Dimensi', render: r => `<span style="font-weight:${by==='berat'?'700':'400'}">${(r.berat * 6000).toFixed(0)} cm³</span>` },
                { label: 'Biaya', render: r => `<span style="font-weight:${by==='biaya'?'700':'400'}">Rp ${formatCurrency(r.biaya)}</span>` },
                { label: 'Status', render: r => renderStatusChip(r.status) },
            ],
            data
        )}`;
    } catch (err) {
        el.innerHTML = `<p style="color:var(--status-error)">${err.error || 'Gagal memuat data'}</p>`;
    }
}
