// ============================================================
// Screen 12: Filter Data Framework
// ============================================================
function renderFilterDataScreen() {
    return `
    ${renderHeader('Filter Data', 'Framework pencarian dan filtering paket')}
    <div class="content screen-enter" id="filter-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initFilterData() {
    try {
        const cities = await API.getCities();
        const el = document.getElementById('filter-content');
        if (!el) return;

        el.innerHTML = `
        <div class="card">
            <div class="card-title mb-md"><span class="material-icons-outlined">search</span> Filter Paket</div>
            <div class="filter-bar">
                <div class="form-group">
                    <label class="form-label">STATUS</label>
                    <select class="form-select" id="fl-status">
                        <option value="">Semua Status</option>
                        <option value="menunggu">Menunggu</option>
                        <option value="diproses">Diproses</option>
                        <option value="dalam_perjalanan">Dalam Perjalanan</option>
                        <option value="sampai_tujuan">Sampai Tujuan</option>
                        <option value="terkirim">Terkirim</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">KOTA ASAL</label>
                    <select class="form-select" id="fl-asal">
                        <option value="">Semua Kota</option>
                        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">KOTA TUJUAN</label>
                    <select class="form-select" id="fl-tujuan">
                        <option value="">Semua Kota</option>
                        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">CARI RESI / PENERIMA</label>
                    <input class="form-input" id="fl-search" placeholder="Kata kunci...">
                </div>
                <button class="btn btn-primary" onclick="applyFilter()"><span class="material-icons-outlined">search</span> Terapkan</button>
                <button class="btn btn-ghost" onclick="clearFilter()"><span class="material-icons-outlined">close</span> Reset</button>
            </div>
        </div>
        <div class="mt-lg" id="filter-results">
            <div class="empty-state">
                <div class="empty-state-icon"><span class="material-icons-outlined">search</span></div>
                <div class="empty-state-title">Gunakan filter di atas</div>
                <div class="empty-state-text">Pilih kriteria dan klik Terapkan untuk mencari paket.</div>
            </div>
        </div>`;
    } catch (err) {
        document.getElementById('filter-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat data</div></div>`;
    }
}

async function applyFilter() {
    const params = {};
    const status = document.getElementById('fl-status').value;
    const asal = document.getElementById('fl-asal').value;
    const tujuan = document.getElementById('fl-tujuan').value;
    const search = document.getElementById('fl-search').value;
    if (status) params.status = status;
    if (asal) params.kota_asal = asal;
    if (tujuan) params.kota_tujuan = tujuan;
    if (search) params.search = search;

    const el = document.getElementById('filter-results');
    el.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';

    try {
        const data = await API.filterPaket(params);
        el.innerHTML = `
        <div class="page-header">
            <div class="page-subtitle">${data.length} paket ditemukan</div>
        </div>
        ${renderTable(
            [
                { label: 'ID', key: 'id', width: '50px' },
                { label: 'Resi', key: 'resi' },
                { label: 'Penerima', key: 'nama_penerima' },
                { label: 'Rute', render: r => `${r.kota_asal} → ${r.kota_tujuan}` },
                { label: 'Berat', render: r => `${r.berat} kg` },
                { label: 'Biaya', render: r => `Rp ${formatCurrency(r.biaya)}` },
                { label: 'Status', render: r => renderStatusChip(r.status) },
            ],
            data,
            { emptyMessage: 'Tidak ada paket yang cocok dengan filter' }
        )}`;
    } catch (err) {
        el.innerHTML = `<p style="color:var(--status-error)">${err.error || 'Gagal memuat data'}</p>`;
    }
}

function clearFilter() {
    document.getElementById('fl-status').value = '';
    document.getElementById('fl-asal').value = '';
    document.getElementById('fl-tujuan').value = '';
    document.getElementById('fl-search').value = '';
    document.getElementById('filter-results').innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><span class="material-icons-outlined">search</span></div>
            <div class="empty-state-title">Filter direset</div>
        </div>`;
}
