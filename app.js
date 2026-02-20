// Adicione este código no início do arquivo app.js ou crie um novo arquivo theme.js

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
        
        // Adicionar botão de tema no header se não existir
        this.addThemeButton();
    },
    
    addThemeButton() {
        const headerRight = document.querySelector('header > div:last-child');
        if (headerRight && !document.getElementById('theme-toggle-btn')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'theme-toggle-btn';
            themeBtn.className = 'theme-toggle';
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeBtn.onclick = () => this.toggleTheme();
            headerRight.insertBefore(themeBtn, headerRight.firstChild);
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

// Função melhorada para atualizar badges dos condomínios
function updateCondoBadges() {
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidas = notificacoes.filter(n => !n.lida);
    
    // Agrupar notificações por condomínio
    const notificacoesPorCondo = {};
    naoLidas.forEach(notif => {
        if (notif.condo) {
            if (!notificacoesPorCondo[notif.condo]) {
                notificacoesPorCondo[notif.condo] = 0;
            }
            notificacoesPorCondo[notif.condo]++;
        }
    });
    
    // Atualizar cada badge
    DATA.condominios.forEach(condo => {
        const badge = document.getElementById(`badge-${condo.n.replace(/\s+/g, '-')}`);
        const count = notificacoesPorCondo[condo.n] || 0;
        
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.add('has-notification');
                badge.style.animation = 'none';
                badge.offsetHeight; // Trigger reflow
                badge.style.animation = 'badgePop 0.3s ease-out';
            } else {
                badge.textContent = '0';
                badge.classList.remove('has-notification');
            }
        }
    });
}

// Sobrescrever a função de criar notificação para animar os badges
const originalCriarNotificacao = app.criarNotificacao;
app.criarNotificacao = function(condo, tipo, desc) {
    // Chamar função original
    originalCriarNotificacao.call(this, condo, tipo, desc);
    
    // Atualizar badges com animação
    setTimeout(() => {
        updateCondoBadges();
    }, 100);
};

// Sistema de Toast Notifications
function showToast(message, type = 'success', duration = 3000) {
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

// Animação de slide out
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

// Melhorar a função showMessage existente
app.showMessage = function(text, type) {
    showToast(text, type);
};

// Inicializar tema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    themeSystem.init();
    
    // Atualizar badges periodicamente
    setInterval(updateCondoBadges, 5000);
    
    // Observar mudanças no localStorage para atualizar badges
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        originalSetItem.call(this, key, value);
        if (key === 'porter_notificacoes') {
            setTimeout(updateCondoBadges, 50);
        }
    };
});
