// ============================================================
// Screen 2: Overview Dashboard
// ============================================================
function renderDashboardScreen() {
    return `
    ${renderHeader('Overview Dashboard', 'Ringkasan operasional SwiftExpedition')}
    <div class="content screen-enter" id="dashboard-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initDashboard() {
    try {
        const stats = await API.getStats();
        const el = document.getElementById('dashboard-content');
        if (!el) return;

        el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-info-bg);color:var(--status-info)"><span class="material-icons-outlined">inventory_2</span></div>
                <div class="stat-card-value">${stats.total_paket}</div>
                <div class="stat-card-label">Total Paket</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-warning-bg);color:var(--status-warning)"><span class="material-icons-outlined">pending_actions</span></div>
                <div class="stat-card-value">${stats.menunggu}</div>
                <div class="stat-card-label">Menunggu</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-process-bg);color:var(--status-process)"><span class="material-icons-outlined">local_shipping</span></div>
                <div class="stat-card-value">${stats.dalam_perjalanan}</div>
                <div class="stat-card-label">Dalam Perjalanan</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-success-bg);color:var(--status-success)"><span class="material-icons-outlined">check_circle</span></div>
                <div class="stat-card-value">${stats.terkirim}</div>
                <div class="stat-card-label">Terkirim</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--gutter)">
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title"><span class="material-icons-outlined">payments</span> Ringkasan Keuangan</div>
                        <div class="card-subtitle">Statistik biaya pengiriman</div>
                    </div>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Pendapatan</span>
                    <span class="metric-value positive">Rp ${formatCurrency(stats.total_biaya)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Rata-rata Biaya</span>
                    <span class="metric-value">Rp ${formatCurrency(stats.rata_biaya)}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Berat</span>
                    <span class="metric-value">${stats.total_berat.toFixed(1)} kg</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Rata-rata Berat</span>
                    <span class="metric-value">${stats.rata_berat.toFixed(1)} kg</span>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title"><span class="material-icons-outlined">analytics</span> Status Distribusi</div>
                        <div class="card-subtitle">Breakdown paket berdasarkan status</div>
                    </div>
                </div>
                ${(stats.status_breakdown || []).map(s => `
                    <div class="metric-row">
                        <span class="metric-label">${renderStatusChip(s.status)}</span>
                        <span class="metric-value">${s.count} paket</span>
                    </div>
                `).join('')}
                <div class="metric-row">
                    <span class="metric-label">Dalam Antrean (Queue)</span>
                    <span class="metric-value">${stats.queue_size} paket</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Kurir</span>
                    <span class="metric-value">${stats.total_kurir}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Tracking Entry</span>
                    <span class="metric-value">${stats.total_tracking}</span>
                </div>
            </div>
        </div>

        <div class="card mt-lg">
            <div class="card-header">
                <div>
                    <div class="card-title"><span class="material-icons-outlined">inventory_2</span> Paket Terbaru</div>
                    <div class="card-subtitle">5 paket terakhir ditambahkan</div>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="App.navigate('pengiriman')">Lihat Semua →</button>
            </div>
            ${renderTable(
                [
                    { label: 'ID', key: 'id', width: '60px' },
                    { label: 'Resi', key: 'resi' },
                    { label: 'Penerima', key: 'nama_penerima' },
                    { label: 'Rute', render: r => `${r.kota_asal} → ${r.kota_tujuan}` },
                    { label: 'Biaya', render: r => `Rp ${formatCurrency(r.biaya)}` },
                    { label: 'Status', render: r => renderStatusChip(r.status) }
                ],
                (stats.recent_paket || []).slice(0, 5)
            )}
        </div>`;
    } catch (err) {
        document.getElementById('dashboard-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div>
             <div class="empty-state-title">Gagal memuat data</div>
             <div class="empty-state-text">${err.error || 'Koneksi ke server gagal'}</div></div>`;
    }
}

function formatCurrency(val) {
    return Number(val || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}
