// ============================================================
// SwiftExpedition GUI Server
// C++ HTTP Server bridging frontend to SwiftExpedition namespace
// Compile: g++ -std=c++17 -O2 server.cpp -o server.exe -lws2_32
// ============================================================

// Windows socket requirement for httplib
#ifdef _WIN32
#ifndef _WIN32_WINNT
#define _WIN32_WINNT 0x0A00
#endif
#endif

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
#include <mutex>

// Single-header libraries
#include "json.hpp"
using json = nlohmann::json;

#include "httplib.h"

using namespace std;

// ============================================================
// Include SwiftExpedition namespace (everything from main.cpp
// except the main() function and menu functions)
// ============================================================

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
// TEMPLATE DATA STRUCTURES
// ============================================================

template<typename T>
struct SinglyLinkedList {
    struct Node { T data; Node* next; Node(const T& d) : data(d), next(nullptr) {} };
    Node* head;
    int size_;
    SinglyLinkedList() : head(nullptr), size_(0) {}
    ~SinglyLinkedList() { clear(); }
    inline bool isEmpty() const { return head == nullptr; }
    inline int size() const { return size_; }

    void insert(const T& data) {
        Node* n = new Node(data);
        if (!head) { head = n; } else { Node* t = head; while (t->next) t = t->next; t->next = n; }
        size_++;
    }
    T* findById(int id) { Node* t = head; while (t) { if (t->data.id == id) return &(t->data); t = t->next; } return nullptr; }
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
    void clear() { while (head) { Node* t = head; head = head->next; delete t; } size_ = 0; }
};

template<typename T>
struct CircularLinkedList {
    struct Node { T data; Node* next; Node(const T& d) : data(d), next(nullptr) {} };
    Node* tail;
    int size_;
    CircularLinkedList() : tail(nullptr), size_(0) {}
    ~CircularLinkedList() { clear(); }
    inline bool isEmpty() const { return tail == nullptr; }
    inline int size() const { return size_; }
    void insert(const T& data) {
        Node* n = new Node(data);
        if (!tail) { tail = n; tail->next = tail; } else { n->next = tail->next; tail->next = n; tail = n; }
        size_++;
    }
    void rotate() { if (tail) tail = tail->next; }
    T* current() { return tail ? &(tail->data) : nullptr; }
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
    vector<T> toVector() const {
        vector<T> r; Node* t = topNode;
        while (t) { r.push_back(t->data); t = t->next; }
        return r;
    }
    void clear() { while (topNode) { Node* t = topNode; topNode = topNode->next; delete t; } size_ = 0; }
};

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
        if (!frontNode) { frontNode = rearNode = n; }
        else if (data.id_layanan > frontNode->data.id_layanan) { n->next = frontNode; frontNode = n; }
        else {
            Node* curr = frontNode;
            while (curr->next && curr->next->data.id_layanan >= data.id_layanan) curr = curr->next;
            n->next = curr->next; curr->next = n;
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
    vector<T> toVector() const {
        vector<T> r; Node* t = frontNode;
        while (t) { r.push_back(t->data); t = t->next; }
        return r;
    }
    void clear() { while (frontNode) { Node* t = frontNode; frontNode = frontNode->next; delete t; } rearNode = nullptr; size_ = 0; }
};

template<typename K, typename V>
struct AVLTree {
    struct Node { K key; V value; Node* left; Node* right; int height;
        Node(const K& k, const V& v) : key(k), value(v), left(nullptr), right(nullptr), height(1) {} };
    Node* root;
    AVLTree() : root(nullptr) {}
    ~AVLTree() { clear(); }
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
    void clearNode(Node* n) { if (!n) return; clearNode(n->left); clearNode(n->right); delete n; }
    void clear() { clearNode(root); root = nullptr; }
};

template<typename K, typename V>
struct HashTable {
    map<K, V> table;
    void insert(const K& key, const V& value) { table[key] = value; }
    V* find(const K& key) { auto it = table.find(key); return (it != table.end()) ? &(it->second) : nullptr; }
    size_t size() const { return table.size(); }
};

struct Graph {
    map<string, vector<Edge>> adjList;
    void addEdge(const string& asal, const string& tujuan, int jarak) {
        adjList[asal].push_back({tujuan, jarak});
        adjList[tujuan].push_back({asal, jarak});
    }
    vector<string> BFS(const string& asal, const string& tujuan) {
        map<string, string> parent;
        map<string, bool> visited;
        queue<string> q;
        for (auto& p : adjList) visited[p.first] = false;
        visited[asal] = true; q.push(asal); parent[asal] = "";
        bool found = false;
        while (!q.empty() && !found) {
            string cur = q.front(); q.pop();
            for (auto& e : adjList[cur]) {
                if (!visited[e.tujuan]) {
                    visited[e.tujuan] = true; parent[e.tujuan] = cur; q.push(e.tujuan);
                    if (e.tujuan == tujuan) { found = true; break; }
                }
            }
        }
        vector<string> path;
        if (!found) return path;
        string cur = tujuan;
        while (cur != "") { path.push_back(cur); cur = parent[cur]; }
        reverse(path.begin(), path.end());
        return path;
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
    struct PathResult { vector<string> path; int distance; };
    vector<PathResult> findAllPaths(const string& asal, const string& tujuan) {
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
// CSV HELPERS
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
    file.close(); return lines;
}
inline void csvWrite(const string& filename, const vector<string>& lines) {
    ofstream file(filename);
    if (!file.is_open()) throw runtime_error("Gagal membuka file: " + filename);
    for (auto& line : lines) file << line << "\n";
    file.close();
}
inline vector<string> csvSplit(const string& line, char delimiter = ',') {
    vector<string> tokens; stringstream ss(line); string token;
    while (getline(ss, token, delimiter)) tokens.push_back(token);
    return tokens;
}
inline string csvJoin(const vector<string>& tokens, char delimiter = ',') {
    string r;
    for (size_t i = 0; i < tokens.size(); i++) { r += tokens[i]; if (i < tokens.size()-1) r += delimiter; }
    return r;
}

// ============================================================
// SERVICE: Global state
// ============================================================
struct AuthData { HashTable<string, User> userTable; };
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
inline void authLoadUsers(AuthData& auth, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) {
            auto t = csvSplit(line, ';');
            if (t.size() >= 5) {
                User u(stoi(t[0]), t[1], t[2], t[3], stringToRole(t[4]));
                auth.userTable.insert(u.username, u);
            }
        }
        cout << "  [LOAD] " << auth.userTable.size() << " user dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] " << e.what() << "\n"; }
}
inline User* authLogin(AuthData& auth, const string& username, const string& password) {
    User* u = auth.userTable.find(username);
    return (u && u->password == password) ? u : nullptr;
}
inline void paketLoadLayanan(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) { auto t = csvSplit(line, ';'); if (t.size() >= 3) p.layananList.push_back(Layanan(stoi(t[0]), t[1], stod(t[2]))); }
        cout << "  [LOAD] " << p.layananList.size() << " layanan dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] " << e.what() << "\n"; }
}
inline void paketLoadKlasifikasi(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) { auto t = csvSplit(line, ';'); if (t.size() >= 3) p.klasifikasiList.push_back(KlasifikasiBerat(stoi(t[0]), t[1], stod(t[2]))); }
        cout << "  [LOAD] " << p.klasifikasiList.size() << " klasifikasi dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] " << e.what() << "\n"; }
}
inline void paketLoadPaket(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) {
            auto t = csvSplit(line, ';');
            if (t.size() >= 12) {
                Paket pk(stoi(t[0]), t[1], t[2], t[3], t[4], t[5], stod(t[6]), stod(t[7]), t[8], stoi(t[9]), stoi(t[10]), stoi(t[11]));
                p.paketList.insert(pk); p.resiTree.insert(pk.resi, pk.id);
                if (pk.id >= p.nextPaketId) p.nextPaketId = pk.id + 1;
                if (pk.status == "menunggu") p.paketQueue.enqueue(pk);
            }
        }
        cout << "  [LOAD] " << p.paketList.size() << " paket dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] " << e.what() << "\n"; }
}
inline void paketLoadKurir(PaketData& p, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) { auto t = csvSplit(line, ';'); if (t.size() >= 4) p.kurirList.insert(Kurir(stoi(t[0]), t[1], t[2], stoi(t[3]))); }
        cout << "  [LOAD] " << p.kurirList.size() << " kurir dimuat.\n";
    } catch (const exception& e) {
        cout << "  [WARNING] " << e.what() << " - adding defaults\n";
        p.kurirList.insert(Kurir(1, "Budi Santoso", "Tersedia", 0));
        p.kurirList.insert(Kurir(2, "Andi Pratama", "Tersedia", 0));
    }
}
inline void trackingLoad(TrackingData& tr, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) {
            auto t = csvSplit(line, ';');
            if (t.size() >= 5) {
                Tracking tk(stoi(t[0]), stoi(t[1]), t[2], t[3], t[4]);
                tr.trackingHistory.push_back(tk);
                tr.undoStacks[tk.id_paket].push(tk);
            }
        }
        cout << "  [LOAD] " << tr.trackingHistory.size() << " tracking dimuat.\n";
    } catch (const exception& e) { cout << "  [WARNING] " << e.what() << "\n"; }
}
inline void routingLoad(RoutingData& rt, const string& filename) {
    try {
        auto lines = csvRead("data/" + filename);
        for (auto& line : lines) {
            auto t = csvSplit(line, ';');
            if (t.size() >= 3) { Kota k(t[0], t[1], stoi(t[2])); rt.edgesList.push_back(k); rt.graph.addEdge(k.asal, k.tujuan, k.jarak); }
        }
        cout << "  [LOAD] " << rt.edgesList.size() << " jalur dimuat.\n";
    } catch (const exception& e) { cout << "  [ERROR] " << e.what() << "\n"; }
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
inline void paketSavePaket(PaketData& p, const string& filename) {
    auto pakets = p.paketList.toVector();
    vector<string> lines;
    lines.push_back("id;resi;nama_penerima;alamat_tujuan;kota_asal;kota_tujuan;berat;biaya;status;id_layanan;id_klasifikasi;id_kurir");
    for (auto& pp : pakets) lines.push_back(csvJoin({to_string(pp.id), pp.resi, pp.nama_penerima, pp.alamat_tujuan, pp.kota_asal, pp.kota_tujuan, to_string(pp.berat), to_string(pp.biaya), pp.status, to_string(pp.id_layanan), to_string(pp.id_klasifikasi), to_string(pp.id_kurir)}, ';'));
    csvWrite("data/" + filename, lines);
}
inline void trackingSave(TrackingData& tr, const string& filename) {
    vector<string> lines;
    lines.push_back("id;id_paket;lokasi;status;timestamp");
    for (auto& tk : tr.trackingHistory) lines.push_back(csvJoin({to_string(tk.id), to_string(tk.id_paket), tk.lokasi, tk.status, tk.timestamp}, ';'));
    csvWrite("data/" + filename, lines);
}

} // namespace SwiftExpedition

// ============================================================
// JSON Serialization helpers
// ============================================================
using namespace SwiftExpedition;

json paketToJson(const Paket& p, PaketData& pd) {
    string layananNama = "";
    for (auto& l : pd.layananList) if (l.id == p.id_layanan) { layananNama = l.nama; break; }
    string klasNama = "";
    for (auto& k : pd.klasifikasiList) if (k.id == p.id_klasifikasi) { klasNama = k.nama; break; }
    return {
        {"id", p.id}, {"resi", p.resi}, {"nama_penerima", p.nama_penerima},
        {"alamat_tujuan", p.alamat_tujuan}, {"kota_asal", p.kota_asal},
        {"kota_tujuan", p.kota_tujuan}, {"berat", p.berat}, {"biaya", p.biaya},
        {"status", p.status}, {"id_layanan", p.id_layanan},
        {"id_klasifikasi", p.id_klasifikasi}, {"id_kurir", p.id_kurir},
        {"layanan_nama", layananNama}, {"klasifikasi_nama", klasNama}
    };
}
json trackingToJson(const Tracking& t) {
    return {{"id", t.id}, {"id_paket", t.id_paket}, {"lokasi", t.lokasi},
            {"status", t.status}, {"timestamp", t.timestamp}, {"keterangan", t.keterangan}};
}

// ============================================================
// MAIN — HTTP SERVER
// ============================================================
int main() {
    AuthData auth;
    PaketData paket;
    TrackingData tracking;
    RoutingData routing;
    mutex dataMutex;

    cout << "\n  ============================================\n";
    cout << "  === SwiftExpedition GUI Server ===\n";
    cout << "  ============================================\n\n";

    authLoadUsers(auth, "anggota.csv");
    paketLoadLayanan(paket, "layanan.csv");
    paketLoadKlasifikasi(paket, "klasifikasi.csv");
    paketLoadPaket(paket, "paket.csv");
    paketLoadKurir(paket, "kurir.csv");
    trackingLoad(tracking, "tracking.csv");
    routingLoad(routing, "kota.csv");

    cout << "\n  [OK] Semua data berhasil dimuat.\n\n";

    httplib::Server svr;

    // ---- Serve frontend static files ----
    svr.set_mount_point("/", "./frontend");

    // ---- CORS ----
    svr.set_pre_routing_handler([](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        return httplib::Server::HandlerResponse::Unhandled;
    });
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        res.status = 204;
    });

    // ========== AUTH ==========
    svr.Post("/api/auth/login", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        try {
            auto body = json::parse(req.body);
            string username = body.value("username", "");
            string password = body.value("password", "");
            User* u = authLogin(auth, username, password);
            if (u) {
                json j = {{"id", u->id}, {"nama", u->nama}, {"username", u->username}, {"role", roleToString(u->role)}};
                res.set_content(j.dump(), "application/json");
            } else {
                res.status = 401;
                res.set_content(json({{"error", "Username atau password salah"}}).dump(), "application/json");
            }
        } catch (...) { res.status = 400; res.set_content(json({{"error", "Bad request"}}).dump(), "application/json"); }
    });

    // ========== DASHBOARD STATS ==========
    svr.Get("/api/dashboard/stats", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto pakets = paket.paketList.toVector();
        int total = pakets.size();
        double totalBiaya = 0, totalBerat = 0;
        map<string, int> statusCounts;
        for (auto& p : pakets) { totalBiaya += p.biaya; totalBerat += p.berat; statusCounts[p.status]++; }
        json breakdown = json::array();
        for (auto& sc : statusCounts) breakdown.push_back({{"status", sc.first}, {"count", sc.second}});
        json recentPakets = json::array();
        auto vec = paket.paketList.toVector();
        int start = max(0, (int)vec.size() - 5);
        for (int i = start; i < (int)vec.size(); i++) recentPakets.push_back(paketToJson(vec[i], paket));

        json j = {
            {"total_paket", total},
            {"menunggu", statusCounts["menunggu"]},
            {"dalam_perjalanan", statusCounts["dalam_perjalanan"]},
            {"diproses", statusCounts["diproses"]},
            {"terkirim", statusCounts["terkirim"]},
            {"sampai_tujuan", statusCounts["sampai_tujuan"]},
            {"total_biaya", totalBiaya},
            {"total_berat", totalBerat},
            {"rata_biaya", total > 0 ? totalBiaya / total : 0},
            {"rata_berat", total > 0 ? totalBerat / total : 0},
            {"queue_size", paket.paketQueue.size()},
            {"total_kurir", paket.kurirList.size()},
            {"total_tracking", (int)tracking.trackingHistory.size()},
            {"status_breakdown", breakdown},
            {"recent_paket", recentPakets}
        };
        res.set_content(j.dump(), "application/json");
    });

    // ========== PAKET CRUD ==========
    svr.Get("/api/paket", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto pakets = paket.paketList.toVector();
        json j = json::array();
        for (auto& p : pakets) j.push_back(paketToJson(p, paket));
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/paket", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        try {
            auto body = json::parse(req.body);
            Paket pk;
            pk.id = paket.nextPaketId++;
            pk.resi = body.value("resi", "");
            if (pk.resi.empty()) pk.resi = generateResi(paket);
            pk.nama_penerima = body.value("nama_penerima", "");
            pk.alamat_tujuan = body.value("alamat_tujuan", "");
            pk.kota_asal = body.value("kota_asal", "");
            pk.kota_tujuan = body.value("kota_tujuan", "");
            pk.berat = body.value("berat", 0.0);
            pk.biaya = body.value("biaya", 0.0);
            pk.status = "menunggu";
            pk.id_layanan = body.value("id_layanan", 0);
            pk.id_klasifikasi = body.value("id_klasifikasi", 0);
            pk.id_kurir = 0;
            paket.paketList.insert(pk);
            paket.resiTree.insert(pk.resi, pk.id);
            paket.paketQueue.enqueue(pk);
            res.set_content(paketToJson(pk, paket).dump(), "application/json");
        } catch (...) { res.status = 400; res.set_content(json({{"error", "Bad request"}}).dump(), "application/json"); }
    });

    svr.Put(R"(/api/paket/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        try {
            int id = stoi(req.matches[1]);
            auto body = json::parse(req.body);
            Paket* existing = paket.paketList.findById(id);
            if (!existing) { res.status = 404; res.set_content(json({{"error", "Paket tidak ditemukan"}}).dump(), "application/json"); return; }
            Paket updated = *existing;
            if (body.contains("nama_penerima")) updated.nama_penerima = body["nama_penerima"];
            if (body.contains("alamat_tujuan")) updated.alamat_tujuan = body["alamat_tujuan"];
            if (body.contains("kota_asal")) updated.kota_asal = body["kota_asal"];
            if (body.contains("kota_tujuan")) updated.kota_tujuan = body["kota_tujuan"];
            if (body.contains("berat")) updated.berat = body["berat"];
            if (body.contains("biaya")) updated.biaya = body["biaya"];
            if (body.contains("status")) updated.status = body["status"];
            paket.paketList.update(id, updated);
            res.set_content(paketToJson(updated, paket).dump(), "application/json");
        } catch (...) { res.status = 400; res.set_content(json({{"error", "Bad request"}}).dump(), "application/json"); }
    });

    svr.Delete(R"(/api/paket/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        int id = stoi(req.matches[1]);
        if (paket.paketList.removeById(id)) {
            res.set_content(json({{"success", true}}).dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(json({{"error", "Paket tidak ditemukan"}}).dump(), "application/json");
        }
    });

    // ========== QUEUE ==========
    svr.Get("/api/paket/queue", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto q = paket.paketQueue.toVector();
        json j = json::array();
        for (auto& p : q) j.push_back(paketToJson(p, paket));
        res.set_content(j.dump(), "application/json");
    });

    svr.Post("/api/paket/dequeue", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        Paket pk;
        if (paket.paketQueue.dequeue(pk)) {
            // Assign to next kurir via circular list
            string kurirName = "";
            if (!paket.kurirList.isEmpty()) {
                paket.kurirList.rotate();
                Kurir* k = paket.kurirList.current();
                if (k) {
                    Paket* pp = paket.paketList.findById(pk.id);
                    if (pp) { pp->id_kurir = k->id; pp->status = "dalam_perjalanan"; }
                    kurirName = k->nama;
                    // Add tracking
                    int newId = tracking.trackingHistory.size() + 1;
                    Tracking tk(newId, pk.id, pk.kota_asal, "dalam_perjalanan", getTimestamp());
                    tracking.trackingHistory.push_back(tk);
                    tracking.undoStacks[pk.id].push(tk);
                }
            }
            json j = paketToJson(pk, paket);
            j["kurir"] = kurirName;
            res.set_content(j.dump(), "application/json");
        } else {
            res.status = 404;
            res.set_content(json({{"error", "Antrean kosong"}}).dump(), "application/json");
        }
    });

    // ========== KURIR ==========
    svr.Get("/api/kurir", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto kurirs = paket.kurirList.toVector();
        string currentName = "";
        if (paket.kurirList.current()) currentName = paket.kurirList.current()->nama;
        json jk = json::array();
        for (auto& k : kurirs) jk.push_back({{"id", k.id}, {"nama", k.nama}, {"status", k.status}, {"total_paket", k.total_paket}});
        res.set_content(json({{"kurirs", jk}, {"current", currentName}}).dump(), "application/json");
    });

    svr.Post("/api/kurir/rotate", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        paket.kurirList.rotate();
        string name = paket.kurirList.current() ? paket.kurirList.current()->nama : "";
        res.set_content(json({{"current", name}}).dump(), "application/json");
    });

    // ========== TRACKING ==========
    svr.Get("/api/tracking", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        json j = json::array();
        for (auto& t : tracking.trackingHistory) j.push_back(trackingToJson(t));
        res.set_content(json({{"tracking", j}}).dump(), "application/json");
    });

    svr.Get(R"(/api/tracking/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        int paketId = stoi(req.matches[1]);
        json j = json::array();
        for (auto& t : tracking.trackingHistory) if (t.id_paket == paketId) j.push_back(trackingToJson(t));
        res.set_content(json({{"tracking", j}}).dump(), "application/json");
    });

    svr.Get(R"(/api/tracking/stack/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        int paketId = stoi(req.matches[1]);
        json j = json::array();
        auto it = tracking.undoStacks.find(paketId);
        if (it != tracking.undoStacks.end()) {
            auto vec = it->second.toVector();
            for (auto& t : vec) j.push_back(trackingToJson(t));
        }
        res.set_content(json({{"stack", j}}).dump(), "application/json");
    });

    svr.Post("/api/tracking/update", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        try {
            auto body = json::parse(req.body);
            int paketId = body.value("id_paket", 0);
            string status = body.value("status", "");
            string lokasi = body.value("lokasi", "");
            int newId = tracking.trackingHistory.size() + 1;
            Tracking tk(newId, paketId, lokasi, status, getTimestamp());
            tracking.trackingHistory.push_back(tk);
            tracking.undoStacks[paketId].push(tk);
            // Update paket status too
            Paket* pp = paket.paketList.findById(paketId);
            if (pp) pp->status = status;
            res.set_content(json({{"success", true}, {"tracking", trackingToJson(tk)}}).dump(), "application/json");
        } catch (...) { res.status = 400; res.set_content(json({{"error", "Bad request"}}).dump(), "application/json"); }
    });

    svr.Post(R"(/api/tracking/undo/(\d+))", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        int paketId = stoi(req.matches[1]);
        auto it = tracking.undoStacks.find(paketId);
        if (it == tracking.undoStacks.end() || it->second.isEmpty()) {
            res.status = 404;
            res.set_content(json({{"error", "Tidak ada tracking untuk di-undo"}}).dump(), "application/json");
            return;
        }
        Tracking undone;
        if (it->second.pop(undone)) {
            for (auto iter = tracking.trackingHistory.begin(); iter != tracking.trackingHistory.end(); ++iter) {
                if (iter->id == undone.id && iter->id_paket == paketId) { tracking.trackingHistory.erase(iter); break; }
            }
            // Restore previous status
            string prevStatus = "";
            if (!it->second.isEmpty()) {
                auto vec = it->second.toVector();
                if (!vec.empty()) prevStatus = vec[0].status;
            }
            Paket* pp = paket.paketList.findById(paketId);
            if (pp && !prevStatus.empty()) pp->status = prevStatus;
            res.set_content(json({{"success", true}, {"undone_status", undone.status}, {"restored_status", prevStatus}}).dump(), "application/json");
        } else {
            res.status = 400;
            res.set_content(json({{"error", "Gagal melakukan undo"}}).dump(), "application/json");
        }
    });

    // ========== REPORT ==========
    svr.Get("/api/report/operational", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto pakets = paket.paketList.toVector();
        int total = pakets.size();
        double totalBiaya = 0, totalBerat = 0, maxBiaya = 0;
        string paketTermahal;
        map<string, int> statusCounts;
        for (auto& p : pakets) {
            totalBiaya += p.biaya; totalBerat += p.berat; statusCounts[p.status]++;
            if (p.biaya > maxBiaya) { maxBiaya = p.biaya; paketTermahal = p.resi; }
        }
        json breakdown = json::array();
        for (auto& sc : statusCounts) breakdown.push_back({{"status", sc.first}, {"count", sc.second}});
        json jPakets = json::array();
        for (auto& p : pakets) jPakets.push_back(paketToJson(p, paket));

        json j = {
            {"total_paket", total}, {"total_biaya", totalBiaya}, {"total_berat", totalBerat},
            {"rata_biaya", total > 0 ? totalBiaya / total : 0},
            {"rata_berat", total > 0 ? totalBerat / total : 0},
            {"paket_termahal", paketTermahal}, {"biaya_tertinggi", maxBiaya},
            {"total_kurir", paket.kurirList.size()},
            {"total_tracking", (int)tracking.trackingHistory.size()},
            {"status_breakdown", breakdown}, {"pakets", jPakets}
        };
        res.set_content(j.dump(), "application/json");
    });

    // ========== FILTER ==========
    svr.Get("/api/paket/filter", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto pakets = paket.paketList.toVector();
        string status = req.get_param_value("status");
        string kota_asal = req.get_param_value("kota_asal");
        string kota_tujuan = req.get_param_value("kota_tujuan");
        string search = req.get_param_value("search");

        vector<Paket> filtered;
        for (auto& p : pakets) {
            if (!status.empty() && p.status != status) continue;
            if (!kota_asal.empty() && p.kota_asal != kota_asal) continue;
            if (!kota_tujuan.empty() && p.kota_tujuan != kota_tujuan) continue;
            if (!search.empty()) {
                string low = search;
                transform(low.begin(), low.end(), low.begin(), ::tolower);
                string resi_low = p.resi; transform(resi_low.begin(), resi_low.end(), resi_low.begin(), ::tolower);
                string nama_low = p.nama_penerima; transform(nama_low.begin(), nama_low.end(), nama_low.begin(), ::tolower);
                if (resi_low.find(low) == string::npos && nama_low.find(low) == string::npos) continue;
            }
            filtered.push_back(p);
        }
        json j = json::array();
        for (auto& p : filtered) j.push_back(paketToJson(p, paket));
        res.set_content(j.dump(), "application/json");
    });

    // ========== SORT ==========
    svr.Get("/api/paket/sort", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        auto pakets = paket.paketList.toVector();
        string by = req.get_param_value("by");
        string order = req.get_param_value("order");
        bool asc = (order != "desc");

        if (by == "berat") {
            sort(pakets.begin(), pakets.end(), [asc](const Paket& a, const Paket& b) { return asc ? a.berat < b.berat : a.berat > b.berat; });
        } else {
            sort(pakets.begin(), pakets.end(), [asc](const Paket& a, const Paket& b) { return asc ? a.biaya < b.biaya : a.biaya > b.biaya; });
        }
        json j = json::array();
        for (auto& p : pakets) j.push_back(paketToJson(p, paket));
        res.set_content(j.dump(), "application/json");
    });

    // ========== GRAPH ==========
    svr.Get("/api/graph/cities", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        json j = routing.graph.getCities();
        res.set_content(j.dump(), "application/json");
    });

    svr.Get("/api/graph/edges", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        json j = json::array();
        for (auto& k : routing.edgesList) j.push_back({{"asal", k.asal}, {"tujuan", k.tujuan}, {"jarak", k.jarak}});
        res.set_content(j.dump(), "application/json");
    });

    svr.Get("/api/graph/bfs", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string from = req.get_param_value("from");
        string to = req.get_param_value("to");
        if (!routing.graph.hasCity(from) || !routing.graph.hasCity(to)) {
            res.status = 400; res.set_content(json({{"error", "Kota tidak ditemukan"}}).dump(), "application/json"); return;
        }
        auto path = routing.graph.BFS(from, to);
        int dist = routing.graph.getBFSDistance(from, to);
        res.set_content(json({{"path", path}, {"distance", dist}}).dump(), "application/json");
    });

    svr.Get("/api/graph/dfs", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string start = req.get_param_value("start");
        if (!routing.graph.hasCity(start)) {
            res.status = 400; res.set_content(json({{"error", "Kota tidak ditemukan"}}).dump(), "application/json"); return;
        }
        auto order = routing.graph.DFSOrder(start);
        res.set_content(json({{"order", order}}).dump(), "application/json");
    });

    svr.Get("/api/graph/allpaths", [&](const httplib::Request& req, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        string from = req.get_param_value("from");
        string to = req.get_param_value("to");
        if (!routing.graph.hasCity(from) || !routing.graph.hasCity(to)) {
            res.status = 400; res.set_content(json({{"error", "Kota tidak ditemukan"}}).dump(), "application/json"); return;
        }
        auto paths = routing.graph.findAllPaths(from, to);
        json jp = json::array();
        for (auto& p : paths) jp.push_back({{"path", p.path}, {"distance", p.distance}});
        res.set_content(json({{"paths", jp}}).dump(), "application/json");
    });

    // ========== LAYANAN & KLASIFIKASI ==========
    svr.Get("/api/layanan", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        json j = json::array();
        for (auto& l : paket.layananList) j.push_back({{"id", l.id}, {"nama", l.nama}, {"tarif_per_kg", l.tarif_per_kg}});
        res.set_content(j.dump(), "application/json");
    });

    svr.Get("/api/klasifikasi", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        json j = json::array();
        for (auto& k : paket.klasifikasiList) j.push_back({{"id", k.id}, {"nama", k.nama}, {"biaya_tambahan", k.biaya_tambahan}});
        res.set_content(j.dump(), "application/json");
    });

    // ========== SAVE ==========
    svr.Post("/api/save", [&](const httplib::Request&, httplib::Response& res) {
        lock_guard<mutex> lock(dataMutex);
        try {
            paketSavePaket(paket, "paket.csv");
            trackingSave(tracking, "tracking.csv");
            res.set_content(json({{"success", true}}).dump(), "application/json");
        } catch (const exception& e) {
            res.status = 500;
            res.set_content(json({{"error", e.what()}}).dump(), "application/json");
        }
    });

    // ---- Start server ----
    int port = 8080;
    cout << "  ============================================\n";
    cout << "  Server berjalan di http://localhost:" << port << "\n";
    cout << "  Buka browser ke alamat di atas.\n";
    cout << "  Tekan Ctrl+C untuk berhenti.\n";
    cout << "  ============================================\n\n";

    // Auto-open browser
    #ifdef _WIN32
    system("start http://localhost:8080");
    #endif

    svr.listen("0.0.0.0", port);
    return 0;
}
