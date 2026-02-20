// Sistema de Tema (Modo Escuro/Claro)
const themeSystem = {
    init() {
        // Verificar preferência salva
        const savedTheme = localStorage.getItem('porter_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.updateThemeIcon(true);
        } else {
            this.updateThemeIcon(false);
        }
    },
    
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('porter_theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon(isDark);
        
        // Animação suave
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    },
    
    updateThemeIcon(isDark) {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }
};

// Sistema de Toast Notifications
function showToast(message, type = 'success', duration = 3000) {
    // Remover toasts anteriores
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}" style="font-size: 1.5rem; color: var(--${type === 'error' ? 'danger' : type});"></i>
        <div>
            <strong style="display: block; margin-bottom: 4px;">${type.toUpperCase()}</strong>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Função para atualizar badges dos condomínios
function updateCondoBadges() {
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidas = notificacoes.filter(n => !n.lida);
    
    // Agrupar por condomínio
    const notificacoesPorCondo = {};
    naoLidas.forEach(notif => {
        if (notif.condo) {
            notificacoesPorCondo[notif.condo] = (notificacoesPorCondo[notif.condo] || 0) + 1;
        }
    });
    
    // Atualizar badges
    if (typeof DATA !== 'undefined' && DATA.condominios) {
        DATA.condominios.forEach(condo => {
            const badge = document.getElementById(`badge-${condo.n.replace(/\s+/g, '-')}`);
            const count = notificacoesPorCondo[condo.n] || 0;
            
            if (badge) {
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.classList.add('has-notification');
                    badge.style.animation = 'none';
                    badge.offsetHeight;
                    badge.style.animation = 'badgePop 0.3s ease-out';
                } else {
                    badge.textContent = '0';
                    badge.classList.remove('has-notification');
                }
            }
        });
    }
}

// Tornar funções globais
window.themeSystem = themeSystem;
window.showToast = showToast;
window.updateCondoBadges = updateCondoBadges;
