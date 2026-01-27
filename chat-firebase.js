// Sistema de Chat Universal via Firebase
const chatFirebase = {
    // 🔧 Inicializar chat com Firebase
    init() {
        if (!window.db) {
            console.log('❌ Firebase não disponível para chat universal');
            return;
        }
        
        console.log('🔧 Inicializando chat universal via Firebase...');
        
        // Configurar listeners para chat geral
        this.configurarChatGeralFirebase();
        
        // Configurar listeners para chat privado
        this.configurarChatPrivadoFirebase();
    },
    
    // 🔧 Configurar chat geral no Firebase
    configurarChatGeralFirebase() {
        if (!window.db) return;
        
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
                
                console.log('💬 Chat geral recebido do Firebase:', mensagens.length, 'mensagens');
                
                // Salvar no localStorage
                localStorage.setItem('porter_chat_firebase', JSON.stringify(mensagens));
                
                // Mesclar com mensagens locais
                this.sincronizarChatGeral(mensagens);
                
            }, error => {
                console.error('❌ Erro no listener do chat geral:', error);
            });
    },
    
    // 🔧 Sincronizar chat geral local com Firebase
    sincronizarChatGeral(mensagensFirebase) {
        const mensagensLocais = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        const todasMensagens = this.mesclarMensagens(mensagensLocais, mensagensFirebase);
        
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
    
    // 🔧 Mesclar mensagens locais com Firebase
    mesclarMensagens(locais, firebase) {
        const mapaUnico = new Map();
        
        // Adicionar todas do Firebase
        firebase.forEach(msg => {
            mapaUnico.set(msg.id, msg);
        });
        
        // Adicionar locais que não estão no Firebase
        locais.forEach(msg => {
            if (!mapaUnico.has(msg.id)) {
                mapaUnico.set(msg.id, msg);
                // Sincronizar mensagem local com Firebase
                this.enviarMensagemParaFirebase(msg);
            }
        });
        
        // Converter de volta para array e ordenar
        const resultado = Array.from(mapaUnico.values());
        resultado.sort((a, b) => {
            const timeA = new Date(a.timestamp || Date.now()).getTime();
            const timeB = new Date(b.timestamp || Date.now()).getTime();
            return timeA - timeB; // Ordem cronológica
        });
        
        return resultado;
    },
    
    // 🔧 Enviar mensagem para Firebase
    enviarMensagemParaFirebase(mensagem) {
        if (!window.db || mensagem.firebaseId) return;
        
        // Remover propriedades internas
        const mensagemParaFirebase = {
            id: mensagem.id,
            sender: mensagem.sender,
            senderRole: mensagem.senderRole,
            senderMood: mensagem.senderMood,
            message: mensagem.message,
            time: mensagem.time,
            timestamp: mensagem.timestamp,
            date: mensagem.date
        };
        
        window.db.collection('chat_geral').add(mensagemParaFirebase)
            .then(docRef => {
                console.log('✅ Mensagem enviada para Firebase:', docRef.id);
            })
            .catch(error => {
                console.error('❌ Erro ao enviar mensagem para Firebase:', error);
            });
    },
    
    // 🔧 Enviar nova mensagem via Firebase
    enviarMensagemGeral(mensagem) {
        if (!window.db) {
            console.log('⚠️ Firebase não disponível, usando localStorage');
            return false;
        }
        
        const mensagemParaFirebase = {
            id: mensagem.id,
            sender: mensagem.sender,
            senderRole: mensagem.senderRole,
            senderMood: mensagem.senderMood,
            message: mensagem.message,
            time: mensagem.time,
            timestamp: mensagem.timestamp,
            date: mensagem.date
        };
        
        return window.db.collection('chat_geral').add(mensagemParaFirebase)
            .then(docRef => {
                console.log('✅ Mensagem enviada para Firebase:', docRef.id);
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao enviar mensagem para Firebase:', error);
                return false;
            });
    },
    
    // 🔧 Configurar chat privado no Firebase
    configurarChatPrivadoFirebase() {
        if (!window.db || !app || !app.currentUser) return;
        
        console.log('🔧 Configurando chat privado via Firebase...');
        
        // Ouvir todas as conversas onde o usuário atual está envolvido
        window.db.collection('chat_privado')
            .where('participantes', 'array-contains', app.currentUser.user)
            .onSnapshot(snapshot => {
                snapshot.forEach(doc => {
                    const conversa = doc.data();
                    this.processarConversaPrivada(conversa);
                });
                
            }, error => {
                console.error('❌ Erro no listener do chat privado:', error);
            });
    },
    
    // 🔧 Processar conversa privada recebida
    processarConversaPrivada(conversa) {
        // Gerar ID da conversa (mesmo formato usado no sistema local)
        const chatId = this.getPrivateChatId(conversa.participantes[0], conversa.participantes[1]);
        
        // Carregar conversas locais
        let privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        // Se não existe ou se a mensagem é nova, adicionar
        if (!privateChats[chatId] || !privateChats[chatId].some(msg => msg.id === conversa.ultimaMensagem.id)) {
            if (!privateChats[chatId]) {
                privateChats[chatId] = [];
            }
            
            // Adicionar última mensagem
            privateChats[chatId].push(conversa.ultimaMensagem);
            
            // Limitar histórico
            if (privateChats[chatId].length > 100) {
                privateChats[chatId] = privateChats[chatId].slice(-100);
            }
            
            // Salvar no localStorage
            localStorage.setItem('porter_chat_privado', JSON.stringify(privateChats));
            
            // Atualizar interface se necessário
            if (app.currentPrivateChatTarget && 
                (conversa.participantes.includes(app.currentUser.user) && 
                 conversa.participantes.includes(app.currentPrivateChatTarget))) {
                if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChat) {
                    chatSystem.loadPrivateChat();
                }
            }
            
            // Atualizar badge
            if (typeof app !== 'undefined' && app.atualizarBadgeChatPrivado) {
                app.atualizarBadgeChatPrivado();
            }
        }
    },
    
    // 🔧 Enviar mensagem privada via Firebase
    enviarMensagemPrivada(chatMessage) {
        if (!window.db) return false;
        
        // Gerar ID da conversa
        const chatId = this.getPrivateChatId(chatMessage.sender, chatMessage.receiver);
        
        const conversaParaFirebase = {
            participantes: [chatMessage.sender, chatMessage.receiver].sort(),
            ultimaMensagem: {
                id: chatMessage.id,
                sender: chatMessage.sender,
                senderName: chatMessage.senderName,
                senderRole: chatMessage.senderRole,
                senderMood: chatMessage.senderMood,
                receiver: chatMessage.receiver,
                message: chatMessage.message,
                time: chatMessage.time,
                timestamp: chatMessage.timestamp,
                date: chatMessage.date
            },
            timestamp: new Date().toISOString(),
            atualizadoPor: chatMessage.sender
        };
        
        return window.db.collection('chat_privado').doc(chatId).set(conversaParaFirebase)
            .then(() => {
                console.log('✅ Mensagem privada enviada para Firebase:', chatId);
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao enviar mensagem privada para Firebase:', error);
                return false;
            });
    },
    
    // 🔧 Gerar ID da conversa privada (mesmo formato do sistema local)
    getPrivateChatId(user1, user2) {
        const users = [user1, user2].sort();
        return `${users[0]}_${users[1]}`;
    },
    
    // 🔧 Sincronizar mensagens locais com Firebase
    sincronizarMensagensLocais() {
        if (!window.db) return;
        
        console.log('🔄 Sincronizando mensagens locais com Firebase...');
        
        // Sincronizar chat geral
        const mensagensLocais = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        mensagensLocais.forEach(msg => {
            if (!msg.firebaseId) {
                this.enviarMensagemParaFirebase(msg);
            }
        });
        
        // Sincronizar chat privado
        const privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        Object.entries(privateChats).forEach(([chatId, mensagens]) => {
            mensagens.forEach(msg => {
                if (!msg.firebaseId) {
                    // Extrair usuários do chatId
                    const [user1, user2] = chatId.split('_');
                    
                    const chatMessage = {
                        id: msg.id,
                        sender: msg.sender,
                        senderName: msg.senderName || msg.sender,
                        senderRole: msg.senderRole,
                        senderMood: msg.senderMood,
                        receiver: msg.sender === user1 ? user2 : user1,
                        message: msg.message,
                        time: msg.time,
                        timestamp: msg.timestamp,
                        date: msg.date
                    };
                    
                    this.enviarMensagemPrivada(chatMessage);
                }
            });
        });
    }
};

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Aguardar Firebase e app carregarem
        setTimeout(() => {
            if (window.db && typeof chatFirebase !== 'undefined') {
                chatFirebase.init();
                
                // Sincronizar periodicamente
                setInterval(() => {
                    chatFirebase.sincronizarMensagensLocais();
                }, 30000); // A cada 30 segundos
            }
        }, 2000);
    });
} else {
    setTimeout(() => {
        if (window.db && typeof chatFirebase !== 'undefined') {
            chatFirebase.init();
            
            setInterval(() => {
                chatFirebase.sincronizarMensagensLocais();
            }, 30000);
        }
    }, 2000);
}
