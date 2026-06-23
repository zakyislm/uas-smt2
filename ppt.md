# Slide 1: Judul Presentasi
**SwiftExpedition: Sistem Manajemen Logistik Modern**
*Integrasi Struktur Data C++ Backend & GUI Web Responsif*

---

# Slide 2: Latar Belakang & Pustaka (Libraries)
*Mengapa menggunakan teknologi ini?*

**Backend (C++)**:
- `libsodium`: Hashing password aman menggunakan algoritma Argon2id.
- `cpp-httplib`: Server HTTP RESTful modern yang ringan dan multi-threaded.
- `nlohmann/json`: Parsing dan serialisasi data JSON yang cepat dan aman.

**Frontend (HTML/CSS/JS)**:
- Vanilla Javascript: Manipulasi DOM interaktif tanpa framework berat.
- Canvas API: Menggambar visualisasi struktur data Graph secara dinamis.
- Poppins & Material Icons: Tipografi dan ikon visual modern & premium.

---

# Slide 3: Kenapa Memakai JavaScript di Frontend?
1. **Antarmuka Interaktif**: SPA (Single Page Application) tanpa refresh halaman untuk pengalaman pengguna yang mulus.
2. **Visualisasi Graph**: Menggunakan `<canvas>` untuk menggambar node kota dan rute lintasan (BFS & DFS) secara visual dan interaktif.
3. **Komunikasi Asinkron**: Menggunakan `Fetch API` (AJAX) untuk berkomunikasi langsung dengan REST API server C++.

---

# Slide 4: Kenapa Harus Menggunakan REST API?
- **Decoupling (Pemisahan Tugas)**: C++ fokus pada logika bisnis, algoritma pencarian rute, dan manipulasi memori berkecepatan tinggi. Frontend (Web) fokus pada desain visual.
- **Interoperabilitas**: Struktur data internal C++ (seperti AVL Tree, Graph, List) tidak dapat dipahami langsung oleh web browser. REST API menerjemahkan struktur ini menjadi format standar **JSON**.

---

# Slide 5: Kelebihan & Kekurangan (Pros & Cons)

**Kelebihan (+)**:
- **Performa Tinggi**: Kecepatan pemrosesan *in-memory* di C++ (O(1) untuk Hashtable, O(log N) untuk AVL Tree).
- **Aman**: Password disimpan terenkripsi hash menggunakan Libsodium (Argon2id).
- **GUI Modern**: Desain Dark Mode yang estetik dengan visualisasi rute interaktif.

**Kekurangan (-)**:
- **In-Memory Volatility**: Kehilangan data jika server crash sebelum disimpan ke file CSV.
- **Concurrency Overhead**: Memerlukan sinkronisasi `std::mutex` karena struktur data custom tidak bersifat *thread-safe* bawaan.

---

# Slide 6: Struktur Data & Lokasi Kode (1/2)
*Bagaimana persyaratan struktur data dipenuhi di kode C++*

1. **Singly Linked List**: Manajemen daftar paket.
   - 📂 [lib/expedition.h:L128-212](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L128-L212)
2. **Circular Linked List**: Antrean rotasi kurir Round-Robin.
   - 📂 [lib/expedition.h:L216-260](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L216-L260)
3. **Queue**: Antrean paket masuk prioritas layanan.
   - 📂 [lib/expedition.h:L293-345](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L293-L345)
4. **Stack**: Riwayat pelacakan paket & fitur Undo.
   - 📂 [lib/expedition.h:L264-289](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L264-L289)

---

# Slide 7: Struktur Data & Lokasi Kode (2/2)

5. **AVL Tree**: Pencarian paket logaritmik berdasarkan nomor resi.
   - 📂 [lib/expedition.h:L349-399](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L349-L399)
6. **Hash Table**: Autentikasi user O(1) lookup.
   - 📂 [lib/expedition.h:L402-415](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L402-L415)
7. **Graph (BFS/DFS)**: Pemetaan rute kota, rute terpendek (BFS), seluruh rute (DFS).
   - 📂 [lib/expedition.h:L418-546](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L418-L546)
8. **IntroSort**: Pengurutan paket berdasarkan berat/biaya.
   - 📂 [lib/expedition.h:L741, L748](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L741-L748)
9. **Password Hashing (Libsodium)**: Verifikasi password menggunakan `crypto_pwhash_str_verify`.
   - 📂 [lib/expedition.h:L634-651](file:///c:/Users/user/Documents/uassmt2/alpro-strukdat/lib/expedition.h#L634-L651)
