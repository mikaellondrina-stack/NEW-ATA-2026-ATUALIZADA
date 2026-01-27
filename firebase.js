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

// Funções auxiliares do Firebase
const firebaseHelper = {
    // Salvar uma ata no Firebase
    salvarAtaNoFirebase(ata) {
        if (!window.db) {
            console.log('Firebase não está disponível');
            return Promise.resolve(false);
        }
        
        return window.db.collection('atas').doc(ata.id.toString()).set(ata)
            .then(() => {
                console.log('Ata salva no Firebase:', ata.id);
                return true;
            })
            .catch(error => {
                console.error('Erro ao salvar ata no Firebase:', error);
                return false;
            });
    },

    // Buscar atas do Firebase
    buscarAtasDoFirebase(filtros = {}) {
        if (!window.db) {
            console.log('Firebase não está disponível');
            return Promise.resolve([]);
        }
        
        let query = window.db.collection('atas').orderBy('timestamp', 'desc');
        
        // Aplicar filtros
        if (filtros.condo) {
            query = query.where('condo', '==', filtros.condo);
        }
        
        if (filtros.dataInicio) {
            query = query.where('dataISO', '>=', filtros.dataInicio);
        }
        
        if (filtros.dataFim) {
            query = query.where('dataISO', '<=', filtros.dataFim);
        }
        
        if (filtros.tipo) {
            query = query.where('tipo', '==', filtros.tipo);
        }
        
        if (filtros.status) {
            query = query.where('status', '==', filtros.status);
        }
        
        return query.get()
            .then(snapshot => {
                const atas = [];
                snapshot.forEach(doc => {
                    atas.push(doc.data());
                });
                return atas;
            })
            .catch(error => {
                console.error('Erro ao buscar atas do Firebase:', error);
                return [];
            });
    },

    // Salvar uma OS no Firebase
    salvarOSNoFirebase(os) {
        if (!window.db) {
            console.log('Firebase não está disponível');
            return Promise.resolve(false);
        }
        
        return window.db.collection('ordens_servico').doc(os.id.toString()).set(os)
            .then(() => {
                console.log('OS salva no Firebase:', os.id);
                return true;
            })
            .catch(error => {
                console.error('Erro ao salvar OS no Firebase:', error);
                return false;
            });
    },

    // Buscar OS do Firebase
    buscarOSDoFirebase(filtros = {}) {
        if (!window.db) {
            console.log('Firebase não está disponível');
            return Promise.resolve([]);
        }
        
        let query = window.db.collection('ordens_servico').orderBy('timestamp', 'desc');
        
        if (filtros.condo) {
            query = query.where('condo', '==', filtros.condo);
        }
        
        if (filtros.gravidade) {
            query = query.where('gravidade', '==', filtros.gravidade);
        }
        
        return query.get()
            .then(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    osList.push(doc.data());
                });
                return osList;
            })
            .catch(error => {
                console.error('Erro ao buscar OS do Firebase:', error);
                return [];
            });
    },

    // 🔧 FIX 1: Configurar listener em tempo real para OS
    configurarOSFirebase() {
        if (!window.db) {
            console.log('Firebase não disponível para OS');
            return;
        }
        
        // Listener para ordens de serviço
        window.db.collection('ordens_servico')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    osList.push(doc.data());
                });
                
                // Atualizar localStorage com dados do Firebase
                localStorage.setItem('porter_os', JSON.stringify(osList));
                
                // Atualizar interface se estiver na aba de OS
                if (document.getElementById('tab-os') && 
                    !document.getElementById('tab-os').classList.contains('hidden')) {
                    if (typeof window.app !== 'undefined' && window.app.renderOS) {
                        window.app.renderOS();
                    }
                }
                
                // Atualizar contagem de OS
                if (typeof window.app !== 'undefined' && window.app.updateTabCounts) {
                    window.app.updateTabCounts();
                }
                
                console.log('✅ OS sincronizadas do Firebase:', osList.length);
            }, error => {
                console.error('Erro no listener de OS do Firebase:', error);
            });
    },

    // Sincronizar dados locais com Firebase
    sincronizarDados() {
        if (!window.db) {
            console.log('Firebase não está disponível, usando localStorage apenas');
            return;
        }
        
        // Sincronizar atas
        const atasLocais = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        atasLocais.forEach(ata => {
            this.salvarAtaNoFirebase(ata);
        });
        
        // Sincronizar OS
        const osLocais = JSON.parse(localStorage.getItem('porter_os') || '[]');
        osLocais.forEach(os => {
            this.salvarOSNoFirebase(os);
        });
        
        console.log('✅ Dados sincronizados com Firebase');
    },

    // 🔧 FIX 2: CORREÇÃO DO ONLINE - Nova função para sincronizar status online com Firebase
    sincronizarStatusOnlineComFirebase() {
        if (!window.db || !window.app || !window.app.currentUser) return;
        
        const statusOnline = {
            user: window.app.currentUser.user,
            nome: window.app.currentUser.nome,
            role: window.app.currentUser.role,
            mood: window.app.getMoodAtual ? window.app.getMoodAtual() : 'Normal',
            lastActivity: new Date().toISOString(),
            online: true,
            turno: window.app.currentUser.turno || 'Diurno'
        };
        
        // Salvar no Firebase
        window.db.collection('online_users').doc(window.app.currentUser.user).set(statusOnline)
            .then(() => {
                console.log('✅ Status online sincronizado com Firebase');
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar status online:', error);
            });
    },

    // 🔧 FIX 2: CORREÇÃO DO ONLINE - Monitorar usuários online no Firebase CORRETAMENTE
    configurarMonitoramentoOnlineFirebase() {
        if (!window.db) return;
        
        // CORREÇÃO: Remover o filtro .where('online', '==', true) para ver TODOS os usuários
        window.db.collection('online_users')
            .onSnapshot(snapshot => {
                const usuariosOnlineFirebase = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
                    // Verificar se está marcado como online
                    if (usuario.online === true) {
                        // Verificar se não está "morto" (última atividade há mais de 3 minutos)
                        const ultimaAtividade = new Date(usuario.lastActivity);
                        const diferencaMinutos = (agora - ultimaAtividade) / (1000 * 60);
                        
                        if (diferencaMinutos < 3) { // Considerar online se ativo nos últimos 3 minutos
                            usuariosOnlineFirebase.push(usuario);
                        } else {
                            // Marcar como offline no Firebase
                            window.db.collection('online_users').doc(doc.id).update({
                                online: false
                            }).catch(() => {});
                        }
                    }
                });
                
                // Atualizar lista local
                if (typeof window.app !== 'undefined') {
                    // Salvar no localStorage para o app.js usar
                    localStorage.setItem('porter_online_firebase', JSON.stringify({
                        timestamp: new Date().toISOString(),
                        users: usuariosOnlineFirebase
                    }));
                    
                    // Forçar atualização da lista de online
                    if (window.app.currentUser && window.app.updateOnlineUsers) {
                        window.app.updateOnlineUsers();
                    }
                }
                
                console.log('👥 Usuários online no Firebase:', usuariosOnlineFirebase.length);
            }, error => {
                console.error('❌ Erro no monitoramento online do Firebase:', error);
            });
    },

    // Configurar listener em tempo real para chat
    configurarChatTempoReal() {
        if (!window.db) return;
        
        window.db.collection('chat')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const mensagens = [];
                snapshot.forEach(doc => {
                    mensagens.push({ ...doc.data(), firebaseId: doc.id });
                });
                
                // Atualizar localStorage
                localStorage.setItem('porter_chat', JSON.stringify(mensagens));
                
                // Atualizar interface se estiver na aba de chat
                if (document.getElementById('tab-chat') && 
                    !document.getElementById('tab-chat').classList.contains('hidden')) {
                    if (typeof window.chatSystem !== 'undefined' && window.chatSystem.loadChat) {
                        window.chatSystem.loadChat();
                    }
                }
                
                // Atualizar badge
                if (typeof window.app !== 'undefined' && window.app.atualizarBadgeChat) {
                    window.app.atualizarBadgeChat();
                }
            }, error => {
                console.error('Erro no listener do chat:', error);
            });
    },

    // Configurar listener em tempo real para notificações
    configurarNotificacoesTempoReal() {
        if (!window.db) return;
        
        window.db.collection('notificacoes')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const notificacoes = [];
                snapshot.forEach(doc => {
                    notificacoes.push(doc.data());
                });
                
                // Atualizar localStorage
                localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
                
                // Atualizar interface apenas se app estiver definido e tiver a função
                if (typeof window.app !== 'undefined') {
                    if (window.app.loadNotifications && typeof window.app.loadNotifications === 'function') {
                        window.app.loadNotifications();
                    }
                    if (window.app.updateNotificationBadges && typeof window.app.updateNotificationBadges === 'function') {
                        window.app.updateNotificationBadges();
                    }
                }
            }, error => {
                console.error('Erro no listener de notificações:', error);
            });
    },

    // 🔧 FIX 2: Marcar usuário como offline
    marcarUsuarioOffline() {
        if (!window.db || !window.app || !window.app.currentUser) return;
        
        window.db.collection('online_users').doc(window.app.currentUser.user).update({
            online: false,
            lastActivity: new Date().toISOString()
        }).then(() => {
            console.log('✅ Usuário marcado como offline:', window.app.currentUser.user);
        }).catch(error => {
            console.error('❌ Erro ao marcar usuário como offline:', error);
        });
    },

    // Inicializar todos os listeners
    inicializarFirebase() {
        if (!window.db) {
            console.log('Firebase não inicializado, usando localStorage');
            return;
        }
        
        console.log('✅ Firebase inicializado com sucesso');
        
        // 🔧 FIX 1: Configurar listener para OS
        this.configurarOSFirebase();
        
        // 🔧 FIX 2: Configurar monitoramento de status online CORRETAMENTE
        this.configurarMonitoramentoOnlineFirebase();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        
        // 🔧 FIX 2: Sincronizar status online periodicamente
        setInterval(() => {
            if (window.app && window.app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 10000); // A cada 10 segundos
        
        // Sincronizar periodicamente
        setInterval(() => {
            this.sincronizarDados();
        }, 30000); // Sincronizar a cada 30 segundos
        
        // Configurar para marcar como offline quando a página for fechada
        window.addEventListener('beforeunload', () => {
            this.marcarUsuarioOffline();
        });
        
        // Inicializar status online do usuário atual (com delay para app carregar)
        setTimeout(() => {
            if (window.app && window.app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 3000);
    }
};

// CORREÇÃO: Aguardar app carregar antes de inicializar
function inicializarFirebaseAposApp() {
    // Verificar se app está definido
    if (typeof window.app !== 'undefined') {
        firebaseHelper.inicializarFirebase();
    } else {
        // Se app não está definido ainda, tentar novamente em 1 segundo
        console.log('⚠️ App não está definido, aguardando...');
        setTimeout(inicializarFirebaseAposApp, 1000);
    }
}

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Aguardar um pouco para app.js carregar primeiro
        setTimeout(inicializarFirebaseAposApp, 500);
    });
} else {
    setTimeout(inicializarFirebaseAposApp, 500);
}
