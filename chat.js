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
            .then((docRef) => {
                console.log('✅ Mensagem enviada para Firebase:', docRef.id);
            })
            .catch((error) => {
                console.error('❌ Erro ao enviar para Firebase:', error);
            });
    },

    loadChat() {
        if (!document.getElementById('chat-messages')) return;
        
        const container = document.getElementById('chat-messages');
        const chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        if (app.currentUser && (app.currentUser.role === 'ADMIN' || app.currentUser.role === 'TÉCNICO')) {
            const adminControls = document.getElementById('chat-admin-controls');
            if (adminControls) adminControls.style.display = 'flex';
        }
        
        if (chat.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem;"></i>
                    <p>Nenhuma mensagem ainda.</p>
                </div>
            `;
            return;
        }
        
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
                        ${msg.senderMood || '😐'} ${msg.sender}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.message}</div>
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

    sendChatMessage() {
        if (!app.currentUser) {
            showToast('Você precisa estar logado!', 'error');
            return;
        }
        
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
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
        this.loadChat();
    },

    clearChat() {
        if (!app.currentUser || (app.currentUser.role !== 'ADMIN' && app.currentUser.role !== 'TÉCNICO')) {
            showToast('Apenas administradores ou técnicos podem limpar o chat.', 'error');
            return;
        }
        
        if (!confirm('Tem certeza que deseja limpar todas as mensagens do chat?')) return;
        
        localStorage.removeItem('porter_chat');
        this.loadChat();
        
        if (typeof app !== 'undefined') {
            app.updateTabCounts();
            showToast('Chat limpo!', 'success');
        }
    },

    loadPrivateChat() {
        if (!app.currentUser || !app.currentPrivateChatTarget) return;
        
        const container = document.getElementById('chat-private-messages');
        const privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        const chatId = this.getPrivateChatId(app.currentUser.user, app.currentPrivateChatTarget);
        const messages = privateChats[chatId] || [];
        
        const input = document.getElementById('chat-private-input');
        const sendBtn = document.getElementById('chat-private-send-btn');
        
        if (app.currentPrivateChatTarget) {
            input.disabled = false;
            sendBtn.disabled = false;
        }
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem;"></i>
                    <p>Nenhuma mensagem ainda.</p>
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
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        ${msg.senderMood || '😐'} ${msg.senderName || msg.sender}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.message}</div>
            `;
            
            container.appendChild(messageDiv);
        });
        
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    },

    sendPrivateChatMessage() {
        if (!app.currentUser || !app.currentPrivateChatTarget) {
            showToast('Selecione um destinatário!', 'error');
            return;
        }
        
        const input = document.getElementById('chat-private-input');
        const message = input.value.trim();
        
        if (!message) return;
        
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
        this.loadPrivateChat();
        
        if (typeof app !== 'undefined' && app.atualizarBadgeChatPrivado) {
            app.atualizarBadgeChatPrivado();
        }
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

window.chatSystem = chatSystem;
