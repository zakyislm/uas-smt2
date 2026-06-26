// ============================================================
// App — Main Router & State Management
// ============================================================
const App = {
    currentUser: null,
    currentScreen: 'login',

    setUser(user) {
        this.currentUser = user;
        localStorage.setItem('swift_user', JSON.stringify(user));
    },

    getUser() {
        if (this.currentUser) return this.currentUser;
        try {
            const stored = localStorage.getItem('swift_user');
            if (stored) { this.currentUser = JSON.parse(stored); return this.currentUser; }
        } catch(e) {}
        return null;
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('swift_user');
        this.navigate('login');
    },

    async navigate(screen) {
        this.currentScreen = screen;
        const app = document.getElementById('app');

        if (screen === 'login') {
            app.innerHTML = renderLoginScreen();
            return;
        }

        const user = this.getUser();
        if (!user) { this.navigate('login'); return; }

        // Route Guard based on MENU_ACCESS
        const access = MENU_ACCESS[user.role] || [];
        if (!access.includes(screen)) {
            const defaultScreen = access[0] || 'login';
            this.navigate(defaultScreen);
            return;
        }

        // Build layout
        const contentHtml = this.getScreenHtml(screen);
        app.innerHTML = `
            ${renderSidebar(user, screen)}
            <div class="main-area">
                <div id="screen-content">${contentHtml}</div>
            </div>`;

        // Call init function if available
        await this.initScreen(screen);
    },

    getScreenHtml(screen) {
        const renderers = {
            dashboard: renderDashboardScreen,
            pengiriman: renderPengirimanScreen,
            tambahPaket: renderTambahPaketScreen,
            antrean: renderAntreanScreen,
            kurir: renderKurirScreen,
            ambilPaket: renderAmbilPaketScreen,
            updateStatus: renderUpdateStatusScreen,
            undoAction: renderUndoActionScreen,
            riwayat: renderRiwayatScreen,
            filterData: renderFilterDataScreen,
            sortingPaket: renderSortingPaketScreen,
            bfsGraph: renderBfsGraphScreen,
            dfsGraph: renderDfsGraphScreen,
        };
        const fn = renderers[screen];
        return fn ? fn() : '<div class="content"><div class="empty-state"><div class="empty-state-icon"><span class="material-icons-outlined">construction</span></div><div class="empty-state-title">Screen tidak ditemukan</div></div></div>';
    },

    async initScreen(screen) {
        const inits = {
            dashboard: initDashboard,
            pengiriman: initPengiriman,
            tambahPaket: initTambahPaket,
            antrean: initAntrean,
            kurir: initKurir,
            ambilPaket: initAmbilPaket,
            filterData: initFilterData,
            sortingPaket: initSortingPaket,
            bfsGraph: initBfsGraph,
            dfsGraph: initDfsGraph,
        };
        const fn = inits[screen];
        if (fn) {
            try { await fn(); } catch(e) { console.error('Init error:', e); }
        }
    },

    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '<span class="material-icons-outlined">check_circle</span>' : type === 'error' ? '<span class="material-icons-outlined">cancel</span>' : '<span class="material-icons-outlined">info</span>'}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    async saveData() {
        try {
            await API.saveAll();
            this.toast('Data berhasil disimpan ke CSV!', 'success');
        } catch (err) {
            this.toast('Gagal menyimpan data', 'error');
        }
    }
};

// ============================================================
// Boot
// ============================================================
(function boot() {
    const user = App.getUser();
    if (user) {
        App.navigate('dashboard');
    } else {
        App.navigate('login');
    }
})();
