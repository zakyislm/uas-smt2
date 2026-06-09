// ============================================================
// Screen 6: Daftar Kurir (Circular Linked List)
// ============================================================
function renderKurirScreen() {
    return `
    ${renderHeader('Daftar Kurir', 'Circular Linked List — Rotasi round-robin')}
    <div class="content screen-enter" id="kurir-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initKurir() {
    try {
        const data = await API.getKurir();
        const el = document.getElementById('kurir-content');
        if (!el) return;

        el.innerHTML = `
        <div class="page-header">
            <div>
                <div class="page-title"><span class="material-icons-outlined">local_shipping</span> Daftar Kurir</div>
                <div class="page-subtitle">${data.kurirs.length} kurir dalam Circular Linked List (Aktif: ${data.current || '-'})</div>
            </div>
            <button class="btn btn-primary" onclick="rotateKurirAction()"><span class="material-icons-outlined">sync</span> Rotasi Kurir</button>
        </div>

        <div class="circular-list" id="kurir-circle">
            ${data.kurirs.map(k => `
                <div class="circular-item${k.nama === data.current ? ' current' : ''}">
                    <div style="font-size:32px;margin-bottom:8px"><span class="material-icons-outlined">local_shipping</span></div>
                    <div style="font-weight:600;font-size:14px;margin-bottom:4px">${k.nama}</div>
                    <div style="margin-bottom:8px">${renderStatusChip(k.status)}</div>
                    <div style="font-size:11px;color:var(--text-muted)">Paket: ${k.total_paket}</div>
                    <div style="font-size:11px;color:var(--text-muted)">ID: ${k.id}</div>
                </div>
            `).join('')}
        </div>

        <div class="card mt-lg">
            <div class="card-title mb-md"><span class="material-icons-outlined">analytics</span> Tabel Kurir</div>
            ${renderTable(
                [
                    { label: 'ID', key: 'id', width: '60px' },
                    { label: 'Nama', key: 'nama' },
                    { label: 'Status', render: r => renderStatusChip(r.status) },
                    { label: 'Total Paket', key: 'total_paket' },
                    { label: 'Aktif', render: r => r.nama === data.current ? '<span class="badge">▶ Aktif</span>' : '-' },
                ],
                data.kurirs
            )}
        </div>`;
    } catch (err) {
        document.getElementById('kurir-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat data kurir</div></div>`;
    }
}

async function rotateKurirAction() {
    try {
        await API.rotateKurir();
        App.toast('Kurir dirotasi', 'success');
        initKurir();
    } catch (err) { App.toast('Gagal merotasi kurir', 'error'); }
}
