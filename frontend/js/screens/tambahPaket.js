// ============================================================
// Screen 4: Tambah Paket Form
// ============================================================
function renderTambahPaketScreen() {
    return `
    ${renderHeader('Tambah Paket', 'Formulir penambahan paket baru')}
    <div class="content screen-enter" id="tambah-content">
        <div class="loading-overlay"><div class="loading-spinner"></div></div>
    </div>`;
}

async function initTambahPaket() {
    try {
        const [layanan, klasifikasi, cities] = await Promise.all([
            API.getLayanan(), API.getKlasifikasi(), API.getCities()
        ]);
        const el = document.getElementById('tambah-content');
        if (!el) return;

        el.innerHTML = `
        <div class="card" style="max-width:720px">
            <div class="card-header">
                <div>
                    <div class="card-title"><span class="material-icons-outlined">add_box</span> Form Tambah Paket Baru</div>
                    <div class="card-subtitle">Data akan dimasukkan ke SinglyLinkedList dan Queue</div>
                </div>
            </div>
            <form id="tambah-form" onsubmit="submitTambahPaket(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">NAMA PENERIMA *</label>
                        <input class="form-input" id="tp-nama" placeholder="Nama lengkap penerima" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ALAMAT TUJUAN *</label>
                        <input class="form-input" id="tp-alamat" placeholder="Jl. Contoh No. 123" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">KOTA ASAL *</label>
                        <select class="form-select" id="tp-asal" required>
                            <option value="">Pilih kota asal</option>
                            ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">KOTA TUJUAN *</label>
                        <select class="form-select" id="tp-tujuan" required>
                            <option value="">Pilih kota tujuan</option>
                            ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">BERAT (KG) *</label>
                        <input class="form-input" type="number" step="0.1" min="0.1" id="tp-berat" placeholder="0.0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">LAYANAN *</label>
                        <select class="form-select" id="tp-layanan" required onchange="calcBiaya()">
                            <option value="">Pilih layanan</option>
                            ${layanan.map(l => `<option value="${l.id}" data-tarif="${l.tarif_per_kg}">${l.nama} (Rp ${formatCurrency(l.tarif_per_kg)}/kg)</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">KLASIFIKASI BERAT *</label>
                        <select class="form-select" id="tp-klasifikasi" required onchange="calcBiaya()">
                            <option value="">Pilih klasifikasi</option>
                            ${klasifikasi.map(k => `<option value="${k.id}" data-biaya="${k.biaya_tambahan}">${k.nama} (+Rp ${formatCurrency(k.biaya_tambahan)})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">ESTIMASI BIAYA</label>
                        <div class="form-input" style="background:var(--bg-container-high);display:flex;align-items:center;font-weight:600;color:var(--status-success)" id="tp-biaya-display">
                            Rp 0
                        </div>
                        <input type="hidden" id="tp-biaya" value="0">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">RESI (OPSIONAL)</label>
                    <input class="form-input" id="tp-resi" placeholder="Kosongkan untuk auto-generate">
                    <div class="form-hint">Akan dibuat otomatis jika dikosongkan (format: SWF-YYYYMMDD-XXXX)</div>
                </div>
                <div style="display:flex;gap:12px;margin-top:24px">
                    <button type="submit" class="btn btn-primary btn-lg" id="tp-submit"><span class="material-icons-outlined">inventory_2</span> Tambah Paket</button>
                    <button type="button" class="btn btn-secondary btn-lg" onclick="App.navigate('pengiriman')">Batal</button>
                </div>
            </form>
        </div>`;

        document.getElementById('tp-berat').addEventListener('input', calcBiaya);
    } catch (err) {
        document.getElementById('tambah-content').innerHTML =
            `<div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">warning</span></div><div class="empty-state-title">Gagal memuat form</div></div>`;
    }
}

function calcBiaya() {
    const berat = parseFloat(document.getElementById('tp-berat')?.value || 0);
    const layananEl = document.getElementById('tp-layanan');
    const klasEl = document.getElementById('tp-klasifikasi');
    const tarif = parseFloat(layananEl?.selectedOptions[0]?.dataset.tarif || 0);
    const tambahan = parseFloat(klasEl?.selectedOptions[0]?.dataset.biaya || 0);
    const total = (berat * tarif) + tambahan;
    const display = document.getElementById('tp-biaya-display');
    const hidden = document.getElementById('tp-biaya');
    if (display) display.textContent = `Rp ${formatCurrency(total)}`;
    if (hidden) hidden.value = total;
}

async function submitTambahPaket(e) {
    e.preventDefault();
    const btn = document.getElementById('tp-submit');
    btn.disabled = true;
    btn.textContent = 'Menyimpan...';

    const data = {
        resi: document.getElementById('tp-resi').value,
        nama_penerima: document.getElementById('tp-nama').value,
        alamat_tujuan: document.getElementById('tp-alamat').value,
        kota_asal: document.getElementById('tp-asal').value,
        kota_tujuan: document.getElementById('tp-tujuan').value,
        berat: parseFloat(document.getElementById('tp-berat').value),
        biaya: parseFloat(document.getElementById('tp-biaya').value),
        id_layanan: parseInt(document.getElementById('tp-layanan').value),
        id_klasifikasi: parseInt(document.getElementById('tp-klasifikasi').value),
    };

    try {
        await API.addPaket(data);
        App.toast('Paket berhasil ditambahkan!', 'success');
        App.navigate('pengiriman');
    } catch (err) {
        App.toast(err.error || 'Gagal menambahkan paket', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '<span class="material-icons-outlined">inventory_2</span> Tambah Paket';
    }
}
