criarNotificacao(condo, tipo, desc) {
    const notificacao = {
        id: Date.now(),
        condo,
        tipo,
        desc: desc.length > 100 ? desc.substring(0, 100) + '...' : desc,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        timestamp: new Date().toISOString(),
        lida: false,
        // Adicionar prioridade para OS sempre aparecerem
        prioridade: tipo === 'Ordem de Serviço' ? 'alta' : 'normal'
    };
    
    let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    notificacoes.unshift(notificacao);
    
    if (notificacoes.length > 50) notificacoes.pop();
    localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
    
    // SEMPRE mostrar toast para OS, independente do condomínio
    if (tipo === 'Ordem de Serviço') {
        this.showToast(
            desc,
            'info',
            `🔧 NOVA OS - ${condo}`
        );
        
        // Também criar notificação no chat
        this.criarNotificacaoChat(`Nova OS criada em ${condo}: ${desc.substring(0, 80)}...`);
    } else {
        // Para outros tipos, mostrar toast normal
        this.showCondoNotification(condo, desc, 'info');
    }
    
    this.loadNotifications();
    this.updateNotificationBadges();
    
    // Adicionar badge na sidebar sem ordem alfabética
    this.atualizarBadgeSidebar(condo);
},

// Nova função para atualizar badge na sidebar sem ordem alfabética
atualizarBadgeSidebar(condo) {
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidasPorCondo = {};
    
    // Contar notificações não lidas por condomínio
    notificacoes.forEach(notif => {
        if (!notif.lida) {
            naoLidasPorCondo[notif.condo] = (naoLidasPorCondo[notif.condo] || 0) + 1;
        }
    });
    
    // Atualizar badges na sidebar (mantém a ordem original do DOM)
    document.querySelectorAll('.condo-item').forEach(item => {
        const condoName = item.dataset.condo;
        const badge = item.querySelector('.condo-badge');
        const count = naoLidasPorCondo[condoName] || 0;
        
        if (count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.classList.add('has-notification');
            // Adicionar animação de pulsar
            badge.style.animation = 'pulse 1s ease-in-out';
            setTimeout(() => {
                badge.style.animation = '';
            }, 1000);
        } else {
            badge.textContent = '0';
            badge.classList.remove('has-notification');
        }
    });
},

// Modificar a função updateNotificationBadges para garantir que OS sempre apareça
updateNotificationBadges() {
    const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    const naoLidas = notificacoes.filter(n => !n.lida).length;
    
    const badge = document.getElementById('notification-count');
    if (naoLidas > 0) {
        badge.textContent = naoLidas > 99 ? '99+' : naoLidas;
        badge.style.display = 'block';
        badge.style.backgroundColor = '#e74c3c'; // Vermelho
        badge.style.animation = 'pulse 2s infinite';
    } else {
        badge.style.display = 'none';
        badge.style.animation = '';
    }
    
    // Atualizar badges na sidebar
    this.atualizarBadgeSidebar();
    
    this.updateTabCounts();
},
