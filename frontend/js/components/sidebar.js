// ============================================================
// Sidebar Component — Role-based navigation
// ============================================================
const MENU_ITEMS = [
    { section: 'UTAMA', items: [
        { id: 'dashboard',    icon: '<span class="material-icons-outlined">analytics</span>', label: 'Overview Dashboard' },
        { id: 'pengiriman',   icon: '<span class="material-icons-outlined">inventory_2</span>', label: 'Semua Paket' },
    ]},
    { section: 'OPERASI', items: [
        { id: 'tambahPaket',  icon: '<span class="material-icons-outlined">add_box</span>', label: 'Tambah Paket' },
        { id: 'antrean',      icon: '<span class="material-icons-outlined">format_list_numbered</span>', label: 'Antrean Paket' },
        { id: 'kurir',        icon: '<span class="material-icons-outlined">local_shipping</span>', label: 'Daftar Kurir' },
        { id: 'ambilPaket',   icon: '<span class="material-icons-outlined">outbox</span>', label: 'Ambil Paket' },
        { id: 'updateStatus', icon: '<span class="material-icons-outlined">sync</span>', label: 'Update Status' },
        { id: 'undoAction',   icon: '<span class="material-icons-outlined">undo</span>', label: 'Undo Action' },
    ]},
    { section: 'ANALISIS', items: [
        { id: 'riwayat',      icon: '<span class="material-icons-outlined">history</span>', label: 'Riwayat Tracking' },
        { id: 'filterData',   icon: '<span class="material-icons-outlined">search</span>', label: 'Filter Data' },
        { id: 'sortingPaket', icon: '<span class="material-icons-outlined">sort</span>',  label: 'Sorting Paket' },
    ]},
    { section: 'RUTE & GRAF', items: [
        { id: 'bfsGraph',     icon: '<span class="material-icons-outlined">map</span>', label: 'Jalur Terpendek (BFS)' },
        { id: 'dfsGraph',     icon: '<span class="material-icons-outlined">hub</span>', label: 'Semua Rute (DFS)' },
    ]},
];

const MENU_ACCESS = {
    CEO:     ['dashboard','pengiriman','tambahPaket','antrean','kurir','ambilPaket','updateStatus',
              'undoAction','riwayat','filterData','sortingPaket','bfsGraph','dfsGraph'],
    Manager: ['dashboard','pengiriman','riwayat','filterData','sortingPaket','bfsGraph','dfsGraph'],
    Admin:   ['pengiriman','tambahPaket','antrean','kurir','filterData','sortingPaket'],
    Kurir:   ['pengiriman','ambilPaket','updateStatus','undoAction','riwayat','antrean'],
};

function renderSidebar(user, activeScreen) {
    const access = MENU_ACCESS[user.role] || [];
    let sectionsHtml = '';

    for (const section of MENU_ITEMS) {
        const visibleItems = section.items.filter(it => access.includes(it.id));
        if (visibleItems.length === 0) continue;

        let itemsHtml = '';
        for (const item of visibleItems) {
            const active = item.id === activeScreen ? ' active' : '';
            itemsHtml += `
                <div class="sidebar-item${active}" data-screen="${item.id}" onclick="App.navigate('${item.id}')">
                    <span class="sidebar-item-icon">${item.icon}</span>
                    <span>${item.label}</span>
                </div>`;
        }
        sectionsHtml += `
            <div class="sidebar-section">
                <div class="sidebar-section-title">${section.section}</div>
                ${itemsHtml}
            </div>`;
    }

    const initials = user.nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="sidebar-logo"><span class="material-icons-outlined">inventory_2</span></div>
            <span class="sidebar-brand">SwiftExpedition</span>
        </div>
        <nav class="sidebar-nav">
            ${sectionsHtml}
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user" onclick="App.logout()">
                <div class="sidebar-avatar">${initials}</div>
                <div class="sidebar-user-info">
                    <div class="sidebar-user-name">${user.nama}</div>
                    <div class="sidebar-user-role">${user.role}</div>
                </div>
                <span style="color:var(--text-muted);font-size:14px" title="Logout"><span class="material-icons-outlined">logout</span></span>
            </div>
        </div>
    </aside>`;
}
