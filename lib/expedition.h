#ifndef EXPEDITION_H
#define EXPEDITION_H

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <list>
#include <map>
#include <queue>
#include <stack>
#include <set>
#include <algorithm>
#include <functional>
#include <ctime>
#include <iomanip>
#include <limits>
#include <stdexcept>
#include <sodium.h>

using namespace std;

namespace SwiftExpedition {

// ============================================================
// ENUM & HELPER
// ============================================================
enum RoleType { CEO, MANAGER, ADMIN, KURIR };

inline string roleToString(RoleType r) {
    switch (r) {
        case CEO:     return "CEO";
        case MANAGER: return "Manager";
        case ADMIN:   return "Admin";
        case KURIR:   return "Kurir";
        default:      return "Unknown";
    }
}

inline RoleType stringToRole(const string& s) {
    if (s == "CEO" || s == "ceo")         return CEO;
    if (s == "Manager" || s == "manager") return MANAGER;
    if (s == "Admin" || s == "admin")     return ADMIN;
    if (s == "Kurir" || s == "kurir")     return KURIR;
    return KURIR;
}

// ============================================================
// DATA STRUCTS
// ============================================================
struct User {
    int id;
    string nama, username, password;
    RoleType role;
    User(int id = 0, const string& nama = "", const string& username = "",
         const string& password = "", RoleType role = KURIR)
        : id(id), nama(nama), username(username), password(password), role(role) {}
};

struct Paket {
    int id, id_layanan, id_klasifikasi, id_kurir;
    string resi, nama_penerima, alamat_tujuan, kota_asal, kota_tujuan, status;
    double berat, biaya;
    Paket(int id = 0, const string& resi = "", const string& nama_penerima = "",
          const string& alamat_tujuan = "", const string& kota_asal = "",
          const string& kota_tujuan = "", double berat = 0.0, double biaya = 0.0,
          const string& status = "menunggu", int id_layanan = 0,
          int id_klasifikasi = 0, int id_kurir = 0)
        : id(id), id_layanan(id_layanan), id_klasifikasi(id_klasifikasi),
          id_kurir(id_kurir), resi(resi), nama_penerima(nama_penerima),
          alamat_tujuan(alamat_tujuan), kota_asal(kota_asal),
          kota_tujuan(kota_tujuan), status(status), berat(berat), biaya(biaya) {}
};

struct Tracking {
    int id, id_paket;
    string lokasi, status, timestamp, keterangan;
    Tracking(int id = 0, int id_paket = 0, const string& lokasi = "",
             const string& status = "", const string& timestamp = "",
             const string& keterangan = "")
        : id(id), id_paket(id_paket), lokasi(lokasi), status(status),
          timestamp(timestamp), keterangan(keterangan) {}
};

struct Kurir {
    int id;
    string nama, status;
    int total_paket;
    Kurir(int id = 0, const string& nama = "", const string& status = "Tersedia",
          int total_paket = 0)
        : id(id), nama(nama), status(status), total_paket(total_paket) {}
};

struct Layanan {
    int id;
    string nama;
    double tarif_per_kg;
    Layanan(int id = 0, const string& nama = "", double tarif_per_kg = 0.0)
        : id(id), nama(nama), tarif_per_kg(tarif_per_kg) {}
};

struct KlasifikasiBerat {
    int id;
    string nama;
    double biaya_tambahan;
    KlasifikasiBerat(int id = 0, const string& nama = "", double biaya_tambahan = 0.0)
        : id(id), nama(nama), biaya_tambahan(biaya_tambahan) {}
};

struct Kota {
    string asal, tujuan;
    int jarak;
    Kota(const string& asal = "", const string& tujuan = "", int jarak = 0)
        : asal(asal), tujuan(tujuan), jarak(jarak) {}
};

struct Edge {
    string tujuan;
    int jarak;
};

// ============================================================
// TEMPLATE DATA STRUCTURES (struct instead of class, all public)
// ============================================================

// --- Singly Linked List ---
template<typename T>
struct SinglyLinkedList {
    struct Node {
        T data;
        Node* next;
        Node(const T& d) : data(d), next(nullptr) {}
    };
    Node* head;
    int size_;

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

    SinglyLinkedList() : head(nullptr), size_(0) {}
    ~SinglyLinkedList() { clear(); }
    inline bool isEmpty() const { return head == nullptr; }
    inline int size() const { return size_; }
    Iterator begin() { return Iterator(head); }
    Iterator end() { return Iterator(nullptr); }

    void insert(const T& data) {
        Node* n = new Node(data);
        if (!head) { head = n; }
        else {
            Node* t = head;
            while (t->next) t = t->next;
            t->next = n;
        }
        size_++;
    }

    T* findById(int id) {
        Node* t = head;
        while (t) { if (t->data.id == id) return &(t->data); t = t->next; }
        return nullptr;
    }

    bool findById(int id, T& result) {
        Node* t = head;
        while (t) { if (t->data.id == id) { result = t->data; return true; } t = t->next; }
        return false;
    }

    T* findByResi(const string& resi) {
        Node* t = head;
        while (t) { if (t->data.resi == resi) return &(t->data); t = t->next; }
        return nullptr;
    }

    bool removeById(int id) {
        if (!head) return false;
        if (head->data.id == id) { Node* d = head; head = head->next; delete d; size_--; return true; }
        Node* t = head;
        while (t->next && t->next->data.id != id) t = t->next;
        if (!t->next) return false;
        Node* d = t->next; t->next = t->next->next; delete d; size_--; return true;
    }

    bool update(int id, const T& newData) {
        Node* t = head;
        while (t) { if (t->data.id == id) { t->data = newData; t->data.id = id; return true; } t = t->next; }
        return false;
    }

    vector<T> toVector() const {
        vector<T> r; Node* t = head;
        while (t) { r.push_back(t->data); t = t->next; }
        return r;
    }

    void display() const {
        Node* t = head; int c = 0;
        while (t) { cout << "[" << c++ << "] ID: " << t->data.id << " | Resi: " << t->data.resi << " | Penerima: " << t->data.nama_penerima << " | Status: " << t->data.status << "\n"; t = t->next; }
        if (c == 0) cout << "  (Tidak ada data)\n";
    }

    void clear() { while (head) { Node* t = head; head = head->next; delete t; } size_ = 0; }
};

// --- Circular Linked List ---
template<typename T>
struct CircularLinkedList {
    struct Node {
        T data;
        Node* next;
        Node(const T& d) : data(d), next(nullptr) {}
    };
    Node* tail;
    int size_;

    CircularLinkedList() : tail(nullptr), size_(0) {}
    ~CircularLinkedList() { clear(); }
    inline bool isEmpty() const { return tail == nullptr; }
    inline int size() const { return size_; }

    void insert(const T& data) {
        Node* n = new Node(data);
        if (!tail) { tail = n; tail->next = tail; }
        else { n->next = tail->next; tail->next = n; tail = n; }
        size_++;
    }

    void rotate() { if (tail) tail = tail->next; }
    T* current() { return tail ? &(tail->data) : nullptr; }

    void display() const {
        if (!tail) { cout << "  (Tidak ada kurir)\n"; return; }
        Node* t = tail->next; int c = 0;
        do { cout << "[" << c++ << "] ID: " << t->data.id << " | Nama: " << t->data.nama << " | Status: " << t->data.status << "\n"; t = t->next; } while (t != tail->next);
    }

    vector<T> toVector() const {
        vector<T> r;
        if (!tail) return r;
        Node* t = tail->next;
        do { r.push_back(t->data); t = t->next; } while (t != tail->next);
        return r;
    }

    void clear() {
        if (!tail) return;
        Node* cur = tail->next;
        while (cur != tail) { Node* t = cur; cur = cur->next; delete t; }
        delete tail; tail = nullptr; size_ = 0;
    }
};

// --- Stack ---
template<typename T>
struct Stack {
    struct Node { T data; Node* next; Node(const T& d) : data(d), next(nullptr) {} };
    Node* topNode;
    int size_;

    Stack() : topNode(nullptr), size_(0) {}
    ~Stack() { clear(); }
    inline bool isEmpty() const { return topNode == nullptr; }
    inline int size() const { return size_; }

    void push(const T& data) { Node* n = new Node(data); n->next = topNode; topNode = n; size_++; }
    bool pop(T& result) { if (!topNode) return false; Node* t = topNode; result = t->data; topNode = topNode->next; delete t; size_--; return true; }

    void display() const {
        if (!topNode) { cout << "  (Stack kosong)\n"; return; }
        cout << "  Stack Tracking History (terbaru di atas):\n";
        Node* t = topNode; int c = 0;
        while (t) { cout << "  [" << c++ << "] " << t->data.status << " - " << t->data.lokasi << " (" << t->data.timestamp << ")\n"; t = t->next; }
    }
    vector<T> toVector() const {
        vector<T> r; Node* t = topNode;
        while (t) { r.push_back(t->data); t = t->next; }
        return r;
    }
    void clear() { while (topNode) { Node* t = topNode; topNode = topNode->next; delete t; } size_ = 0; }
};

// --- Queue ---
template<typename T>
struct Queue {
    struct Node { T data; Node* next; Node(const T& d) : data(d), next(nullptr) {} };
    Node* frontNode;
    Node* rearNode;
    int size_;

    Queue() : frontNode(nullptr), rearNode(nullptr), size_(0) {}
    ~Queue() { clear(); }
    inline bool isEmpty() const { return frontNode == nullptr; }
    inline int size() const { return size_; }

    void enqueue(const T& data) {
        Node* n = new Node(data);

        if (!frontNode) {
            frontNode = rearNode = n;
        } 
        else if (data.id_layanan > frontNode->data.id_layanan) {
            n->next = frontNode;
            frontNode = n;
        } 
        else {
            Node* curr = frontNode;
            while (curr->next && curr->next->data.id_layanan >= data.id_layanan) {
                curr = curr->next;
            }
            n->next = curr->next;
            curr->next = n;
            if (!n->next) rearNode = n; 
        }
        size_++;
    }

    bool dequeue(T& result) {
        if (!frontNode) return false;
        Node* t = frontNode; result = t->data; frontNode = frontNode->next;
        if (!frontNode) rearNode = nullptr;
        delete t; size_--; return true;
    }

    void display() const {
        if (!frontNode) { cout << "  (Antrean kosong)\n"; return; }
        cout << "  Antrean Paket Masuk:\n";
        Node* t = frontNode; int c = 1;
        while (t) { cout << "  [" << c++ << "] Resi: " << t->data.resi << " | Penerima: " << t->data.nama_penerima << " | Tujuan: " << t->data.kota_tujuan << "\n"; t = t->next; }
    }
    vector<T> toVector() const {
        vector<T> r; Node* t = frontNode;
        while (t) { r.push_back(t->data); t = t->next; }
        return r;
    }
    void clear() { while (frontNode) { Node* t = frontNode; frontNode = frontNode->next; delete t; } rearNode = nullptr; size_ = 0; }
};

// --- AVL Tree ---
template<typename K, typename V>
struct AVLTree {
    struct Node { K key; V value; Node* left; Node* right; int height;
        Node(const K& k, const V& v) : key(k), value(v), left(nullptr), right(nullptr), height(1) {} };
    Node* root;

    AVLTree() : root(nullptr) {}
    ~AVLTree() { clear(); }
    inline bool isEmpty() const { return root == nullptr; }

    inline int height(Node* n) const { return n ? n->height : 0; }
    inline int getBalance(Node* n) const { return n ? height(n->left) - height(n->right) : 0; }

    Node* rotateRight(Node* y) { Node* x = y->left; Node* T2 = x->right; x->right = y; y->left = T2; y->height = max(height(y->left), height(y->right)) + 1; x->height = max(height(x->left), height(x->right)) + 1; return x; }
    Node* rotateLeft(Node* x) { Node* y = x->right; Node* T2 = y->left; y->left = x; x->right = T2; x->height = max(height(x->left), height(x->right)) + 1; y->height = max(height(y->left), height(y->right)) + 1; return y; }

    Node* insertNode(Node* n, const K& key, const V& value) {
        if (!n) return new Node(key, value);
        if (key < n->key) n->left = insertNode(n->left, key, value);
        else if (key > n->key) n->right = insertNode(n->right, key, value);
        else { n->value = value; return n; }
        n->height = 1 + max(height(n->left), height(n->right));
        int bal = getBalance(n);
        if (bal > 1 && key < n->left->key) return rotateRight(n);
        if (bal < -1 && key > n->right->key) return rotateLeft(n);
        if (bal > 1 && key > n->left->key) { n->left = rotateLeft(n->left); return rotateRight(n); }
        if (bal < -1 && key < n->right->key) { n->right = rotateRight(n->right); return rotateLeft(n); }
        return n;
    }

    V* searchNode(Node* n, const K& key) {
        if (!n) return nullptr;
        if (key == n->key) return &(n->value);
        if (key < n->key) return searchNode(n->left, key);
        return searchNode(n->right, key);
    }

    void insert(const K& key, const V& value) { root = insertNode(root, key, value); }
    V* search(const K& key) { return searchNode(root, key); }

    void inorder(Node* n, vector<pair<K,V>>& r) const { if (!n) return; inorder(n->left, r); r.push_back({n->key, n->value}); inorder(n->right, r); }

    void display() const {
        vector<pair<K,V>> r; inorder(root, r);
        if (r.empty()) { cout << "  (AVL Tree kosong)\n"; return; }
        cout << "  Daftar Resi (AVL Tree - inorder):\n";
        for (size_t i = 0; i < r.size(); i++) cout << "  [" << i << "] Resi: " << r[i].first << " -> ID Paket: " << r[i].second << "\n";
    }

    void clearNode(Node* n) { if (!n) return; clearNode(n->left); clearNode(n->right); delete n; }
    void clear() { clearNode(root); root = nullptr; }
};

// --- Hash Table ---
template<typename K, typename V>
struct HashTable {
    map<K, V> table;
    void insert(const K& key, const V& value) { table[key] = value; }
    V* find(const K& key) { auto it = table.find(key); return (it != table.end()) ? &(it->second) : nullptr; }
    bool contains(const K& key) const { return table.find(key) != table.end(); }
    void display() const {
        if (table.empty()) { cout << "  (Hash Table kosong)\n"; return; }
        cout << "  Daftar User (Hash Table):\n";
        for (auto it = table.begin(); it != table.end(); ++it)
            cout << "  Username: " << it->first << " | Nama: " << it->second.nama << " | Role: " << roleToString(it->second.role) << "\n";
    }
    size_t size() const { return table.size(); }
};

// --- Graph ---
struct Graph {
    map<string, vector<Edge>> adjList;

    void addEdge(const string& asal, const string& tujuan, int jarak) {
        adjList[asal].push_back({tujuan, jarak});
        adjList[tujuan].push_back({asal, jarak});
    }

    void display() const {
        cout << "\n  ===== REPRESENTASI GRAF JALUR ANTAR KOTA =====\n";
        for (auto& pair : adjList) {
            cout << "  " << pair.first << " ->";
            for (size_t i = 0; i < pair.second.size(); i++)
                cout << " " << pair.second[i].tujuan << "(" << pair.second[i].jarak << "km)" << (i < pair.second.size()-1 ? "," : "");
            cout << "\n";
        }
    }

    vector<string> BFS(const string& asal, const string& tujuan) {
        map<string, string> parent;
        map<string, bool> visited;
        queue<string> q;
        for (auto& p : adjList) visited[p.first] = false;
        visited[asal] = true; q.push(asal); parent[asal] = "";
        bool found = false;
        auto isUnvisited = [&visited](const string& n) { return !visited[n]; };
        while (!q.empty() && !found) {
            string cur = q.front(); q.pop();
            for (auto& e : adjList[cur]) {
                if (isUnvisited(e.tujuan)) { // lambda
                    visited[e.tujuan] = true; parent[e.tujuan] = cur; q.push(e.tujuan);
                    if (e.tujuan == tujuan) { found = true; break; }
                }
            }
        }
        vector<string> path;
        if (!found) return path;
        string cur = tujuan;
        while (cur != "") { path.push_back(cur); cur = parent[cur]; }
        reverse(path.begin(), path.end()); // sort-like: reverse
        return path;
    }

    void DFS(const string& start) {
        map<string, bool> visited;
        for (auto& p : adjList) visited[p.first] = false;
        cout << "\n  ===== DFS: SEMUA JALUR DARI " << start << " =====\n  Urutan kunjungan DFS: ";
        function<void(const string&)> dfsRec = [&](const string& node) { // lambda with recursion
            visited[node] = true; cout << node << " -> ";
            for (auto& e : adjList[node]) if (!visited[e.tujuan]) dfsRec(e.tujuan);
        };
        dfsRec(start);
        cout << "\n";
    }

    vector<string> DFSOrder(const string& start) {
        map<string, bool> visited;
        for (auto& p : adjList) visited[p.first] = false;
        vector<string> order;
        function<void(const string&)> dfsRec = [&](const string& node) {
            visited[node] = true; order.push_back(node);
            for (auto& e : adjList[node]) if (!visited[e.tujuan]) dfsRec(e.tujuan);
        };
        dfsRec(start);
        return order;
    }

    struct PathResult {
        vector<string> path;
        int distance;
    };

    vector<PathResult> findAllPathsList(const string& asal, const string& tujuan) {
        map<string, bool> visited;
        for (auto& p : adjList) visited[p.first] = false;
        vector<string> curPath;
        vector<PathResult> results;
        function<void(const string&, int)> dfsAll = [&](const string& cur, int dist) {
            visited[cur] = true; curPath.push_back(cur);
            if (cur == tujuan) {
                results.push_back({curPath, dist});
            } else {
                for (auto& e : adjList[cur]) if (!visited[e.tujuan]) dfsAll(e.tujuan, dist + e.jarak);
            }
            curPath.pop_back(); visited[cur] = false;
        };
        dfsAll(asal, 0);
        return results;
    }

    void findAllPaths(const string& asal, const string& tujuan) {
        map<string, bool> visited;
        for (auto& p : adjList) visited[p.first] = false;
        vector<string> curPath;
        int pathCount = 0;
        cout << "\n  ===== SEMUA JALUR DARI " << asal << " KE " << tujuan << " =====\n";
        function<void(const string&)> dfsAll = [&](const string& cur) { // lambda recursion
            visited[cur] = true; curPath.push_back(cur);
            if (cur == tujuan) {
                pathCount++;
                cout << "  Jalur " << pathCount << ": ";
                int total = 0;
                for (size_t i = 0; i < curPath.size(); i++) {
                    cout << curPath[i];
                    if (i < curPath.size()-1) {
                        for (auto& e : adjList[curPath[i]]) if (e.tujuan == curPath[i+1]) { total += e.jarak; cout << " --(" << e.jarak << "km)--> "; break; }
                    }
                }
                cout << " | Total Jarak: " << total << " km\n";
            } else {
                for (auto& e : adjList[cur]) if (!visited[e.tujuan]) dfsAll(e.tujuan);
            }
            curPath.pop_back(); visited[cur] = false;
        };
        dfsAll(asal);
        if (pathCount == 0) cout << "  Tidak ada jalur yang ditemukan.\n";
    }

    int getBFSDistance(const string& asal, const string& tujuan) {
        vector<string> path = BFS(asal, tujuan);
        if (path.empty()) return -1;
        int total = 0;
        for (size_t i = 0; i < path.size()-1; i++)
            for (auto& e : adjList[path[i]]) if (e.tujuan == path[i+1]) { total += e.jarak; break; }
        return total;
    }
    bool hasCity(const string& city) const { return adjList.find(city) != adjList.end(); }
    vector<string> getCities() const { vector<string> c; for (auto& p : adjList) c.push_back(p.first); return c; }
};

// ============================================================
// CSV HELPER FUNCTIONS
// ============================================================
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

inline vector<string> csvSplit(const string& line, char delimiter = ',') {
    vector<string> tokens;
    stringstream ss(line);
    string token;
    while (getline(ss, token, delimiter)) tokens.push_back(token);
    return tokens;
}

inline string csvJoin(const vector<string>& tokens, char delimiter = ',') {
    string r;
    for (size_t i = 0; i < tokens.size(); i++) { r += tokens[i]; if (i < tokens.size()-1) r += delimiter; }
    return r;
}

// ============================================================
// SERVICE: Global state (all in structs, no class)
// ============================================================
struct AuthData {
    HashTable<string, User> userTable;
};

struct PaketData {
    SinglyLinkedList<Paket> paketList;
    AVLTree<string, int> resiTree;
    Queue<Paket> paketQueue;
    CircularLinkedList<Kurir> kurirList;
    vector<Layanan> layananList;
    vector<KlasifikasiBerat> klasifikasiList;
    int nextPaketId = 1;
};

struct TrackingData {
    vector<Tracking> trackingHistory;
    map<int, Stack<Tracking>> undoStacks;
};

struct RoutingData {
    Graph graph;
    vector<Kota> edgesList;
};

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

// --- Auth ---
inline void authLoadUsers(AuthData& auth, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 5) {
                User u(stoi(t[0]), t[1], t[2], t[3], stringToRole(t[4]));
                auth.userTable.insert(u.username, u);
                cout << "  [LOAD] User: " << u.username << " (" << roleToString(u.role) << ") berhasil dimuat.\n";
            }
        }
        cout << "  Total " << auth.userTable.size() << " user dimuat dari " << filename << ".\n";
    } catch (const exception& e) { cout << "  [ERROR] Gagal memuat user: " << e.what() << "\n"; }
}

inline void initSodium() {
    static bool initialized = false;
    if (!initialized) {
        if (sodium_init() < 0) {
            throw std::runtime_error("Gagal inisialisasi libsodium");
        }
        initialized = true;
    }
}

inline User* authLogin(AuthData& auth, const string& username, const string& password) {
    initSodium();
    User* u = auth.userTable.find(username);
    if (u) {
        if (crypto_pwhash_str_verify(u->password.c_str(), password.c_str(), password.length()) == 0) {
            return u;
        }
    }
    return nullptr;
}

// --- Paket Service ---
inline void paketLoadLayanan(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 3) p.layananList.push_back(Layanan(stoi(t[0]), t[1], stod(t[2])));
        }
        cout << "  [LOAD] " << p.layananList.size() << " layanan dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] Gagal memuat layanan: " << e.what() << "\n"; }
}

inline void paketLoadKlasifikasi(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 3) p.klasifikasiList.push_back(KlasifikasiBerat(stoi(t[0]), t[1], stod(t[2])));
        }
        cout << "  [LOAD] " << p.klasifikasiList.size() << " klasifikasi dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] Gagal memuat klasifikasi: " << e.what() << "\n"; }
}

inline void paketLoadPaket(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 12) {
                Paket pk(stoi(t[0]), t[1], t[2], t[3], t[4], t[5], stod(t[6]), stod(t[7]), t[8], stoi(t[9]), stoi(t[10]), stoi(t[11]));
                p.paketList.insert(pk);
                p.resiTree.insert(pk.resi, pk.id);
                if (pk.id >= p.nextPaketId) p.nextPaketId = pk.id + 1;
                auto isMenunggu = [](const string& s) { return s == "menunggu"; };
                if (isMenunggu(pk.status)) p.paketQueue.enqueue(pk);
            }
        }
        cout << "  [LOAD] " << p.paketList.size() << " paket dimuat dari " << filename << ".\n";
    } catch (const exception& e) { cout << "  [ERROR] Gagal memuat paket: " << e.what() << "\n"; }
}

inline void paketLoadKurir(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 4) p.kurirList.insert(Kurir(stoi(t[0]), t[1], t[2], stoi(t[3])));
        }
        cout << "  [LOAD] " << p.kurirList.size() << " kurir dimuat dari " << filename << ".\n";
    } catch (const exception& e) {
        cout << "  [WARNING] Gagal memuat kurir: " << e.what() << "\n  [INFO] Menambahkan kurir default...\n";
        p.kurirList.insert(Kurir(1, "Budi Santoso", "Tersedia", 0));
        p.kurirList.insert(Kurir(2, "Andi Pratama", "Tersedia", 0));
        p.kurirList.insert(Kurir(3, "Citra Dewi", "Tersedia", 0));
    }
}

inline string generateResi(PaketData& p) {
    time_t now = time(0); tm* ltm = localtime(&now);
    char buf[30]; sprintf(buf, "SWF-%04d%02d%02d-%04d", 1900+ltm->tm_year, 1+ltm->tm_mon, ltm->tm_mday, p.nextPaketId);
    return string(buf);
}

inline string getTimestamp() {
    time_t now = time(0); tm* ltm = localtime(&now);
    char buf[30]; sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d", 1900+ltm->tm_year, 1+ltm->tm_mon, ltm->tm_mday, ltm->tm_hour, ltm->tm_min, ltm->tm_sec);
    return string(buf);
}

inline void paketAddPaket(PaketData& p, const Paket& pk) {
    Paket np = pk; np.id = p.nextPaketId++;
    if (np.resi.empty()) np.resi = generateResi(p);
    p.paketList.insert(np); p.resiTree.insert(np.resi, np.id); p.paketQueue.enqueue(np);
    cout << "  [SUKSES] Paket " << np.resi << " berhasil ditambahkan.\n";
}

inline bool paketDeletePaket(PaketData& p, int id) {
    Paket* found = p.paketList.findById(id);
    if (!found) { cout << "  [GAGAL] Paket dengan ID " << id << " tidak ditemukan.\n"; return false; }
    string resi = found->resi;
    p.paketList.removeById(id);
    cout << "  [SUKSES] Paket " << resi << " berhasil dihapus.\n"; return true;
}

inline bool paketEditPaket(PaketData& p, int id, const Paket& nd) {
    Paket upd = nd; upd.id = id;
    if (p.paketList.update(id, upd)) { cout << "  [SUKSES] Paket ID " << id << " berhasil diperbarui.\n"; return true; }
    cout << "  [GAGAL] Paket dengan ID " << id << " tidak ditemukan.\n"; return false;
}

inline Paket* paketFindById(PaketData& p, int id) { return p.paketList.findById(id); }
inline Paket* paketFindByResi(PaketData& p, const string& resi) { int* idp = p.resiTree.search(resi); return idp ? p.paketList.findById(*idp) : nullptr; }
inline void paketEnqueue(PaketData& p, const Paket& pk) { p.paketQueue.enqueue(pk); }
inline bool paketDequeue(PaketData& p, Paket& result) { return p.paketQueue.dequeue(result); }
inline Kurir* paketGetNextKurir(PaketData& p) { if (p.kurirList.isEmpty()) return nullptr; p.kurirList.rotate(); return p.kurirList.current(); }

inline void paketAssignToKurir(PaketData& p, int paketId, int kurirId) {
    Paket* pp = p.paketList.findById(paketId);
    if (pp) { pp->id_kurir = kurirId; pp->status = "dalam_perjalanan"; cout << "  [SUKSES] Paket " << pp->resi << " diassign ke Kurir ID " << kurirId << ".\n"; }
}

inline vector<Paket> paketSortByBiaya(PaketData& p, bool ascending = true) {
    vector<Paket> r = p.paketList.toVector();
    sort(r.begin(), r.end(), [ascending](const Paket& a, const Paket& b) { return ascending ? (a.biaya < b.biaya) : (a.biaya > b.biaya); });
    return r;
}

inline vector<Paket> paketSortByBerat(PaketData& p, bool ascending = true) {
    vector<Paket> r = p.paketList.toVector();
    sort(r.begin(), r.end(), [ascending](const Paket& a, const Paket& b) { return ascending ? (a.berat < b.berat) : (a.berat > b.berat); });
    return r;
}

inline int paketCountByStatus(PaketData& p, const string& status) {
    vector<Paket> r = p.paketList.toVector();
    return count_if(r.begin(), r.end(), [&status](const Paket& pp) { return pp.status == status; });
}

inline string paketGetLayananName(PaketData& p, int id) {
    auto it = find_if(p.layananList.begin(), p.layananList.end(), [id](const Layanan& l) { return l.id == id; });
    return (it != p.layananList.end()) ? it->nama : "Tidak diketahui";
}

inline string paketGetKlasifikasiName(PaketData& p, int id) {
    auto it = find_if(p.klasifikasiList.begin(), p.klasifikasiList.end(), [id](const KlasifikasiBerat& k) { return k.id == id; });
    return (it != p.klasifikasiList.end()) ? it->nama : "Tidak diketahui";
}

inline double paketGetLayananTarif(PaketData& p, int id) {
    auto it = find_if(p.layananList.begin(), p.layananList.end(), [id](const Layanan& l) { return l.id == id; });
    return (it != p.layananList.end()) ? it->tarif_per_kg : 0.0;
}

inline double paketGetKlasifikasiBiaya(PaketData& p, int id) {
    auto it = find_if(p.klasifikasiList.begin(), p.klasifikasiList.end(), [id](const KlasifikasiBerat& k) { return k.id == id; });
    return (it != p.klasifikasiList.end()) ? it->biaya_tambahan : 0.0;
}

inline void paketDisplayAll(PaketData& p) {
    cout << "\n  ===== DAFTAR SEMUA PAKET (Singly Linked List) =====\n  Total: " << p.paketList.size() << " paket\n";
    p.paketList.display();
    auto pakets = p.paketList.toVector();
    if (!pakets.empty()) {
        cout << "\n  Detail:\n";
        for (size_t i = 0; i < pakets.size(); i++) {
            auto& pp = pakets[i];
            cout << "  ----------------------------------------\n  ID       : " << pp.id << "\n  Resi     : " << pp.resi << "\n  Penerima : " << pp.nama_penerima << "\n  Tujuan   : " << pp.kota_asal << " -> " << pp.kota_tujuan << "\n  Alamat   : " << pp.alamat_tujuan << "\n  Berat    : " << pp.berat << " kg\n  Biaya    : Rp " << pp.biaya << "\n  Layanan  : " << paketGetLayananName(p, pp.id_layanan) << "\n  Klasifikasi: " << paketGetKlasifikasiName(p, pp.id_klasifikasi) << "\n  Kurir ID : " << pp.id_kurir << "\n  Status   : " << pp.status << "\n";
        }
    }
}

inline void paketDisplayQueue(PaketData& p) { cout << "\n  ===== ANTREAN PAKET (Queue) =====\n  Jumlah antrean: " << p.paketQueue.size() << "\n"; p.paketQueue.display(); }
inline void paketDisplayKurir(PaketData& p) { cout << "\n  ===== DAFTAR KURIR (Circular Linked List) =====\n  Total: " << p.kurirList.size() << " kurir\n"; p.kurirList.display(); }
inline void paketDisplayAVL(PaketData& p) { cout << "\n  ===== PENCARIAN RESI (AVL Tree) =====\n"; p.resiTree.display(); }

inline void paketSavePaket(PaketData& p, const string& filename) {
    auto pakets = p.paketList.toVector();
    vector<string> lines;
    lines.push_back("id;resi;nama_penerima;alamat_tujuan;kota_asal;kota_tujuan;berat;biaya;status;id_layanan;id_klasifikasi;id_kurir");
    for (auto& pp : pakets) lines.push_back(csvJoin({to_string(pp.id), pp.resi, pp.nama_penerima, pp.alamat_tujuan, pp.kota_asal, pp.kota_tujuan, to_string(pp.berat), to_string(pp.biaya), pp.status, to_string(pp.id_layanan), to_string(pp.id_klasifikasi), to_string(pp.id_kurir)}, ';'));
    csvWrite("data/" + filename, lines);
    cout << "  [SUKSES] " << pakets.size() << " paket disimpan ke " << filename << ".\n";
}

// --- Tracking Service ---
inline void trackingLoad(TrackingData& tr, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 5) {
                Tracking tk(stoi(t[0]), stoi(t[1]), t[2], t[3], t[4]);
                tr.trackingHistory.push_back(tk);
                tr.undoStacks[tk.id_paket].push(tk);
            }
        }
        cout << "  [LOAD] " << tr.trackingHistory.size() << " tracking history dimuat dari " << filename << ".\n";
    } catch (const exception& e) { cout << "  [WARNING] Gagal memuat tracking: " << e.what() << "\n"; }
}

inline void trackingSave(TrackingData& tr, const string& filename) {
    vector<string> lines;
    lines.push_back("id;id_paket;lokasi;status;timestamp");
    for (auto& tk : tr.trackingHistory)
        lines.push_back(csvJoin({to_string(tk.id), to_string(tk.id_paket), tk.lokasi, tk.status, tk.timestamp}, ';'));
    csvWrite("data/" + filename, lines);
    cout << "  [SUKSES] " << tr.trackingHistory.size() << " tracking history disimpan ke " << filename << ".\n";
}

inline void trackingUpdateStatus(TrackingData& tr, int paketId, const string& status, const string& lokasi) {
    time_t now = time(0); tm* ltm = localtime(&now);
    char buf[30]; sprintf(buf, "%04d-%02d-%02d %02d:%02d:%02d", 1900+ltm->tm_year, 1+ltm->tm_mon, ltm->tm_mday, ltm->tm_hour, ltm->tm_min, ltm->tm_sec);
    int newId = tr.trackingHistory.size() + 1;
    Tracking tk(newId, paketId, lokasi, status, string(buf));
    tr.trackingHistory.push_back(tk);
    tr.undoStacks[paketId].push(tk);
    cout << "  [TRACKING] Paket ID " << paketId << " -> " << status << " di " << lokasi << "\n";
}

inline bool trackingUndoLast(TrackingData& tr, int paketId) {
    auto it = tr.undoStacks.find(paketId);
    if (it == tr.undoStacks.end() || it->second.isEmpty()) { cout << "  [UNDO] Tidak ada tracking untuk paket ID " << paketId << ".\n"; return false; }
    Tracking undone;
    if (it->second.pop(undone)) {
        for (auto iter = tr.trackingHistory.begin(); iter != tr.trackingHistory.end(); ++iter) {
            if (iter->id == undone.id && iter->id_paket == paketId) { tr.trackingHistory.erase(iter); break; }
        }
        cout << "  [UNDO] Tracking di-undo: " << undone.status << " - " << undone.lokasi << "\n"; return true;
    }
    return false;
}

// callback function parameter
inline void trackingProcessHistory(TrackingData& tr, int paketId, void (*callback)(const Tracking&)) {
    cout << "  [CALLBACK] Memproses tracking history untuk paket ID " << paketId << ":\n";
    for (auto& tk : tr.trackingHistory) if (tk.id_paket == paketId) callback(tk);
}

inline void trackingDisplayHistory(TrackingData& tr, int paketId) {
    cout << "\n  ===== TRACKING HISTORY PAKET ID " << paketId << " =====\n";
    bool found = false;
    for (auto& tk : tr.trackingHistory)
        if (tk.id_paket == paketId) { cout << "  [" << tk.timestamp << "] " << tk.status << " - " << tk.lokasi << "\n"; found = true; }
    if (!found) cout << "  (Tidak ada tracking history)\n";
}

inline void trackingDisplayAll(TrackingData& tr) {
    cout << "\n  ===== SEMUA TRACKING HISTORY =====\n";
    if (tr.trackingHistory.empty()) { cout << "  (Tidak ada tracking history)\n"; return; }
    for (auto& tk : tr.trackingHistory)
        cout << "  [ID:" << tk.id << " | Paket:" << tk.id_paket << "] " << tk.timestamp << " - " << tk.status << " di " << tk.lokasi << "\n";
}

inline void trackingDisplayStack(TrackingData& tr, int paketId) {
    cout << "\n  ===== UNDO STACK PAKET ID " << paketId << " =====\n";
    auto it = tr.undoStacks.find(paketId);
    if (it != tr.undoStacks.end()) it->second.display();
    else cout << "  (Stack kosong untuk paket ini)\n";
}

inline Tracking trackingGetLatest(TrackingData& tr, int paketId) {
    for (auto it = tr.trackingHistory.rbegin(); it != tr.trackingHistory.rend(); ++it)
        if (it->id_paket == paketId) return *it;
    return Tracking(0, paketId, "Tidak diketahui", "-", "-");
}

// --- Report Service ---
inline void reportDisplayLaporanPaket(vector<Paket>& pakets) {
    cout << "\n  ============================================\n  === LAPORAN SEMUA PAKET ===\n  ============================================\n";
    if (pakets.empty()) { cout << "  [INFO] Belum ada data paket.\n"; return; }
    sort(pakets.begin(), pakets.end(), [](const Paket& a, const Paket& b) { return a.id < b.id; });
    cout << "  " << setw(5) << "ID" << setw(15) << "Resi" << setw(18) << "Penerima" << setw(15) << "Kota Tujuan" << setw(8) << "Berat" << setw(12) << "Biaya" << setw(18) << "Status" << "\n";
    cout << "  " << string(91, '-') << "\n";
    auto displayRow = [](const Paket& pp) { cout << "  " << setw(5) << pp.id << setw(15) << pp.resi << setw(18) << pp.nama_penerima << setw(15) << pp.kota_tujuan << setw(8) << pp.berat << setw(12) << pp.biaya << setw(18) << pp.status << "\n"; };
    for_each(pakets.begin(), pakets.end(), displayRow);
    cout << "\n  Total paket: " << pakets.size() << "\n";
}

inline void reportDisplayByStatus(vector<Paket>& pakets) {
    cout << "\n  ============================================\n  === LAPORAN PAKET BERDASARKAN STATUS ===\n  ============================================\n";
    if (pakets.empty()) { cout << "  [INFO] Belum ada data paket.\n"; return; }
    auto cnt = [&](const string& s) -> int { return count_if(pakets.begin(), pakets.end(), [&s](const Paket& pp) { return pp.status == s; }); };
    vector<string> statuses = {"Menunggu", "Dalam Perjalanan", "Terkirim"};
    for (auto& s : statuses) {
        cout << "\n  --- Status: " << s << " (" << cnt(s) << " paket) ---\n";
        for (auto& pp : pakets) if (pp.status == s) cout << "    ID: " << pp.id << " | Resi: " << pp.resi << " | " << pp.nama_penerima << " | " << pp.kota_tujuan << " | Rp " << pp.biaya << "\n";
    }
}

inline void reportDisplayStatistik(vector<Paket>& pakets) {
    cout << "\n  ============================================\n  === STATISTIK PENGIRIMAN ===\n  ============================================\n";
    if (pakets.empty()) { cout << "  [INFO] Belum ada data paket.\n"; return; }
    int total = pakets.size();
    int menunggu = count_if(pakets.begin(), pakets.end(), [](const Paket& pp) { return pp.status == "Menunggu"; });
    int dalam = count_if(pakets.begin(), pakets.end(), [](const Paket& pp) { return pp.status == "Dalam Perjalanan"; });
    int terkirim = count_if(pakets.begin(), pakets.end(), [](const Paket& pp) { return pp.status == "Terkirim"; });
    double totalBiaya = 0, totalBerat = 0, maxBiaya = 0; string paketTermahal;
    for (auto& pp : pakets) { totalBiaya += pp.biaya; totalBerat += pp.berat; if (pp.biaya > maxBiaya) { maxBiaya = pp.biaya; paketTermahal = pp.resi; } }
    cout << "\n  Total Paket          : " << total << "\n  Menunggu             : " << menunggu << "\n  Dalam Perjalanan     : " << dalam << "\n  Terkirim             : " << terkirim;
    cout << "\n  ----------------------------------------\n  Total Biaya          : Rp " << fixed << setprecision(0) << totalBiaya << "\n  Rata-rata Biaya      : Rp " << (total>0?totalBiaya/total:0) << "\n  Rata-rata Berat      : " << (total>0?totalBerat/total:0) << " kg\n  Paket Termahal       : " << paketTermahal << " (Rp " << maxBiaya << ")\n  ============================================\n";
}

inline void reportDisplayCEO(vector<Paket>& pakets, int totalKurir, int totalTracking) {
    cout << "\n  ============================================\n  === LAPORAN CEO - OVERVIEW PERUSAHAAN ===\n  ============================================\n";
    reportDisplayStatistik(pakets);
    cout << "\n  ===== INFORMASI TAMBAHAN CEO =====\n  Total Kurir Aktif    : " << totalKurir << "\n  Total Tracking Entry : " << totalTracking << "\n  ============================================\n";
}

// --- Routing Service ---
inline void routingLoad(RoutingData& rt, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (size_t i = 0; i < lines.size(); i++) {
            auto t = csvSplit(lines[i], ';');
            if (t.size() >= 3) { Kota k(t[0], t[1], stoi(t[2])); rt.edgesList.push_back(k); rt.graph.addEdge(k.asal, k.tujuan, k.jarak); }
        }
        cout << "  [LOAD] " << rt.edgesList.size() << " jalur antar kota dimuat dari " << filename << ".\n";
    } catch (const exception& e) { cout << "  [ERROR] Gagal memuat kota: " << e.what() << "\n"; }
}

inline void routingDisplayEdges(RoutingData& rt) {
    cout << "\n  ===== DAFTAR JALUR (KOTA.CSV) =====\n";
    if (rt.edgesList.empty()) { cout << "  (Tidak ada jalur)\n"; return; }
    for (auto& k : rt.edgesList) cout << "  " << k.asal << " -> " << k.tujuan << " (" << k.jarak << " km)\n";
}

// ============================================================
// CALLBACK FUNCTION (for tracking) - global function pointer type
// ============================================================
inline void trackingCallbackPrint(const Tracking& tr) {
    cout << "    -> " << tr.timestamp << " | " << tr.status << " - " << tr.lokasi << "\n";
}

} // namespace SwiftExpedition

#endif // EXPEDITION_H
