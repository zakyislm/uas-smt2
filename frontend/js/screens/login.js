// ============================================================
// Screen 1: Login Gate
// ============================================================
function renderLoginScreen() {
    return `
    <div class="login-container">
        <div class="login-card">
            <div class="login-logo">
                <div class="login-logo-icon"><span class="material-icons-outlined">inventory_2</span></div>
                <span class="login-logo-text">SwiftExpedition</span>
            </div>
            <p class="login-subtitle">Masuk ke Tracking Dashboard untuk melanjutkan</p>

            <div class="login-error" id="login-error">
                <span><span class="material-icons-outlined">warning</span></span>
                <span id="login-error-text">Username atau password salah</span>
            </div>

            <form onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label class="form-label">USERNAME</label>
                    <input type="text" class="form-input" id="login-username" placeholder="Masukkan username" autocomplete="off" required>
                </div>
                <div class="form-group">
                    <label class="form-label">PASSWORD</label>
                    <input type="password" class="form-input" id="login-password" placeholder="Masukkan password" required>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full" id="login-btn" style="margin-top:8px">
                    Masuk
                </button>
            </form>

            <div style="margin-top:24px; padding-top:16px; border-top:1px solid var(--border-subtle)">
                <p class="text-label text-muted" style="margin-bottom:8px">DEMO ACCOUNTS</p>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;color:var(--text-muted)">
                    <span><span class="material-icons-outlined">admin_panel_settings</span> zaky / pass123</span>
                    <span><span class="material-icons-outlined">analytics</span> farrel / pass123</span>
                    <span><span class="material-icons-outlined">settings</span> fauzi / pass123</span>
                    <span><span class="material-icons-outlined">local_shipping</span> citra / pass123</span>
                </div>
            </div>
        </div>
    </div>`;
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errEl = document.getElementById('login-error');
    const errText = document.getElementById('login-error-text');
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    btn.disabled = true;
    btn.textContent = 'Memproses...';
    errEl.classList.remove('visible');

    try {
        const user = await API.login(username, password);
        App.setUser(user);
        App.navigate('dashboard');
    } catch (err) {
        errText.textContent = err.error || 'Username atau password salah';
        errEl.classList.add('visible');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Masuk';
    }
}
