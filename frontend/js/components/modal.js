// ============================================================
// Modal Component
// ============================================================
const Modal = {
    show(title, bodyHtml, footerHtml = '') {
        const backdrop = document.getElementById('modal-backdrop');
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close" onclick="Modal.hide()"><span class="material-icons-outlined">close</span></button>
            </div>
            <div class="modal-body">${bodyHtml}</div>
            ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
        `;
        backdrop.classList.add('visible');
    },

    hide() {
        document.getElementById('modal-backdrop').classList.remove('visible');
    },

    confirm(title, message, onConfirm) {
        this.show(title, `<p class="text-body" style="color:var(--text-secondary)">${message}</p>`,
            `<button class="btn btn-secondary" onclick="Modal.hide()">Batal</button>
             <button class="btn btn-danger" onclick="Modal.hide(); (${onConfirm})()">Hapus</button>`
        );
    }
};

// Close modal on backdrop click
document.getElementById('modal-backdrop').addEventListener('click', function(e) {
    if (e.target === this) Modal.hide();
});
