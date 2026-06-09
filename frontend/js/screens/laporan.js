// ============================================================
// Screen 11: Laporan Operasional / Financials
// ============================================================
function renderLaporanScreen() {
    return `
    ${renderHeader('Laporan Operasional', 'Statistik dan laporan keuangan CEO')}
    <div class="content screen-enter" id="laporan-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initLaporan() {
    try {
        const data = await API.getReport();
        const el = document.getElementById('laporan-content');
        if (!el) return;

        el.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-success-bg);color:var(--status-success)"><span class="material-icons-outlined">payments</span></div>
                <div class="stat-card-value">Rp ${formatCurrency(data.total_biaya)}</div>
                <div class="stat-card-label">Total Pendapatan</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-info-bg);color:var(--status-info)"><span class="material-icons-outlined">inventory_2</span></div>
                <div class="stat-card-value">${data.total_paket}</div>
                <div class="stat-card-label">Total Paket</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-warning-bg);color:var(--status-warning)"><span class="material-icons-outlined">scale</span></div>
                <div class="stat-card-value">${data.total_berat.toFixed(1)}</div>
                <div class="stat-card-label">Total Berat (kg)</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-icon" style="background:var(--status-process-bg);color:var(--status-process)"><span class="material-icons-outlined">local_shipping</span></div>
                <div class="stat-card-value">${data.total_kurir}</div>
                <div class="stat-card-label">Total Kurir</div>
            </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--gutter)">
            <div class="card">
                <div class="card-title mb-md"><span class="material-icons-outlined">analytics</span> Rata-rata</div>
                <div class="metric-row"><span class="metric-label">Rata-rata Biaya/Paket</span><span class="metric-value">Rp ${formatCurrency(data.rata_biaya)}</span></div>
                <div class="metric-row"><span class="metric-label">Rata-rata Berat/Paket</span><span class="metric-value">${data.rata_berat.toFixed(1)} kg</span></div>
                <div class="metric-row"><span class="metric-label">Paket Termahal</span><span class="metric-value">${data.paket_termahal || '-'}</span></div>
                <div class="metric-row"><span class="metric-label">Biaya Tertinggi</span><span class="metric-value positive">Rp ${formatCurrency(data.biaya_tertinggi)}</span></div>
            </div>
            <div class="card">
                <div class="card-title mb-md"><span class="material-icons-outlined">trending_up</span> Status Breakdown</div>
                ${(data.status_breakdown || []).map(s => {
                    const pct = data.total_paket > 0 ? ((s.count / data.total_paket) * 100).toFixed(0) : 0;
                    return `
                    <div style="margin-bottom:12px">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                            ${renderStatusChip(s.status)}
                            <span style="font-size:12px;color:var(--text-muted)">${s.count} (${pct}%)</span>
                        </div>
                        <div style="height:6px;background:var(--bg-container-lowest);border-radius:var(--radius-pill);overflow:hidden">
                            <div style="height:100%;width:${pct}%;background:var(--accent-primary);border-radius:var(--radius-pill);transition:width 0.5s ease"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>

        <div class="card mt-lg">
            <div class="card-header">
                <div class="card-title"><span class="material-icons-outlined">format_list_numbered</span> Laporan Lengkap Semua Paket</div>
            </div>
            ${renderTable(
                [
                    { label: 'ID', key: 'id', width: '50px' },
                    { label: 'Resi', key: 'resi' },
                    { label: 'Penerima', key: 'nama_penerima' },
                    { label: 'Kota Tujuan', key: 'kota_tujuan' },
                    { label: 'Berat', render: r => `${r.berat} kg` },
                    { label: 'Biaya', render: r => `Rp ${formatCurrency(r.biaya)}` },
                    { label: 'Status', render: r => renderStatusChip(r.status) },
                ],
                data.pakets || []
            )}
        </div>`;
    } catch (err) {
        document.getElementById('laporan-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat laporan</div></div>`;
    }
}
