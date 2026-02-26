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

    enviarParaFirebase(mensagem
