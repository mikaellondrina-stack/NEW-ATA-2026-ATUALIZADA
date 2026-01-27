const chatSystem = {
    loadChat() {
        const container = document.getElementById('chat-messages');
        const chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        if (app.currentUser && (app.currentUser.role === 'ADMIN' || app.currentUser.role === 'TÉCNICO')) {
            document.getElementById('chat-admin-controls').style.display = 'flex';
        }
        
        if (chat.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
                </div>
            `;
            this.mostrarVistoPor(container);
            
            // 🔧 FIX 2: Scroll para baixo após carregar
            setTimeout(() => {
                this.scrollToBottom();
            }, 100);
            return;
        }
        
        // 🔧 FIX 2: REMOVER reverse() - manter ordem cronológica natural
        // As mensagens mais antigas no topo, mais novas embaixo
        const chatOrdenado = [...chat].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        container.innerHTML = '';
        
        chatOrdenado.forEach(msg => {
            const isSent = msg.sender === app.currentUser.nome;
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
            messageDiv.dataset.id = msg.id;
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        <span style="font-size: 1.1rem; margin-right: 5px;">${msg.senderMood || '😐'}</span>
                        ${msg.sender} ${msg.senderRole === 'ADMIN' ? ' 👑' : ''} ${msg.senderRole === 'TÉCNICO' ? ' 🔧' : ''}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.message}</div>
                ${app.currentUser && (app.currentUser.role === 'ADMIN' || app.currentUser.role === 'TÉCNICO') && !isSent ?
                    `<div style="margin-top: 5px; text-align: right;">
                        <button class="btn btn-danger btn-sm" onclick="chatSystem.deleteChatMessage(${msg.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>` :
                    ''
                }
            `;
            
            container.appendChild(messageDiv);
        });
        
        this.mostrarVistoPor(container);
        
        // 🔧 FIX 2: SEMPRE scroll para baixo após carregar
        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
        
        app.registrarVisualizacaoChat();
        app.atualizarBadgeChat();
    },

    mostrarVistoPor(container) {
        const vistoPorDiv = document.createElement('div');
        vistoPorDiv.className = 'chat-visto-por';
        vistoPorDiv.style.cssText = `
            margin-top: 20px;
            padding: 10px 15px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #666;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            animation: fadeIn 0.5s ease-out;
        `;
        
        const visualizacoes = app.obterVisualizacoesRecentes();
        
        if (visualizacoes.length > 0) {
            visualizacoes.sort((a, b) => b.timestamp - a.timestamp);
            const usuarios = visualizacoes.map(v => 
                `${v.nome.split(' ')[0]} ${v.mood}`
            ).join(', ');
            
            const ultimaVisualizacao = visualizacoes[0];
            const tempoUltima = app.formatarTempoAtivo(new Date(ultimaVisualizacao.timestamp));
            
            vistoPorDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 5px;">
                    <i class="fas fa-eye" style="color: #3498db;"></i>
                    <strong style="color: #1a3a5f;">Visto por:</strong>
                    <span>${usuarios}</span>
                </div>
                <div style="font-size: 0.75rem; color: #888;">
                    <i class="far fa-clock"></i> Última visualização: ${tempoUltima}
                </div>
            `;
        } else {
            vistoPorDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fas fa-eye-slash" style="color: #999;"></i>
                    <span style="color: #999;">Ninguém viu o chat recentemente</span>
                </div>
            `;
        }
        
        container.appendChild(vistoPorDiv);
        
        // 🔧 FIX 2: Scroll para baixo após adicionar "visto por"
        setTimeout(() => {
            this.scrollToBottom();
        }, 50);
    },

    destacarMensagemChat(mensagemId) {
        const mensagens = document.querySelectorAll('.chat-message');
        mensagens.forEach(msg => {
            msg.classList.remove('mensagem-destacada');
            if (msg.dataset.id === String(mensagemId)) {
                msg.classList.add('mensagem-destacada');
                msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    msg.classList.remove('mensagem-destacada');
                }, 5000);
            }
        });
    },

    deleteChatMessage(id) {
        if (app.currentUser.role !== 'ADMIN' && app.currentUser.role !== 'TÉCNICO') {
            alert('Apenas administradores ou técnicos podem excluir mensagens.');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
            let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
            chat = chat.filter(msg => msg.id !== id);
            localStorage.setItem('porter_chat', JSON.stringify(chat));
            this.loadChat();
            app.updateTabCounts();
        }
    },

    clearChat() {
        if (app.currentUser.role !== 'ADMIN' && app.currentUser.role !== 'TÉCNICO') {
            alert('Apenas administradores ou técnicos podem limpar o chat.');
            return;
        }
        
        if (confirm('Tem certeza que deseja limpar todas as mensagens do chat?')) {
            localStorage.removeItem('porter_chat');
            this.loadChat();
            app.updateTabCounts();
            app.showMessage('Chat limpo com sucesso!', 'success');
        }
    },

    sendChatMessage() {
        if (!app.currentUser) {
            alert('Você precisa estar logado para enviar mensagens.');
            return;
        }
        
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const sendBtn = document.getElementById('chat-send-btn');
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = '<div class="loading"></div>';
        sendBtn.disabled = true;
        
        const chatMessage = {
            id: Date.now(),
            sender: app.currentUser.nome,
            senderRole: app.currentUser.role,
            senderMood: app.getMoodAtual(),
            message: message,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chat.push(chatMessage);
        
        if (chat.length > 200) chat = chat.slice(-200);
        localStorage.setItem('porter_chat', JSON.stringify(chat));
        
        input.value = '';
        
        setTimeout(() => {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }, 500);
        
        this.loadChat();
        
        // 🔧 FIX 2: Scroll para baixo após enviar
        setTimeout(() => {
            this.scrollToBottom();
        }, 100);
        
        app.criarNotificacaoChatComAcao(chatMessage);
    },

    // 🔧 FIX 2: Nova função para scroll automático
    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    // 🔧 FIX 1: CHAT PRIVADO - FUNÇÃO CORRIGIDA
    loadPrivateChatUsers() {
        if (!app.currentUser) return;
        
        const select = document.getElementById('private-chat-target');
        if (!select) return;
        
        // Limpar opções existentes
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        // 🔧 FIX 1: Buscar usuários online do Firebase em vez de apenas dados locais
        const onlineData = localStorage.getItem('porter_online_firebase');
        let usuariosDisponiveis = [];
        
        if (onlineData) {
            try {
                const data = JSON.parse(onlineData);
                const dataTime = new Date(data.timestamp);
                const agora = new Date();
                const diferencaSegundos = (agora - dataTime) / 1000;
                
                if (diferencaSegundos < 10) { // Dados recentes do Firebase
                    usuariosDisponiveis = data.users || [];
                }
            } catch (e) {
                console.error('Erro ao parsear dados online:', e);
            }
        }
        
        // 🔧 FIX 1: Se não tiver dados do Firebase, usar dados locais como fallback
        if (usuariosDisponiveis.length === 0) {
            // Adicionar funcionários (exceto o usuário atual)
            DATA.funcionarios.forEach(f => {
                if (f.user !== app.currentUser.user) {
                    usuariosDisponiveis.push({
                        nome: f.nome,
                        user: f.user,
                        role: f.role,
                        online: true
                    });
                }
            });
            
            // Adicionar técnicos (exceto o usuário atual)
            DATA.tecnicos.forEach(t => {
                const tecUser = t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
                if (tecUser !== app.currentUser.user) {
                    usuariosDisponiveis.push({
                        nome: t.nome,
                        user: tecUser,
                        role: 'TÉCNICO',
                        online: true
                    });
                }
            });
        } else {
            // 🔧 FIX 1: Filtrar apenas usuários que existem no sistema (não o usuário atual)
            usuariosDisponiveis = usuariosDisponiveis.filter(user => 
                user.user !== app.currentUser.user
            );
        }
        
        // Ordenar por nome
        usuariosDisponiveis.sort((a, b) => a.nome.localeCompare(b.nome));
        
        // Adicionar opções ao select
        usuariosDisponiveis.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.user;
            
            // Formatar texto da opção
            let texto = usuario.nome;
            if (usuario.role === 'ADMIN') {
                texto += ' 👑';
            } else if (usuario.role === 'TÉCNICO') {
                texto += ' 🔧';
            }
            
            // 🔧 FIX 1: Indicar status online
            if (usuario.online) {
                texto += ' 🟢';
            } else {
                texto += ' ⚫';
            }
            
            option.textContent = texto;
            select.appendChild(option);
        });
        
        console.log('✅ Chat privado: ' + usuariosDisponiveis.length + ' usuários carregados');
    },

    loadPrivateChat() {
        if (!app.currentUser || !app.currentPrivateChatTarget) return;
        
        const container = document.getElementById('chat-private-messages');
        const privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        // Gerar ID da conversa (ordem alfabética para garantir consistência)
        const chatId = this.getPrivateChatId(app.currentUser.user, app.currentPrivateChatTarget);
        const messages = privateChats[chatId] || [];
        
        // Ativar/desativar campo de entrada
        const input = document.getElementById('chat-private-input');
        const sendBtn = document.getElementById('chat-private-send-btn');
        
        if (app.currentPrivateChatTarget) {
            input.disabled = false;
            sendBtn.disabled = false;
        } else {
            input.disabled = true;
            sendBtn.disabled = true;
        }
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                </div>
            `;
            
            // 🔧 FIX 2: Scroll para baixo
            setTimeout(() => {
                const privateContainer = document.getElementById('chat-private-messages');
                if (privateContainer) {
                    privateContainer.scrollTop = privateContainer.scrollHeight;
                }
            }, 100);
            return;
        }
        
        // 🔧 FIX 2: REMOVER reverse() - manter ordem cronológica
        const messagesOrdenado = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        container.innerHTML = '';
        
        messagesOrdenado.forEach(msg => {
            const isSent = msg.sender === app.currentUser.user;
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
            messageDiv.dataset.id = msg.id;
            
            // Obter nome do remetente
            const senderInfo = DATA.funcionarios.find(f => f.user === msg.sender) || 
                              DATA.tecnicos.find(t => t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.') === msg.sender) ||
                              { nome: msg.sender, role: 'OPERADOR' };
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        <span style="font-size: 1.1rem; margin-right: 5px;">${msg.senderMood || '😐'}</span>
                        ${senderInfo.nome.split(' ')[0]} ${senderInfo.role === 'ADMIN' ? ' 👑' : ''} ${senderInfo.role === 'TÉCNICO' ? ' 🔧' : ''}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.message}</div>
            `;
            
            container.appendChild(messageDiv);
        });
        
        // 🔧 FIX 2: SEMPRE scroll para baixo no chat privado
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
        
        // Marcar como visualizado
        this.marcarChatPrivadoComoVisualizado(chatId);
    },

    getPrivateChatId(user1, user2) {
        // Ordenar os usuários para garantir ID consistente
        const users = [user1, user2].sort();
        return `${users[0]}_${users[1]}`;
    },

    sendPrivateChatMessage() {
        if (!app.currentUser || !app.currentPrivateChatTarget) {
            alert('Selecione um destinatário primeiro.');
            return;
        }
        
        const input = document.getElementById('chat-private-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const sendBtn = document.getElementById('chat-private-send-btn');
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = '<div class="loading"></div>';
        sendBtn.disabled = true;
        
        // Gerar ID da conversa
        const chatId = this.getPrivateChatId(app.currentUser.user, app.currentPrivateChatTarget);
        
        const chatMessage = {
            id: Date.now(),
            sender: app.currentUser.user,
            senderName: app.currentUser.nome,
            senderRole: app.currentUser.role,
            senderMood: app.getMoodAtual(),
            receiver: app.currentPrivateChatTarget,
            message: message,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        // Carregar conversas existentes
        let privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        // Inicializar array se não existir
        if (!privateChats[chatId]) {
            privateChats[chatId] = [];
        }
        
        // Adicionar mensagem
        privateChats[chatId].push(chatMessage);
        
        // Limitar histórico (últimas 100 mensagens por conversa)
        if (privateChats[chatId].length > 100) {
            privateChats[chatId] = privateChats[chatId].slice(-100);
        }
        
        // Salvar
        localStorage.setItem('porter_chat_privado', JSON.stringify(privateChats));
        
        // Limpar campo de entrada
        input.value = '';
        
        // Restaurar botão
        setTimeout(() => {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }, 500);
        
        // Recarregar chat
        this.loadPrivateChat();
        
        // 🔧 FIX 2: Scroll para baixo no chat privado
        setTimeout(() => {
            const privateContainer = document.getElementById('chat-private-messages');
            if (privateContainer) {
                privateContainer.scrollTop = privateContainer.scrollHeight;
            }
        }, 100);
        
        // Atualizar badge
        app.atualizarBadgeChatPrivado();
        
        // Criar notificação para o destinatário
        this.criarNotificacaoChatPrivado(chatMessage);
    },

    criarNotificacaoChatPrivado(chatMessage) {
        // Obter informações do destinatário
        let destinatario = DATA.funcionarios.find(f => f.user === chatMessage.receiver);
        if (!destinatario) {
            // Verificar se é um técnico
            destinatario = DATA.tecnicos.find(t => 
                t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.') === chatMessage.receiver
            );
        }
        
        if (!destinatario) return;
        
        const notificacao = {
            id: Date.now(),
            condo: 'Chat Privado',
            tipo: 'chat_privado',
            desc: `Nova mensagem privada de ${chatMessage.senderName.split(' ')[0]}: ${chatMessage.message.substring(0, 50)}${chatMessage.message.length > 50 ? '...' : ''}`,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            lida: false,
            acao: {
                tipo: 'ir_para_chat_privado',
                sender: chatMessage.sender,
                receiver: chatMessage.receiver
            },
            destaque: true
        };
        
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        notificacoes.unshift(notificacao);
        
        if (notificacoes.length > 50) notificacoes.pop();
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        app.loadNotifications();
        app.updateNotificationBadges();
        app.atualizarBadgeChatPrivado();
    },

    marcarChatPrivadoComoVisualizado(chatId) {
        localStorage.setItem(`porter_chat_privado_last_view_${chatId}`, Date.now().toString());
        app.atualizarBadgeChatPrivado();
    }
};

// 🔧 FIX 2: Configurar scroll automático quando a aba de chat for aberta
document.addEventListener('DOMContentLoaded', () => {
    // Observar mudanças nas abas
    const tabChat = document.getElementById('tab-chat');
    if (tabChat) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    // Se a aba de chat ficou visível
                    if (!tabChat.classList.contains('hidden')) {
                        // Aguardar renderização e fazer scroll para baixo
                        setTimeout(() => {
                            if (chatSystem.scrollToBottom) {
                                chatSystem.scrollToBottom();
                            }
                        }, 300);
                    }
                }
            });
        });
        
        observer.observe(tabChat, { attributes: true });
    }
    
    // Observar mudanças na aba de chat privado
    const chatPrivateTab = document.getElementById('tab-chat-private');
    if (chatPrivateTab) {
        const observerPrivate = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    // Se a aba de chat privado ficou visível
                    if (!chatPrivateTab.classList.contains('hidden')) {
                        // Aguardar renderização e fazer scroll para baixo
                        setTimeout(() => {
                            const privateContainer = document.getElementById('chat-private-messages');
                            if (privateContainer) {
                                privateContainer.scrollTop = privateContainer.scrollHeight;
                            }
                        }, 300);
                    }
                }
            });
        });
        
        observerPrivate.observe(chatPrivateTab, { attributes: true });
    }
});
