// ============================================================
// Screen 14: Jalur Terpendek BFS Graph View
// ============================================================
function renderBfsGraphScreen() {
    return `
    ${renderHeader('Jalur Terpendek (BFS)', 'Breadth-First Search — Minimal transit antar kota')}
    <div class="content screen-enter" id="bfs-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initBfsGraph() {
    try {
        const [cities, edgesData] = await Promise.all([API.getCities(), API.getEdges()]);
        const el = document.getElementById('bfs-content');
        if (!el) return;

        el.innerHTML = `
        <div class="card">
            <div class="card-title mb-md"><span class="material-icons-outlined">map</span> Cari Jalur Terpendek (BFS)</div>
            <div class="graph-controls">
                <div class="form-group" style="min-width:200px">
                    <label class="form-label">KOTA ASAL</label>
                    <select class="form-select" id="bfs-from">
                        <option value="">Pilih kota asal</option>
                        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="min-width:200px">
                    <label class="form-label">KOTA TUJUAN</label>
                    <select class="form-select" id="bfs-to">
                        <option value="">Pilih kota tujuan</option>
                        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary" onclick="runBFS()" style="margin-bottom:16px"><span class="material-icons-outlined">search</span> Cari Jalur</button>
            </div>
            <div class="graph-canvas-wrapper">
                <canvas id="bfs-canvas" class="graph-canvas"></canvas>
                <div class="graph-legend">
                    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#454556"></div> Kota</div>
                    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#2F2FE4"></div> Edge</div>
                    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#4ade80"></div> Jalur Terpendek</div>
                </div>
            </div>
            <div id="bfs-result" class="mt-lg"></div>
        </div>`;

        // Initial render
        setTimeout(() => {
            GraphRenderer.render('bfs-canvas', cities, edgesData);
        }, 100);
    } catch (err) {
        document.getElementById('bfs-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat data graf</div></div>`;
    }
}

async function runBFS() {
    const from = document.getElementById('bfs-from').value;
    const to = document.getElementById('bfs-to').value;
    if (!from || !to) { App.toast('Pilih kota asal dan tujuan', 'error'); return; }
    if (from === to) { App.toast('Kota asal dan tujuan harus berbeda', 'error'); return; }

    try {
        const [result, cities, edges] = await Promise.all([
            API.bfs(from, to), API.getCities(), API.getEdges()
        ]);

        // Build highlight edges
        const highlightEdges = [];
        if (result.path && result.path.length > 1) {
            for (let i = 0; i < result.path.length - 1; i++) {
                highlightEdges.push({ from: result.path[i], to: result.path[i+1] });
            }
        }

        GraphRenderer.render('bfs-canvas', cities, edges, result.path || [], highlightEdges);

        const resEl = document.getElementById('bfs-result');
        if (result.path && result.path.length > 0) {
            resEl.innerHTML = `
            <div class="card" style="border-color:var(--status-success);background:rgba(74,222,128,0.03)">
                <div class="card-title" style="color:var(--status-success)"><span class="material-icons-outlined">check_circle</span> Jalur Ditemukan</div>
                <div class="metric-row"><span class="metric-label">Rute</span><span class="metric-value">${result.path.join(' → ')}</span></div>
                <div class="metric-row"><span class="metric-label">Total Jarak</span><span class="metric-value positive">${result.distance} km</span></div>
                <div class="metric-row"><span class="metric-label">Jumlah Transit</span><span class="metric-value">${Math.max(0, result.path.length - 2)} kota</span></div>
            </div>`;
        } else {
            resEl.innerHTML = `<div class="card" style="border-color:var(--status-error)">
                <div class="card-title" style="color:var(--status-error)"><span class="material-icons-outlined">cancel</span> Tidak Ada Jalur</div>
                <p class="text-muted">Tidak ditemukan jalur dari ${from} ke ${to}.</p>
            </div>`;
        }
    } catch (err) {
        App.toast(err.error || 'Gagal menjalankan BFS', 'error');
    }
}
