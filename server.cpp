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

#include "external/lib/http_lib/httplib.h"
#include "lib/serialization.h"

using namespace std;

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
  svr.set_pre_routing_handler(
      [](const httplib::Request &, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods",
                       "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        return httplib::Server::HandlerResponse::Unhandled;
      });
  svr.Options(".*", [](const httplib::Request &, httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods",
                   "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    res.status = 204;
  });

  // ========== AUTH ==========
  svr.Post("/api/auth/login",
           [&](const httplib::Request &req, httplib::Response &res) {
             lock_guard<mutex> lock(dataMutex);
             try {
               auto body = json::parse(req.body);
               string username = body.value("username", "");
               string password = body.value("password", "");
               User *u = authLogin(auth, username, password);
               if (u) {
                 json j = {{"id", u->id},
                           {"nama", u->nama},
                           {"username", u->username},
                           {"role", roleToString(u->role)}};
                 res.set_content(j.dump(), "application/json");
               } else {
                 res.status = 401;
                 json errorObj = {{"error", "Username atau password salah"}};
                 res.set_content(errorObj.dump(), "application/json");
               }
             } catch (...) {
               res.status = 400;
               json errorObj = {{"error", "Bad request"}};
               res.set_content(errorObj.dump(), "application/json");
             }
           });

  // ========== DASHBOARD STATS ==========
  svr.Get("/api/dashboard/stats",
          [&](const httplib::Request &, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            auto pakets = paket.paketList.toVector();
            int total = pakets.size();
            double totalBiaya = 0, totalBerat = 0;
            map<string, int> statusCounts;
            for (auto &p : pakets) {
              totalBiaya += p.biaya;
              totalBerat += p.berat;
              statusCounts[p.status]++;
            }
            json breakdown = json::array();
            for (auto &sc : statusCounts)
              breakdown.push_back({{"status", sc.first}, {"count", sc.second}});
            json recentPakets = json::array();
            auto vec = paket.paketList.toVector();
            int start = max(0, (int)vec.size() - 5);
            for (int i = start; i < (int)vec.size(); i++)
              recentPakets.push_back(paketToJson(vec[i], paket));

            json j = {{"total_paket", total},
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
                      {"recent_paket", recentPakets}};
            res.set_content(j.dump(), "application/json");
          });

  // ========== PAKET CRUD ==========
  svr.Get("/api/paket", [&](const httplib::Request &, httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    auto pakets = paket.paketList.toVector();
    json j = json::array();
    for (auto &p : pakets)
      j.push_back(paketToJson(p, paket));
    res.set_content(j.dump(), "application/json");
  });

  svr.Post(
      "/api/paket", [&](const httplib::Request &req, httplib::Response &res) {
        lock_guard<mutex> lock(dataMutex);
        try {
          auto body = json::parse(req.body);
          Paket pk;
          pk.id = paket.nextPaketId++;
          pk.resi = body.value("resi", "");
          if (pk.resi.empty())
            pk.resi = generateResi(paket);
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
        } catch (...) {
          res.status = 400;
          json errorObj = {{"error", "Bad request"}};
          res.set_content(errorObj.dump(), "application/json");
        }
      });

  svr.Put(R"(/api/paket/(\d+))", [&](const httplib::Request &req,
                                     httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    try {
      int id = stoi(req.matches[1]);
      auto body = json::parse(req.body);
      Paket *existing = paket.paketList.findById(id);
      if (!existing) {
        res.status = 404;
        json errorObj = {{"error", "Paket tidak ditemukan"}};
        res.set_content(errorObj.dump(), "application/json");
        return;
      }
      Paket updated = *existing;
      if (body.contains("nama_penerima"))
        updated.nama_penerima = body["nama_penerima"];
      if (body.contains("alamat_tujuan"))
        updated.alamat_tujuan = body["alamat_tujuan"];
      if (body.contains("kota_asal"))
        updated.kota_asal = body["kota_asal"];
      if (body.contains("kota_tujuan"))
        updated.kota_tujuan = body["kota_tujuan"];
      if (body.contains("berat"))
        updated.berat = body["berat"];
      if (body.contains("biaya"))
        updated.biaya = body["biaya"];
      if (body.contains("status"))
        updated.status = body["status"];
      paket.paketList.update(id, updated);
      res.set_content(paketToJson(updated, paket).dump(), "application/json");
    } catch (...) {
      res.status = 400;
      json errorObj = {{"error", "Bad request"}};
      res.set_content(errorObj.dump(), "application/json");
    }
  });

  svr.Delete(R"(/api/paket/(\d+))", [&](const httplib::Request &req,
                                        httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    int id = stoi(req.matches[1]);
    if (paket.paketList.removeById(id)) {
      json successObj = {{"success", true}};
      res.set_content(successObj.dump(), "application/json");
    } else {
      res.status = 404;
      json errorObj = {{"error", "Paket tidak ditemukan"}};
      res.set_content(errorObj.dump(), "application/json");
    }
  });

  // ========== QUEUE ==========
  svr.Get("/api/paket/queue",
          [&](const httplib::Request &, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            auto q = paket.paketQueue.toVector();
            json j = json::array();
            for (auto &p : q)
              j.push_back(paketToJson(p, paket));
            res.set_content(j.dump(), "application/json");
          });

  svr.Post("/api/paket/dequeue",
           [&](const httplib::Request &, httplib::Response &res) {
             lock_guard<mutex> lock(dataMutex);
             Paket pk;
             if (paket.paketQueue.dequeue(pk)) {
               // Assign to next kurir via circular list
               string kurirName = "";
               if (!paket.kurirList.isEmpty()) {
                 paket.kurirList.rotate();
                 Kurir *k = paket.kurirList.current();
                 if (k) {
                   Paket *pp = paket.paketList.findById(pk.id);
                   if (pp) {
                     pp->id_kurir = k->id;
                     pp->status = "dalam_perjalanan";
                   }
                   kurirName = k->nama;
                   // Add tracking
                   int newId = tracking.trackingHistory.size() + 1;
                   Tracking tk(newId, pk.id, pk.kota_asal, "dalam_perjalanan",
                               getTimestamp());
                   tracking.trackingHistory.push_back(tk);
                   tracking.undoStacks[pk.id].push(tk);
                 }
               }
               json j = paketToJson(pk, paket);
               j["kurir"] = kurirName;
               res.set_content(j.dump(), "application/json");
             } else {
               res.status = 404;
               json errorObj = {{"error", "Antrean kosong"}};
               res.set_content(errorObj.dump(), "application/json");
             }
           });

  // ========== KURIR ==========
  svr.Get("/api/kurir", [&](const httplib::Request &, httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    auto kurirs = paket.kurirList.toVector();
    string currentName = "";
    if (paket.kurirList.current())
      currentName = paket.kurirList.current()->nama;
    json jk = json::array();
    for (auto &k : kurirs)
      jk.push_back({{"id", k.id},
                    {"nama", k.nama},
                    {"status", k.status},
                    {"total_paket", k.total_paket}});
    json responseObj = {{"kurirs", jk}, {"current", currentName}};
    res.set_content(responseObj.dump(), "application/json");
  });

  svr.Post("/api/kurir/rotate", [&](const httplib::Request &,
                                    httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    paket.kurirList.rotate();
    string name =
        paket.kurirList.current() ? paket.kurirList.current()->nama : "";
    json responseObj = {{"current", name}};
    res.set_content(responseObj.dump(), "application/json");
  });

  // ========== TRACKING ==========
  svr.Get("/api/tracking",
          [&](const httplib::Request &, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            json j = json::array();
            for (auto &t : tracking.trackingHistory)
              j.push_back(trackingToJson(t));
            json responseObj = {{"tracking", j}};
            res.set_content(responseObj.dump(), "application/json");
          });

  svr.Get(R"(/api/tracking/(\d+))",
          [&](const httplib::Request &req, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            int paketId = stoi(req.matches[1]);
            json j = json::array();
            for (auto &t : tracking.trackingHistory)
              if (t.id_paket == paketId)
                j.push_back(trackingToJson(t));
            json responseObj = {{"tracking", j}};
            res.set_content(responseObj.dump(), "application/json");
          });

  svr.Get(R"(/api/tracking/stack/(\d+))",
          [&](const httplib::Request &req, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            int paketId = stoi(req.matches[1]);
            json j = json::array();
            auto it = tracking.undoStacks.find(paketId);
            if (it != tracking.undoStacks.end()) {
              auto vec = it->second.toVector();
              for (auto &t : vec)
                j.push_back(trackingToJson(t));
            }
            json responseObj = {{"stack", j}};
            res.set_content(responseObj.dump(), "application/json");
          });

  svr.Post("/api/tracking/update", [&](const httplib::Request &req,
                                       httplib::Response &res) {
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
      Paket *pp = paket.paketList.findById(paketId);
      if (pp)
        pp->status = status;
      json responseObj = {{"success", true}, {"tracking", trackingToJson(tk)}};
      res.set_content(responseObj.dump(), "application/json");
    } catch (...) {
      res.status = 400;
      json errorObj = {{"error", "Bad request"}};
      res.set_content(errorObj.dump(), "application/json");
    }
  });

  svr.Post(R"(/api/tracking/undo/(\d+))",
           [&](const httplib::Request &req, httplib::Response &res) {
             lock_guard<mutex> lock(dataMutex);
             int paketId = stoi(req.matches[1]);
             auto it = tracking.undoStacks.find(paketId);
             if (it == tracking.undoStacks.end() || it->second.isEmpty()) {
               res.status = 404;
               json errorObj = {{"error", "Tidak ada tracking untuk di-undo"}};
               res.set_content(errorObj.dump(), "application/json");
               return;
             }
             Tracking undone;
             if (it->second.pop(undone)) {
               for (auto iter = tracking.trackingHistory.begin();
                    iter != tracking.trackingHistory.end(); ++iter) {
                 if (iter->id == undone.id && iter->id_paket == paketId) {
                   tracking.trackingHistory.erase(iter);
                   break;
                 }
               }
               // Restore previous status
               string prevStatus = "";
               if (!it->second.isEmpty()) {
                 auto vec = it->second.toVector();
                 if (!vec.empty())
                   prevStatus = vec[0].status;
               }
               Paket *pp = paket.paketList.findById(paketId);
               if (pp && !prevStatus.empty())
                 pp->status = prevStatus;
               json responseObj = {{"success", true},
                                   {"undone_status", undone.status},
                                   {"restored_status", prevStatus}};
               res.set_content(responseObj.dump(), "application/json");
             } else {
               res.status = 400;
               json errorObj = {{"error", "Gagal melakukan undo"}};
               res.set_content(errorObj.dump(), "application/json");
             }
           });

  // ========== REPORT ==========
  svr.Get("/api/report/operational",
          [&](const httplib::Request &, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            auto pakets = paket.paketList.toVector();
            int total = pakets.size();
            double totalBiaya = 0, totalBerat = 0, maxBiaya = 0;
            string paketTermahal;
            map<string, int> statusCounts;
            for (auto &p : pakets) {
              totalBiaya += p.biaya;
              totalBerat += p.berat;
              statusCounts[p.status]++;
              if (p.biaya > maxBiaya) {
                maxBiaya = p.biaya;
                paketTermahal = p.resi;
              }
            }
            json breakdown = json::array();
            for (auto &sc : statusCounts)
              breakdown.push_back({{"status", sc.first}, {"count", sc.second}});
            json jPakets = json::array();
            for (auto &p : pakets)
              jPakets.push_back(paketToJson(p, paket));

            json j = {{"total_paket", total},
                      {"total_biaya", totalBiaya},
                      {"total_berat", totalBerat},
                      {"rata_biaya", total > 0 ? totalBiaya / total : 0},
                      {"rata_berat", total > 0 ? totalBerat / total : 0},
                      {"paket_termahal", paketTermahal},
                      {"biaya_tertinggi", maxBiaya},
                      {"total_kurir", paket.kurirList.size()},
                      {"total_tracking", (int)tracking.trackingHistory.size()},
                      {"status_breakdown", breakdown},
                      {"pakets", jPakets}};
            res.set_content(j.dump(), "application/json");
          });

  // ========== FILTER ==========
  svr.Get("/api/paket/filter",
          [&](const httplib::Request &req, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            auto pakets = paket.paketList.toVector();
            string status = req.get_param_value("status");
            string kota_asal = req.get_param_value("kota_asal");
            string kota_tujuan = req.get_param_value("kota_tujuan");
            string search = req.get_param_value("search");

            vector<Paket> filtered;
            for (auto &p : pakets) {
              if (!status.empty() && p.status != status)
                continue;
              if (!kota_asal.empty() && p.kota_asal != kota_asal)
                continue;
              if (!kota_tujuan.empty() && p.kota_tujuan != kota_tujuan)
                continue;
              if (!search.empty()) {
                string low = search;
                transform(low.begin(), low.end(), low.begin(), ::tolower);
                string resi_low = p.resi;
                transform(resi_low.begin(), resi_low.end(), resi_low.begin(),
                          ::tolower);
                string nama_low = p.nama_penerima;
                transform(nama_low.begin(), nama_low.end(), nama_low.begin(),
                          ::tolower);
                if (resi_low.find(low) == string::npos &&
                    nama_low.find(low) == string::npos)
                  continue;
              }
              filtered.push_back(p);
            }
            json j = json::array();
            for (auto &p : filtered)
              j.push_back(paketToJson(p, paket));
            res.set_content(j.dump(), "application/json");
          });

  // ========== SORT ==========
  svr.Get("/api/paket/sort", [&](const httplib::Request &req,
                                 httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    auto pakets = paket.paketList.toVector();
    string by = req.get_param_value("by");
    string order = req.get_param_value("order");
    bool asc = (order != "desc");

    if (by == "berat") {
      sort(pakets.begin(), pakets.end(), [asc](const Paket &a, const Paket &b) {
        return asc ? a.berat < b.berat : a.berat > b.berat;
      });
    } else {
      sort(pakets.begin(), pakets.end(), [asc](const Paket &a, const Paket &b) {
        return asc ? a.biaya < b.biaya : a.biaya > b.biaya;
      });
    }
    json j = json::array();
    for (auto &p : pakets)
      j.push_back(paketToJson(p, paket));
    res.set_content(j.dump(), "application/json");
  });

  // ========== GRAPH ==========
  svr.Get("/api/graph/cities",
          [&](const httplib::Request &, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            json j = routing.graph.getCities();
            res.set_content(j.dump(), "application/json");
          });

  svr.Get("/api/graph/edges", [&](const httplib::Request &,
                                  httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    json j = json::array();
    for (auto &k : routing.edgesList)
      j.push_back({{"asal", k.asal}, {"tujuan", k.tujuan}, {"jarak", k.jarak}});
    res.set_content(j.dump(), "application/json");
  });

  svr.Get("/api/graph/bfs",
          [&](const httplib::Request &req, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            string from = req.get_param_value("from");
            string to = req.get_param_value("to");
            if (!routing.graph.hasCity(from) || !routing.graph.hasCity(to)) {
              res.status = 400;
              json errorObj = {{"error", "Kota tidak ditemukan"}};
              res.set_content(errorObj.dump(), "application/json");
              return;
            }
            auto path = routing.graph.BFS(from, to);
            int dist = routing.graph.getBFSDistance(from, to);
            json responseObj = {{"path", path}, {"distance", dist}};
            res.set_content(responseObj.dump(), "application/json");
          });

  svr.Get("/api/graph/dfs", [&](const httplib::Request &req,
                                httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    string start = req.get_param_value("start");
    if (!routing.graph.hasCity(start)) {
      res.status = 400;
      json errorObj = {{"error", "Kota tidak ditemukan"}};
      res.set_content(errorObj.dump(), "application/json");
      return;
    }
    auto order = routing.graph.DFSOrder(start);
    json responseObj = {{"order", order}};
    res.set_content(responseObj.dump(), "application/json");
  });

  svr.Get("/api/graph/allpaths",
          [&](const httplib::Request &req, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            string from = req.get_param_value("from");
            string to = req.get_param_value("to");
            if (!routing.graph.hasCity(from) || !routing.graph.hasCity(to)) {
              res.status = 400;
              json errorObj = {{"error", "Kota tidak ditemukan"}};
              res.set_content(errorObj.dump(), "application/json");
              return;
            }
            auto paths = routing.graph.findAllPathsList(from, to);
            json jp = json::array();
            for (auto &p : paths)
              jp.push_back({{"path", p.path}, {"distance", p.distance}});
            json responseObj = {{"paths", jp}};
            res.set_content(responseObj.dump(), "application/json");
          });

  // ========== LAYANAN & KLASIFIKASI ==========
  svr.Get("/api/layanan", [&](const httplib::Request &,
                              httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    json j = json::array();
    for (auto &l : paket.layananList)
      j.push_back(
          {{"id", l.id}, {"nama", l.nama}, {"tarif_per_kg", l.tarif_per_kg}});
    res.set_content(j.dump(), "application/json");
  });

  svr.Get("/api/klasifikasi",
          [&](const httplib::Request &, httplib::Response &res) {
            lock_guard<mutex> lock(dataMutex);
            json j = json::array();
            for (auto &k : paket.klasifikasiList)
              j.push_back({{"id", k.id},
                           {"nama", k.nama},
                           {"biaya_tambahan", k.biaya_tambahan}});
            res.set_content(j.dump(), "application/json");
          });

  // ========== SAVE ==========
  svr.Post("/api/save", [&](const httplib::Request &, httplib::Response &res) {
    lock_guard<mutex> lock(dataMutex);
    try {
      paketSavePaket(paket, "paket.csv");
      trackingSave(tracking, "tracking.csv");
      json successObj = {{"success", true}};
      res.set_content(successObj.dump(), "application/json");
    } catch (const exception &e) {
      res.status = 500;
      json errorObj = {{"error", e.what()}};
      res.set_content(errorObj.dump(), "application/json");
    }
  });

  // ---- Start server ----
  int port = 9090;
  cout << "  ============================================\n";
  cout << "  Server berjalan di http://localhost:" << port << "\n";
  cout << "  Buka browser ke alamat di atas.\n";
  cout << "  Tekan Ctrl+C untuk berhenti.\n";
  cout << "  ============================================\n\n";

// Auto-open browser
#ifdef _WIN32
  system("start http://localhost:9090");
#endif

  svr.listen("0.0.0.0", port);
  return 0;
}
