# SwiftExpedition — Sistem Manajemen Logistik & Pengiriman Paket

SwiftExpedition adalah sistem manajemen logistik dan pengiriman paket yang menggunakan  **backend C++** dengan **interface web modern (SPA Javascript)**. Semua data diproses secara *in-memory* menggunakan struktur data buatan sendiri.

> **Platform:** Windows

---

## Requirements

| Specification | ... |
|---------------|------------|
| **OS** | Windows 10 / 11 |
| **Compiler** | MinGW `g++` (C++17) |
| **Browser** | Chrome, Edge, atau Firefox versi terbaru |

> Jika belum install MinGW, download disini  [winlibs.com](https://winlibs.com/) atau [MSYS2](https://www.msys2.org/).

---

## Cara Menggunakan Aplikasi

### 1. Compile (Build)

Klik dua kali file **`build.bat`** atau execute via terminal:

```
build.bat
OR
./build.bat
OR
.\build.bat
```

Script ini akan compile `server.cpp` menjadi `server.exe` menggunakan library `httplib`, `nlohmann/json`, dan `libsodium`.

### 2. Run Server

Klik dua kali file **`server.exe`** atau execute via terminal:

```
server.exe
OR
./server.exe
OR
.\server.exe
```

Local HTTP server akan running di **`http://localhost:9090`** lalu browser akan **terbuka otomatis** ke url tersebut.

### 3. Login

Gunakan salah satu akun berikut (password default: **`pass123`** untuk semua akun):

| Username | Role | Permissions |
|----------|------|-------|
| `zaky` | CEO | Dashboard, All |
| `farrel` | Manager | Dashboard, Report, Sorting |
| `fauzi` | Admin | Manage Package, Queue |
| `citra` | Kurir | Update Status, Undo, History |

### 4. Done!

Aplikasi siap digunakan. Untuk menghentikan server, tekan `Ctrl+C` pada terminal atau close windows terminal.

---

## Proyek Structure

```
alpro-strukdat/
├── build.bat                  # Script compile (Windows)
├── server.cpp                 # HTTP REST Server + routing API
├── server.exe                 # Hasil compile server
├── main.cpp                   # Entry point CLI (program console)
├── main.exe                   # Hasil compile CLI
├── libsodium-26.dll           # Runtime library untuk hashing password
│
├── lib/                       #   Header module C++
│   ├── expedition.h           #   Semua struktur data (LinkedList, Queue, Stack, AVL, Graph)
│   ├── cli_menus.h            #   Menu interaktif CLI
│   └── serialization.h        #   Helper parser C++ → JSON
│
├── external/lib/              #   3rd Party Library
│   ├── http_lib/httplib.h     #   HTTP server library
│   ├── json_hpp/json.hpp      #   JSON parser
│   └── libsodium/             #   Password hashing
│
├── data/                      #   Data CSV (database flat-file)
│   ├── anggota.csv            #   Data pengguna & login
│   ├── paket.csv              #   Data paket pengiriman
│   ├── tracking.csv           #   Riwayat tracking paket
│   ├── kurir.csv              #   Daftar kurir
│   ├── kota.csv               #   Graph rute antarkota
│   ├── layanan.csv            #   Jenis layanan pengiriman
│   └── klasifikasi.csv        #   Klasifikasi paket
│
└── frontend/                  # Single Page Application (SPA)
    ├── index.html             #   Main Page
    ├── css/swift.css           #   Stylesheet (dark mode)
    └── js/
        ├── api.js             #   HTTP client ke backend
        ├── app.js             #   Router & navigasi SPA
        ├── chart.js           #   Chart.js (grafik dashboard)
        ├── components/        #   Komponen UI reusable
        │   ├── graphCanvas.js #     Visualisasi graf (Canvas API)
        │   ├── sidebar.js     #     Nav sidebar
        │   ├── header.js      #     Header halaman
        │   ├── modal.js       #     Dialog modal
        │   ├── statusChip.js  #     Badge status paket
        │   └── table.js       #     Tabel data
        └── screens/           #   Halaman-halaman aplikasi
            ├── login.js       #     Halaman login
            ├── dashboard.js   #     Dashboard & statistik
            ├── pengiriman.js  #     Daftar semua paket
            ├── tambahPaket.js #     Form tambah paket baru
            ├── antrean.js     #     Antrean paket (Queue)
            ├── kurir.js       #     Rotasi kurir (Circular LL)
            ├── ambilPaket.js  #     Dequeue + assign kurir
            ├── updateStatus.js#     Update tracking paket
            ├── undoAction.js  #     Undo status terakhir (Stack)
            ├── riwayat.js     #     Riwayat tracking
            ├── filterData.js  #     Filter & pencarian paket
            ├── sortingPaket.js#     Sorting paket
            ├── bfsGraph.js    #     Jalur terpendek (BFS)
            └── dfsGraph.js    #     Semua rute (DFS)
```

---

## Struktur Data

| Struktur Data | ... |
|---------------|-------------|
| **Singly Linked List** | Manajemen seluruh paket |
| **Circular Linked List** | Rotasi kurir (round-robin) |
| **Queue** | Antrean paket menunggu diproses |
| **Stack** | Sistem undo status tracking |
| **AVL Tree** | Pencarian paket berdasarkan resi |
| **Hash Table** | Auth pengguna |
| **Graph + BFS** | Pencarian jalur terpendek antarkota |
| **Graph + DFS** | Pencarian semua rute alternatif |
| **IntroSort** | Pengurutan paket berdasarkan biaya/ukuran dimensi |

---

## Notes

- Semua data disimpan dalam file CSV di folder `data/`. Data yang berubah **otomatis tersave** saat logout dari aplikasi.
- File `libsodium-26.dll` **wajib ada** di folder yang sama dengan `server.exe` agar fungsi hash berjalan.
- Aplikasi ini dibuat untuk **Windows** dan belum tersedia untuk OS lain.