# SwiftExpedition Tracking Dashboard

SwiftExpedition adalah sistem manajemen logistik dan pengiriman paket canggih yang dirancang untuk mensimulasikan alur kerja ekspedisi di dunia nyata. Proyek ini memadukan kekuatan **Struktur Data Kompleks di C++** dengan **Antarmuka Grafis Berbasis Web (GUI)** modern untuk menghasilkan platform yang interaktif, cepat, dan mudah digunakan.

---

## Konsep Inti (Core Concepts)

Sistem ini dibangun di atas konsep integrasi antara backend berkinerja tinggi dan frontend yang responsif, menggunakan arsitektur **Local Client-Server**:

1. **C++ Data Structures Backend**
   Sistem tidak menggunakan database eksternal seperti SQL. Semua data diproses murni secara *in-memory* menggunakan implementasi struktur data buatan sendiri (Custom STL-like) di dalam memori C++:
   *   **Singly Linked List**: Untuk manajemen keseluruhan daftar paket.
   *   **Circular Linked List**: Untuk rotasi penugasan kurir secara otomatis (Round-Robin).
   *   **Queue**: Untuk antrean paket yang menunggu diproses berdasarkan prioritas layanan.
   *   **Stack**: Untuk sistem *Undo*, memungkinkan pembatalan status *tracking* terakhir jika terjadi kesalahan.
   *   **AVL Tree**: Untuk pencarian paket yang sangat cepat berdasarkan nomor resi (Logaritmic Time Complexity).
   *   **Hash Table**: Untuk sistem autentikasi dan pencarian pengguna (O(1) lookup).
   *   **Graph (BFS & DFS)**: Untuk memvisualisasikan rute antarkota, mencari jalur terpendek (BFS), dan mencari alternatif seluruh rute yang mungkin (DFS).
   *   **IntroSort (std::sort)**: Mengurutkan paket berdasarkan biaya atau berat secara efisien.

2. **C++ HTTP REST Server**
   Sebuah server HTTP lokal yang dibuat dengan `cpp-httplib` dan `nlohmann/json` berjalan di latar belakang (port 8080). Server ini bertugas untuk menerjemahkan data dari struktur data C++ menjadi format JSON agar bisa dibaca oleh *browser*. Server juga memproteksi data dengan sistem `std::mutex` untuk mencegah tabrakan data (Thread-Safety).

3. **Single Page Application (SPA) Frontend**
   Antarmuka web tanpa *refresh* yang dirancang dengan **Vanilla JavaScript & CSS** tanpa *framework* berat. Antarmuka ini menggunakan sistem desain premium dengan gaya *dark mode* dan mengkonsumsi API JSON dari C++.

---

## Struktur Folder Modular (Modular Directory Structure)

Untuk kemudahan presentasi dan pemeliharaan kode (maintainability), codebase proyek ini telah direfaktorisasi dari file tunggal yang panjang menjadi struktur modular yang rapi di bawah folder `lib/`:

*   **`main.cpp`**: Hanya berisi fungsi utama `main()` dan inisialisasi awal untuk alur CLI program console (~48 baris).
*   **`server.cpp`**: Hanya berisi konfigurasi HTTP server dan routing API JSON untuk frontend web.
*   **`lib/expedition.h`**: Core header yang menyimpan semua definisi struktur data custom (Singly/Circular Linked List, Stack, Queue, AVL Tree, Graph), manipulasi CSV, dan state global.
*   **`lib/cli_menus.h`**: Menyimpan alur dan tampilan menu CLI untuk program console.
*   **`lib/serialization.h`**: Menyimpan helper serialisasi objek C++ menjadi JSON untuk API backend.
*   **`external/`**: Menyimpan pustaka eksternal pihak ketiga (`httplib.h` dan `json.hpp`) agar file root tetap bersih.

---

## Program Workflow (Alur Kerja)

Alur kerja dirancang menyerupai operasional ekspedisi nyata dengan 4 pilar utama (berdasarkan *Role* / Hak Akses):

### 1. Penerimaan Paket (Admin / CEO)
*   **Input Data**: Admin memasukkan data paket baru melalui form web (Layanan, Berat, Kota Asal, dan Kota Tujuan).
*   **Masuk Antrean**: Paket baru akan masuk ke dalam **Queue** (Antrean), dan didata di dalam **Singly Linked List** dan **AVL Tree**.

### 2. Penugasan Kurir (Kurir / Admin)
*   **Dequeue**: Saat fungsi "Ambil Paket" dieksekusi, paket pertama di antrean akan dikeluarkan dari **Queue**.
*   **Rotasi Kurir**: Sistem akan melihat **Circular Linked List** kurir. Kurir yang sedang mendapat giliran akan otomatis dipasangkan dengan paket yang baru dikeluarkan dari antrean.
*   Status paket berubah otomatis menjadi `dalam_perjalanan`.

### 3. Pemantauan & Update Status (Kurir)
*   **Tracking**: Kurir mengupdate lokasi terkini paket. Setiap update dimasukkan ke **Array Tracking** dan dicatat dalam **Stack**.
*   **Kesalahan Update (Undo)**: Jika ada salah *input*, kurir dapat memencet tombol *Undo Action*. Sistem akan mem-`pop` (mengambil data terakhir) dari **Stack** dan mengembalikan paket ke status sebelumnya.

### 4. Analisis & Rute Ekspedisi (Manager / CEO)
*   **Laporan Operasional**: Manajer dapat melihat perbandingan pendapatan, total beban, dan efisiensi kurir.
*   **Sorting & Filtering**: Menemukan anomali paket terberat atau paling mahal.
*   **Simulasi Rute (Graph)**: 
    *   **BFS (Breadth-First Search)**: Secara *real-time* mencari jalur terpendek (transit paling sedikit) agar bahan bakar lebih efisien. Digambarkan dengan *Canvas API*.
    *   **DFS (Depth-First Search)**: Menampilkan seluruh kemungkinan rute jika jalur utama sedang bermasalah.

---

## Cara Menjalankan

1. Lakukan kompilasi server (*build*):
   ```bash
   build.bat
   ```
2. Jalankan aplikasi server:
   ```bash
   ./server.exe
   ```
3. Browser akan otomatis terbuka ke alamat `http://localhost:8080`.
4. Login menggunakan role sesuai data di `anggota.csv` (Contoh: `admin1` / `adminpass`).
5. Jangan lupa klik tombol **Simpan (CSV)** pada sistem sebelum menutup *server* agar seluruh perubahan struktur data tersimpan permanen!