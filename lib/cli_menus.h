#ifndef CLI_MENUS_H
#define CLI_MENUS_H

#include "expedition.h"

namespace SwiftExpedition {

// --- Login ---
inline User* menuLogin(AuthData& auth) {
    string username, password;
    int attempts = 0; const int maxAttempts = 3;
    while (attempts < maxAttempts) {
        cout << "\n  ============================================\n  === SWIFT EXPEDITION - LOGIN ===\n  ============================================\n  Username : ";
        getline(cin, username);
        cout << "  Password : "; getline(cin, password);
        if (username.empty() || password.empty()) { cout << "\n  [ERROR] Username dan password tidak boleh kosong!\n"; attempts++; continue; }
        User* u = authLogin(auth, username, password);
        if (u) { cout << "\n  ============================================\n  Selamat datang, " << u->nama << "!\n  Role: " << roleToString(u->role) << "\n  ============================================\n"; return u; }
        attempts++; cout << "\n  [ERROR] Login gagal! Sisa percobaan: " << (maxAttempts - attempts) << "\n";
    }
    cout << "\n  [ERROR] Terlalu banyak percobaan login. Program berhenti.\n"; return nullptr;
}

// --- Admin ---
inline bool menuAdmin(User* user, PaketData& paket) {
    int pilihan;
    do {
        cout << "\n  ============================================\n  === MENU ADMIN ===\n  User: " << user->nama << "\n  ============================================\n  1. Tambah Paket\n  2. Hapus Paket\n  3. Edit Paket\n  4. Cari Paket (by ID)\n  5. Cari Paket (by Resi)\n  6. Lihat Semua Paket\n  7. Lihat Antrean Paket\n  8. Lihat Daftar Kurir\n  9. Lihat Daftar Layanan\n  10. Lihat Klasifikasi Berat\n  11. Lihat AVL Tree (Resi)\n  0. Logout\n  99. Exit Program\n  ----------------------------------------\n  Pilihan: ";
        cin >> pilihan; cin.ignore(numeric_limits<streamsize>::max(), '\n');
        switch (pilihan) {
        case 1: { Paket p2; p2.id=0; cout << "\n  --- Tambah Paket Baru ---\n  Resi          : "; getline(cin, p2.resi); cout << "  Nama Penerima : "; getline(cin, p2.nama_penerima); cout << "  Alamat Tujuan : "; getline(cin, p2.alamat_tujuan); cout << "  Kota Asal     : "; getline(cin, p2.kota_asal); cout << "  Kota Tujuan   : "; getline(cin, p2.kota_tujuan); double pj = 0, lb = 0, tg = 0; cout << "  Panjang (cm)  : "; cin >> pj; cout << "  Lebar (cm)    : "; cin >> lb; cout << "  Tinggi (cm)   : "; cin >> tg; p2.berat = (pj * lb * tg) / 6000.0; cout << "  ID Layanan    : "; cin >> p2.id_layanan; cout << "  ID Klasifikasi: "; cin >> p2.id_klasifikasi; cout << "  Biaya         : "; cin >> p2.biaya; cin.ignore(numeric_limits<streamsize>::max(), '\n'); p2.status="Pending"; p2.id_kurir=0; paketAddPaket(paket, p2); cout << "\n  [SUCCESS] Paket berhasil ditambahkan dengan Dimensi Volumetrik: " << p2.berat << " kg!\n"; break; }
        case 2: { int id; cout << "\n  Masukkan ID paket yang akan dihapus: "; cin >> id; paketDeletePaket(paket, id) ? cout << "  [SUCCESS] Paket berhasil dihapus!\n" : cout << "  [ERROR] Paket tidak ditemukan!\n"; break; }
        case 3: { int id; cout << "\n  Masukkan ID paket yang akan diedit: "; cin >> id; cin.ignore(numeric_limits<streamsize>::max(), '\n'); Paket* ex = paketFindById(paket, id); if (!ex) { cout << "  [ERROR] Paket tidak ditemukan!\n"; break; } Paket nd = *ex; string in; cout << "  --- Edit Paket (kosongkan untuk tidak mengubah) ---\n  Resi [" << nd.resi << "]: "; getline(cin, in); if (!in.empty()) nd.resi=in; cout << "  Nama Penerima [" << nd.nama_penerima << "]: "; getline(cin, in); if (!in.empty()) nd.nama_penerima=in; cout << "  Alamat Tujuan [" << nd.alamat_tujuan << "]: "; getline(cin, in); if (!in.empty()) nd.alamat_tujuan=in; cout << "  Kota Asal [" << nd.kota_asal << "]: "; getline(cin, in); if (!in.empty()) nd.kota_asal=in; cout << "  Kota Tujuan [" << nd.kota_tujuan << "]: "; getline(cin, in); if (!in.empty()) nd.kota_tujuan=in; cout << "  Status [" << nd.status << "]: "; getline(cin, in); if (!in.empty()) nd.status=in; cout << "  Dimensi Volumetrik (kg) [" << nd.berat << "]: "; getline(cin, in); if (!in.empty()) nd.berat=stod(in); cout << "  Biaya [" << nd.biaya << "]: "; getline(cin, in); if (!in.empty()) nd.biaya=stod(in); paketEditPaket(paket, id, nd) ? cout << "  [SUCCESS] Paket berhasil diupdate!\n" : cout << "  [ERROR] Gagal mengupdate paket!\n"; break; }
        case 4: { int id; cout << "\n  Masukkan ID paket: "; cin >> id; Paket* f = paketFindById(paket, id); if (f) cout << "\n  ===== PAKET DITEMUKAN =====\n  ID:" << f->id << "\n  Resi:" << f->resi << "\n  Penerima:" << f->nama_penerima << "\n  Alamat:" << f->alamat_tujuan << "\n  Dari:" << f->kota_asal << " -> " << f->kota_tujuan << "\n  Dimensi Volumetrik:" << f->berat << " kg\n  Biaya:Rp " << f->biaya << "\n  Status:" << f->status << "\n"; else cout << "  [ERROR] Paket tidak ditemukan!\n"; break; }
        case 5: { string resi; cout << "\n  Masukkan nomor resi: "; cin.ignore(numeric_limits<streamsize>::max(), '\n'); getline(cin, resi); Paket* f = paketFindByResi(paket, resi); if (f) cout << "\n  ===== PAKET DITEMUKAN =====\n  ID:" << f->id << "\n  Resi:" << f->resi << "\n  Penerima:" << f->nama_penerima << "\n  Status:" << f->status << "\n"; else cout << "  [ERROR] Paket tidak ditemukan!\n"; break; }
        case 6: paketDisplayAll(paket); break;
        case 7: paketDisplayQueue(paket); break;
        case 8: paketDisplayKurir(paket); break;
        case 9: { cout << "\n  ===== DAFTAR LAYANAN =====\n"; for (auto& l : paket.layananList) cout << "  ID: " << l.id << " | " << l.nama << " | Tarif: Rp " << l.tarif_per_kg << "/kg\n"; break; }
        case 10: { cout << "\n  ===== KLASIFIKASI UKURAN =====\n"; for (auto& k : paket.klasifikasiList) cout << "  ID: " << k.id << " | " << k.nama << " | Tambahan: Rp " << k.biaya_tambahan << "\n"; break; }
        case 11: paketDisplayAVL(paket); break;
        case 0: cout << "  Logout...\n"; return true;
        case 99: cout << "\n  Keluar dari program...\n"; return false;
        default: cout << "  Pilihan tidak valid!\n"; break;
        }
    } while (true);
}

// --- Kurir ---
inline bool menuKurir(User* user, PaketData& paket, TrackingData& tracking) {
    int pilihan;
    do {
        cout << "\n  ============================================\n  === MENU KURIR ===\n  User: " << user->nama << "\n  ============================================\n  1. Ambil Paket dari Queue\n  2. Update Status Tracking\n  3. Undo Tracking (Stack)\n  4. Lihat Riwayat Tracking\n  5. Lihat Antrean Paket\n  6. Lihat Semua Paket\n  0. Logout\n  99. Exit Program\n  ----------------------------------------\n  Pilihan: ";
        cin >> pilihan; cin.ignore(numeric_limits<streamsize>::max(), '\n');
        switch (pilihan) {
        case 1: { Paket pk; if (paketDequeue(paket, pk)) { cout << "\n  [BERHASIL] Mengambil paket " << pk.resi << "\n  Penerima: " << pk.nama_penerima << "\n  Tujuan: " << pk.kota_asal << " -> " << pk.kota_tujuan << "\n"; Kurir* k = paketGetNextKurir(paket); if (k) { paketAssignToKurir(paket, pk.id, k->id); trackingUpdateStatus(tracking, pk.id, "Dalam Perjalanan", pk.kota_asal); } else trackingUpdateStatus(tracking, pk.id, "Diproses", "Pusat Sortir"); } else cout << "\n  [KOSONG] Tidak ada paket dalam antrean.\n"; break; }
        case 2: { int id; string st, lok; cout << "\n  ID Paket  : "; cin >> id; cin.ignore(numeric_limits<streamsize>::max(), '\n'); cout << "  Status Baru: "; getline(cin, st); cout << "  Lokasi     : "; getline(cin, lok); trackingUpdateStatus(tracking, id, st, lok); Paket* pp = paketFindById(paket, id); if (pp) pp->status = st; break; }
        case 3: { int id; cout << "\n  ID Paket untuk undo: "; cin >> id; cin.ignore(numeric_limits<streamsize>::max(), '\n'); if (trackingUndoLast(tracking, id)) { Tracking lt = trackingGetLatest(tracking, id); Paket* pp = paketFindById(paket, id); if (pp && !lt.status.empty()) pp->status = lt.status; cout << "  [UNDO] Kembali ke status: " << lt.status << "\n"; } else cout << "  [GAGAL] Tidak ada tracking yang bisa di-undo.\n"; break; }
        case 4: { cout << "\n  1. Lihat per Paket (masukkan ID)\n  2. Lihat semua\n  Pilih: "; int sub; cin >> sub; cin.ignore(numeric_limits<streamsize>::max(), '\n'); if (sub==1) { int id; cout << "  ID Paket: "; cin >> id; cin.ignore(numeric_limits<streamsize>::max(), '\n'); trackingProcessHistory(tracking, id, trackingCallbackPrint); } else trackingDisplayAll(tracking); break; }
        case 5: paketDisplayQueue(paket); break;
        case 6: paketDisplayAll(paket); break;
        case 0: cout << "  Logout...\n"; return true;
        case 99: cout << "\n  Keluar dari program...\n"; return false;
        default: cout << "  Pilihan tidak valid!\n"; break;
        }
    } while (true);
}

// --- Manager ---
inline bool menuManager(User* user, PaketData& paket, TrackingData& tracking) {
    int pilihan;
    do {
        cout << "\n  ============================================\n  === MENU MANAGER ===\n  User: " << user->nama << "\n  ============================================\n  1. Laporan Semua Paket\n  2. Laporan Paket by Status\n  3. Sorting Paket Berdasarkan Biaya\n  4. Sorting Paket Berdasarkan Dimensi\n  5. Statistik Pengiriman\n  6. Lihat Riwayat Tracking\n  7. Lihat Semua Paket\n  0. Logout\n  99. Exit Program\n  ----------------------------------------\n  Pilihan: ";
        cin >> pilihan; cin.ignore(numeric_limits<streamsize>::max(), '\n');
        switch (pilihan) {
        case 1: { auto pakets = paket.paketList.toVector(); reportDisplayLaporanPaket(pakets); break; }
        case 2: { auto pakets = paket.paketList.toVector(); reportDisplayByStatus(pakets); break; }
        case 3: { cout << "\n  1. Ascending (termurah)\n  2. Descending (termahal)\n  Pilih: "; int s; cin >> s; auto sorted = paketSortByBiaya(paket, s==1); cout << "\n  ===== PAKET DIURUTKAN BERDASARKAN BIAYA =====\n"; for (auto& pp : sorted) cout << "  " << pp.id << " | " << pp.resi << " | " << pp.nama_penerima << " | Rp " << pp.biaya << " | " << pp.status << "\n"; break; }
        case 4: { cout << "\n  1. Ascending (terkecil)\n  2. Descending (terbesar)\n  Pilih: "; int s; cin >> s; auto sorted = paketSortByBerat(paket, s==1); cout << "\n  ===== PAKET DIURUTKAN BERDASARKAN DIMENSI =====\n"; for (auto& pp : sorted) cout << "  " << pp.id << " | " << pp.resi << " | " << pp.nama_penerima << " | " << pp.berat << " kg (Volumetrik) | " << pp.status << "\n"; break; }
        case 5: { auto pakets = paket.paketList.toVector(); reportDisplayStatistik(pakets); break; }
        case 6: trackingDisplayAll(tracking); break;
        case 7: paketDisplayAll(paket); break;
        case 0: cout << "  Logout...\n"; return true;
        case 99: cout << "\n  Keluar dari program...\n"; return false;
        default: cout << "  Pilihan tidak valid!\n"; break;
        }
    } while (true);
}

// --- CEO ---
inline bool menuCeo(User* user, PaketData& paket, TrackingData& tracking, RoutingData& routing) {
    int pilihan;
    do {
        cout << "\n  ============================================\n  === MENU CEO ===\n  User: " << user->nama << " (CEO)\n  ============================================\n  1. Laporan Keseluruhan (CEO Report)\n  2. Statistik Pengiriman\n  3. Lihat Semua Paket\n  4. Lihat Riwayat Tracking\n  5. Lihat Graph Rute Kota\n  6. BFS - Cari Jalur Terpendek Antar Kota\n  7. DFS - Tampilkan Semua Rute Dari Kota\n  8. Cari Semua Jalur Antar Kota\n  9. Lihat Daftar Kota\n  10. Simpan Data\n  0. Logout\n  99. Exit Program\n  ----------------------------------------\n  Pilihan: ";
        cin >> pilihan; cin.ignore(numeric_limits<streamsize>::max(), '\n');
        switch (pilihan) {
        case 1: { auto pakets = paket.paketList.toVector(); reportDisplayCEO(pakets, 1, 1); break; }
        case 2: { auto pakets = paket.paketList.toVector(); reportDisplayStatistik(pakets); break; }
        case 3: paketDisplayAll(paket); break;
        case 4: trackingDisplayAll(tracking); break;
        case 5: routingDisplayEdges(routing); routing.graph.display(); break;
        case 6: { string asal, tujuan; cout << "\n  Kota Asal  : "; getline(cin, asal); cout << "  Kota Tujuan: "; getline(cin, tujuan); if (!routing.graph.hasCity(asal)) { cout << "  [ERROR] Kota asal '" << asal << "' tidak ditemukan.\n"; break; } if (!routing.graph.hasCity(tujuan)) { cout << "  [ERROR] Kota tujuan '" << tujuan << "' tidak ditemukan.\n"; break; } vector<string> path = routing.graph.BFS(asal, tujuan); if (path.empty()) { cout << "  Tidak ada jalur dari " << asal << " ke " << tujuan << ".\n"; break; } cout << "\n  ===== BFS: Mencari Transit Terdekat =====\n  Dari: " << asal << " -> Tujuan: " << tujuan << "\n  Jalur terpendek (minimal transit):\n  "; int total=0; for (size_t i=0; i<path.size(); i++) { cout << path[i]; if (i<path.size()-1) cout << " -> "; } total = routing.graph.getBFSDistance(asal, tujuan); cout << "\n  Total jarak: " << total << " km\n  Jumlah transit: " << (path.size()-2>0?path.size()-2:0) << "\n"; break; }
        case 7: { string start; cout << "\n  Kota Awal: "; getline(cin, start); if (!routing.graph.hasCity(start)) { cout << "  [ERROR] Kota '" << start << "' tidak ditemukan.\n"; break; } routing.graph.DFS(start); break; }
        case 8: { string asal, tujuan; cout << "\n  Kota Asal  : "; getline(cin, asal); cout << "  Kota Tujuan: "; getline(cin, tujuan); if (!routing.graph.hasCity(asal) || !routing.graph.hasCity(tujuan)) { cout << "  [ERROR] Kota tidak ditemukan.\n"; break; } routing.graph.findAllPaths(asal, tujuan); break; }
        case 9: { auto cities = routing.graph.getCities(); cout << "\n  ===== DAFTAR KOTA =====\n"; if (cities.empty()) cout << "  (Tidak ada kota)\n"; else for (size_t i=0; i<cities.size(); i++) cout << "  " << (i+1) << ". " << cities[i] << "\n"; break; }
        case 10: paketSavePaket(paket, "paket.csv"); trackingSave(tracking, "tracking.csv"); break;
        case 0: cout << "  Logout...\n"; return true;
        case 99: cout << "\n  Keluar dari program...\n"; return false;
        default: cout << "  Pilihan tidak valid!\n"; break;
        }
    } while (true);
}

} // namespace SwiftExpedition

#endif // CLI_MENUS_H
