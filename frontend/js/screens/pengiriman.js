// ============================================================
// Screen 3: Semua Paket / Pengiriman Grid
// ============================================================
function renderPengirimanScreen() {
    return `
    ${renderHeader('Semua Paket', 'Daftar lengkap semua paket (Singly Linked List)')}
    <div class="content screen-enter" id="pengiriman-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initPengiriman() {
    try {
        const pakets = await API.getPaket();
        const el = document.getElementById('pengiriman-content');
        if (!el) return;

        el.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title"><span class="material-icons-outlined">inventory_2</span> Data Pengiriman</div>
                <div class="page-subtitle">${pakets.length} paket tersimpan dalam Singly Linked List</div>
            </div>
            <button class="btn btn-primary" onclick="App.navigate('tambahPaket')"><span class="material-icons-outlined">add_box</span> Tambah Paket</button>
        </div>
        ${renderTable(
            [
                { label: 'ID', key: 'id', width: '50px' },
                { label: 'Resi', key: 'resi' },
                { label: 'Penerima', key: 'nama_penerima' },
                { label: 'Rute', render: r => `<span style="font-size:12px">${r.kota_asal} → ${r.kota_tujuan}</span>` },
                { label: 'Berat', render: r => `${r.berat} kg` },
                { label: 'Biaya', render: r => `Rp ${formatCurrency(r.biaya)}` },
                { label: 'Status', render: r => renderStatusChip(r.status) },
                { label: 'Aksi', width: '120px', render: r => `
                    <div class="actions">
                        <button class="btn-icon" onclick="viewPaketDetail(${r.id})" title="Detail"><span class="material-icons-outlined">visibility</span>️</button>
                        <button class="btn-icon" onclick="showEditPaket(${r.id})" title="Edit"><span class="material-icons-outlined">edit</span>️</button>
                        <button class="btn-icon" onclick="confirmDeletePaket(${r.id}, '${r.resi}')" title="Hapus"><span class="material-icons-outlined">delete</span></button>
                    </div>`
                }
            ],
            pakets,
            { emptyMessage: 'Belum ada data paket' }
        )}`;
    } catch (err) {
        document.getElementById('pengiriman-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat data</div></div>`;
    }
}

async function viewPaketDetail(id) {
    try {
        const pakets = await API.getPaket();
        const p = pakets.find(pk => pk.id === id);
        if (!p) return;
        Modal.show(`Detail Paket #${p.id}`, `
            <div class="metric-row"><span class="metric-label">Resi</span><span class="metric-value">${p.resi}</span></div>
            <div class="metric-row"><span class="metric-label">Penerima</span><span class="metric-value">${p.nama_penerima}</span></div>
            <div class="metric-row"><span class="metric-label">Alamat</span><span class="metric-value">${p.alamat_tujuan}</span></div>
            <div class="metric-row"><span class="metric-label">Rute</span><span class="metric-value">${p.kota_asal} → ${p.kota_tujuan}</span></div>
            <div class="metric-row"><span class="metric-label">Berat</span><span class="metric-value">${p.berat} kg</span></div>
            <div class="metric-row"><span class="metric-label">Biaya</span><span class="metric-value">Rp ${formatCurrency(p.biaya)}</span></div>
            <div class="metric-row"><span class="metric-label">Layanan</span><span class="metric-value">${p.layanan_nama || 'ID: ' + p.id_layanan}</span></div>
            <div class="metric-row"><span class="metric-label">Klasifikasi</span><span class="metric-value">${p.klasifikasi_nama || 'ID: ' + p.id_klasifikasi}</span></div>
            <div class="metric-row"><span class="metric-label">Kurir ID</span><span class="metric-value">${p.id_kurir || '-'}</span></div>
            <div class="metric-row"><span class="metric-label">Status</span><span class="metric-value">${renderStatusChip(p.status)}</span></div>
        `);
    } catch (err) { App.toast('Gagal memuat detail', 'error'); }
}

async function showEditPaket(id) {
    try {
        const pakets = await API.getPaket();
        const p = pakets.find(pk => pk.id === id);
        if (!p) return;
        Modal.show(`Edit Paket #${p.id}`, `
            <form id="edit-paket-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">NAMA PENERIMA</label>
                        <input class="form-input" id="edit-nama" value="${p.nama_penerima}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">ALAMAT TUJUAN</label>
                        <input class="form-input" id="edit-alamat" value="${p.alamat_tujuan}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">KOTA ASAL</label>
                        <input class="form-input" id="edit-asal" value="${p.kota_asal}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">KOTA TUJUAN</label>
                        <input class="form-input" id="edit-tujuan" value="${p.kota_tujuan}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">BERAT (KG)</label>
                        <input class="form-input" type="number" step="0.1" id="edit-berat" value="${p.berat}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">STATUS</label>
                        <select class="form-select" id="edit-status">
                            ${['menunggu','diproses','dalam_perjalanan','sampai_tujuan','terkirim'].map(s =>
                                `<option value="${s}"${s===p.status?' selected':''}>${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </form>
        `, `<button class="btn btn-secondary" onclick="Modal.hide()">Batal</button>
            <button class="btn btn-primary" onclick="submitEditPaket(${id})">Simpan</button>`);
    } catch (err) { App.toast('Gagal memuat data', 'error'); }
}

async function submitEditPaket(id) {
    const data = {
        nama_penerima: document.getElementById('edit-nama').value,
        alamat_tujuan: document.getElementById('edit-alamat').value,
        kota_asal: document.getElementById('edit-asal').value,
        kota_tujuan: document.getElementById('edit-tujuan').value,
        berat: parseFloat(document.getElementById('edit-berat').value),
        status: document.getElementById('edit-status').value
    };
    try {
        await API.editPaket(id, data);
        Modal.hide();
        App.toast('Paket berhasil diperbarui', 'success');
        initPengiriman();
    } catch (err) { App.toast('Gagal memperbarui paket', 'error'); }
}

function confirmDeletePaket(id, resi) {
    Modal.confirm('Hapus Paket', `Apakah Anda yakin ingin menghapus paket <strong>${resi}</strong>?`,
        `async function(){ try { await API.deletePaket(${id}); App.toast('Paket berhasil dihapus','success'); initPengiriman(); } catch(e){ App.toast('Gagal menghapus','error'); } }`
    );
}
