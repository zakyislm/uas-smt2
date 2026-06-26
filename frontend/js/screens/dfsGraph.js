/**
 * Dokumentasi Halaman Graph DFS (dfsGraph.js)
 * 
 * File ini mengatur antarmuka dan logika untuk visualisasi penelusuran graf menggunakan Depth-First Search (DFS).
 * Menyediakan dua moda utama: DFS Traversal untuk melihat urutan penjelajahan graf secara berurutan, 
 * dan pencarian Semua Rute alternatif (all paths) antara kota asal dan tujuan.
 */
let dfsState = {
    cities: [],
    edges: [],
    paths: [],
    selectedPathIndex: 0
};
let dfsMode = 'dfs';
function renderDfsGraphScreen() {
    return `
    ${renderHeader('Semua Rute (DFS)', 'Depth-First Search — Eksplorasi semua rute dari kota')}
    <div class="content screen-enter" id="dfs-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}
async function initDfsGraph() {
    try {
        const [cities, edges] = await Promise.all([API.getCities(), API.getEdges()]);
        dfsState.cities = cities;
        dfsState.edges = edges;
        dfsState.paths = [];
        dfsState.selectedPathIndex = 0;
        const el = document.getElementById('dfs-content');
        if (!el) return;
        el.innerHTML = `
        <div class="card">
            <div class="card-title mb-md">DFS — Eksplorasi Semua Rute</div>
            <div class="tabs">
                <div class="tab active" data-mode="dfs" onclick="switchDfsMode('dfs',this)">DFS Traversal</div>
                <div class="tab" data-mode="allpaths" onclick="switchDfsMode('allpaths',this)">Semua Jalur (A → B)</div>
            </div>
            <div id="dfs-controls">
                <div class="graph-controls">
                    <div class="form-group" style="min-width:200px">
                        <label class="form-label">KOTA AWAL</label>
                        <select class="form-select" id="dfs-start" onchange="runDFS(true)">
                            <option value="">Pilih kota</option>
                            ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="min-width:200px;display:none" id="dfs-to-group">
                        <label class="form-label">KOTA TUJUAN</label>
                        <select class="form-select" id="dfs-to" onchange="runDFS(true)">
                            <option value="">Pilih kota tujuan</option>
                            ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="runDFS()" style="margin-bottom:16px"><span class="material-icons-outlined">search</span> Jalankan</button>
                </div>
            </div>
            <div class="graph-canvas-wrapper">
                <canvas id="dfs-canvas" class="graph-canvas"></canvas>
                <div class="graph-legend">
                    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#454556"></div> Kota</div>
                    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#c0c1ff"></div> DFS Visited</div>
                    <div class="graph-legend-item"><div class="graph-legend-dot" style="background:#2F2FE4"></div> Edge</div>
                    <div class="graph-legend-item" id="dfs-legend-highlight" style="display:none"><div class="graph-legend-dot" style="background:#4ade80"></div> Rute Terpilih</div>
                </div>
            </div>
            <div id="dfs-result" class="mt-lg"></div>
        </div>`;
        setTimeout(() => {
            GraphRenderer.render('dfs-canvas', cities, edges);
        }, 100);
    } catch (err) {
        document.getElementById('dfs-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat data graf</div></div>`;
    }
}
function switchDfsMode(mode, tabEl) {
    dfsMode = mode;
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');
    const toGroup = document.getElementById('dfs-to-group');
    if (toGroup) toGroup.style.display = mode === 'allpaths' ? 'block' : 'none';
    document.getElementById('dfs-legend-highlight').style.display = 'none';
    document.getElementById('dfs-result').innerHTML = '';
    GraphRenderer.render('dfs-canvas', dfsState.cities, dfsState.edges);
    runDFS(true);
}
function selectDfsPath(index) {
    dfsState.selectedPathIndex = index;
    const pathObj = dfsState.paths[index];
    if (!pathObj) return;
    document.querySelectorAll('.dfs-path-card').forEach((card, idx) => {
        if (idx === index) {
            card.style.borderColor = 'var(--status-success)';
            card.style.background = 'rgba(74, 222, 128, 0.05)';
        } else {
            card.style.borderColor = 'var(--border-subtle)';
            card.style.background = 'var(--bg-container-lowest)';
        }
    });
    document.getElementById('dfs-legend-highlight').style.display = 'flex';
    GraphRenderer.animatePath('dfs-canvas', dfsState.cities, dfsState.edges, pathObj.path);
}
async function runDFS(isAuto = false) {
    const start = document.getElementById('dfs-start').value;
    if (!start) {
        if (!isAuto) App.toast('Pilih kota awal', 'error');
        return;
    }
    try {
        const [cities, edges] = await Promise.all([API.getCities(), API.getEdges()]);
        dfsState.cities = cities;
        dfsState.edges = edges;
        if (dfsMode === 'dfs') {
            document.getElementById('dfs-legend-highlight').style.display = 'none';
            const result = await API.dfs(start);
            GraphRenderer.animateTraversal('dfs-canvas', cities, edges, result.order || []);
            document.getElementById('dfs-result').innerHTML = `
            <div class="card">
                <div class="card-title">DFS Traversal Order dari ${start}</div>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                    ${(result.order || []).map((city, i) => `
                        <div style="display:flex;align-items:center;gap:4px">
                            <span class="badge">${i + 1}</span>
                            <span style="font-size:13px;font-weight:500">${city}</span>
                            ${i < result.order.length - 1 ? '<span style="color:var(--text-muted)">→</span>' : ''}
                        </div>
                    `).join('')}
                </div>
                <p class="form-hint mt-md">Total kota dikunjungi: ${(result.order || []).length}</p>
            </div>`;
        } else {
            const to = document.getElementById('dfs-to').value;
            if (!to) {
                if (!isAuto) App.toast('Pilih kota tujuan', 'error');
                return;
            }
            if (start === to) {
                App.toast('Kota asal dan tujuan harus berbeda', 'error');
                return;
            }
            const result = await API.allPaths(start, to);
            dfsState.paths = result.paths || [];
            const resultsContainer = document.getElementById('dfs-result');
            if (dfsState.paths.length === 0) {
                document.getElementById('dfs-legend-highlight').style.display = 'none';
                GraphRenderer.render('dfs-canvas', cities, edges);
                resultsContainer.innerHTML = `
                <div class="card" style="border-color:var(--status-error)">
                    <div class="card-title" style="color:var(--status-error)">Tidak Ada Jalur</div>
                    <p class="text-muted">Tidak ditemukan jalur dari ${start} ke ${to}.</p>
                </div>`;
                return;
            }
            resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-title">Semua Jalur: ${start} → ${to}</div>
                <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
                    ${dfsState.paths.map((p, i) => `
                    <div class="dfs-path-card" onclick="selectDfsPath(${i})" style="padding:14px;background:var(--bg-container-lowest);border-radius:var(--radius-lg);border:1px solid var(--border-subtle);cursor:pointer;transition:all 0.2s">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                            <span class="text-label" style="font-weight:600">JALUR ${i + 1}</span>
                            <span style="font-weight:600;color:var(--status-success)">${p.distance} km</span>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary)">${p.path.join(' → ')}</div>
                    </div>
                `).join('')}
                </div>
                <p class="form-hint mt-md">Klik salah satu rute di atas untuk menyorot jalur pada peta. Total jalur ditemukan: ${dfsState.paths.length}</p>
            </div>`;
            selectDfsPath(0);
        }
    } catch (err) {
        if (!isAuto) App.toast(err.error || 'Gagal menjalankan DFS', 'error');
    }
}
