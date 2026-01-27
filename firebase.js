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

    // 🔧 CORREÇÃO CRÍTICA: Configurar listener em tempo real para OS
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

    // 🔧 CORREÇÃO CRÍTICA: Nova função para sincronizar status online com Firebase - VERSÃO CORRIGIDA
    sincronizarStatusOnlineComFirebase() {
        if (!window.db || !app || !app.currentUser) {
            console.log('❌ Firebase ou usuário não disponível para sincronização online');
            return;
        }
        
        const agora = new Date();
        const statusOnline = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual(),
            lastActivity: agora.toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno',
            timestamp: agora.getTime(),
            loginDate: app.currentUser.loginDate || agora.toLocaleDateString('pt-BR'),
            loginHour: app.currentUser.loginHour || agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
        };
        
        // Salvar no Firebase - usando set com merge para não sobrescrever outros campos
        window.db.collection('online_users').doc(app.currentUser.user)
            .set(statusOnline, { merge: true })
            .then(() => {
                console.log('✅ Status online sincronizado com Firebase:', app.currentUser.user);
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar status online:', error);
            });
    },

    // 🔧 CORREÇÃO CRÍTICA: Nova função para monitorar usuários online no Firebase - VERSÃO CORRIGIDA
    configurarMonitoramentoOnlineFirebase() {
        if (!window.db) {
            console.log('❌ Firebase não disponível para monitoramento online');
            return;
        }
        
        console.log('🔧 Iniciando monitoramento online do Firebase...');
        
        // Listener para usuários online em tempo real
        window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuariosOnlineFirebase = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
                    // Verificar se não está "morto" (última atividade há mais de 2 minutos)
                    const ultimaAtividade = new Date(usuario.lastActivity);
                    const diferencaSegundos = (agora - ultimaAtividade) / 1000;
                    
                    if (diferencaSegundos < 120) { // Considerar online se ativo nos últimos 2 minutos
                        usuariosOnlineFirebase.push({
                            ...usuario,
                            id: doc.id
                        });
                    } else {
                        // Marcar como offline no Firebase automaticamente
                        window.db.collection('online_users').doc(doc.id).update({
                            online: false,
                            lastActivity: agora.toISOString()
                        }).catch(() => {});
                    }
                });
                
                // 🔧 CORREÇÃO CRÍTICA: Atualizar localStorage para o app.js usar
                localStorage.setItem('porter_online_firebase', JSON.stringify({
                    timestamp: agora.toISOString(),
                    users: usuariosOnlineFirebase
                }));
                
                console.log('👥 Usuários online no Firebase atualizados:', usuariosOnlineFirebase.length);
                
                // 🔧 CORREÇÃO CRÍTICA: Forçar atualização da interface imediatamente
                if (typeof app !== 'undefined' && app.currentUser && app.updateOnlineUsers) {
                    app.updateOnlineUsers();
                }
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

    // 🔧 CORREÇÃO: Função para limpar usuários offline antigos
    limparUsuariosOfflineAntigos() {
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
                console.log('🧹 Usuários offline antigos removidos do Firebase');
            })
            .catch(error => {
                console.error('Erro ao limpar usuários offline:', error);
            });
    },

    // Inicializar todos os listeners
    inicializarFirebase() {
        if (!window.db) {
            console.log('❌ Firebase não inicializado, usando localStorage');
            return;
        }
        
        console.log('✅ Firebase inicializado com sucesso');
        
        // 🔧 CORREÇÃO CRÍTICA: Limpar usuários offline antigos ao iniciar
        this.limparUsuariosOfflineAntigos();
        
        // 🔧 CORREÇÃO CRÍTICA: Configurar monitoramento de status online PRIMEIRO
        this.configurarMonitoramentoOnlineFirebase();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        this.configurarOSFirebase();
        
        // 🔧 CORREÇÃO: Sincronizar status online imediatamente
        if (app && app.currentUser) {
            setTimeout(() => {
                this.sincronizarStatusOnlineComFirebase();
            }, 1000);
        }
        
        // 🔧 CORREÇÃO: Sincronizar status online periodicamente (mais frequente)
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 15000); // A cada 15 segundos
        
        // 🔧 CORREÇÃO: Limpar usuários offline periodicamente
        setInterval(() => {
            this.limparUsuariosOfflineAntigos();
        }, 300000); // A cada 5 minutos
        
        // Sincronizar dados periodicamente
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
