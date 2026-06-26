// ============================================================
// Screen 8: Update Status Form
// ============================================================
function renderUpdateStatusScreen() {
    return `
    ${renderHeader('Update Status', 'Perbarui status tracking paket')}
    <div class="content screen-enter" id="update-status-content">
        <div class="card" style="max-width:600px">
            <div class="card-header">
                <div>
                    <div class="card-title">Update Status Tracking</div>
                    <div class="card-subtitle">Tracking akan dicatat ke Stack dan History</div>
                </div>
            </div>
            <form onsubmit="submitUpdateStatus(event)">
                <div class="form-group">
                    <label class="form-label">ID PAKET *</label>
                    <input class="form-input" type="number" id="us-paketid" placeholder="Masukkan ID paket" required>
                </div>
                <div class="form-group">
                    <label class="form-label">STATUS BARU *</label>
                    <select class="form-select" id="us-status" required>
                        <option value="">Pilih status</option>
                        <option value="diproses">Diproses</option>
                        <option value="dalam_perjalanan">Dalam Perjalanan</option>
                        <option value="sampai_tujuan">Sampai Tujuan</option>
                        <option value="terkirim">Terkirim</option>
                        <option value="gagal">Gagal</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">LOKASI *</label>
                    <input class="form-input" id="us-lokasi" placeholder="Lokasi saat ini (contoh: Jakarta Pusat)" required>
                </div>
                <div class="form-group">
                    <label class="form-label">KETERANGAN (OPSIONAL)</label>
                    <textarea class="form-textarea" id="us-keterangan" placeholder="Tambahan informasi..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg" id="us-submit"><span class="material-icons-outlined">sync</span> Update Status</button>
            </form>
        </div>
    </div>`;
}

async function submitUpdateStatus(e) {
    e.preventDefault();
    const btn = document.getElementById('us-submit');
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
        await API.updateTracking({
            id_paket: parseInt(document.getElementById('us-paketid').value),
            status: document.getElementById('us-status').value,
            lokasi: document.getElementById('us-lokasi').value,
            keterangan: document.getElementById('us-keterangan').value,
        });
        App.toast('Status berhasil diperbarui!', 'success');
        document.getElementById('us-paketid').value = '';
        document.getElementById('us-status').value = '';
        document.getElementById('us-lokasi').value = '';
        document.getElementById('us-keterangan').value = '';
    } catch (err) {
        App.toast(err.error || 'Gagal memperbarui status', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '<span class="material-icons-outlined">sync</span> Update Status';
    }
}
