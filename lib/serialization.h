#ifndef SERIALIZATION_H
#define SERIALIZATION_H

#include "../external/lib/json_hpp/json.hpp"
#include "expedition.h"

using json = nlohmann::json;
using namespace SwiftExpedition;

inline json paketToJson(const Paket& p, PaketData& pd) {
    string layananNama = "";
    for (auto& l : pd.layananList)
        if (l.id == p.id_layanan) {
            layananNama = l.nama;
            break;
        }
    string klasNama = "";
    for (auto& k : pd.klasifikasiList)
        if (k.id == p.id_klasifikasi) {
            klasNama = k.nama;
            break;
        }
    return {{"id", p.id},
            {"resi", p.resi},
            {"nama_penerima", p.nama_penerima},
            {"alamat_tujuan", p.alamat_tujuan},
            {"kota_asal", p.kota_asal},
            {"kota_tujuan", p.kota_tujuan},
            {"berat", p.berat},
            {"biaya", p.biaya},
            {"status", p.status},
            {"id_layanan", p.id_layanan},
            {"id_klasifikasi", p.id_klasifikasi},
            {"id_kurir", p.id_kurir},
            {"layanan_nama", layananNama},
            {"klasifikasi_nama", klasNama},
            {"created_at", p.created_at}};
}

inline json trackingToJson(const Tracking& t) {
    return {{"id", t.id},
            {"id_paket", t.id_paket},
            {"lokasi", t.lokasi},
            {"status", t.status},
            {"timestamp", t.timestamp},
            {"keterangan", t.keterangan}};
}

#endif // SERIALIZATION_H
