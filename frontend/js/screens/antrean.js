// ============================================================
// Screen 5: Antrean Paket (Priority Queue)
// ============================================================
function renderAntreanScreen() {
    return `
    ${renderHeader('Antrean Paket', 'Priority Queue — Diurutkan berdasarkan prioritas layanan')}
    <div class="content screen-enter" id="antrean-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initAntrean() {
    try {
        const queue = await API.getQueue();
        const el = document.getElementById('antrean-content');
        if (!el) return;

        el.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title"><span class="material-icons-outlined">format_list_numbered</span> Antrean Paket Masuk</div>
                <div class="page-subtitle">${queue.length} paket dalam antrean (Queue - FIFO dengan Priority)</div>
            </div>
            <span class="badge">${queue.length}</span>
        </div>

        ${queue.length === 0 ? `
            <div class="empty-state">
                <div class="empty-state-icon"><span class="material-icons-outlined">inbox</span></div>
                <div class="empty-state-title">Antrean Kosong</div>
                <div class="empty-state-text">Semua paket telah diproses atau belum ada paket masuk.</div>
            </div>
        ` : `
            <div class="queue-container">
                ${queue.map((p, i) => `
                    ${i > 0 ? '<div class="queue-arrow">→</div>' : ''}
                    <div class="queue-item">
                        ${i === 0 ? '' : ''}
                        <div style="font-weight:600;color:var(--text-primary);margin-bottom:4px">${p.resi}</div>
                        <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px">${p.nama_penerima}</div>
                        <div style="font-size:11px;color:var(--text-muted)">${p.kota_asal} → ${p.kota_tujuan}</div>
                        <div style="margin-top:8px">${renderStatusChip(p.status)}</div>
                        <div style="margin-top:8px;font-size:11px">
                            <span class="priority-badge priority-badge--${p.id_layanan >= 3 ? 'high' : (p.id_layanan >= 2 ? 'medium' : 'low')}">
                                P${p.id_layanan}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="card mt-lg">
                <div class="card-title mb-md"><span class="material-icons-outlined">analytics</span> Tabel Antrean</div>
                ${renderTable(
                    [
                        { label: '#', render: (r, i) => `<span class="badge">${queue.indexOf(r) + 1}</span>`, width: '50px' },
                        { label: 'Resi', key: 'resi' },
                        { label: 'Penerima', key: 'nama_penerima' },
                        { label: 'Rute', render: r => `${r.kota_asal} → ${r.kota_tujuan}` },
                        { label: 'Berat', render: r => `${r.berat} kg` },
                        { label: 'Prioritas', render: r => `<span class="priority-badge priority-badge--${r.id_layanan >= 3 ? 'high' : (r.id_layanan >= 2 ? 'medium' : 'low')}">Layanan ${r.id_layanan}</span>` },
                    ],
                    queue
                )}
            </div>
        `}`;
    } catch (err) {
        document.getElementById('antrean-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat antrean</div></div>`;
    }
}
