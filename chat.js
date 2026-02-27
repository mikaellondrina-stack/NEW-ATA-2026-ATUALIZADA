const chatSystem = {
    init() {
        console.log('💬 Chat System iniciado');
        this.setupFirebaseListener();
    },

    setupFirebaseListener() {
        if (!window.db) {
            console.log('⚠️ Firebase não disponível para chat');
            return;
        }

        window.db.collection('chat_geral')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                const mensagens = [];
                snapshot.forEach((doc) => {
                    mensagens.push(doc.data());
                });
                this.processarMensagensFirebase(mensagens);
            }, (error) => {
                console.error('❌ Erro no listener do chat:', error);
            });
    },

    processarMensagensFirebase(mensagensFirebase) {
        let mensagensLocais = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        const mapaMensagens = new Map();
        
        mensagensFirebase.forEach(msg => {
            mapaMensagens.set(msg.id, msg);
        });
        
        mensagensLocais.forEach(msg => {
            if (!mapaMensagens.has(msg.id)) {
                mapaMensagens.set(msg.id, msg);
                if (!msg.firebaseSync) {
                    this.enviarParaFirebase(msg);
                }
            }
        });
        
        const todasMensagens = Array.from(mapaMensagens.values());
        todasMensagens.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        localStorage.setItem('porter_chat', JSON.stringify(todasMensagens));
        
        if (document.getElementById('tab-chat') && 
            !document.getElementById('tab-chat').classList.contains('hidden')) {
            this.loadChat();
        }
        
        if (typeof app !== 'undefined' && app.atualizarBadgeChat) {
            app.atualizarBadgeChat();
        }
    },

    enviarParaFirebase(mensagem) {
        if (!window.db) return;
        
        const mensagemParaFirebase = {
            id: mensagem.id,
            sender: mensagem.sender,
            senderRole: mensagem.senderRole,
            senderMood: mensagem.senderMood,
            message: mensagem.message,
            time: mensagem.time,
            timestamp: mensagem.timestamp,
            date: mensagem.date,
            firebaseSync: true
        };
        
        window.db.collection('chat_geral').add(mensagemParaFirebase)
            .then(() => {
                console.log('✅ Mensagem enviada para Firebase');
            })
            .catch((error) => {
                console.error('❌ Erro ao enviar para Firebase:', error);
            });
    },

    loadChat() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        if (typeof app !== 'undefined' && app.currentUser && 
            (app.currentUser.role === 'ADMIN' || app.currentUser.role === 'TÉCNICO')) {
            const adminControls = document.getElementById('chat-admin-controls');
            if (adminControls) adminControls.style.display = 'flex';
        }
        
        if (chat.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma mensagem ainda. Seja o primeiro a enviar!</p>
                </div>
            `;
            return;
        }
        
        const chatOrdenado = [...chat].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        container.innerHTML = '';
        
        chatOrdenado.forEach(msg => {
            const isSent = typeof app !== 'undefined' && app.currentUser && 
                          msg.sender === app.currentUser.nome;
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
            messageDiv.dataset.id = msg.id;
            
            let senderDisplay = msg.sender;
            if (msg.senderRole === 'ADMIN') senderDisplay += ' 👑';
            if (msg.senderRole === 'TÉCNICO') senderDisplay += ' 🔧';
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        ${msg.senderMood || '😐'} ${senderDisplay}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${this.escapeHtml(msg.message)}</div>
                ${typeof app !== 'undefined' && app.currentUser && 
                  (app.currentUser.role === 'ADMIN' || app.currentUser.role === 'TÉCNICO') && !isSent ?
                    `<div style="margin-top: 5px; text-align: right;">
                        <button class="btn btn-danger btn-sm" onclick="chatSystem.deleteChatMessage(${msg.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>` : ''
                }
            `;
            
            container.appendChild(messageDiv);
        });
        
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
        
        if (typeof app !== 'undefined' && app.atualizarBadgeChat) {
            app.atualizarBadgeChat();
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    sendChatMessage() {
        if (typeof app === 'undefined' || !app.currentUser) {
            if (typeof app !== 'undefined') app.showToast('Você precisa estar logado para enviar mensagens.', 'warning');
            return;
        }
        
        const input = document.getElementById('chat-input');
        if (!input) return;
        
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
            date: new Date().toLocaleDateString('pt-BR'),
            firebaseSync: false
        };
        
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chat.push(chatMessage);
        
        if (chat.length > 200) chat = chat.slice(-200);
        localStorage.setItem('porter_chat', JSON.stringify(chat));
        
        if (window.db) {
            this.enviarParaFirebase(chatMessage);
        }
        
        input.value = '';
        
        setTimeout(() => {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }, 500);
        
        this.loadChat();
        
        if (typeof app !== 'undefined' && app.criarNotificacaoChatComAcao) {
            app.criarNotificacaoChatComAcao(chatMessage);
        }
    },

    deleteChatMessage(id) {
        if (typeof app === 'undefined' || !app.currentUser || 
            (app.currentUser.role !== 'ADMIN' && app.currentUser.role !== 'TÉCNICO')) {
            if (typeof app !== 'undefined') app.showToast('Apenas administradores podem excluir mensagens.', 'warning');
            return;
        }
        
        if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;
        
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chat = chat.filter(msg => msg.id !== id);
        localStorage.setItem('porter_chat', JSON.stringify(chat));
        
        this.loadChat();
        
        if (typeof app !== 'undefined') {
            app.updateTabCounts();
            app.showToast('Mensagem excluída!', 'success');
        }
    },

    clearChat() {
        if (typeof app === 'undefined' || !app.currentUser || 
            (app.currentUser.role !== 'ADMIN' && app.currentUser.role !== 'TÉCNICO')) {
            if (typeof app !== 'undefined') app.showToast('Apenas administradores podem limpar o chat.', 'warning');
            return;
        }
        
        if (!confirm('Tem certeza que deseja limpar todas as mensagens?')) return;
        
        localStorage.removeItem('porter_chat');
        this.loadChat();
        
        if (typeof app !== 'undefined') {
            app.updateTabCounts();
            app.showToast('Chat limpo com sucesso!', 'success');
        }
    },

    criarNotificacaoChat(texto) {
        if (typeof app === 'undefined') return;
        
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        const notificacao = {
            id: Date.now(),
            condo: 'Chat Geral',
            tipo: 'chat',
            desc: texto,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            lida: false
        };
        
        notificacoes.unshift(notificacao);
        if (notificacoes.length > 50) notificacoes.pop();
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        app.loadNotifications();
        app.updateNotificationBadges();
    },

    loadPrivateChat() {
        if (typeof app === 'undefined' || !app.currentUser || !app.currentPrivateChatTarget) return;
        
        const container = document.getElementById('chat-private-messages');
        if (!container) return;
        
        const privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        const chatId = this.getPrivateChatId(app.currentUser.user, app.currentPrivateChatTarget);
        const messages = privateChats[chatId] || [];
        
        const input = document.getElementById('chat-private-input');
        const sendBtn = document.getElementById('chat-private-send-btn');
        
        if (input && sendBtn) {
            input.disabled = false;
            sendBtn.disabled = false;
        }
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                </div>
            `;
            return;
        }
        
        const messagesOrdenado = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        container.innerHTML = '';
        
        messagesOrdenado.forEach(msg => {
            const isSent = msg.sender === app.currentUser.user;
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
            
            const senderInfo = DATA.funcionarios.find(f => f.user === msg.sender) || 
                              { nome: msg.senderName || msg.sender, role: 'OPERADOR' };
            
            let senderDisplay = senderInfo.nome.split(' ')[0];
            if (senderInfo.role === 'ADMIN') senderDisplay += ' 👑';
            if (senderInfo.role === 'TÉCNICO') senderDisplay += ' 🔧';
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        ${msg.senderMood || '😐'} ${senderDisplay}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${this.escapeHtml(msg.message)}</div>
            `;
            
            container.appendChild(messageDiv);
        });
        
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    },

    sendPrivateChatMessage() {
        if (typeof app === 'undefined' || !app.currentUser || !app.currentPrivateChatTarget) {
            if (typeof app !== 'undefined') app.showToast('Selecione um destinatário primeiro.', 'warning');
            return;
        }
        
        const input = document.getElementById('chat-private-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        const sendBtn = document.getElementById('chat-private-send-btn');
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = '<div class="loading"></div>';
        sendBtn.disabled = true;
        
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
        
        let privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        if (!privateChats[chatId]) {
            privateChats[chatId] = [];
        }
        
        privateChats[chatId].push(chatMessage);
        
        if (privateChats[chatId].length > 100) {
            privateChats[chatId] = privateChats[chatId].slice(-100);
        }
        
        localStorage.setItem('porter_chat_privado', JSON.stringify(privateChats));
        
        input.value = '';
        
        setTimeout(() => {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }, 500);
        
        this.loadPrivateChat();
        
        if (typeof app !== 'undefined' && app.atualizarBadgeChatPrivado) {
            app.atualizarBadgeChatPrivado();
        }
        
        app.showToast('Mensagem enviada!', 'success');
    },

    getPrivateChatId(user1, user2) {
        const users = [user1, user2].sort();
        return `${users[0]}_${users[1]}`;
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        chatSystem.init();
    }, 2000);
});
