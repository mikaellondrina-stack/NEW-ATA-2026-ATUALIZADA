// Configuração do Firebase (atualizada com seu projeto)
const firebaseConfig = {
    apiKey: "AIzaSyDma392hveHDF6NShluBGbmGc3FYxc7ogA",
    authDomain: "porter-ata-2026-v2.firebaseapp.com",
    projectId: "porter-ata-2026-v2",
    storageBucket: "porter-ata-2026-v2.firebasestorage.app",
    messagingSenderId: "474353492973",
    appId: "1:474353492973:web:a0409eeabf13cb201ffde4"
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
        
        console.log('🔧 Configurando listener em tempo real para OS...');
        
        // Listener para ordens de serviço
        window.db.collection('ordens_servico')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    const osData = doc.data();
                    osData.firebaseId = doc.id;
                    osList.push(osData);
                });
                
                console.log('✅ OS recebidas do Firebase:', osList.length);
                
                // Atualizar localStorage com dados do Firebase
                localStorage.setItem('porter_os_firebase', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    data: osList
                }));
                
                // Se tiver OS locais, mesclar
                const osLocais = JSON.parse(localStorage.getItem('porter_os') || '[]');
                const todasOS = this.mesclarOS(osLocais, osList);
                
                // Salvar no localStorage principal
                localStorage.setItem('porter_os', JSON.stringify(todasOS));
                
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
                
            }, error => {
                console.error('❌ Erro no listener de OS do Firebase:', error);
            });
    },

    // 🔧 FIX 1: Mesclar OS locais com as do Firebase
    mesclarOS(locais, firebase) {
        const mapaUnico = new Map();
        
        // Adicionar todas do Firebase
        firebase.forEach(os => {
            mapaUnico.set(os.id, os);
        });
        
        // Adicionar locais que não estão no Firebase
        locais.forEach(os => {
            if (!mapaUnico.has(os.id)) {
                // Verificar se não é muito antiga (últimos 30 dias)
                const dataOS = new Date(os.timestamp || os.dataEnvioEmail || Date.now());
                const trintaDiasAtras = new Date();
                trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
                
                if (dataOS > trintaDiasAtras) {
                    mapaUnico.set(os.id, os);
                    // Sincronizar esta OS local com o Firebase
                    this.salvarOSNoFirebase(os);
                }
            }
        });
        
        // Converter de volta para array e ordenar
        const resultado = Array.from(mapaUnico.values());
        resultado.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.dataEnvioEmail || 0).getTime();
            const timeB = new Date(b.timestamp || b.dataEnvioEmail || 0).getTime();
            return timeB - timeA;
        });
        
        return resultado;
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
            turno: app.currentUser.turno || 'Diurno',
            cidade: app.currentUser.cidade || 'Londrina'
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
        
        console.log('🔧 Configurando monitoramento de usuários online...');
        
        window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuariosOnlineFirebase = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
                    // Verificar se não está "morto" (última atividade há mais de 2 minutos)
                    const ultimaAtividade = new Date(usuario.lastActivity);
                    const diferencaMinutos = (agora - ultimaAtividade) / (1000 * 60);
                    
                    if (diferencaMinutos < 2) { // Considerar online se ativo nos últimos 2 minutos
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

    // Sincronizar OS locais com Firebase
    sincronizarOSLocais() {
        if (!window.db) return;
        
        const osLocais = JSON.parse(localStorage.getItem('porter_os') || '[]');
        
        // Para cada OS local, verificar se existe no Firebase
        osLocais.forEach(os => {
            if (!os.firebaseId) { // Se não tem ID do Firebase, precisa sincronizar
                this.salvarOSNoFirebase(os)
                    .then(sucesso => {
                        if (sucesso) {
                            console.log('✅ OS local sincronizada:', os.id);
                        }
                    });
            }
        });
    },

    // Inicializar todos os listeners
    inicializarFirebase() {
        if (!window.db) {
            console.log('Firebase não inicializado, usando localStorage');
            return;
        }
        
        console.log('✅ Firebase inicializado com sucesso - Projeto: porter-ata-2026-v2');
        
        // 🔧 FIX 1: Configurar listener para OS
        this.configurarOSFirebase();
        
        // 🔧 FIX 2: Configurar monitoramento de status online
        this.configurarMonitoramentoOnlineFirebase();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        
        // 🔧 FIX 2: Sincronizar status online periodicamente
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 10000); // A cada 10 segundos
        
        // Sincronizar OS locais periodicamente
        setInterval(() => {
            this.sincronizarOSLocais();
        }, 15000); // A cada 15 segundos
        
        // Forçar sincronização inicial
        setTimeout(() => {
            this.sincronizarOSLocais();
        }, 2000);
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
