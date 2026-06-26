// ============================================================
// Screen 2: Overview Dashboard (CEO & Manager only)
// ============================================================

let dashboardState = {
    allPakets: [],
    filteredPakets: [],
    period: 'Y', // Default active period: Y (YTD)
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
    chart: null,
    totalKurir: 0,
    totalTracking: 0,
    queueSize: 0,
    statusBreakdown: []
};

function renderDashboardScreen() {
    return `
    ${renderHeader('Overview Dashboard', 'Statistik dan Laporan Operasional Terpadu')}
    <div class="content screen-enter" id="dashboard-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initDashboard() {
    try {
        const data = await API.getReport();
        dashboardState.allPakets = data.pakets || [];
        dashboardState.totalKurir = data.total_kurir || 0;
        dashboardState.totalTracking = data.total_tracking || 0;
        dashboardState.queueSize = data.queue_size || 0;
        dashboardState.statusBreakdown = data.status_breakdown || [];
        
        // Reset state on initial load
        dashboardState.searchQuery = '';
        dashboardState.currentPage = 1;

        updateDashboardUI();
    } catch (err) {
        document.getElementById('dashboard-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div>
             <div class="empty-state-title">Gagal memuat dashboard</div>
             <div class="empty-state-text">${err.error || 'Koneksi ke server gagal'}</div></div>`;
    }
}

function parsePackageDate(dateStr) {
    if (!dateStr) return new Date(2026, 5, 26); // Default fallback
    const parts = dateStr.split(' ');
    const dParts = parts[0].split('-');
    const tParts = parts[1] ? parts[1].split(':') : [0, 0, 0];
    return new Date(dParts[0], dParts[1] - 1, dParts[2], tParts[0], tParts[1], tParts[2]);
}

function updateDashboardUI() {
    const el = document.getElementById('dashboard-content');
    if (!el) return;

    // Filter packages by period
    // Reference date is June 26, 2026 (the last date in generated data)
    const refDate = new Date(2026, 5, 26, 23, 59, 59);
    const startOfDay = new Date(2026, 5, 26, 0, 0, 0);
    
    // Calculate start time based on period
    let startTime = null;
    if (dashboardState.period === 'D') {
        startTime = startOfDay;
    } else if (dashboardState.period === 'W') {
        startTime = new Date(2026, 5, 20, 0, 0, 0); // 7 days ending June 26
    } else if (dashboardState.period === 'M') {
        startTime = new Date(2026, 4, 30, 0, 0, 0); // May 30 to June 26
    } else if (dashboardState.period === 'Y') {
        startTime = new Date(2026, 0, 1, 0, 0, 0); // YTD 2026
    } else {
        startTime = new Date(2025, 0, 1, 0, 0, 0); // All time
    }

    // Filter packages
    dashboardState.filteredPakets = dashboardState.allPakets.filter(p => {
        const pDate = parsePackageDate(p.created_at);
        if (dashboardState.period === 'D') {
            return pDate >= startTime && pDate <= refDate;
        } else if (dashboardState.period === 'W') {
            return pDate >= startTime && pDate <= refDate;
        } else if (dashboardState.period === 'M') {
            return pDate >= startTime && pDate <= refDate;
        } else if (dashboardState.period === 'Y') {
            return pDate.getFullYear() === 2026 && pDate <= refDate;
        }
        return true; // All
    });

    // Recalculate stats for the period
    let totalBiaya = 0;
    let totalDimensi = 0;
    let totalPaket = dashboardState.filteredPakets.length;
    let statusCounts = { menunggu: 0, diproses: 0, dalam_perjalanan: 0, sampai_tujuan: 0, terkirim: 0 };
    let maxBiaya = 0;
    let paketTermahal = '-';

    dashboardState.filteredPakets.forEach(p => {
        totalBiaya += p.biaya;
        totalDimensi += p.berat;
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        if (p.biaya > maxBiaya) {
            maxBiaya = p.biaya;
            paketTermahal = p.resi;
        }
    });

    const rataBiaya = totalPaket > 0 ? totalBiaya / totalPaket : 0;
    const rataDimensi = totalPaket > 0 ? totalDimensi / totalPaket : 0;

    // Build markup
    el.innerHTML = `
    <!-- Period Buttons -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="font-size:14px; color:var(--text-muted)">
            Menampilkan data untuk periode terfilter.
        </div>
        <div style="display:flex; background:var(--bg-container-high); padding:4px; border-radius:var(--radius-sm); border:1px solid var(--border-primary)">
            ${['D', 'W', 'M', 'Y', 'A'].map(p => {
                const label = p === 'A' ? 'All' : p;
                const active = dashboardState.period === p ? 'background:var(--accent-primary);color:#fff;font-weight:600' : 'color:var(--text-secondary);font-weight:400';
                return `<button class="btn-sm" style="border:none; border-radius:var(--radius-sm); padding:6px 14px; font-size:12px; font-family:var(--font-family); cursor:pointer; background:none; transition:all 0.2s; ${active}" onclick="changePeriod('${p}')">${label}</button>`;
            }).join('')}
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-card-icon"><span class="material-icons-outlined">payments</span></div>
            <div class="stat-card-label">Total Pendapatan</div>
            <div class="stat-card-value">${formatCompactCurrency(totalBiaya)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-icon"><span class="material-icons-outlined">inventory_2</span></div>
            <div class="stat-card-label">Total Paket</div>
            <div class="stat-card-value">${totalPaket}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-icon"><span class="material-icons-outlined">scale</span></div>
            <div class="stat-card-label">Total Volume (cm³)</div>
            <div class="stat-card-value">${formatCompactNumber(totalDimensi * 6000)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-icon"><span class="material-icons-outlined">format_list_numbered</span></div>
            <div class="stat-card-label">Dalam Antrean</div>
            <div class="stat-card-value">${dashboardState.queueSize}</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-icon"><span class="material-icons-outlined">local_shipping</span></div>
            <div class="stat-card-label">Total Kurir</div>
            <div class="stat-card-value">${dashboardState.totalKurir}</div>
        </div>
    </div>

    <!-- Chart Card -->
    <div class="card mb-lg" style="padding:24px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
            <div>
                <div class="card-title">Grafik Transaksi Pengiriman</div>
                <div class="card-subtitle">Volume pengiriman berdasarkan data waktu transaksi</div>
            </div>
        </div>
        <div style="position:relative; height:280px; width:100%">
            <canvas id="dashboard-chart"></canvas>
        </div>
    </div>

    <!-- Details Grid -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--gutter); margin-bottom:24px">
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Ringkasan Finansial & Volume</div>
                    <div class="card-subtitle">Detail rata-rata dan pencatat rekor biaya</div>
                </div>
            </div>
            <div class="metric-row">
                <span class="metric-label">Rata-rata Biaya / Paket</span>
                <span class="metric-value">Rp ${formatCurrency(rataBiaya)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Paket Termahal</span>
                <span class="metric-value" style="font-weight:600">${paketTermahal}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Biaya Tertinggi</span>
                <span class="metric-value positive">Rp ${formatCurrency(maxBiaya)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Rata-rata Volume / Paket</span>
                <span class="metric-value">${(rataDimensi * 6000).toFixed(0)} cm³</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Total Tracking Entry</span>
                <span class="metric-value">${dashboardState.totalTracking}</span>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">Status Breakdown</div>
                    <div class="card-subtitle">Distribusi pengiriman pada periode ini</div>
                </div>
            </div>
            ${Object.keys(statusCounts).map(s => {
                const count = statusCounts[s];
                const pct = totalPaket > 0 ? ((count / totalPaket) * 100).toFixed(0) : 0;
                return `
                <div style="margin-bottom:12px">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px">
                        ${renderStatusChip(s)}
                        <span style="font-size:12px; color:var(--text-muted)">${count} (${pct}%)</span>
                    </div>
                    <div style="height:6px; background:var(--bg-container-lowest); border-radius:var(--radius-pill); overflow:hidden">
                        <div style="height:100%; width:${pct}%; background:var(--accent-primary); border-radius:var(--radius-pill); transition:width 0.5s ease"></div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    </div>

    <!-- Table Card -->
    <div class="card">
        <div class="card-header" style="flex-wrap:wrap; gap:16px">
            <div>
                <div class="card-title">Daftar Paket Terfilter</div>
                <div class="card-subtitle">Semua data paket pada periode ini</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px">
                <input class="form-input form-input-sm" id="table-search" placeholder="Cari Resi / Penerima..." value="${dashboardState.searchQuery}" oninput="handleTableSearch(event)" style="width:200px">
            </div>
        </div>
        <div id="dashboard-table-container">
            ${renderDashboardTableMarkup()}
        </div>
    </div>`;

    // Render chart
    renderChartInstance();
}

function changePeriod(p) {
    dashboardState.period = p;
    dashboardState.currentPage = 1;
    updateDashboardUI();
}

function handleTableSearch(e) {
    dashboardState.searchQuery = e.target.value.toLowerCase().trim();
    dashboardState.currentPage = 1;
    renderDashboardTableOnly();
}

function getTableFilteredPakets() {
    if (!dashboardState.searchQuery) return dashboardState.filteredPakets;
    return dashboardState.filteredPakets.filter(p => 
        p.resi.toLowerCase().includes(dashboardState.searchQuery) ||
        p.nama_penerima.toLowerCase().includes(dashboardState.searchQuery)
    );
}

function renderDashboardTableMarkup() {
    const list = getTableFilteredPakets();
    const startIdx = (dashboardState.currentPage - 1) * dashboardState.pageSize;
    const paginatedList = list.slice(startIdx, startIdx + dashboardState.pageSize);
    const totalPages = Math.ceil(list.length / dashboardState.pageSize) || 1;

    return `
    ${renderTable(
        [
            { label: 'ID', key: 'id', width: '50px' },
            { label: 'Resi', key: 'resi' },
            { label: 'Penerima', key: 'nama_penerima' },
            { label: 'Rute', render: r => `${r.kota_asal} → ${r.kota_tujuan}` },
            { label: 'Dimensi', render: r => `${(parseFloat(r.berat) * 6000).toFixed(0)} cm³` },
            { label: 'Biaya', render: r => `Rp ${formatCurrency(r.biaya)}` },
            { label: 'Status', render: r => renderStatusChip(r.status) },
            { label: 'Tanggal', render: r => `<span style="font-size:11px">${r.created_at.substring(0, 16)}</span>` }
        ],
        paginatedList,
        { emptyMessage: 'Tidak ada data paket' }
    )}
    
    <!-- Pagination controls -->
    <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:var(--bg-container-lowest); border-top:1px solid var(--border-primary)">
        <div style="font-size:12px; color:var(--text-muted)">
            Menampilkan ${list.length > 0 ? startIdx + 1 : 0} - ${Math.min(startIdx + dashboardState.pageSize, list.length)} dari ${list.length} paket
        </div>
        <div style="display:flex; gap:8px">
            <button class="btn btn-secondary btn-sm" ${dashboardState.currentPage === 1 ? 'disabled style="opacity:0.5"' : ''} onclick="prevTablePage()">Sebelumnya</button>
            <span style="display:flex; align-items:center; font-size:12px; padding:0 8px; color:var(--text-secondary)">Halaman ${dashboardState.currentPage} dari ${totalPages}</span>
            <button class="btn btn-secondary btn-sm" ${dashboardState.currentPage === totalPages ? 'disabled style="opacity:0.5"' : ''} onclick="nextTablePage()">Berikutnya</button>
        </div>
    </div>`;
}

function renderDashboardTableOnly() {
    const el = document.getElementById('dashboard-table-container');
    if (el) el.innerHTML = renderDashboardTableMarkup();
}

function prevTablePage() {
    if (dashboardState.currentPage > 1) {
        dashboardState.currentPage--;
        renderDashboardTableOnly();
    }
}

function nextTablePage() {
    const list = getTableFilteredPakets();
    const totalPages = Math.ceil(list.length / dashboardState.pageSize) || 1;
    if (dashboardState.currentPage < totalPages) {
        dashboardState.currentPage++;
        renderDashboardTableOnly();
    }
}

function renderChartInstance() {
    const ctx = document.getElementById('dashboard-chart')?.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart instance to prevent canvas rendering bugs on update
    if (dashboardState.chart) {
        dashboardState.chart.destroy();
    }

    // Prepare chart labels and data based on selected period
    let labels = [];
    let dataPoints = [];
    
    // Group packets
    if (dashboardState.period === 'D') {
        labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        dataPoints = [0, 0, 0, 0, 0, 0];
        dashboardState.filteredPakets.forEach(p => {
            const pDate = parsePackageDate(p.created_at);
            const hour = pDate.getHours();
            const binIdx = Math.floor(hour / 4);
            if (binIdx >= 0 && binIdx < 6) {
                dataPoints[binIdx]++;
            }
        });
    } else if (dashboardState.period === 'W') {
        // Last 7 days: June 20 to June 26
        labels = ['20 Jun', '21 Jun', '22 Jun', '23 Jun', '24 Jun', '25 Jun', '26 Jun'];
        dataPoints = [0, 0, 0, 0, 0, 0, 0];
        dashboardState.filteredPakets.forEach(p => {
            const pDate = parsePackageDate(p.created_at);
            const day = pDate.getDate();
            const idx = day - 20; // 20 Jun -> idx 0, 26 Jun -> idx 6
            if (idx >= 0 && idx < 7) {
                dataPoints[idx]++;
            }
        });
    } else if (dashboardState.period === 'M') {
        // Last 4 weeks:
        // W1: May 30 - Jun 5
        // W2: Jun 6 - Jun 12
        // W3: Jun 13 - Jun 19
        // W4: Jun 20 - Jun 26
        labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
        dataPoints = [0, 0, 0, 0];
        dashboardState.filteredPakets.forEach(p => {
            const pDate = parsePackageDate(p.created_at);
            // Translate date to custom week
            if (pDate >= new Date(2026, 4, 30) && pDate <= new Date(2026, 5, 5, 23, 59, 59)) {
                dataPoints[0]++;
            } else if (pDate >= new Date(2026, 5, 6) && pDate <= new Date(2026, 5, 12, 23, 59, 59)) {
                dataPoints[1]++;
            } else if (pDate >= new Date(2026, 5, 13) && pDate <= new Date(2026, 5, 19, 23, 59, 59)) {
                dataPoints[2]++;
            } else if (pDate >= new Date(2026, 5, 20) && pDate <= new Date(2026, 5, 26, 23, 59, 59)) {
                dataPoints[3]++;
            }
        });
    } else if (dashboardState.period === 'Y') {
        // Months of 2026 YTD: Jan to Jun
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        dataPoints = [0, 0, 0, 0, 0, 0];
        dashboardState.filteredPakets.forEach(p => {
            const pDate = parsePackageDate(p.created_at);
            if (pDate.getFullYear() === 2026) {
                const monthIdx = pDate.getMonth(); // 0 is Jan, 5 is Jun
                if (monthIdx >= 0 && monthIdx < 6) {
                    dataPoints[monthIdx]++;
                }
            }
        });
    } else {
        // All time: 12 months 2025 + 12 months 2026
        labels = [
            'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25',
            'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26'
        ];
        dataPoints = Array(18).fill(0);
        dashboardState.filteredPakets.forEach(p => {
            const pDate = parsePackageDate(p.created_at);
            const yr = pDate.getFullYear();
            const mo = pDate.getMonth();
            if (yr === 2025) {
                dataPoints[mo]++;
            } else if (yr === 2026 && mo < 6) {
                dataPoints[12 + mo]++;
            }
        });
    }

    // Chart.js Configuration
    const gridColor = 'rgba(255, 255, 255, 0.05)';
    const textColor = 'rgba(255, 255, 255, 0.6)';
    const accentColor = '#6366f1'; // Indigo base
    
    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    dashboardState.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Transaksi',
                data: dataPoints,
                borderColor: accentColor,
                borderWidth: 3,
                pointBackgroundColor: accentColor,
                pointBorderColor: '#fff',
                pointHoverRadius: 6,
                pointRadius: 4,
                tension: 0.35,
                fill: true,
                backgroundColor: gradient
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor, font: { family: 'Poppins, sans-serif', size: 11 } }
                },
                y: {
                    grid: { color: gridColor },
                    ticks: { 
                        color: textColor, 
                        font: { family: 'Poppins, sans-serif', size: 11 },
                        callback: function(value) { if (Number.isInteger(value)) return value; }
                    },
                    min: 0
                }
            }
        }
    });
}

function formatCurrency(val) {
    return Number(val || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function formatCompactNumber(val) {
    const num = Number(val || 0);
    if (num >= 1000000) {
        const millions = num / 1000000;
        return millions.toFixed(2).replace('.', ',') + ' jt';
    }
    return Number(num).toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function formatCompactCurrency(val) {
    const rpSpan = `<span style="font-size: 14px; font-weight: 400; color: var(--text-muted); margin-right: 4px; vertical-align: middle;">Rp</span>`;
    return `${rpSpan}<span style="vertical-align: middle;">${formatCompactNumber(val)}</span>`;
}
