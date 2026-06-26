// ============================================================
// Screen 7: Ambil Paket (Dequeue)
// ============================================================
function renderAmbilPaketScreen() {
    return `
    ${renderHeader('Ambil Paket', 'Dequeue paket dari antrean dan assign ke kurir')}
    <div class="content screen-enter" id="ambil-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initAmbilPaket() {
    try {
        const queue = await API.getQueue();
        const el = document.getElementById('ambil-content');
        if (!el) return;

        const nextPaket = queue.length > 0 ? queue[0] : null;

        el.innerHTML = `
        <div class="card" style="max-width:600px">
            <div class="card-header">
                <div>
                    <div class="card-title">Ambil Paket dari Antrean</div>
                    <div class="card-subtitle">Paket di depan Queue akan di-dequeue dan diassign ke kurir berikutnya (Circular List)</div>
                </div>
            </div>

            ${nextPaket ? `
                <div style="padding:20px;background:var(--bg-container-lowest);border-radius:var(--radius-lg);margin-bottom:20px;border:1px solid var(--border-primary)">
                    <div class="text-label text-muted mb-sm">PAKET SELANJUTNYA DALAM ANTREAN</div>
                    <div style="font-size:20px;font-weight:700;margin-bottom:8px">${nextPaket.resi}</div>
                    <div class="metric-row"><span class="metric-label">Penerima</span><span class="metric-value">${nextPaket.nama_penerima}</span></div>
                    <div class="metric-row"><span class="metric-label">Rute</span><span class="metric-value">${nextPaket.kota_asal} → ${nextPaket.kota_tujuan}</span></div>
                    <div class="metric-row"><span class="metric-label">Dimensi</span><span class="metric-value">${(nextPaket.berat * 6000).toFixed(0)} cm³</span></div>
                    <div class="metric-row"><span class="metric-label">Biaya</span><span class="metric-value">Rp ${formatCurrency(nextPaket.biaya)}</span></div>
                </div>
                <button class="btn btn-primary btn-lg w-full" onclick="doDequeue()" id="dequeue-btn">
                    <span class="material-icons-outlined">outbox</span> Ambil & Assign ke Kurir
                </button>
                <p class="form-hint mt-md">Sisa antrean: ${queue.length} paket</p>
            ` : `
                <div class="empty-state">
                    <div class="empty-state-icon"><span class="material-icons-outlined">inbox</span></div>
                    <div class="empty-state-title">Antrean Kosong</div>
                    <div class="empty-state-text">Tidak ada paket yang menunggu dalam antrean.</div>
                </div>
            `}
        </div>`;
    } catch (err) {
        document.getElementById('ambil-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat data</div></div>`;
    }
}

async function doDequeue() {
    const btn = document.getElementById('dequeue-btn');
    btn.disabled = true;
    btn.textContent = 'Memproses...';
    try {
        const result = await API.dequeuePaket();
        App.toast(`Paket ${result.resi} diambil → Kurir: ${result.kurir || 'Auto-assign'}`, 'success');
        initAmbilPaket();
    } catch (err) {
        App.toast(err.error || 'Gagal mengambil paket', 'error');
        btn.disabled = false;
        btn.textContent = '<span class="material-icons-outlined">outbox</span> Ambil & Assign ke Kurir';
    }
}
