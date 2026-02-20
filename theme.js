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
        
        // Adicionar botão de tema se não existir
        this.ensureThemeButton();
    },
    
    ensureThemeButton() {
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (!themeBtn) {
            const headerRight = document.querySelector('header > div:last-child');
            if (headerRight) {
                const btn = document.createElement('button');
                btn.id = 'theme-toggle-btn';
                btn.className = 'theme-toggle';
                btn.innerHTML = '<i class="fas fa-moon"></i>';
                btn.onclick = () => this.toggleTheme();
                headerRight.insertBefore(btn, headerRight.firstChild);
            }
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
        <i class="fas ${icons[type] || icons.info}" style="font-size: 1.5rem; color: var(--${type});"></i>
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
                    // Trigger animation
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

// Adicionar animação de slideOutRight
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Exportar para uso global
window.themeSystem = themeSystem;
window.showToast = showToast;
window.updateCondoBadges = updateCondoBadges;
