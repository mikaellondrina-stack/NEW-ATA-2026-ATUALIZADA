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
                    if (typeof app !== 'undefined' && app.renderOS) {
                        app.renderOS();
                    }
                }
                
                // Atualizar contagem de OS
                if (typeof app !== 'undefined' && app.updateTabCounts) {
                    app.updateTabCounts();
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

    // 🔧 FIX 2: Nova função para sincronizar status online com Firebase
    sincronizarStatusOnlineComFirebase() {
        if (!window.db || !app || !app.currentUser) return;
        
        const statusOnline = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual(),
            lastActivity: new Date().toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno'
        };
        
        // Salvar no Firebase
        window.db.collection('online_users').doc(app.currentUser.user).set(statusOnline)
            .then(() => {
                console.log('✅ Status online sincronizado com Firebase');
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar status online:', error);
            });
    },

    // 🔧 FIX 2: Nova função para monitorar usuários online no Firebase
    configurarMonitoramentoOnlineFirebase() {
        if (!window.db) return;
        
        window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuariosOnlineFirebase = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
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
                });
                
                // Atualizar lista local
                if (typeof app !== 'undefined') {
                    // Salvar no localStorage para o app.js usar
                    localStorage.setItem('porter_online_firebase', JSON.stringify({
                        timestamp: new Date().toISOString(),
                        users: usuariosOnlineFirebase
                    }));
                    
                    // Forçar atualização da lista de online
                    if (app.currentUser && app.updateOnlineUsers) {
                        app.updateOnlineUsers();
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
                
                // Atualizar interface
                if (typeof app !== 'undefined') {
                    app.loadNotifications();
                    app.updateNotificationBadges();
                }
            }, error => {
                console.error('Erro no listener de notificações:', error);
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
        
        // 🔧 FIX 2: Configurar monitoramento de status online
        this.configurarMonitoramentoOnlineFirebase();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        
        // 🔧 FIX 2: Sincronizar status online periodicamente
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 10000); // A cada 10 segundos
        
        // Sincronizar periodicamente
        setInterval(() => {
            this.sincronizarDados();
        }, 30000); // Sincronizar a cada 30 segundos
    }
};

// Inicializar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        firebaseHelper.inicializarFirebase();
    });
} else {
    firebaseHelper.inicializarFirebase();
}
