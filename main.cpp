#include "lib/cli_menus.h"

// ============================================================
// MAIN
// ============================================================
int main() {
    using namespace SwiftExpedition;

    AuthData auth;
    PaketData paket;
    TrackingData tracking;
    RoutingData routing;

    cout << "\n  ============================================\n  === LOADING DATA DARI CSV... ===\n  ============================================\n";

    authLoadUsers(auth, "anggota.csv");
    paketLoadLayanan(paket, "layanan.csv");
    paketLoadKlasifikasi(paket, "klasifikasi.csv");
    paketLoadPaket(paket, "paket.csv");
    paketLoadKurir(paket, "kurir.csv");
    trackingLoad(tracking, "tracking.csv");
    routingLoad(routing, "kota.csv");

    cout << "\n  ============================================\n  === SEMUA DATA BERHASIL DIMUAT ===\n  ============================================\n";

    User* currentUser = nullptr;

    do {
        currentUser = menuLogin(auth);
        if (currentUser) {
            bool continueProgram = true;
            switch (currentUser->role) {
                case ADMIN:   continueProgram = menuAdmin(currentUser, paket); break;
                case KURIR:   continueProgram = menuKurir(currentUser, paket, tracking); break;
                case MANAGER: continueProgram = menuManager(currentUser, paket, tracking); break;
                case CEO:     continueProgram = menuCeo(currentUser, paket, tracking, routing); break;
                default:      cout << "\n  [ERROR] Role tidak dikenali.\n"; break;
            }
            cout << "\n\n  ============================================\n  === MENYIMPAN DATA... ===\n";
            paketSavePaket(paket, "paket.csv");
            trackingSave(tracking, "tracking.csv");
            cout << "  ============================================\n";
            if (!continueProgram) break;
        }
    } while (true);

    return 0;
}