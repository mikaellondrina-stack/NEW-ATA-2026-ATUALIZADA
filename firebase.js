// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyARRqLJJFdaHpcmUtrSStqmx90ZYm8ERe8",
    authDomain: "ata-porter-2026-new-98c61.firebaseapp.com",
    projectId: "ata-porter-2026-new-98c61",
    storageBucket: "ata-porter-2026-new-98c61.firebasestorage.app",
    messagingSenderId: "196023937983",
    appId: "1:196023937983:web:090b010284141d2edecf0a"
};

// Inicializar Firebase apenas se ainda não foi inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Tornar o banco de dados disponível globalmente
window.db = firebase.firestore();
window.auth = firebase.auth();

// 🔥 CORREÇÃO CRÍTICA: Objeto global para armazenar listeners
window.firebaseListeners = {
    onlineUsers: null,
    chat: null,
    os: null,
    notifications: null
};

const firebaseHelper = {
    // 🔥 CORREÇÃO: Função universal para sincronizar status online
    sincronizarStatusOnlineComFirebase() {
        if (!window.db || !app || !app.currentUser) {
            console.log('❌ Firebase ou usuário não disponível');
            return;
        }
        
        const agora = new Date();
        const userData = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual(),
            lastActivity: agora.toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno',
            timestamp: agora.getTime(),
            loginDate: app.currentUser.loginDate,
            loginHour: app.currentUser.loginHour
        };
        
        // Usar set com merge para não sobrescrever outros campos
        window.db.collection('online_users').doc(app.currentUser.user)
            .set(userData, { merge: true })
            .then(() => {
                console.log('✅ Status online sincronizado:', app.currentUser.nome);
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar:', error);
            });
    },

    // 🔥 CORREÇÃO: Configurar listener UNIVERSAL para usuários online
    configurarListenerOnlineUniversal() {
        if (!window.db) {
            console.error('❌ Firebase não disponível para listener online');
            return;
        }
        
        console.log('🔥 Iniciando listener UNIVERSAL de usuários online...');
        
        // Remover listener anterior se existir
        if (window.firebaseListeners.onlineUsers) {
            window.firebaseListeners.onlineUsers();
        }
        
        // 🔥 LISTENER EM TEMPO REAL PARA TODOS OS USUÁRIOS ONLINE
        window.firebaseListeners.onlineUsers = window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuariosOnline = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
                    const ultimaAtividade = new Date(usuario.lastActivity);
                    const diferencaSegundos = (agora - ultimaAtividade) / 1000;
                    
                    // 🔥 FILTRO: Apenas usuários ativos nos últimos 2 minutos
                    if (diferencaSegundos < 120) {
                        usuariosOnline.push({
                            ...usuario,
                            id: doc.id,
                            isCurrentUser: usuario.user === (app.currentUser ? app.currentUser.user : '')
                        });
                    } else {
                        // Marcar como offline automaticamente
                        window.db.collection('online_users').doc(doc.id).update({
                            online: false
                        }).catch(() => {});
                    }
                });
                
                console.log(`👥 ${usuariosOnline.length} usuários online no Firebase`);
                
                // 🔥 SALVAR NO LOCALSTORAGE PARA TODAS AS MÁQUINAS
                localStorage.setItem('porter_online_firebase', JSON.stringify({
                    timestamp: agora.toISOString(),
                    users: usuariosOnline
                }));
                
                // 🔥 FORÇAR ATUALIZAÇÃO DA INTERFACE EM TODAS AS MÁQUINAS
                if (typeof app !== 'undefined' && app.updateOnlineUsers) {
                    app.updateOnlineUsers();
                }
                
                // 🔥 ATUALIZAR LISTA DE CHAT PRIVADO
                if (typeof app !== 'undefined' && app.loadPrivateChatUsers) {
                    app.loadPrivateChatUsers();
                }
                
            }, error => {
                console.error('🔥 Erro no listener online:', error);
            });
    },

    // 🔥 CORREÇÃO: Configurar listener para chat geral
    configurarListenerChatGeral() {
        if (!window.db) return;
        
        // Remover listener anterior
        if (window.firebaseListeners.chat) {
            window.firebaseListeners.chat();
        }
        
        window.firebaseListeners.chat = window.db.collection('chat_geral')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const mensagens = [];
                snapshot.forEach(doc => {
                    mensagens.push(doc.data());
                });
                
                // 🔥 SALVAR PARA TODAS AS MÁQUINAS
                localStorage.setItem('porter_chat', JSON.stringify(mensagens));
                
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
                
            }, error => {
                console.error('Erro no listener do chat:', error);
            });
    },

    // 🔥 CORREÇÃO: Configurar listener para OS
    configurarListenerOS() {
        if (!window.db) return;
        
        if (window.firebaseListeners.os) {
            window.firebaseListeners.os();
        }
        
        window.firebaseListeners.os = window.db.collection('ordens_servico')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    osList.push(doc.data());
                });
                
                // 🔥 SALVAR PARA TODAS AS MÁQUINAS
                localStorage.setItem('porter_os', JSON.stringify(osList));
                
                if (document.getElementById('tab-os') && 
                    !document.getElementById('tab-os').classList.contains('hidden')) {
                    if (typeof app !== 'undefined' && app.renderOS) {
                        app.renderOS();
                    }
                }
                
                if (typeof app !== 'undefined' && app.updateTabCounts) {
                    app.updateTabCounts();
                }
                
            }, error => {
                console.error('Erro no listener de OS:', error);
            });
    },

    // 🔥 NOVO: Enviar mensagem de chat para o Firebase
    enviarMensagemChatFirebase(mensagem) {
        if (!window.db) return;
        
        return window.db.collection('chat_geral').doc(mensagem.id.toString()).set(mensagem)
            .then(() => {
                console.log('✅ Mensagem enviada para Firebase');
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao enviar mensagem:', error);
                return false;
            });
    },

    // 🔥 NOVO: Enviar OS para o Firebase
    enviarOSFirebase(osData) {
        if (!window.db) return;
        
        return window.db.collection('ordens_servico').doc(osData.id.toString()).set(osData)
            .then(() => {
                console.log('✅ OS enviada para Firebase');
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao enviar OS:', error);
                return false;
            });
    },

    // 🔥 NOVO: Limpar usuários offline antigos
    limparUsuariosOffline() {
        if (!window.db) return;
        
        const umaHoraAtras = new Date();
        umaHoraAtras.setHours(umaHoraAtras.getHours() - 1);
        
        window.db.collection('online_users')
            .where('lastActivity', '<', umaHoraAtras.toISOString())
            .get()
            .then(snapshot => {
                const batch = window.db.batch();
                snapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return batch.commit();
            })
            .then(() => {
                console.log('🧹 Usuários offline antigos removidos');
            })
            .catch(error => {
                console.error('Erro ao limpar usuários:', error);
            });
    },

    // 🔥 CORREÇÃO: Inicializar TODOS os listeners
    inicializarFirebaseUniversal() {
        if (!window.db) {
            console.log('❌ Firebase não inicializado');
            return;
        }
        
        console.log('🔥 Inicializando Firebase Universal...');
        
        // Limpar usuários offline antigos
        this.limparUsuariosOffline();
        
        // 🔥 CONFIGURAR TODOS OS LISTENERS EM TEMPO REAL
        this.configurarListenerOnlineUniversal();
        this.configurarListenerChatGeral();
        this.configurarListenerOS();
        
        // Sincronizar status do usuário atual
        if (app && app.currentUser) {
            setTimeout(() => {
                this.sincronizarStatusOnlineComFirebase();
            }, 1000);
        }
        
        // 🔥 SINCRONIZAÇÃO PERIÓDICA DO STATUS ONLINE
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 15000);
        
        // 🔥 LIMPEZA PERIÓDICA
        setInterval(() => {
            this.limparUsuariosOffline();
        }, 300000);
        
        console.log('✅ Firebase Universal inicializado!');
    },

    // 🔥 CORREÇÃO: Marcar usuário como offline
    marcarUsuarioOffline(userId) {
        if (!window.db) return;
        
        window.db.collection('online_users').doc(userId).update({
            online: false,
            lastActivity: new Date().toISOString()
        }).then(() => {
            console.log('✅ Usuário marcado como offline:', userId);
        }).catch(error => {
            console.error('❌ Erro ao marcar offline:', error);
        });
    }
};

// 🔥 CORREÇÃO: Inicializar imediatamente quando o script carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            firebaseHelper.inicializarFirebaseUniversal();
        }, 1000);
    });
} else {
    setTimeout(() => {
        firebaseHelper.inicializarFirebaseUniversal();
    }, 1000);
}
