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
            
            container
