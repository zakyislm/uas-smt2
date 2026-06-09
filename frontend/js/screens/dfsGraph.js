// ============================================================
// Screen 15: Semua Rute DFS Tree/Network
// ============================================================
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
        const el = document.getElementById('dfs-content');
        if (!el) return;

        el.innerHTML = `
        <div class="card">
            <div class="card-title mb-md"><span class="material-icons-outlined">hub</span> DFS — Eksplorasi Semua Rute</div>
            <div class="tabs">
                <div class="tab active" data-mode="dfs" onclick="switchDfsMode('dfs',this)">DFS Traversal</div>
                <div class="tab" data-mode="allpaths" onclick="switchDfsMode('allpaths',this)">Semua Jalur (A → B)</div>
            </div>

            <div id="dfs-controls">
                <div class="graph-controls">
                    <div class="form-group" style="min-width:200px">
                        <label class="form-label">KOTA AWAL</label>
                        <select class="form-select" id="dfs-start">
                            <option value="">Pilih kota</option>
                            ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="min-width:200px;display:none" id="dfs-to-group">
                        <label class="form-label">KOTA TUJUAN</label>
                        <select class="form-select" id="dfs-to">
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

let dfsMode = 'dfs';

function switchDfsMode(mode, tabEl) {
    dfsMode = mode;
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    if (tabEl) tabEl.classList.add('active');
    const toGroup = document.getElementById('dfs-to-group');
    if (toGroup) toGroup.style.display = mode === 'allpaths' ? 'block' : 'none';
}

async function runDFS() {
    const start = document.getElementById('dfs-start').value;
    if (!start) { App.toast('Pilih kota awal', 'error'); return; }

    try {
        const [cities, edges] = await Promise.all([API.getCities(), API.getEdges()]);

        if (dfsMode === 'dfs') {
            const result = await API.dfs(start);
            GraphRenderer.render('dfs-canvas', cities, edges, [], [], result.order || []);

            document.getElementById('dfs-result').innerHTML = `
            <div class="card">
                <div class="card-title"><span class="material-icons-outlined">location_on</span> DFS Traversal Order dari ${start}</div>
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
            if (!to) { App.toast('Pilih kota tujuan', 'error'); return; }
            if (start === to) { App.toast('Kota asal dan tujuan harus berbeda', 'error'); return; }

            const result = await API.allPaths(start, to);
            GraphRenderer.render('dfs-canvas', cities, edges);

            document.getElementById('dfs-result').innerHTML = `
            <div class="card">
                <div class="card-title"><span class="material-icons-outlined">route</span> Semua Jalur: ${start} → ${to}</div>
                ${(result.paths || []).length === 0 ? '<p class="text-muted mt-md">Tidak ada jalur yang ditemukan.</p>' :
                    (result.paths || []).map((p, i) => `
                    <div style="padding:12px;margin-top:8px;background:var(--bg-container-lowest);border-radius:var(--radius-lg);border:1px solid var(--border-subtle)">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                            <span class="text-label">JALUR ${i + 1}</span>
                            <span style="font-weight:600;color:var(--status-success)">${p.distance} km</span>
                        </div>
                        <div style="font-size:13px;color:var(--text-secondary)">${p.path.join(' → ')}</div>
                    </div>
                `).join('')}
                <p class="form-hint mt-md">Total jalur ditemukan: ${(result.paths || []).length}</p>
            </div>`;
        }
    } catch (err) {
        App.toast(err.error || 'Gagal menjalankan DFS', 'error');
    }
}
