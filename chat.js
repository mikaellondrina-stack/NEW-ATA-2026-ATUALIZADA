// 🔧 NOVA: Configurar sincronização do chat
configurarChatFirebase() {
    if (!window.db) return;
    
    console.log('🔧 Configurando sincronização do chat via Firebase...');
    
    // Listener para chat geral
    window.db.collection('chat_geral')
        .orderBy('timestamp', 'desc')
        .limit(100)
        .onSnapshot(snapshot => {
            const mensagens = [];
            snapshot.forEach(doc => {
                const msg = doc.data();
                msg.firebaseId = doc.id;
                mensagens.push(msg);
            });
            
            console.log('💬 Chat sincronizado do Firebase:', mensagens.length, 'mensagens');
            
            // Salvar no localStorage específico
            localStorage.setItem('porter_chat_firebase', JSON.stringify(mensagens));
            
            // Mesclar com mensagens locais
            this.sincronizarMensagensChat(mensagens);
            
        }, error => {
            console.error('❌ Erro na sincronização do chat:', error);
        });
},

// 🔧 NOVA: Sincronizar mensagens do chat
sincronizarMensagensChat(mensagensFirebase) {
    const mensagensLocais = JSON.parse(localStorage.getItem('porter_chat') || '[]');
    const mapaUnico = new Map();
    
    // Adicionar todas do Firebase
    mensagensFirebase.forEach(msg => {
        mapaUnico.set(msg.id, msg);
    });
    
    // Adicionar locais que não estão no Firebase
    mensagensLocais.forEach(msg => {
        if (!mapaUnico.has(msg.id)) {
            mapaUnico.set(msg.id, msg);
            // Enviar para Firebase se não foi sincronizado
            if (!msg.firebaseSync && window.db) {
                this.enviarMensagemChatParaFirebase(msg);
            }
        }
    });
    
    // Converter para array e ordenar
    const todasMensagens = Array.from(mapaUnico.values());
    todasMensagens.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Salvar no localStorage principal
    localStorage.setItem('porter_chat', JSON.stringify(todasMensagens));
    
    // Atualizar interface se estiver na aba de chat
    if (document.getElementById('tab-chat') && 
        !document.getElementById('tab-chat').classList.contains('hidden')) {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadChat) {
            chatSystem.loadChat();
        }
    }
    
    // Atualizar badge
    if (typeof app !== 'undefined' && app.atualizarBadgeChat) {
        app.atualizarBadgeChat();
    }
},

// 🔧 NOVA: Enviar mensagem do chat para Firebase
enviarMensagemChatParaFirebase(mensagem) {
    if (!window.db) return;
    
    const mensagemParaFirebase = {
        ...mensagem,
        firebaseSync: true
    };
    
    window.db.collection('chat_geral').add(mensagemParaFirebase)
        .then(docRef => {
            console.log('✅ Mensagem do chat enviada para Firebase:', docRef.id);
        })
        .catch(error => {
            console.error('❌ Erro ao enviar mensagem do chat para Firebase:', error);
        });
},
