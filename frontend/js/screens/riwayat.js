// ============================================================
// Screen 10: Riwayat Tracking Timeline
// ============================================================
function renderRiwayatScreen() {
    return `
    ${renderHeader('Riwayat Tracking', 'Timeline tracking semua paket')}
    <div class="content screen-enter" id="riwayat-content">
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title"><span class="material-icons-outlined">history</span> Riwayat Tracking</div>
                    <div class="card-subtitle">Lihat timeline tracking per paket atau semua</div>
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-bottom:20px">
                <input class="form-input" type="number" id="riwayat-paketid" placeholder="ID Paket (kosongkan untuk semua)" style="max-width:300px">
                <button class="btn btn-primary" onclick="loadRiwayat()"><span class="material-icons-outlined">search</span> Cari</button>
                <button class="btn btn-secondary" onclick="loadRiwayatAll()">Lihat Semua</button>
            </div>
            <div id="riwayat-view">
                <div class="empty-state">
                    <div class="empty-state-icon"><span class="material-icons-outlined">history</span></div>
                    <div class="empty-state-title">Masukkan ID Paket</div>
                    <div class="empty-state-text">Atau klik "Lihat Semua" untuk melihat semua tracking history.</div>
                </div>
            </div>
        </div>
    </div>`;
}

async function loadRiwayat() {
    const paketId = document.getElementById('riwayat-paketid').value;
    if (!paketId) { loadRiwayatAll(); return; }

    const el = document.getElementById('riwayat-view');
    el.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';

    try {
        const data = await API.getTracking(paketId);
        if (!data.tracking || data.tracking.length === 0) {
            el.innerHTML = `<div class="empty-state" style="padding:30px">
                <div class="empty-state-icon"><span class="material-icons-outlined">inbox</span></div>
                <div class="empty-state-title">Tidak Ada Riwayat</div>
            </div>`;
            return;
        }

        el.innerHTML = `
        <div class="text-label text-muted mb-md">TIMELINE PAKET ID ${paketId}</div>
        <div class="timeline">
            ${data.tracking.reverse().map(t => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            ${renderStatusChip(t.status)}
                            <span class="timeline-date">${t.timestamp}</span>
                        </div>
                        <div style="margin-top:6px;font-size:13px;color:var(--text-secondary)">
                            <span class="material-icons-outlined">location_on</span> ${t.lokasi}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    } catch (err) {
        el.innerHTML = `<p style="color:var(--status-error)">${err.error || 'Gagal memuat tracking'}</p>`;
    }
}

async function loadRiwayatAll() {
    const el = document.getElementById('riwayat-view');
    el.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';

    try {
        const data = await API.getAllTracking();
        el.innerHTML = renderTable(
            [
                { label: 'ID', key: 'id', width: '50px' },
                { label: 'Paket ID', key: 'id_paket', width: '80px' },
                { label: 'Status', render: r => renderStatusChip(r.status) },
                { label: 'Lokasi', key: 'lokasi' },
                { label: 'Timestamp', key: 'timestamp' },
            ],
            data.tracking || [],
            { emptyMessage: 'Tidak ada tracking history' }
        );
    } catch (err) {
        el.innerHTML = `<p style="color:var(--status-error)">${err.error || 'Gagal memuat tracking'}</p>`;
    }
}
