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
        
        // Sincronizar chat
        const chatLocal = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chatLocal.forEach(mensagem => {
            if (!mensagem.firebaseId) {
                window.db.collection('chat').add(mensagem)
                    .then(docRef => {
                        console.log('Mensagem sincronizada com Firebase:', docRef.id);
                    })
                    .catch(error => {
                        console.error('Erro ao sincronizar mensagem:', error);
                    });
            }
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
                    if (typeof chatSystem !== 'undefined') {
                        chatSystem.loadChat();
                    }
                }
                
                // Atualizar badge
                if (typeof app !== 'undefined') {
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
        
        console.log('Firebase inicializado com sucesso');
        
        // Sincronizar dados iniciais
        this.sincronizarDados();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        
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
