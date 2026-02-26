// ==============================================
// FUNÇÕES DE NOTIFICAÇÃO - COLE ISSO NO SEU app.js
// ==============================================

showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const titles = {
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Aviso',
        info: 'Informação'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type]}</div>
        <div class="toast-content">
            <div class="toast-title">${title || titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
},

showCondoNotification(condo, message, type = 'info') {
    this.showToast(message, type, condo);
},

criarNotificacao(condo, tipo, desc) {
    console.log('🔔 CRIANDO NOTIFICAÇÃO PARA:', condo, tipo);
    
    const notificacao = {
        id: Date.now(),
        condo: condo,
        tipo: tipo,
        desc: desc.length > 100 ? desc.substring(0, 100) + '...' : desc,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        timestamp: new Date().toISOString(),
        lida: false
    };
    
    let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    notificacoes.unshift(notificacao);
    
    if (notificacoes.length > 50) notificacoes.pop();
    localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
    
    // ATUALIZAR BADGE DO SINO
    this.atualizarBadgeSino();
    
    // ATUALIZAR BADGE DO CONDOMÍNIO ESPECÍFICO
    this.atualizarBadgeCondominio(condo);
    
    // MOSTRAR TOAST
    if (tipo === 'Ordem de Serviço') {
        this.showToast(desc, 'info', `🔧 NOVA OS - ${condo}`);
    } else {
        this.showToast(desc, 'info', condo);
    }
    
    this.loadNotifications();
    console.log('✅ NOTIFICAÇÃO CRIADA COM SUCESSO');
},

atualizarBadgeCondominio(condoNome) {
    console.log('🔄 Atualizando badge do condomínio:', condoNome);
    
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidas = notificacoes.filter(n => !n.lida);
    const countEsteCondo = naoLidas.filter(n => n.condo === condoNome).length;
    
    console.log(`📊 ${condoNome} tem ${countEsteCondo} notificações não lidas`);
    
    const condoItem = document.querySelector(`.condo-item[data-condo="${condoNome}"]`);
    
    if (condoItem) {
        const badge = condoItem.querySelector('.condo-badge');
        if (badge) {
            if (countEsteCondo > 0) {
                badge.textContent = countEsteCondo > 9 ? '9+' : countEsteCondo;
                badge.classList.add('has-notification');
                badge.style.display = 'block';
                badge.style.backgroundColor = '#e74c3c';
                badge.style.animation = 'pulse 0.5s ease-in-out';
                
                setTimeout(() => {
                    badge.style.animation = '';
                }, 1000);
                
                console.log(`✅ Badge de ${condoNome} atualizado para ${countEsteCondo}`);
            } else {
                badge.textContent = '0';
                badge.classList.remove('has-notification');
                badge.style.display = 'none';
            }
        }
    } else {
        console.warn(`⚠️ Condomínio não encontrado: ${condoNome}`);
    }
},

atualizarBadgeSino() {
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    
    const badge = document.getElementById('notification-count');
    if (badge) {
        if (naoLidas > 0) {
            badge.textContent = naoLidas > 99 ? '99+' : naoLidas;
            badge.style.display = 'block';
            badge.style.backgroundColor = '#e74c3c';
            badge.style.animation = 'pulse 2s infinite';
            console.log(`🔴 Sino atualizado: ${naoLidas} notificações`);
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
            badge.style.animation = '';
        }
    }
},

updateNotificationBadges() {
    console.log('🔄 Atualizando TODAS as badges');
    
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidas = notificacoes.filter(n => !n.lida);
    
    // Atualizar sino
    this.atualizarBadgeSino();
    
    // Contar por condomínio
    const contagem = {};
    naoLidas.forEach(n => {
        contagem[n.condo] = (contagem[n.condo] || 0) + 1;
    });
    
    console.log('📊 Contagem por condomínio:', contagem);
    
    // Atualizar cada badge na sidebar
    document.querySelectorAll('.condo-item').forEach(item => {
        const condoName = item.dataset.condo;
        const badge = item.querySelector('.condo-badge');
        const count = contagem[condoName] || 0;
        
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.classList.add('has-notification');
                badge.style.display = 'block';
            } else {
                badge.textContent = '0';
                badge.classList.remove('has-notification');
                badge.style.display = 'none';
            }
        }
    });
},

loadNotifications() {
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    this.notifications = notificacoes;
    
    const list = document.getElementById('notifications-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (notificacoes.length === 0) {
        list.innerHTML = `
            <div class="notification-item">
                <div style="text-align: center; color: var(--gray); padding: 2rem;">
                    <i class="fas fa-bell-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma notificação</p>
                </div>
            </div>
        `;
        return;
    }
    
    notificacoes.slice(0, 20).forEach(notif => {
        const item = document.createElement('div');
        item.className = `notification-item ${notif.lida ? '' : 'unread'} ${notif.destaque ? 'destaque' : ''}`;
        item.dataset.tipo = notif.tipo;
        item.onclick = (e) => {
            e.stopPropagation();
            this.processarNotificacao(notif);
        };
        
        let icon = '📝';
        if (notif.tipo === 'chat_mensagem') icon = '💬';
        if (notif.tipo.includes('Ocorrência')) icon = '⚠️';
        if (notif.tipo.includes('Incidente')) icon = '🚨';
        if (notif.tipo.includes('Fixas')) icon = '📌';
        if (notif.tipo === 'chat') icon = '💬';
        if (notif.tipo === 'Ordem de Serviço') icon = '🔧';
        
        item.innerHTML = `
            <div class="notification-condo">${icon} ${notif.condo}</div>
            <div style="margin: 5px 0;">${notif.desc}</div>
            <div class="notification-time">${notif.data} ${notif.hora}</div>
        `;
        
        list.appendChild(item);
    });
    
    this.updateNotificationBadges();
},

processarNotificacao(notificacao) {
    this.marcarNotificacaoComoLida(notificacao.id);
    
    if (notificacao.acao && notificacao.acao.tipo === 'ir_para_chat') {
        const chatTab = document.querySelector('.chat-tab');
        if (chatTab) {
            this.switchTab('tab-chat', chatTab);
            setTimeout(() => {
                if (typeof utils !== 'undefined' && utils.destacarMensagemChat) {
                    utils.destacarMensagemChat(notificacao.acao.mensagemId);
                }
            }, 500);
        }
    }
    
    document.getElementById('notifications-panel').classList.remove('show');
},

toggleNotifications() {
    const panel = document.getElementById('notifications-panel');
    if (!panel) return;
    
    const estaAberto = panel.classList.contains('show');
    
    if (!estaAberto) {
        this.marcarTodasNotificacoesComoLidas();
    }
    
    panel.classList.toggle('show');
},

marcarTodasNotificacoesComoLidas() {
    let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    notificacoes = notificacoes.map(notif => ({ ...notif, lida: true }));
    localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
    
    this.loadNotifications();
    this.updateNotificationBadges();
    this.showToast('Todas as notificações foram marcadas como lidas', 'success');
},

marcarNotificacaoComoLida(id) {
    let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const index = notificacoes.findIndex(n => n.id === id);
    
    if (index !== -1) {
        notificacoes[index].lida = true;
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        this.loadNotifications();
        this.updateNotificationBadges();
    }
},

clearNotifications() {
    if (confirm('Limpar todas as notificações?')) {
        localStorage.removeItem('porter_notificacoes');
        this.loadNotifications();
        this.updateNotificationBadges();
        this.showToast('Notificações limpas!', 'success');
    }
},

filtrarPorCondominio(condoName) {
    console.log('🔍 Filtrando por condomínio:', condoName);
    
    document.getElementById('filter-condo').value = condoName;
    this.currentCondoFilter = condoName;
    this.aplicarFiltrosAtas();
    
    document.querySelectorAll('.condo-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const condoItem = document.querySelector(`.condo-item[data-condo="${condoName}"]`);
    if (condoItem) {
        condoItem.classList.add('active');
        this.marcarNotificacoesPorCondominioComoLidas(condoName);
    }
    
    if (window.innerWidth <= 1200) {
        this.toggleSidebar();
    }
},

marcarNotificacoesPorCondominioComoLidas(condoName) {
    console.log('📌 Marcando notificações como lidas para:', condoName);
    
    let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    let modificado = false;
    
    notificacoes = notificacoes.map(notif => {
        if (notif.condo === condoName && !notif.lida) {
            modificado = true;
            return { ...notif, lida: true };
        }
        return notif;
    });
    
    if (modificado) {
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        this.loadNotifications();
        this.updateNotificationBadges();
        this.atualizarBadgeCondominio(condoName);
        console.log(`✅ Notificações de ${condoName} marcadas como lidas`);
    }
},
