# Swift Expedition - Panduan Lengkap

> Dokumentasi lengkap proyek UAS Algoritma Pemrograman & Struktur Data  
> Single-File C++ Implementation (`main.cpp` — 1100 baris)

---

## Daftar Isi

1. [Penjabaran Syarat UAS](#1-penjabaran-syarat-uas)
2. [Penggunaan Struktur Data](#2-penggunaan-struktur-data)
3. [Mengapa Single-File Implementation](#3-mengapa-single-file-implementation)
4. [Organisasi Kode dalam main.cpp](#4-organisasi-kode-dalam-maincpp)
5. [Alur Kerja Program](#5-alur-kerja-program)
6. [Guide Edit Data CSV](#6-guide-edit-data-csv)
7. [Tutorial Simulasi Semua Role](#7-tutorial-simulasi-semua-role)

---

## 1. Penjabaran Syarat UAS

Berikut adalah penjabaran lengkap dari **16 syarat UAS** yang wajib dipenuhi, beserta lokasi implementasi di `main.cpp` dan alasan mengapa diimplementasikan dengan cara tersebut:

---

### 1.1 `struct` — Model Data

**Lokasi:** Baris 47-116 (`main.cpp`)

**Struct yang dideklarasikan:**
- `User` (baris 47-54) — Data pengguna login
- `Paket` (baris 56-69) — Data paket pengiriman
- `Tracking` (baris 71-79) — Riwayat tracking pengiriman
- `Kurir` (baris 81-88) — Data kurir pengirim
- `Layanan` (baris 90-96) — Jenis layanan pengiriman
- `KlasifikasiBerat` (baris 98-104) — Klasifikasi berat paket
- `Kota` (baris 106-111) — Data kota untuk graph
- `Edge` (baris 113-116) — Edge graph (tujuan + jarak)

**Penggunaan** `struct`:**  
Struct dipilih karena model-model ini berfungsi sebagai **Plain Data Objects (PDO)** — mereka hanya menyimpan data tanpa memerlukan enkapsulasi ketat (private members). Semua field bersifat public secara default pada struct, sehingga akses data menjadi lebih sederhana dan langsung. Ini sesuai dengan prinsip "data-first design" di mana model hanya bertugas membawa data antar layer aplikasi.

**Penggunaan** ditulis seperti itu:**  
Setiap struct merepresentasikan satu entitas bisnis nyata. Contoh `Paket` memiliki field seperti `id`, `resi`, `nama_penerima`, `berat`, `biaya`, `status`, dll. yang merupakan atribut alami dari sebuah paket pengiriman. Constructor dengan default argument disediakan agar objek dapat dibuat dengan fleksibel — bisa kosong (default) atau dengan nilai tertentu.

```cpp
struct Paket {
    int id, id_layanan, id_klasifikasi, id_kurir;
    string resi, nama_penerima, alamat_tujuan, kota_asal, kota_tujuan, status;
    double berat, biaya;
    Paket(int id = 0, const string& resi = "", ...)  // default arguments
        : id(id), id_layanan(id_layanan), ... {}
};
```

---

### 1.2 `pointer (*)` — Navigasi & Akses Data

**Lokasi:** Baris 162-178, 341-346, 561-564 (`main.cpp`)

**Implementasi:**
- `SinglyLinkedList::findById()` (baris 162-166) — mengembalikan `T*`
- `SinglyLinkedList::findByResi()` (baris 174-178) — mengembalikan `T*`
- `AVLTree::searchNode()` (baris 341-346) — mengembalikan `V*`
- `HashTable::find()` (baris 369) — mengembalikan `V*`
- `authLogin()` (baris 561-564) — mengembalikan `User*`

**Mengapa pointer:**  
Pointer digunakan untuk **return value opsional** — fungsi dapat mengembalikan `nullptr` jika data tidak ditemukan, atau pointer ke objek jika ditemukan. Ini lebih efisien daripada mengembalikan objek copy karena:
- Tidak ada overhead copying data
- Pemanggil bisa langsung memodifikasi data asli melalui pointer
- Null-check menjadi mekanisme error handling yang sederhana

```cpp
inline User* authLogin(AuthData& auth, const string& username, const string& password) {
    User* u = auth.userTable.find(username);
    return (u && u->password == password) ? u : nullptr;
}
```

---

### 1.3 `reference (&)` — Pass by Reference

**Lokasi:** Seluruh parameter fungsi service & menu (`main.cpp`)

**Contoh implementasi:**
- `authLoadUsers(AuthData& auth, const string& filename)` (baris 546)
- `paketAddPaket(PaketData& p, const Paket& pk)` (baris 629)
- `trackingUpdateStatus(TrackingData& tr, int paketId, ...)` (baris 749)
- `menuAdmin(User* user, PaketData& paket)` (baris 894)

**Mengapa reference:**  
Reference (`&`) digunakan untuk **menghindari copying** objek besar saat passing parameter ke fungsi. Berbeda dengan pointer, reference:
- Tidak bisa null (lebih aman)
- Syntax pemanggilan lebih bersih (tidak perlu `*` atau `->`)
- Menjamin objek yang di-pass valid
- Memungkinkan modifikasi langsung pada objek asli

```cpp
void paketAddPaket(PaketData& p, const Paket& pk) {
    // p di-pass by reference — modifikasi langsung ke objek asli
    // pk di-pass by const reference — tidak di-copy, tidak bisa diubah
}
```

---

### 1.4 `namespace` — Organisasi Kode

**Lokasi:** Baris 19 dan 1000 (`main.cpp`)

**Implementasi:**
```cpp
namespace SwiftExpedition {
    // Semua enum, struct, template, fungsi, dan menu
    // ...
} // namespace SwiftExpedition

int main() {
    using namespace SwiftExpedition;
    // ...
}
```

**Penggunaan namespace:**  
Namespace mencegah **name collision** (konflik nama) antar modul. Semua kode proyek dibungkus dalam `namespace SwiftExpedition` sehingga nama struct/function seperti `User`, `Paket`, `Graph`, `Stack`, `Queue` tidak akan bentrok dengan library eksternal atau kode lain. Ini adalah best practice C++ untuk proyek skala menengah ke atas.

---

### 1.5 Callback Function — Function Pointer

**Lokasi:** Baris 773-776 (`main.cpp`)

**Implementasi:**
```cpp
inline void trackingProcessHistory(TrackingData& tr, int paketId, void (*callback)(const Tracking&)) {
    cout << "  [CALLBACK] Memproses tracking history untuk paket ID " << paketId << ":\n";
    for (auto& tk : tr.trackingHistory) if (tk.id_paket == paketId) callback(tk);
}
```

**Callback yang digunakan:**
```cpp
inline void trackingCallbackPrint(const Tracking& tr) {
    cout << "    -> " << tr.timestamp << " | " << tr.status << " - " << tr.lokasi << "\n";
}
```

**Mengapa callback function:**  
Callback function memungkinkan **pemanggilan fungsi yang ditentukan saat runtime**. Fungsi `trackingProcessHistory` tidak perlu tahu apa yang akan dilakukan dengan setiap tracking entry — ia cukup memanggil callback yang diberikan. Ini membuat kode lebih fleksibel dan reusable: callback bisa diganti untuk print, log ke file, atau proses lainnya tanpa mengubah fungsi utama.

---

### 1.6 Default Argument — Parameter Opsional

**Lokasi:** Baris 51-53, 60-68, 74-78, 85-87, 93-95, 101-103, 108-110, 479 (`main.cpp`)

**Implementasi:**
```cpp
// Constructor struct dengan default argument
User(int id = 0, const string& nama = "", const string& username = "",
     const string& password = "", RoleType role = KURIR)

// CSV helper function
inline vector<string> csvRead(const string& filename, bool skipHeader = true)
```

**Mengapa default argument:**  
Default argument memberikan **fleksibilitas** — pemanggil tidak wajib menyebutkan semua parameter. Pada `csvRead`, parameter `skipHeader = true` berarti secara default baris pertama CSV (header) akan dilewati, yang merupakan perilaku paling umum. Pemanggil bisa override jika perlu membaca header. Pada constructor struct, default argument memungkinkan pembuatan objek kosong tanpa perlu menyebutkan semua field.

---

### 1.7 Inline Function — Fungsi Kecil Cepat

**Lokasi:** Baris 26-42, 479-512 (`main.cpp`)

**Implementasi:**
```cpp
inline string roleToString(RoleType r) {
    switch (r) {
        case CEO:     return "CEO";
        case MANAGER: return "Manager";
        case ADMIN:   return "Admin";
        case KURIR:   return "Kurir";
        default:      return "Unknown";
    }
}

inline RoleType stringToRole(const string& s) { ... }

// CSV helpers juga inline
inline vector<string> csvRead(const string& filename, bool skipHeader = true) { ... }
inline void csvWrite(const string& filename, const vector<string>& lines) { ... }
inline vector<string> csvSplit(const string& line, char delimiter = ',') { ... }
inline string csvJoin(const vector<string>& tokens, char delimiter = ',') { ... }
```

**Mengapa inline:**  
Fungsi-fungsi ini adalah **kecil dan sering dipanggil**. Keyword `inline` meminta compiler untuk menyisipkan (inline) body fungsi langsung di tempat pemanggilan alih-alih membuat function call, sehingga mengurangi overhead pemanggilan fungsi. Cocok untuk fungsi utility sederhana seperti konversi enum ke string dan operasi CSV.

---

### 1.8 Template — Generic Data Structures

**Lokasi:** Baris 123, 211, 251, 275, 311, 365 (`main.cpp`)

**Implementasi:**
```cpp
template<typename T>
struct SinglyLinkedList { ... };

template<typename T>
struct CircularLinkedList { ... };

template<typename T>
struct Stack { ... };

template<typename T>
struct Queue { ... };

template<typename K, typename V>
struct AVLTree { ... };

template<typename K, typename V>
struct HashTable { ... };
```

**Mengapa template:**  
Template memungkinkan **generic programming** — struktur data yang sama bisa digunakan untuk berbagai tipe data tanpa menulis ulang kode. `SinglyLinkedList<Paket>` untuk menyimpan paket, `SinglyLinkedList<User>` untuk user, dll. Ini memenuhi prinsip DRY (Don't Repeat Yourself) dan membuat kode lebih maintainable.

---

### 1.9 Exception Handling — Try/Catch/Throw

**Lokasi:** Baris 482, 547-558, 569-576, 579-586, 589-605, 607-621, 725-738, 849-858 (`main.cpp`)

**Implementasi:**
```cpp
inline vector<string> csvRead(const string& filename, bool skipHeader = true) {
    vector<string> lines;
    ifstream file(filename);
    if (!file.is_open()) throw runtime_error("Gagal membuka file: " + filename);
    // ...
}

inline void authLoadUsers(AuthData& auth, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        // proses data...
    } catch (const exception& e) {
        cout << "  [ERROR] Gagal memuat user: " << e.what() << "\n";
    }
}
```

**Mengapa exception handling:**  
Operasi file I/O rentan terhadap error (file tidak ditemukan, format salah, permission denied). Exception handling dengan `try/catch` memungkinkan program **menangani error dengan graceful** — menampilkan pesan error yang informatif tanpa crash. Setiap operasi loading data dibungkus dalam try/catch sehingga jika satu file gagal, program tetap bisa berjalan dengan data lainnya.

---

### 1.10 STL `vector` — Dynamic Array

**Lokasi:** Baris 526-527, 532, 538 (`main.cpp`)

**Implementasi:**
```cpp
struct PaketData {
    vector<Layanan> layananList;
    vector<KlasifikasiBerat> klasifikasiList;
    // ...
};

struct TrackingData {
    vector<Tracking> trackingHistory;
    // ...
};

struct RoutingData {
    vector<Kota> edgesList;
    // ...
};
```

**Mengapa `vector`:**  
`vector` dipilih sebagai kontainer utama untuk data referensi karena:
- **Dynamic sizing** — jumlah data tidak diketahui saat kompilasi
- **Random access O(1)** — akses cepat berdasarkan indeks
- **Kompatibel dengan STL algorithm** — `std::sort`, `std::find_if`, `std::count_if`
- **Manajemen memori otomatis** — tidak perlu alokasi/dealokasi manual

---

### 1.11 Iterator — Custom Iterator pada SinglyLinkedList

**Lokasi:** Baris 133-149 (`main.cpp`)

**Implementasi:**
```cpp
struct Iterator {
    Node* current;
    Iterator(Node* node) : current(node) {}
    T& operator*() { return current->data; }
    T* operator->() { return &(current->data); }
    Iterator& operator++() { if (current) current = current->next; return *this; }
    Iterator operator++(int) { Iterator t = *this; ++(*this); return t; }
    bool operator==(const Iterator& o) const { return current == o.current; }
    bool operator!=(const Iterator& o) const { return current != o.current; }
};

Iterator begin() { return Iterator(head); }
Iterator end() { return Iterator(nullptr); }
```

**Mengapa iterator:**  
Custom iterator memungkinkan penggunaan **range-based for loop** pada struktur data kustom. Dengan mengimplementasikan `begin()`, `end()`, dan operator overloading (`*`, `->`, `++`, `==`, `!=`), SinglyLinkedList bisa digunakan dengan syntax modern C++:
```cpp
for (const auto& paket : paketList) { ... }
```
Ini juga kompatibel dengan STL algorithms.

---

### 1.12 `std::sort` — Algoritma Sorting STL

**Lokasi:** Baris 663, 669, 810 (`main.cpp`)

**Implementasi:**
```cpp
inline vector<Paket> paketSortByBiaya(PaketData& p, bool ascending = true) {
    vector<Paket> r = p.paketList.toVector();
    sort(r.begin(), r.end(), [ascending](const Paket& a, const Paket& b) {
        return ascending ? (a.biaya < b.biaya) : (a.biaya > b.biaya);
    });
    return r;
}

inline vector<Paket> paketSortByBerat(PaketData& p, bool ascending = true) {
    vector<Paket> r = p.paketList.toVector();
    sort(r.begin(), r.end(), [ascending](const Paket& a, const Paket& b) {
        return ascending ? (a.berat < b.berat) : (a.berat > b.berat);
    });
    return r;
}
```

**Penggunaan** `std::sort`:**  
`std::sort` adalah implementasi **Introsort** (hybrid QuickSort/HeapSort/InsertionSort) dari STL yang memiliki kompleksitas **O(n log n)**. Dibandingkan menulis sorting manual, `std::sort` lebih efisien, teruji, dan mendukung custom comparator via lambda.

---

### 1.13 `std::find_if` — Pencarian dengan Kondisi

**Lokasi:** Baris 679-680, 683-684, 688-689, 693-694 (`main.cpp`)

**Implementasi:**
```cpp
inline string paketGetLayananName(PaketData& p, int id) {
    auto it = find_if(p.layananList.begin(), p.layananList.end(),
        [id](const Layanan& l) { return l.id == id; });
    return (it != p.layananList.end()) ? it->nama : "Tidak diketahui";
}

inline string paketGetKlasifikasiName(PaketData& p, int id) {
    auto it = find_if(p.klasifikasiList.begin(), p.klasifikasiList.end(),
        [id](const KlasifikasiBerat& k) { return k.id == id; });
    return (it != p.klasifikasiList.end()) ? it->nama : "Tidak diketahui";
}
```

**Penggunaan** `std::find_if`:**  
`std::find_if` mencari elemen berdasarkan **predikat/kondisi kustom**, bukan hanya nilai eksak. Sangat berguna untuk mencari layanan berdasarkan ID atau klasifikasi berdasarkan ID. Lebih fleksibel daripada `std::find` karena bisa menggunakan lambda sebagai kondisi pencarian.

---

### 1.14 `std::count_if` — Menghitung dengan Kondisi

**Lokasi:** Baris 674-676, 821, 833-835 (`main.cpp`)

**Implementasi:**
```cpp
inline int paketCountByStatus(PaketData& p, const string& status) {
    vector<Paket> r = p.paketList.toVector();
    return count_if(r.begin(), r.end(),
        [&status](const Paket& pp) { return pp.status == status; });
}

// Di reportDisplayByStatus:
auto cnt = [&](const string& s) -> int {
    return count_if(pakets.begin(), pakets.end(),
        [&s](const Paket& pp) { return pp.status == s; });
};

// Di reportDisplayStatistik:
int menunggu = count_if(pakets.begin(), pakets.end(),
    [](const Paket& pp) { return pp.status == "Menunggu"; });
```

**Penggunaan** `std::count_if`:**  
`std::count_if` menghitung jumlah elemen yang memenuhi kondisi tertentu dalam satu pass O(n). Digunakan untuk statistik seperti menghitung jumlah paket per status. Lebih efisien dan ekspresif daripada loop manual dengan counter.

---

### 1.15 File Handling — Baca/Tulis CSV

**Lokasi:** Baris 479-498 (`main.cpp`)

**Implementasi:**
```cpp
inline vector<string> csvRead(const string& filename, bool skipHeader = true) {
    vector<string> lines;
    ifstream file(filename);
    if (!file.is_open()) throw runtime_error("Gagal membuka file: " + filename);
    string line; bool first = true;
    while (getline(file, line)) {
        if (skipHeader && first) { first = false; continue; }
        first = false;
        if (!line.empty()) lines.push_back(line);
    }
    file.close();
    return lines;
}

inline void csvWrite(const string& filename, const vector<string>& lines) {
    ofstream file(filename);
    if (!file.is_open()) throw runtime_error("Gagal membuka file untuk ditulis: " + filename);
    for (auto& line : lines) file << line << "\n";
    file.close();
}
```

**Penggunaan** file handling:**  
Data perlu **persisten** (bertahan setelah program ditutup). CSV dipilih karena:
- Format sederhana dan human-readable
- Mudah diedit manual dengan text editor atau Excel
- Tidak memerlukan library database eksternal
- `ifstream`/`ofstream` adalah standar C++ untuk file I/O

---

### 1.16 Lambda Expression — Fungsi Anonim

**Lokasi:** Baris 599, 663, 669, 674, 813, 821 (`main.cpp`)

**Implementasi:**
```cpp
// Lambda sebagai predicate
auto isMenunggu = [](const string& s) { return s == "menunggu"; };
if (isMenunggu(pk.status)) p.paketQueue.enqueue(pk);

// Lambda sebagai comparator sorting
sort(r.begin(), r.end(), [ascending](const Paket& a, const Paket& b) {
    return ascending ? (a.biaya < b.biaya) : (a.biaya > b.biaya);
});

// Lambda sebagai predicate count_if
return count_if(r.begin(), r.end(),
    [&status](const Paket& pp) { return pp.status == status; });

// Lambda sebagai function untuk display
auto displayRow = [](const Paket& pp) {
    cout << "  " << setw(5) << pp.id << setw(15) << pp.resi << ... << "\n";
};
for_each(pakets.begin(), pakets.end(), displayRow);
```

**Penggunaan** lambda:**  
Lambda memungkinkan pembuatan fungsi **sekali pakai secara inline** tanpa perlu mendefinisikan functor atau function pointer terpisah. Pada sorting, lambda sebagai comparator membuat kode lebih ringkas dan logika perbandingan langsung terlihat. Lambda juga bisa **capture** variabel dari scope luar (`[ascending]`, `[&status]`, `[id]`).

---

## 2. Penggunaan Struktur Data

Berikut penjelasan lengkap **10 struktur data** yang digunakan, mengapa dipilih, dan bagaimana implementasinya di `main.cpp`:

---

### 2.1 Singly Linked List — Master Data Paket

**Lokasi:** Baris 123-208 (`main.cpp`)  
**Template:** `SinglyLinkedList<T>`  
**Digunakan untuk:** `SinglyLinkedList<Paket> paketList` (baris 522)

**Penggunaan** Singly Linked List:**
- **Insert O(1)** di akhir list — efisien untuk menambah paket baru
- **Delete O(n)** dengan traversal — cukup untuk operasi hapus paket
- **Memory efisien** — hanya satu pointer `next` per node
- **Sequential access** — sesuai untuk menampilkan semua paket (traversal)
- Struktur node yang fleksibel memudahkan insert dan delete tanpa menggeser elemen seperti pada array

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `insert()` | 151-160 | O(n) | Tambah node di akhir |
| `findById()` | 162-172 | O(n) | Cari berdasarkan ID |
| `findByResi()` | 174-178 | O(n) | Cari berdasarkan resi |
| `removeById()` | 180-187 | O(n) | Hapus berdasarkan ID |
| `update()` | 189-193 | O(n) | Update data berdasarkan ID |
| `toVector()` | 195-199 | O(n) | Konversi ke vector untuk sorting |
| `display()` | 201-205 | O(n) | Tampilkan semua data |
| `clear()` | 207 | O(n) | Hapus semua node |

**Custom Iterator (baris 133-149):**  
Mengimplementasikan operator `*`, `->`, `++`, `==`, `!=` sehingga mendukung range-based for loop.

---

### 2.2 Circular Linked List — Rotasi Kurir

**Lokasi:** Baris 211-248 (`main.cpp`)  
**Template:** `CircularLinkedList<T>`  
**Digunakan untuk:** `CircularLinkedList<Kurir> kurirList` (baris 525)

**Penggunaan** Circular Linked List:**
- **Rotasi natural** — node terakhir menunjuk ke node pertama, menciptakan siklus
- **Round-robin assignment** — setiap pemanggilan `rotate()` + `current()` mengembalikan kurir berikutnya secara siklik
- **Load balancing** — memastikan semua kurir mendapat giliran secara adil
- Tidak perlu reset ke awal secara manual; siklus berjalan terus

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `insert()` | 226-231 | O(1) | Tambah kurir baru |
| `rotate()` | 233 | O(1) | Geser ke kurir berikutnya |
| `current()` | 234 | O(1) | Ambil kurir saat ini |
| `display()` | 236-240 | O(n) | Tampilkan semua kurir |

**Cara kerja rotasi kurir:**
```cpp
inline Kurir* paketGetNextKurir(PaketData& p) {
    if (p.kurirList.isEmpty()) return nullptr;
    p.kurirList.rotate();           // Geser ke kurir berikutnya
    return p.kurirList.current();   // Return kurir yang ditunjuk
}
```

---

### 2.3 Stack — Undo Tracking

**Lokasi:** Baris 251-272 (`main.cpp`)  
**Template:** `Stack<T>`  
**Digunakan untuk:** `map<int, Stack<Tracking>> undoStacks` (baris 533)

**Penggunaan** Stack:**
- **LIFO (Last-In-First-Out)** — undo harus mengembalikan ke status sebelumnya (yang terakhir ditambahkan)
- Operasi `push` (tambah tracking) dan `pop` (undo tracking) keduanya O(1)
- Secara konseptual cocok: setiap update tracking di-push, undo berarti pop status terakhir
- Membatasi akses hanya ke elemen teratas mencegah manipulasi tracking lama

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `push()` | 262 | O(1) | Tambah tracking baru |
| `pop()` | 263 | O(1) | Undo tracking terakhir |
| `isEmpty()` | 259 | O(1) | Cek stack kosong |
| `display()` | 265-270 | O(n) | Tampilkan riwayat |

**Cara kerja undo:**
```cpp
inline bool trackingUndoLast(TrackingData& tr, int paketId) {
    auto it = tr.undoStacks.find(paketId);
    if (it == tr.undoStacks.end() || it->second.isEmpty()) return false;
    Tracking undone;
    if (it->second.pop(undone)) {
        // Hapus dari history dan kembalikan ke status sebelumnya
        // ...
        return true;
    }
    return false;
}
```

---

### 2.4 Queue — Antrian Paket Masuk

**Lokasi:** Baris 275-308 (`main.cpp`)  
**Template:** `Queue<T>`  
**Digunakan untuk:** `Queue<Paket> paketQueue` (baris 524)

**Penggunaan** Queue:**
- **FIFO (First-In-First-Out)** — paket yang masuk lebih dulu harus diproses lebih dulu (keadilan)
- **Enqueue O(1)** — Admin menambah paket ke antrian
- **Dequeue O(1)** — Kurir mengambil paket dari depan antrian
- Mencerminkan proses bisnis nyata: paket diantar sesuai urutan masuk

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `enqueue()` | 287-292 | O(1) | Tambah paket ke antrian |
| `dequeue()` | 294-299 | O(1) | Ambil paket dari antrian |
| `isEmpty()` | 284 | O(1) | Cek antrian kosong |
| `size()` | 285 | O(1) | Jumlah paket dalam antrian |
| `display()` | 301-306 | O(n) | Tampilkan antrian |

**Paket otomatis masuk queue saat:**
1. Diload dari CSV dengan status "menunggu" (baris 599-600)
2. Ditambahkan baru via `paketAddPaket()` (baris 632)

---

### 2.5 AVL Tree — Pencarian Resi

**Lokasi:** Baris 311-362 (`main.cpp`)  
**Template:** `AVLTree<K, V>`  
**Digunakan untuk:** `AVLTree<string, int> resiTree` (baris 523) — key: resi, value: ID paket

**Penggunaan** AVL Tree:**
- **Self-balancing** — menjamin tinggi tree O(log n), mencegah degenerasi ke linked list
- **Pencarian O(log n)** — jauh lebih cepat daripada linear search O(n) untuk data banyak
- Resi adalah **key unik** yang ideal sebagai key tree
- Operasi insert otomatis menyeimbangkan tree (rotasi LL, RR, LR, RL)

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `insert()` | 348, 327-339 | O(log n) | Insert + auto-balance |
| `search()` | 349, 341-346 | O(log n) | Cari resi → ID paket |
| `rotateRight()` | 324 | O(1) | Rotasi kanan |
| `rotateLeft()` | 325 | O(1) | Rotasi kiri |
| `display()` | 353-358 | O(n) | Inorder traversal |

**Rotasi AVL:**
```cpp
// Balance factor > 1 (left heavy)
if (bal > 1 && key < n->left->key) return rotateRight(n);           // LL
if (bal > 1 && key > n->left->key) { n->left = rotateLeft(n->left); return rotateRight(n); } // LR

// Balance factor < -1 (right heavy)
if (bal < -1 && key > n->right->key) return rotateLeft(n);          // RR
if (bal < -1 && key < n->right->key) { n->right = rotateRight(n->right); return rotateLeft(n); } // RL
```

**Cara kerja pencarian resi:**
```cpp
inline Paket* paketFindByResi(PaketData& p, const string& resi) {
    int* idp = p.resiTree.search(resi);     // O(log n) cari ID dari resi
    return idp ? p.paketList.findById(*idp) : nullptr;  // Lalu ambil data paket
}
```

---

### 2.6 Hash Table — Autentikasi User

**Lokasi:** Baris 365-378 (`main.cpp`)  
**Template:** `HashTable<K, V>` (wraps `std::map`)  
**Digunakan untuk:** `HashTable<string, User> userTable` (baris 518) — key: username

**Penggunaan** Hash Table:**
- **Pencarian O(log n)** — login harus cepat (menggunakan `std::map` yang berbasis red-black tree)
- Username sebagai **key unik** yang di-index
- Insert dan lookup keduanya efisien
- Cocok untuk autentikasi di mana pencarian berdasarkan key (username) adalah operasi utama

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `insert()` | 368 | O(log n) | Tambah user |
| `find()` | 369 | O(log n) | Cari user by username |
| `contains()` | 370 | O(log n) | Cek username ada |
| `display()` | 371-376 | O(n) | Tampilkan semua user |

---

### 2.7 Graph — Jalur Antar Kota

**Lokasi:** Baris 381-474 (`main.cpp`)  
**Struktur:** `Graph` (non-template)  
**Digunakan untuk:** `Graph graph` (baris 537) — jaringan rute pengiriman

**Penggunaan** Graph:**
- **Model alami** — kota = vertex, jalan = edge, jarak = weight
- Mendukung **BFS** (shortest path by edges) dan **DFS** (eksplorasi semua rute)
- **Undirected** — jalan antar kota dua arah
- **Weighted edges** — jarak dalam km sebagai bobot edge

**Representasi:** Adjacency list menggunakan `map<string, vector<Edge>>`

**Operasi yang diimplementasikan:**
| Operasi | Baris | Kompleksitas | Fungsi |
|---------|-------|-------------|--------|
| `addEdge()` | 384-387 | O(1) | Tambah jalur antar kota |
| `BFS()` | 399-422 | O(V+E) | Cari jalur minimal transit |
| `DFS()` | 424-434 | O(V+E) | Telusuri semua rute dari kota |
| `findAllPaths()` | 436-462 | O(V!) | Cari semua jalur antar kota |
| `getBFSDistance()` | 464-471 | O(V+E) | Hitung jarak jalur BFS |
| `display()` | 389-397 | O(V+E) | Tampilkan graf |

---

### 2.8 BFS — Jalur Terpendek (Minimal Transit)

**Lokasi:** Baris 399-422 (`main.cpp`)  
**Method:** `Graph::BFS(const string& asal, const string& tujuan)`

**Penggunaan** BFS:**
- BFS menjamin menemukan jalur dengan **jumlah edge paling sedikit** (level-order traversal)
- Cocok untuk mencari rute dengan **minimal transit kota** (bukan jarak terpendek)
- Menggunakan queue dalam implementasinya
- Kompleksitas O(V + E)

**Cara kerja:**
```cpp
vector<string> BFS(const string& asal, const string& tujuan) {
    map<string, string> parent;
    map<string, bool> visited;
    queue<string> q;
    // ... BFS traversal dengan tracking parent
    // Reconstruct path dari tujuan ke asal via parent
    reverse(path.begin(), path.end());
    return path;
}
```

---

### 2.9 DFS — Semua Rute dari Kota

**Lokasi:** Baris 424-434 (`main.cpp`)  
**Method:** `Graph::DFS(const string& start)`

**Penggunaan** DFS:**
- DFS mengeksplorasi **sedalam mungkin** sebelum backtracking
- Cocok untuk **menemukan semua konektivitas** dari suatu titik
- Implementasi rekursif yang natural untuk traversal graph
- Menggunakan lambda dengan recursion (baris 428)

**Lambda recursion:**
```cpp
function<void(const string&)> dfsRec = [&](const string& node) {
    visited[node] = true; cout << node << " -> ";
    for (auto& e : adjList[node]) if (!visited[e.tujuan]) dfsRec(e.tujuan);
};
dfsRec(start);
```

---

### 2.10 Find All Paths — Semua Jalur Antar Kota

**Lokasi:** Baris 436-462 (`main.cpp`)  
**Method:** `Graph::findAllPaths(const string& asal, const string& tujuan)`

**Penggunaan** Find All Paths:**
- Menemukan **semua kemungkinan jalur** dari kota asal ke tujuan
- Menampilkan **total jarak** untuk setiap jalur
- Menggunakan DFS dengan backtracking
- Berguna untuk membandingkan alternatif rute

**Cara kerja:**
```cpp
function<void(const string&)> dfsAll = [&](const string& cur) {
    visited[cur] = true; curPath.push_back(cur);
    if (cur == tujuan) {
        // Print path dan hitung total jarak
    } else {
        for (auto& e : adjList[cur]) if (!visited[e.tujuan]) dfsAll(e.tujuan);
    }
    curPath.pop_back(); visited[cur] = false;  // Backtrack
};
```

---

## 3. Mengapa Single-File Implementation

Proyek ini menggunakan **single-file implementation** (semua kode dalam satu `main.cpp`) dengan pertimbangan berikut:

### 3.1 Kesederhanaan Kompilasi

Dengan satu file, kompilasi menjadi sangat sederhana:
```bash
g++ main.cpp -o main.exe
```
Tidak perlu mengelola banyak file `.cpp` dan dependency antar file.

### 3.2 Organisasi via Namespace

Meskipun dalam satu file, kode tetap terorganisir menggunakan:
- `namespace SwiftExpedition` — membungkus seluruh kode aplikasi
- Blok komentar `// ===` — memisahkan section-section logis
- Urutan deklarasi yang logis: enum → struct → template → helpers → services → menus → main

### 3.3 Semua Kode Terlihat dalam Satu Tempat

Untuk proyek akademik, single-file memudahkan:
- **Review** — dosen/penilai bisa membaca seluruh kode tanpa berpindah file
- **Debugging** — semua fungsi terlihat dalam satu file
- **Pemahaman** — alur kode dari atas ke bawah mudah diikuti

### 3.4 Tidak Mengurangi Kualitas Kode

Meskipun single-file, prinsip-prinsip good programming tetap diterapkan:
- **Separation of concerns** — service functions terpisah dari menu functions
- **Modularity** — setiap fungsi memiliki tanggung jawab tunggal
- **Reusability** — template data structures bisa digunakan untuk tipe data apapun
- **Encapsulation** — namespace mencegah polusi global scope

---

## 4. Organisasi Kode dalam main.cpp

### 4.1 Peta Kode Lengkap

```
main.cpp (1100 baris)
│
├── SECTION 1: HEADERS (baris 1-17)
│   ├── #include <iostream>, <fstream>, <sstream>, <string>
│   ├── #include <vector>, <list>, <map>, <queue>, <stack>, <set>
│   ├── #include <algorithm>, <functional>
│   └── #include <ctime>, <iomanip>, <limits>, <stdexcept>
│
├── SECTION 2: ENUM & HELPERS (baris 19-43)
│   ├── enum RoleType { CEO, MANAGER, ADMIN, KURIR }
│   ├── inline roleToString(RoleType)
│   └── inline stringToRole(const string&)
│
├── SECTION 3: DATA STRUCTS (baris 45-116)
│   ├── struct User
│   ├── struct Paket
│   ├── struct Tracking
│   ├── struct Kurir
│   ├── struct Layanan
│   ├── struct KlasifikasiBerat
│   ├── struct Kota
│   └── struct Edge
│
├── SECTION 4: TEMPLATE DATA STRUCTURES (baris 118-474)
│   ├── SinglyLinkedList<T>       (baris 123-208)
│   │   ├── Node, Iterator
│   │   ├── insert, findById, findByResi, removeById, update
│   │   └── toVector, display, clear
│   ├── CircularLinkedList<T>     (baris 211-248)
│   │   ├── Node
│   │   ├── insert, rotate, current, display, clear
│   ├── Stack<T>                  (baris 251-272)
│   │   ├── Node
│   │   ├── push, pop, display, clear
│   ├── Queue<T>                  (baris 275-308)
│   │   ├── Node
│   │   ├── enqueue, dequeue, display, clear
│   ├── AVLTree<K,V>              (baris 311-362)
│   │   ├── Node
│   │   ├── rotateRight, rotateLeft, insertNode, searchNode
│   │   ├── insert, search, inorder, display, clear
│   ├── HashTable<K,V>            (baris 365-378)
│   │   ├── insert, find, contains, display, size
│   └── Graph                     (baris 381-474)
│       ├── addEdge, display
│       ├── BFS, DFS, findAllPaths
│       ├── getBFSDistance, hasCity, getCities
│
├── SECTION 5: CSV HELPERS (baris 476-512)
│   ├── csvRead(filename, skipHeader=true)
│   ├── csvWrite(filename, lines)
│   ├── csvSplit(line, delimiter)
│   └── csvJoin(tokens, delimiter)
│
├── SECTION 6: SERVICE GLOBAL STATE (baris 514-539)
│   ├── struct AuthData     → HashTable<string, User>
│   ├── struct PaketData    → SinglyLinkedList, AVLTree, Queue, CircularLinkedList, vectors
│   ├── struct TrackingData → vector<Tracking>, map<int, Stack<Tracking>>
│   └── struct RoutingData  → Graph, vector<Kota>
│
├── SECTION 7: SERVICE FUNCTIONS (baris 541-865)
│   ├── Auth Service        (baris 546-564)
│   │   ├── authLoadUsers()
│   │   └── authLogin()
│   ├── Paket Service       (baris 567-722)
│   │   ├── paketLoadLayanan(), paketLoadKlasifikasi()
│   │   ├── paketLoadPaket(), paketLoadKurir()
│   │   ├── generateResi(), paketAddPaket()
│   │   ├── paketDeletePaket(), paketEditPaket()
│   │   ├── paketFindById(), paketFindByResi()
│   │   ├── paketEnqueue(), paketDequeue()
│   │   ├── paketGetNextKurir(), paketAssignToKurir()
│   │   ├── paketSortByBiaya(), paketSortByBerat()
│   │   ├── paketCountByStatus()
│   │   ├── paketGetLayananName(), paketGetKlasifikasiName()
│   │   ├── paketGetLayananTarif(), paketGetKlasifikasiBiaya()
│   │   ├── paketDisplayAll(), paketDisplayQueue()
│   │   ├── paketDisplayKurir(), paketDisplayAVL()
│   │   └── paketSavePaket()
│   ├── Tracking Service    (baris 724-804)
│   │   ├── trackingLoad(), trackingSave()
│   │   ├── trackingUpdateStatus()
│   │   ├── trackingUndoLast()
│   │   ├── trackingProcessHistory() — callback function
│   │   ├── trackingDisplayHistory(), trackingDisplayAll()
│   │   ├── trackingDisplayStack()
│   │   └── trackingGetLatest()
│   ├── Report Service      (baris 806-846)
│   │   ├── reportDisplayLaporanPaket()
│   │   ├── reportDisplayByStatus()
│   │   ├── reportDisplayStatistik()
│   │   └── reportDisplayCEO()
│   └── Routing Service     (baris 848-858)
│       ├── routingLoad()
│       └── routingDisplayEdges()
│
├── SECTION 8: CALLBACK FUNCTION (baris 867-871)
│   └── trackingCallbackPrint(const Tracking&)
│
├── SECTION 9: MENU FUNCTIONS (baris 873-981)
│   ├── menuLogin()         (baris 878-891)
│   │   └── Input username/password, max 3 attempts
│   ├── menuAdmin()         (baris 894-916)
│   │   └── 11 menu items (CRUD paket, lihat data, AVL tree)
│   ├── menuKurir()         (baris 919-936)
│   │   └── 6 menu items (queue, tracking, undo)
│   ├── menuManager()       (baris 939-957)
│   │   └── 7 menu items (laporan, sorting, statistik)
│   └── menuCeo()           (baris 960-981)
│       └── 10 menu items (CEO report, graph, BFS, DFS)
│
├── End of namespace        (baris 1000)
│
└── SECTION 10: MAIN (baris 1005-1100)
    ├── Inisialisasi data structures
    ├── Load semua CSV
    ├── Login loop
    │   ├── menuLogin() → User*
    │   ├── Switch role → menu yang sesuai
    │   └── Save CSV setelah logout/exit
    └── return 0
```

### 4.2 Pola Desain yang Digunakan

**Service Layer Pattern:**  
Fungsi-fungsi service (baris 541-865) bertindak sebagai business logic layer yang mengorkestrasi penggunaan data structures. Setiap service menangani satu domain bisnis.

**Data Access Pattern:**  
CSV helper functions (baris 476-512) bertindak sebagai data access layer yang mengabstraksi operasi file I/O.

**Presentation Layer Pattern:**  
Menu functions (baris 873-981) bertindak sebagai presentation layer yang menangani interaksi dengan user.

---

## 5. Alur Kerja Program

### 5.1 Diagram Alur

```
START (main.cpp baris 988)
  │
  ▼
[Inisialisasi Data Structures] (baris 991-994)
  ├── AuthData auth
  ├── PaketData paket
  ├── TrackingData tracking
  └── RoutingData routing
  │
  ▼
[LOAD DATA dari CSV] (baris 996-1004)
  ├── authLoadUsers(auth, "anggota.csv")        → HashTable
  ├── paketLoadLayanan(paket, "layanan.csv")     → vector<Layanan>
  ├── paketLoadKlasifikasi(paket, "klasifikasi.csv") → vector<KlasifikasiBerat>
  ├── paketLoadPaket(paket, "paket.csv")         → SinglyLinkedList + AVLTree + Queue
  ├── paketLoadKurir(paket, "kurir.csv")         → CircularLinkedList
  ├── trackingLoad(tracking, "tracking.csv")     → vector<Tracking> + Stack
  └── routingLoad(routing, "kota.csv")           → Graph
  │
  ▼
┌─────────────────────────────────────────┐
│           LOGIN LOOP (baris 1010-1027)  │
│  ┌─────────────────────────────────┐    │
│  │ menuLogin(auth)                 │    │
│  │  - Input username & password    │    │
│  │  - Max 3 attempts               │    │
│  │  - Return User* / nullptr       │    │
│  └─────────────────────────────────┘    │
│              │                           │
│     ┌────────┴────────┐                 │
│     ▼                 ▼                 │
│  [nullptr]        [User* valid]         │
│  → exit                │                │
│                   ┌────┴────┐           │
│                   ▼         ▼           │
│            [Switch Role]  [Break]       │
│             │    │    │    │            │
│             ▼    ▼    ▼    ▼            │
│          ADMIN KURIR MGR  CEO           │
│             │    │    │    │            │
│             └────┴────┴────┘            │
│                      │                  │
│               [Menu Loop]               │
│               user memilih              │
│               menu 1..N/0/99            │
│                      │                  │
│              ┌───────┴───────┐          │
│              ▼               ▼          │
│         [Logout (0)]   [Exit (99)]      │
│         return true     return false    │
│              │               │          │
│              ▼               ▼          │
│         [Save CSV]      [Keluar]        │
│         continue loop    break          │
└─────────────────────────────────────────┘
  │
  ▼
END (baris 1029)
```

### 5.2 Penjelasan Detail Alur

#### Fase 1: Startup & Inisialisasi (baris 991-994)

Program dimulai dengan membuat instance 4 data structure containers:

| Container | Tipe | Fungsi |
|-----------|------|--------|
| `auth` | `AuthData` | Menyimpan user dalam HashTable |
| `paket` | `PaketData` | Menyimpan paket, kurir, layanan, klasifikasi |
| `tracking` | `TrackingData` | Menyimpan riwayat tracking dan undo stacks |
| `routing` | `RoutingData` | Menyimpan graph rute kota |

#### Fase 2: Loading Data dari CSV (baris 998-1004)

Setiap service memiliki fungsi `load*()` yang membaca file CSV dari folder `data/`. Urutan loading penting karena ada dependensi data:

1. **anggota.csv** — data user login (harus diload pertama untuk autentikasi)
2. **layanan.csv & klasifikasi.csv** — data referensi (dibutuhkan sebelum paket)
3. **paket.csv** — data paket utama (→ SinglyLinkedList + AVLTree + Queue)
4. **kurir.csv** — data kurir (→ CircularLinkedList)
5. **tracking.csv** — riwayat tracking (→ vector + Stack)
6. **kota.csv** — data rute antar kota (→ Graph)

#### Fase 3: Login Loop (baris 1010-1027)

Program masuk ke infinite loop login:

1. `menuLogin(auth)` menampilkan form login (baris 1011)
2. User memasukkan username dan password
3. `authLogin()` mencari user di HashTable (baris 561-564)
4. Jika password cocok → return pointer User
5. Jika tidak cocok → increment attempt counter (max 3)
6. Jika 3x gagal → return nullptr → program exit

#### Fase 4: Role Routing (baris 1014-1019)

Setelah login berhasil, program menggunakan `switch` untuk mengarahkan user ke menu sesuai role:

```cpp
switch (currentUser->role) {
    case ADMIN:   continueProgram = menuAdmin(currentUser, paket); break;
    case KURIR:   continueProgram = menuKurir(currentUser, paket, tracking); break;
    case MANAGER: continueProgram = menuManager(currentUser, paket, tracking); break;
    case CEO:     continueProgram = menuCeo(currentUser, paket, tracking, routing); break;
}
```

Setiap menu hanya menerima data yang **relevan** dengan role tersebut:
- CEO mendapat akses ke semua data (termasuk routing untuk BFS/DFS)
- Admin hanya mendapat paket data (fokus pada manajemen data)
- Kurir mendapat paket + tracking data (fokus pada operasional)

#### Fase 5: Save & Cleanup (baris 1021-1025)

Setelah user logout (pilih 0) atau exit (pilih 99):

1. Data paket disimpan ke `paket.csv` via `paketSavePaket()` (baris 1022)
2. Data tracking disimpan ke `tracking.csv` via `trackingSave()` (baris 1023)
3. Jika user memilih exit (return false) → break dari login loop → program selesai (baris 1025)
4. Jika user memilih logout (return true) → kembali ke login menu untuk user lain

---

## 6. Guide Edit Data CSV

Semua data disimpan dalam file CSV di folder `data/` dengan delimiter `;` (titik koma).

### 6.1 Aturan Umum

| Aturan | Keterangan |
|--------|-----------|
| Delimiter | `;` (titik koma) — **bukan koma!** |
| Encoding | UTF-8 |
| Baris pertama | Header (nama kolom) — **jangan dihapus** |
| ID | Harus unik dan auto-increment |
| String | Tanpa tanda kutip |
| Desimal | Menggunakan titik (.) contoh: `85000.00` |

### 6.2 Format Per File

#### anggota.csv — Data User Login

```
id;nama;username;password;role
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | int | ID unik user |
| nama | string | Nama lengkap |
| username | string | Username login (case-sensitive) |
| password | string | Password login (plain text) |
| role | string | CEO / Manager / Admin / Kurir |

**Contoh menambah user baru:**
```
11;Rina Amelia;rina;pass123;Admin
```

> ⚠️ Pastikan ID tidak duplikat dan role ditulis persis (CEO, Manager, Admin, Kurir)

#### paket.csv — Data Paket

```
id;resi;nama_penerima;alamat_tujuan;kota_asal;kota_tujuan;berat;biaya;status;id_layanan;id_klasifikasi;id_kurir
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | int | ID unik paket |
| resi | string | Nomor resi (format: SWF-YYYYMMDD-XXXX) |
| nama_penerima | string | Nama penerima paket |
| alamat_tujuan | string | Alamat lengkap tujuan |
| kota_asal | string | Kota pengirim |
| kota_tujuan | string | Kota penerima |
| berat | double | Berat dalam kg |
| biaya | double | Biaya pengiriman (Rp) |
| status | string | menunggu / dalam_perjalanan / terkirim |
| id_layanan | int | Referensi ke layanan.csv |
| id_klasifikasi | int | Referensi ke klasifikasi.csv |
| id_kurir | int | Referensi ke kurir.csv (0 = belum assigned) |

**Contoh menambah paket baru:**
```
11;SWF-20250607-0011;Ibu Ratna;Jl. Melati No.3;Jakarta Pusat;Depok;2.5;75000.00;menunggu;1;1;0
```

> ⚠️ `id_kurir = 0` artinya paket belum di-assign ke kurir

#### tracking.csv — Riwayat Tracking

```
id;id_paket;lokasi;status;timestamp
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | int | ID unik tracking entry |
| id_paket | int | Referensi ke paket.csv |
| lokasi | string | Lokasi saat status update |
| status | string | Status tracking |
| timestamp | string | Format: YYYY-MM-DD HH:MM:SS |

**Contoh menambah tracking:**
```
21;5;Jakarta Pusat;Diproses;2025-06-07 10:30:00
```

#### layanan.csv — Jenis Layanan

```
id;nama;tarif_per_kg
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | int | ID unik layanan |
| nama | string | Nama layanan (Reguler, Express, dll) |
| tarif_per_kg | double | Tarif per kg (Rp) |

#### klasifikasi.csv — Klasifikasi Berat

```
id;nama;biaya_tambahan
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | int | ID unik klasifikasi |
| nama | string | Nama klasifikasi (Ringan, Sedang, Berat) |
| biaya_tambahan | double | Biaya tambahan (Rp) |

#### kota.csv — Data Rute Kota

```
asal;tujuan;jarak
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| asal | string | Nama kota asal (case-sensitive!) |
| tujuan | string | Nama kota tujuan (case-sensitive!) |
| jarak | int | Jarak dalam km |

**Contoh menambah rute baru:**
```
Jakarta Timur;Depok;22
```

> ⚠️ **PENTING:** Nama kota bersifat **case-sensitive**. "Jakarta Pusat" ≠ "jakarta pusat".

#### kurir.csv — Data Kurir

```
id;nama;status;total_paket
```

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| id | int | ID unik kurir |
| nama | string | Nama kurir |
| status | string | Status (Tersedia / Bertugas) |
| total_paket | int | Jumlah paket ditangani |

### 6.3 Tips Edit CSV

1. **Backup dulu** — copy file asli sebelum diedit
2. **Jangan hapus header** — baris pertama adalah nama kolom
3. **ID jangan duplikat** — setiap file memiliki ID auto-increment
4. **Gunakan text editor** — Notepad++, VS Code, atau sejenisnya (bukan Excel yang bisa mengubah format)
5. **Perhatikan delimiter** — selalu gunakan `;` bukan `,`
6. **Jangan ada spasi setelah `;`** — format: `data1;data2;data3` (bukan `data1; data2; data3`)
7. **Referensi ID valid** — pastikan `id_layanan`, `id_klasifikasi`, `id_kurir` di paket.csv merujuk ke ID yang ada di file referensi
8. **Restart program** — setelah edit CSV, restart program agar data baru diload

---

## 7. Tutorial Simulasi Semua Role

### 7.1 Persiapan

**Compile program:**
```bash
g++ main.cpp -o main.exe
```

**Jalankan:**
```bash
./main.exe
```

Program akan memuat semua data dari CSV dan menampilkan:
```
============================================
=== LOADING DATA DARI CSV... ===
============================================
  [LOAD] User: zaky (CEO) berhasil dimuat.
  [LOAD] User: irsal (Manager) berhasil dimuat.
  ...
  Total 8 user dimuat dari anggota.csv.
  [LOAD] 3 layanan dimuat.
  [LOAD] 3 klasifikasi dimuat.
  [LOAD] 10 paket dimuat dari paket.csv.
  [LOAD] 3 kurir dimuat dari kurir.csv.
  [LOAD] 20 tracking history dimuat dari tracking.csv.
  [LOAD] 15 jalur antar kota dimuat dari kota.csv.

============================================
=== SEMUA DATA BERHASIL DIMUAT ===
============================================
```

### 7.2 Simulasi Role ADMIN (andi / pass123)

Admin bertanggung jawab atas manajemen data paket, kurir, layanan, dan klasifikasi.

```
============================================
=== SWIFT EXPEDITION - LOGIN ===
============================================
Username : fauzi
Password : pass123

============================================
Selamat datang, Fauzi Bowo!
Role: Admin
============================================

============================================
=== MENU ADMIN ===
User: Fauzi Bowo
============================================
1. Tambah Paket
2. Hapus Paket
3. Edit Paket
4. Cari Paket (by ID)
5. Cari Paket (by Resi)
6. Lihat Semua Paket
7. Lihat Antrean Paket
8. Lihat Daftar Kurir
9. Lihat Daftar Layanan
10. Lihat Klasifikasi Berat
11. Lihat AVL Tree (Resi)
0. Logout
99. Exit Program
----------------------------------------
Pilihan: _
```

#### Simulasi 1: Tambah Paket Baru

```
Pilihan: 1

--- Tambah Paket Baru ---
Resi          : SWF-20250607-0011
Nama Penerima : Ibu Ratna
Alamat Tujuan : Jl. Melati No.3
Kota Asal     : Jakarta Pusat
Kota Tujuan   : Depok
Berat (kg)    : 2.5
ID Layanan    : 1
ID Klasifikasi: 1
Biaya         : 75000

[SUKSES] Paket SWF-20250607-0011 berhasil ditambahkan.
[SUCCESS] Paket berhasil ditambahkan!
```

> Paket otomatis masuk ke SinglyLinkedList (master data), AVLTree (index resi), dan Queue (antrian kurir)

#### Simulasi 2: Cari Paket by ID

```
Pilihan: 4

Masukkan ID paket: 1

===== PAKET DITEMUKAN =====
ID       : 1
Resi     : SWF-20250101-0001
Penerima : Bapak Rahmat
Alamat   : Jl. Merdeka No.10
Dari     : Jakarta Pusat -> Bandung
Berat    : 5.5 kg
Biaya    : Rp 85000
Status   : terkirim
```

#### Simulasi 3: Cari Paket by Resi (AVL Tree)

```
Pilihan: 5

Masukkan nomor resi: SWF-20250101-0003

===== PAKET DITEMUKAN =====
ID       : 3
Resi     : SWF-20250101-0003
Penerima : PT Maju Jaya
Status   : sampai_tujuan
```

> Pencarian resi menggunakan AVL Tree → O(log n) untuk lookup resi ke ID, lalu O(n) untuk ambil data dari SinglyLinkedList

#### Simulasi 4: Lihat AVL Tree

```
Pilihan: 11

===== PENCARIAN RESI (AVL Tree) =====
  Daftar Resi (AVL Tree - inorder):
  [0] Resi: SWF-20250101-0001 -> ID Paket: 1
  [1] Resi: SWF-20250101-0002 -> ID Paket: 2
  [2] Resi: SWF-20250101-0003 -> ID Paket: 3
  ...
```

> Inorder traversal AVL Tree menghasilkan resi terurut secara alfabetis

#### Simulasi 5: Lihat Antrean Paket (Queue)

```
Pilihan: 7

===== ANTREAN PAKET (Queue) =====
  Jumlah antrean: 3
  Antrean Paket Masuk:
  [1] Resi: SWF-20250101-0007 | Penerima: Budi Utama | Tujuan: Tangerang
  [2] Resi: SWF-20250101-0009 | Penerima: Dina Lestari | Tujuan: Bekasi
  [3] Resi: SWF-20250101-0010 | Penerima: Koperasi Makmur | Tujuan: Semarang
```

#### Simulasi 6: Edit Paket

```
Pilihan: 3

Masukkan ID paket yang akan diedit: 11
--- Edit Paket (kosongkan untuk tidak mengubah) ---
Resi [SWF-20250607-0011]: 
Nama Penerima [Ibu Ratna]: Ibu Ratna Sari
Alamat Tujuan [Jl. Melati No.3]: 
Kota Asal [Jakarta Pusat]: 
Kota Tujuan [Depok]: 
Status [Pending]: 
Berat [2.5]: 3.0
Biaya [75000]: 

[SUKSES] Paket ID 11 berhasil diperbarui.
[SUCCESS] Paket berhasil diupdate!
```

#### Simulasi 7: Logout

```
Pilihan: 0
Logout...


============================================
=== MENYIMPAN DATA... ===
  [SUKSES] 11 paket disimpan ke paket.csv.
  [SUKSES] 20 tracking history disimpan ke tracking.csv.
============================================
```

> Kembali ke menu login

---

### 7.3 Simulasi Role KURIR (citra / pass123)

Kurir bertanggung jawab mengambil paket dari antrian dan mengupdate status pengiriman.

```
Username : citra
Password : pass123

============================================
Selamat datang, Citra Dewi!
Role: Kurir
============================================

============================================
=== MENU KURIR ===
User: Citra Dewi
============================================
1. Ambil Paket dari Queue
2. Update Status Tracking
3. Undo Tracking (Stack)
4. Lihat Riwayat Tracking
5. Lihat Antrean Paket
6. Lihat Semua Paket
0. Logout
99. Exit Program
----------------------------------------
Pilihan: _
```

#### Simulasi 1: Lihat Antrean Paket

```
Pilihan: 5

===== ANTREAN PAKET (Queue) =====
  Jumlah antrean: 3
  Antrean Paket Masuk:
  [1] Resi: SWF-20250101-0007 | Penerima: Budi Utama | Tujuan: Tangerang
  [2] Resi: SWF-20250101-0009 | Penerima: Dina Lestari | Tujuan: Bekasi
  [3] Resi: SWF-20250101-0010 | Penerima: Koperasi Makmur | Tujuan: Semarang
```

#### Simulasi 2: Ambil Paket dari Queue (FIFO)

```
Pilihan: 1

[BERHASIL] Mengambil paket SWF-20250101-0007
Penerima: Budi Utama
Tujuan  : Jakarta Selatan -> Tangerang
[SUKSES] Paket SWF-20250101-0007 diassign ke Kurir ID 1.
[TRACKING] Paket ID 7 -> Dalam Perjalanan di Jakarta Selatan
```

> Paket di-dequeue dari Queue (FIFO), kurir di-assign via CircularLinkedList (rotasi), tracking pertama otomatis dibuat

#### Simulasi 3: Update Status Tracking

```
Pilihan: 2

ID Paket  : 7
Status Baru: sampai_tujuan
Lokasi     : Tangerang

[TRACKING] Paket ID 7 -> sampai_tujuan di Tangerang
```

> Status baru di-push ke Stack (untuk fitur undo) dan ditambahkan ke tracking history

#### Simulasi 4: Undo Tracking (Stack — LIFO)

```
Pilihan: 3

ID Paket untuk undo: 7

[UNDO] Tracking di-undo: sampai_tujuan - Tangerang
[UNDO] Kembali ke status: Dalam Perjalanan
```

> Pop dari Stack — rollback ke status sebelumnya (LIFO). Status paket dikembalikan ke status terakhir yang tersisa di stack.

#### Simulasi 5: Lihat Riwayat Tracking

```
Pilihan: 4

1. Lihat per Paket (masukkan ID)
2. Lihat semua
Pilih: 1
ID Paket: 7

===== TRACKING HISTORY PAKET ID 7 =====
  [2025-06-07 20:30:00] Dalam Perjalanan - Jakarta Selatan
```

#### Simulasi 6: Logout

```
Pilihan: 0
Logout...
```

---

### 7.4 Simulasi Role MANAGER (budi / pass123)

Manager fokus pada laporan, sorting, dan statistik.

```
Username : budi
Password : pass123

============================================
Selamat datang, Budi Santoso!
Role: Manager
============================================

============================================
=== MENU MANAGER ===
User: Budi Santoso
============================================
1. Laporan Semua Paket
2. Laporan Paket by Status
3. Sorting Paket Berdasarkan Biaya
4. Sorting Paket Berdasarkan Berat
5. Statistik Pengiriman
6. Lihat Riwayat Tracking
7. Lihat Semua Paket
0. Logout
99. Exit Program
----------------------------------------
Pilihan: _
```

#### Simulasi 1: Laporan Semua Paket

```
Pilihan: 1

============================================
=== LAPORAN SEMUA PAKET ===
============================================
     ID           Resi        Penerima    Kota Tujuan   Berat       Biaya            Status
  -------------------------------------------------------------------------------------------
     1  SWF-20250101-0001  Bapak Rahmat        Bandung     5.5       85000          terkirim
     2  SWF-20250101-0002      Ibu Sari       Surabaya      12      345000          terkirim
     3  SWF-20250101-0003   PT Maju Jaya    Yogyakarta       3       60000     sampai_tujuan
  ...

Total paket: 11
```

> Menggunakan `std::sort` untuk mengurutkan berdasarkan ID, `std::for_each` + lambda untuk display

#### Simulasi 2: Laporan by Status

```
Pilihan: 2

============================================
=== LAPORAN PAKET BERDASARKAN STATUS ===
============================================

--- Status: Menunggu (3 paket) ---
    ID: 9 | Resi: SWF-20250101-0009 | Dina Lestari | Bekasi | Rp 80000
    ...

--- Status: Dalam Perjalanan (2 paket) ---
    ID: 7 | Resi: SWF-20250101-0007 | Budi Utama | Tangerang | Rp 110000
    ...

--- Status: Terkirim (2 paket) ---
    ID: 1 | Resi: SWF-20250101-0001 | Bapak Rahmat | Bandung | Rp 85000
    ...
```

> Menggunakan `std::count_if` + lambda untuk menghitung jumlah paket per status

#### Simulasi 3: Sorting Berdasarkan Biaya (Termahal)

```
Pilihan: 3

1. Ascending (termurah)
2. Descending (termahal)
Pilih: 2

===== PAKET DIURUTKAN BERDASARKAN BIAYA =====
  5 | SWF-20250101-0005 | Bapak Hadi | Rp 500000 | diproses
  2 | SWF-20250101-0002 | Ibu Sari | Rp 345000 | terkirim
  8 | SWF-20250101-0008 | CV Nusantara | Rp 140000 | diproses
  ...
```

> Menggunakan `std::sort` + lambda expression (callback function) dengan capture `[ascending]`

#### Simulasi 4: Sorting Berdasarkan Berat (Terberat)

```
Pilihan: 4

1. Ascending (teringan)
2. Descending (terberat)
Pilih: 2

===== PAKET DIURUTKAN BERDASARKAN BERAT =====
  5 | SWF-20250101-0005 | Bapak Hadi | 45 kg | diproses
  2 | SWF-20250101-0002 | Ibu Sari | 12 kg | terkirim
  8 | SWF-20250101-0008 | CV Nusantara | 8 kg | diproses
  ...
```

#### Simulasi 5: Statistik Pengiriman

```
Pilihan: 5

============================================
=== STATISTIK PENGIRIMAN ===
============================================

Total Paket          : 11
Menunggu             : 3
Dalam Perjalanan     : 2
Terkirim             : 2
----------------------------------------
Total Biaya          : Rp 1665000
Rata-rata Biaya      : Rp 151363
Rata-rata Berat      : 12 kg
Paket Termahal       : SWF-20250101-0005 (Rp 500000)
============================================
```

> Menggunakan `std::count_if` untuk menghitung per status, loop manual untuk total biaya/berat dan mencari paket termahal

#### Simulasi 6: Logout

```
Pilihan: 0
Logout...
```

---

### 7.5 Simulasi Role CEO (zaky / pass123)

CEO memiliki akses tertinggi termasuk BFS/DFS routing.

```
Username : zaky
Password : pass123

============================================
Selamat datang, Zaky Ismail!
Role: CEO
============================================

============================================
=== MENU CEO ===
User: Zaky Ismail (CEO)
============================================
1. Laporan Keseluruhan (CEO Report)
2. Statistik Pengiriman
3. Lihat Semua Paket
4. Lihat Riwayat Tracking
5. Lihat Graph Rute Kota
6. BFS - Cari Jalur Terpendek Antar Kota
7. DFS - Tampilkan Semua Rute Dari Kota
8. Cari Semua Jalur Antar Kota
9. Lihat Daftar Kota
10. Simpan Data
0. Logout
99. Exit Program
----------------------------------------
Pilihan: _
```

#### Simulasi 1: CEO Report

```
Pilihan: 1

============================================
=== LAPORAN CEO - OVERVIEW PERUSAHAAN ===
============================================
[Menampilkan statistik lengkap + informasi kurir + tracking]
```

#### Simulasi 2: Lihat Graph Rute Kota

```
Pilihan: 5

===== DAFTAR JALUR (KOTA.CSV) =====
  Jakarta Pusat -> Jakarta Selatan (15 km)
  Jakarta Pusat -> Jakarta Timur (20 km)
  Jakarta Pusat -> Jakarta Barat (12 km)
  Jakarta Pusat -> Bandung (150 km)
  Jakarta Pusat -> Bogor (55 km)
  ...

===== REPRESENTASI GRAF JALUR ANTAR KOTA =====
  Jakarta Pusat -> Jakarta Selatan(15km), Jakarta Timur(20km), Jakarta Barat(12km), Bandung(150km), Bogor(55km)
  Jakarta Selatan -> Jakarta Pusat(15km), Jakarta Timur(18km), Depok(25km)
  ...
```

#### Simulasi 3: BFS — Jalur Terpendek (Minimal Transit)

```
Pilihan: 6

Kota Asal  : Jakarta Pusat
Kota Tujuan: Yogyakarta

===== BFS: Mencari Transit Terdekat =====
Dari: Jakarta Pusat -> Tujuan: Yogyakarta
Jalur terpendek (minimal transit):
  Jakarta Pusat -> Bandung -> Yogyakarta
Total jarak: 580 km
Jumlah transit: 1
```

> BFS mencari jalur dengan **edge paling sedikit** (minimal transit), bukan jarak terpendek.

#### Simulasi 4: DFS — Semua Rute dari Kota

```
Pilihan: 7

Kota Awal: Jakarta Pusat

===== DFS: SEMUA JALUR DARI Jakarta Pusat =====
  Urutan kunjungan DFS: Jakarta Pusat -> Jakarta Selatan -> Depok -> ...
```

> DFS mengeksplorasi sedalam mungkin sebelum backtracking, menggunakan lambda recursion

#### Simulasi 5: Cari Semua Jalur Antar Kota

```
Pilihan: 8

Kota Asal  : Jakarta Pusat
Kota Tujuan: Bandung

===== SEMUA JALUR DARI Jakarta Pusat KE Bandung =====
  Jalur 1: Jakarta Pusat --(150km)--> Bandung | Total Jarak: 150 km
  Jalur 2: Jakarta Pusat --(55km)--> Bogor --(180km)--> Bandung | Total Jarak: 235 km
```

> DFS dengan backtracking menemukan semua kemungkinan jalur beserta total jaraknya

#### Simulasi 6: Lihat Daftar Kota

```
Pilihan: 9

===== DAFTAR KOTA =====
  1. Jakarta Pusat
  2. Jakarta Selatan
  3. Jakarta Timur
  4. Jakarta Barat
  5. Depok
  6. Bekasi
  7. Tangerang
  8. Bogor
  9. Bandung
  10. Surabaya
  11. Yogyakarta
  12. Semarang
```

#### Simulasi 7: Simpan Data Manual

```
Pilihan: 10

  [SUKSES] 11 paket disimpan ke paket.csv.
  [SUKSES] 21 tracking history disimpan ke tracking.csv.
```

#### Simulasi 8: Exit Program

```
Pilihan: 99

Keluar dari program...


============================================
=== MENYIMPAN DATA... ===
  [SUKSES] 11 paket disimpan ke paket.csv.
  [SUKSES] 21 tracking history disimpan ke tracking.csv.
============================================
```

> Program menyimpan semua data dan keluar

---

### 7.6 Ringkasan Fitur Per Role

| Role | Fitur Utama | Struktur Data Digunakan |
|------|------------|------------------------|
| **Admin** | CRUD paket, lihat data master, AVL tree | SinglyLinkedList, Queue, AVLTree, CircularLinkedList |
| **Kurir** | Ambil paket (FIFO), update tracking, undo (LIFO) | Queue, Stack, SinglyLinkedList |
| **Manager** | Laporan, sorting, statistik | vector, std::sort, std::count_if, std::find_if |
| **CEO** | Laporan komprehensif, BFS/DFS routing, graph | Graph (BFS, DFS, Find All Paths), semua struktur data |

### 7.7 Tips Simulasi

1. **Login sebagai Admin dulu** — tambahkan beberapa paket baru agar ada data untuk disimulasikan oleh role lain
2. **Login sebagai Kurir** — ambil paket dari queue, update statusnya bertahap (Dalam Perjalanan → sampai_tujuan → terkirim)
3. **Login sebagai Manager** — lihat laporan dan statistik setelah data bertambah
4. **Login sebagai CEO** — gunakan BFS/DFS setelah memahami graph kota
5. **Edit CSV manual** — tambah kota baru di `kota.csv` dan lihat perubahannya di menu CEO
6. **Undo tracking** — coba update status beberapa kali lalu undo untuk melihat stack bekerja
7. **Coba AVL Tree** — tambah banyak paket lalu lihat struktur AVL Tree di menu Admin

---

## 8. Ringkasan Konsep C++ yang Digunakan

| Konsep | Kategori | Digunakan di |
|--------|----------|-------------|
| `struct` | Data Model | 8 struct (User, Paket, Tracking, dll) |
| `enum` | Data Type | RoleType (CEO, MANAGER, ADMIN, KURIR) |
| `template` | Generic Programming | 6 template data structures |
| `pointer (*)` | Memory Management | Return value fungsi pencarian |
| `reference (&)` | Parameter Passing | Semua fungsi service & menu |
| `namespace` | Code Organization | SwiftExpedition namespace |
| `inline` | Optimization | Helper functions (roleToString, csvRead, dll) |
| `lambda` | Functional Programming | Comparator sort, predicate count_if/find_if |
| `callback` | Function Pointer | trackingProcessHistory |
| `exception` | Error Handling | try/catch pada semua load CSV |
| `file I/O` | Persistence | ifstream/ofstream untuk CSV |
| `STL algorithms` | Standard Library | sort, find_if, count_if, for_each |
| `recursion` | Algorithm | DFS, AVL Tree operations |
| `operator overloading` | OOP | Iterator operators (*, ->, ++, ==, !=) |

---

> **Dokumentasi ini disusun untuk memenuhi pemahaman menyeluruh terhadap proyek Swift Expedition UAS Algoritma Pemrograman & Struktur Data.**  
> Seluruh kode diimplementasikan dalam single-file `main.cpp` (1100 baris) dengan 10 struktur data dan 16 konsep C++.