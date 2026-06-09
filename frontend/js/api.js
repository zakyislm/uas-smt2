// ============================================================
// API Client — Fetch wrapper for C++ backend communication
// ============================================================
const API = {
    BASE: '',

    async request(method, url, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) opts.body = JSON.stringify(body);
        try {
            const res = await fetch(this.BASE + url, opts);
            const data = await res.json();
            if (!res.ok) throw { status: res.status, ...data };
            return data;
        } catch (err) {
            if (err.status) throw err;
            throw { status: 0, error: 'Server tidak terhubung' };
        }
    },

    // Auth
    login(username, password) { return this.request('POST', '/api/auth/login', { username, password }); },

    // Dashboard
    getStats() { return this.request('GET', '/api/dashboard/stats'); },

    // Paket CRUD
    getPaket() { return this.request('GET', '/api/paket'); },
    addPaket(paket) { return this.request('POST', '/api/paket', paket); },
    editPaket(id, paket) { return this.request('PUT', `/api/paket/${id}`, paket); },
    deletePaket(id) { return this.request('DELETE', `/api/paket/${id}`); },

    // Queue
    getQueue() { return this.request('GET', '/api/paket/queue'); },
    dequeuePaket() { return this.request('POST', '/api/paket/dequeue'); },

    // Kurir
    getKurir() { return this.request('GET', '/api/kurir'); },
    rotateKurir() { return this.request('POST', '/api/kurir/rotate'); },

    // Tracking
    getTracking(paketId) { return this.request('GET', `/api/tracking/${paketId}`); },
    getAllTracking() { return this.request('GET', '/api/tracking'); },
    updateTracking(data) { return this.request('POST', '/api/tracking/update', data); },
    undoTracking(paketId) { return this.request('POST', `/api/tracking/undo/${paketId}`); },
    getUndoStack(paketId) { return this.request('GET', `/api/tracking/stack/${paketId}`); },

    // Reports
    getReport() { return this.request('GET', '/api/report/operational'); },

    // Filter & Sort
    filterPaket(params) {
        const qs = new URLSearchParams(params).toString();
        return this.request('GET', `/api/paket/filter?${qs}`);
    },
    sortPaket(by, order) {
        return this.request('GET', `/api/paket/sort?by=${by}&order=${order}`);
    },

    // Graph
    getCities() { return this.request('GET', '/api/graph/cities'); },
    getEdges() { return this.request('GET', '/api/graph/edges'); },
    bfs(from, to) { return this.request('GET', `/api/graph/bfs?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`); },
    dfs(start) { return this.request('GET', `/api/graph/dfs?start=${encodeURIComponent(start)}`); },
    allPaths(from, to) { return this.request('GET', `/api/graph/allpaths?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`); },

    // Layanan & Klasifikasi
    getLayanan() { return this.request('GET', '/api/layanan'); },
    getKlasifikasi() { return this.request('GET', '/api/klasifikasi'); },

    // Save
    saveAll() { return this.request('POST', '/api/save'); },
};
