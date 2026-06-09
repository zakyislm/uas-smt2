// ============================================================
// Status Chip Component
// ============================================================
function getStatusConfig(status) {
    const s = (status || '').toLowerCase();
    const map = {
        'menunggu':          { label: 'Menunggu',          variant: 'warning' },
        'pending':           { label: 'Pending',           variant: 'warning' },
        'diproses':          { label: 'Diproses',          variant: 'info' },
        'dalam_perjalanan':  { label: 'Dalam Perjalanan',  variant: 'process' },
        'sampai_tujuan':     { label: 'Sampai Tujuan',     variant: 'success' },
        'terkirim':          { label: 'Terkirim',          variant: 'success' },
        'gagal':             { label: 'Gagal',             variant: 'error' },
        'tersedia':          { label: 'Tersedia',          variant: 'success' },
        'sibuk':             { label: 'Sibuk',             variant: 'warning' },
        'tidak_tersedia':    { label: 'Tidak Tersedia',    variant: 'error' },
    };
    return map[s] || { label: status || '-', variant: 'neutral' };
}

function renderStatusChip(status) {
    const cfg = getStatusConfig(status);
    return `<span class="status-chip status-chip--${cfg.variant}">
        <span class="status-chip-dot"></span>${cfg.label}
    </span>`;
}
