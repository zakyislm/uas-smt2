# Swift Expedition - C++

> Project UAS Mata Kuliah Algoritma Pemrograman & Struktur Data  
> CLI Program dengan Bahasa C++ — Single-File Implementation

---

## Overview

**Swift Expedition** adalah aplikasi CLI untuk pengelolaan sistem ekspedisi pengiriman paket dengan fitur multi-role login. Seluruh kode program diimplementasikan dalam **satu file `main.cpp`** (1030 baris) yang terorganisir menggunakan `namespace SwiftExpedition`.

Program ini memiliki **4 role pengguna**: **CEO**, **Manager**, **Admin**, dan **Kurir**, masing-masing dengan menu dan hak akses berbeda. Fitur utama mencakup manajemen paket (CRUD), tracking pengiriman dengan undo, antrian paket FIFO, rotasi kurir, pencarian resi via AVL Tree, serta visualisasi rute antar kota menggunakan Graph (BFS/DFS).

---

## Arsitektur Program

### Single-File Structure (`main.cpp`)

Seluruh kode berada dalam satu file `main.cpp` yang terorganisir dalam blok-blok logis:

```
main.cpp (1030 baris)
│
├── Baris 1-17      : Include headers & using namespace std
├── Baris 19-43     : Enum RoleType & helper functions (inline)
├── Baris 45-116    : Data structs (User, Paket, Tracking, Kurir, Layanan, KlasifikasiBerat, Kota, Edge)
├── Baris 118-474   : Template Data Structures
│   ├── SinglyLinkedList<T>    (baris 123-208)
│   ├── CircularLinkedList<T>  (baris 211-248)
│   ├── Stack<T>               (baris 251-272)
│   ├── Queue<T>               (baris 275-308)
│   ├── AVLTree<K,V>           (baris 311-362)
│   ├── HashTable<K,V>         (baris 365-378)
│   └── Graph                  (baris 381-474)
├── Baris 476-512   : CSV Helper Functions (csvRead, csvWrite, csvSplit, csvJoin)
├── Baris 514-539   : Service Global State (AuthData, PaketData, TrackingData, RoutingData)
├── Baris 541-865   : Service Functions
│   ├── Auth         (baris 546-564)
│   ├── Paket        (baris 567-722)
│   ├── Tracking     (baris 724-804)
│   ├── Report       (baris 806-846)
│   └── Routing      (baris 848-865)
├── Baris 867-871   : Callback Function (trackingCallbackPrint)
├── Baris 873-981   : Menu Functions
│   ├── menuLogin    (baris 878-891)
│   ├── menuAdmin    (baris 894-916)
│   ├── menuKurir    (baris 919-936)
│   ├── menuManager  (baris 939-957)
│   └── menuCeo      (baris 960-981)
├── Baris 983       : End of namespace SwiftExpedition
└── Baris 988-1030  : main() — Entry point
```

---

## Daftar Syarat UAS yang Dipenuhi

| No | Konsep | Lokasi di main.cpp | Implementasi |
|----|--------|-------------------|--------------|
| 1 | `struct` | Baris 47-116 | User, Paket, Tracking, Kurir, Layanan, KlasifikasiBerat, Kota, Edge |
| 2 | `pointer (*)` | Baris 162-178, 561-564 | `findById()`, `findByResi()`, `authLogin()` mengembalikan pointer |
| 3 | `reference (&)` | Seluruh parameter fungsi | Passing by reference untuk efisiensi (contoh: `AuthData& auth`) |
| 4 | `namespace` | Baris 19, 983 | `namespace SwiftExpedition { ... }` membungkus seluruh kode |
| 5 | Callback function | Baris 773-776 | `trackingProcessHistory()` menerima function pointer `void (*callback)(const Tracking&)` |
| 6 | Default argument | Baris 51-53, 479 | Constructor struct dengan default value, `csvRead(filename, skipHeader = true)` |
| 7 | Inline function | Baris 26-42, 479-512 | `roleToString()`, `stringToRole()`, semua CSV helper functions |
| 8 | Template | Baris 123, 211, 251, 275, 311, 365 | Template class untuk semua struktur data custom |
| 9 | Exception handling | Baris 482, 547-558, 569-576 | `try/catch/throw` pada semua fungsi load CSV |
| 10 | STL vector/list | Baris 526-527, 532, 538 | `vector<Layanan>`, `vector<KlasifikasiBerat>`, `vector<Tracking>`, `vector<Kota>` |
| 11 | Iterator | Baris 133-142, 148-149 | Custom `Iterator` struct pada SinglyLinkedList dengan operator overloading |
| 12 | sort | Baris 663, 669, 810 | `std::sort()` dengan lambda comparator untuk sorting paket |
| 13 | find_if | Baris 679-680, 683-684 | `std::find_if()` untuk mencari layanan dan klasifikasi |
| 14 | count_if | Baris 674-676, 821, 833-835 | `std::count_if()` untuk menghitung paket berdasarkan status |
| 15 | File handling | Baris 479-498 | `ifstream`/`ofstream` pada `csvRead()` dan `csvWrite()` |
| 16 | Lambda expression | Baris 599, 663, 669, 674, 813 | Lambda sebagai comparator di sort, predicate di count_if |

---

## Penggunaan Struktur Data

| No | Struktur Data | Baris | Fungsi dalam Program |
|----|--------------|-------|---------------------|
| 1 | **Singly Linked List** | 123-208 | Master data paket — CRUD, traversal, pencarian |
| 2 | **Circular Linked List** | 211-248 | Rotasi kurir — round-robin assignment paket ke kurir |
| 3 | **Stack** | 251-272 | Undo tracking — LIFO rollback status pengiriman |
| 4 | **Queue** | 275-308 | Antrian paket — FIFO paket menunggu diproses kurir |
| 5 | **AVL Tree** | 311-362 | Pencarian resi — O(log n) lookup nomor resi ke ID paket |
| 6 | **Hash Table** | 365-378 | Autentikasi user — O(1) lookup username untuk login |
| 7 | **Graph (Adjacency List)** | 381-474 | Rute antar kota — representasi jaringan jalur pengiriman |
| 8 | **BFS** | 399-422 | Mencari jalur dengan minimal transit antar kota |
| 9 | **DFS** | 424-434 | Menelusuri semua rute yang terjangkau dari suatu kota |
| 10 | **Find All Paths** | 436-462 | Mencari semua kemungkinan jalur beserta total jaraknya |

---

## Struktur Folder

```
swift_expedition_uas/
│
├── main.cpp                          # Single-file implementation (1030 baris)
├── main.exe                          # Executable hasil kompilasi
├── README.md                         # Dokumentasi overview
├── guide.md                          # Panduan lengkap & penjabaran syarat
│
└── data/                             # Data CSV (delimiter: titik koma)
    ├── anggota.csv                    # Data user login (id;nama;username;password;role)
    ├── paket.csv                      # Data paket pengiriman
    ├── tracking.csv                   # Riwayat tracking pengiriman
    ├── layanan.csv                    # Jenis layanan (Reguler, Express, dll)
    ├── klasifikasi.csv               # Klasifikasi berat (Ringan, Sedang, Berat)
    ├── kota.csv                       # Jalur antar kota untuk Graph
    └── kurir.csv                      # Data kurir
```

---

## Cara Penggunaan

### 1. Compile

```bash
g++ main.cpp -o main.exe
```

### 2. Run

```bash
./main.exe
```

### 3. Login

Gunakan salah satu akun berikut:

| Username | Password | Role    |
|----------|----------|---------|
| zaky     | pass123  | CEO     |
| budi     | pass123  | Manager |
| andi     | pass123  | Admin   |
| citra    | pass123  | Kurir   |
| doni     | pass123  | Kurir   |
| eka      | pass123  | Kurir   |
| admin    | pass1    | Admin   |
| manager  | pass1    | Manager |
| ceo      | pass1    | CEO     |

### 4. Menu Per Role

#### Admin (11 menu)
1. Tambah Paket Baru
2. Hapus Paket
3. Edit Paket
4. Cari Paket (by ID)
5. Cari Paket (by Resi — AVL Tree)
6. Lihat Semua Paket (Singly Linked List)
7. Lihat Antrean Paket (Queue)
8. Lihat Daftar Kurir (Circular Linked List)
9. Lihat Daftar Layanan
10. Lihat Klasifikasi Berat
11. Lihat AVL Tree (Resi)

#### Kurir (6 menu)
1. Ambil Paket dari Queue (FIFO)
2. Update Status Tracking
3. Undo Tracking (Stack — LIFO rollback)
4. Lihat Riwayat Tracking
5. Lihat Antrean Paket
6. Lihat Semua Paket

#### Manager (7 menu)
1. Laporan Semua Paket
2. Laporan Paket by Status
3. Sorting Paket Berdasarkan Biaya (asc/desc)
4. Sorting Paket Berdasarkan Berat (asc/desc)
5. Statistik Pengiriman
6. Lihat Riwayat Tracking
7. Lihat Semua Paket

#### CEO (10 menu)
1. Laporan Keseluruhan (CEO Report)
2. Statistik Pengiriman
3. Lihat Semua Paket
4. Lihat Riwayat Tracking
5. Lihat Graph Rute Kota
6. BFS — Cari Jalur Terpendek (Minimal Transit)
7. DFS — Tampilkan Semua Rute dari Kota
8. Cari Semua Jalur Antar Kota
9. Lihat Daftar Kota
10. Simpan Data ke CSV

### 5. Navigasi

- **0** → Logout (kembali ke menu login, data otomatis disimpan)
- **99** → Exit Program (keluar sepenuhnya, data otomatis disimpan)

---

## Format CSV

Semua file CSV menggunakan delimiter **`;`** (titik koma) dan berada di folder `data/`.

### anggota.csv
```
id;nama;username;password;role
```

### paket.csv
```
id;resi;nama_penerima;alamat_tujuan;kota_asal;kota_tujuan;berat;biaya;status;id_layanan;id_klasifikasi;id_kurir
```

### tracking.csv
```
id;id_paket;lokasi;status;timestamp
```

### layanan.csv
```
id;nama;tarif_per_kg
```

### klasifikasi.csv
```
id;nama;biaya_tambahan
```

### kota.csv
```
asal;tujuan;jarak
```

### kurir.csv
```
id;nama;status;total_paket
```

---

## Alur Program

```
START
  │
  ▼
[Load Data CSV]
  ├── anggota.csv   → HashTable (User)
  ├── layanan.csv   → vector<Layanan>
  ├── klasifikasi.csv → vector<KlasifikasiBerat>
  ├── paket.csv     → SinglyLinkedList + AVLTree + Queue
  ├── kurir.csv     → CircularLinkedList
  ├── tracking.csv  → vector<Tracking> + Stack
  └── kota.csv      → Graph
  │
  ▼
[Login Loop]
  │
  ├── Input username & password (max 3 attempts)
  │
  ├── Login Gagal → Exit (setelah 3x)
  │
  └── Login Berhasil → Switch Role
        │
        ├── ADMIN   → menuAdmin()
        ├── KURIR   → menuKurir()
        ├── MANAGER → menuManager()
        └── CEO     → menuCeo()
              │
              ├── Pilih 0  → Logout → Save CSV → Kembali ke Login
              └── Pilih 99 → Exit → Save CSV → END
```

---

## Catatan Penting

- Semua kode berada dalam **satu file `main.cpp`** — tidak ada header file terpisah
- Data disimpan di folder `data/` dan **otomatis dibaca saat program dimulai**
- Data **otomatis tersimpan** ke CSV saat user logout (0) atau exit (99)
- Delimiter CSV: **`;`** (titik koma), bukan koma
- Kompatibel dengan Windows (g++ MinGW-w64)
- Semua template data structures diimplementasikan manual (bukan STL)
- Graph menggunakan **undirected weighted adjacency list**

---

> **Swift Expedition** — UAS Algoritma Pemrograman & Struktur Data  
> Single-file C++ implementation dengan 10 struktur data & 16 konsep pemrograman