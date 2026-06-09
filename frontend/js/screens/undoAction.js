// ============================================================
// Screen 9: Undo Action (Stack View)
// ============================================================
function renderUndoActionScreen() {
    return `
    ${renderHeader('Undo Action', 'Stack View — LIFO undo tracking')}
    <div class="content screen-enter" id="undo-content">
        <div class="card" style="max-width:600px">
            <div class="card-header">
                <div>
                    <div class="card-title"><span class="material-icons-outlined">undo</span> Undo Tracking (Stack)</div>
                    <div class="card-subtitle">Pop tracking terakhir dari map&lt;int, Stack&lt;Tracking&gt;&gt;</div>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">ID PAKET</label>
                <div style="display:flex;gap:8px">
                    <input class="form-input" type="number" id="undo-paketid" placeholder="Masukkan ID paket">
                    <button class="btn btn-secondary" onclick="loadUndoStack()">Lihat Stack</button>
                </div>
            </div>
            <div id="undo-stack-view"></div>
        </div>
    </div>`;
}

async function loadUndoStack() {
    const paketId = document.getElementById('undo-paketid').value;
    if (!paketId) { App.toast('Masukkan ID paket', 'error'); return; }

    const el = document.getElementById('undo-stack-view');
    el.innerHTML = '<div class="loading-overlay"><div class="loading-spinner"></div></div>';

    try {
        const data = await API.getUndoStack(paketId);
        if (!data.stack || data.stack.length === 0) {
            el.innerHTML = `<div class="empty-state" style="padding:30px">
                <div class="empty-state-icon"><span class="material-icons-outlined">inbox</span></div>
                <div class="empty-state-title">Stack Kosong</div>
                <div class="empty-state-text">Tidak ada tracking yang bisa di-undo untuk paket ini.</div>
            </div>`;
            return;
        }

        el.innerHTML = `
        <div style="margin-top:16px">
            <div class="text-label text-muted mb-sm">STACK TRACKING (TOP → BOTTOM)</div>
            <div class="stack-container">
                ${data.stack.map((t, i) => `
                    <div class="stack-item">
                        <div>
                            ${i === 0 ? '<div class="stack-label">⬆ TOP (Terbaru)</div>' : ''}
                            <div style="font-weight:500">${t.status}</div>
                            <div style="font-size:12px;color:var(--text-muted)">${t.lokasi} — ${t.timestamp}</div>
                        </div>
                        ${i === 0 ? `<button class="btn btn-danger btn-sm" onclick="doUndo(${paketId})">↩ Undo</button>` : ''}
                    </div>
                `).join('')}
            </div>
            <p class="form-hint mt-md">Stack size: ${data.stack.length} entries</p>
        </div>`;
    } catch (err) {
        el.innerHTML = `<p style="color:var(--status-error);padding:16px">${err.error || 'Gagal memuat stack'}</p>`;
    }
}

async function doUndo(paketId) {
    try {
        const result = await API.undoTracking(paketId);
        App.toast(`Undo berhasil: ${result.undone_status || 'tracking dihapus'}`, 'success');
        loadUndoStack();
    } catch (err) {
        App.toast(err.error || 'Gagal melakukan undo', 'error');
    }
}
