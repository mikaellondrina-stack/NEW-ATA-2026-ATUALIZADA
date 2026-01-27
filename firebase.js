// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyARRqLJJFdaHpcmUtrSStqmx90ZYm8ERe8",
    authDomain: "ata-porter-2026-new-98c61.firebaseapp.com",
    projectId: "ata-porter-2026-new-98c61",
    storageBucket: "ata-porter-2026-new-98c61.firebasestorage.app",
    messagingSenderId: "196023937983",
    appId: "1:196023937983:web:090b010284141d2edecf0a"
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
firebase.initializeApp(firebaseConfig);
}

// LINHA NOVA (mais ou menos linha 20)
window.rtdb = firebase.database();

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
// Salvar uma ata no Firebase
salvarAtaNoFirebase(ata) {
if (!window.db) {
console.log('Firebase não está disponível');
return Promise.resolve(false);
}

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
// Buscar atas do Firebase
buscarAtasDoFirebase(filtros = {}) {
if (!window.db) {
console.log('Firebase não está disponível');
return Promise.resolve([]);
}

    // Buscar OS do Firebase
    buscarOSDoFirebase(filtros = {}) {
         (!window.db) {
            console.log('Firebase não está disponível');
            return Promise.resolve([]);
        }
        
        let query = window.db.collection('ordens_servico').orderBy('timestamp', 'desc');
        
         (filtros.condo) {
            query = query.where('condo', '==', filtros.condo);
        }
        
         (filtros.gravidade) {
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
let query = window.db.collection('atas').orderBy('timestamp', 'desc');

    // Sincronizar dados locais com Firebase
    sincronizarDados() {
         (!window.db) {
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
             (!mensagem.firebaseId) {
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

// 🔧 FIX 3: Nova função para sincronizar status online com Firebase
sincronizarStatusOnlineComFirebase() {
         (!window.db || !app.currentUser) return;
        if (!window.db || !app.currentUser) return;

const statusOnline = {
user: app.currentUser.user,
@@ -192,34 +189,34 @@ const firebaseHelper = {

// 🔧 FIX 3: Nova função para monitorar usuários online no Firebase
configurarMonitoramentoOnlineFirebase() {
         (!window.db) return;
        if (!window.db) return;

window.db.collection('online_users')
.where('online', '==', true)
.onSnapshot(snapshot => {
const usuariosOnlineFirebase = [];
snapshot.forEach(doc => {
const usuario = doc.data();
                    // Vericar se não está "morto" (última atividade há mais de 3 minutos)
                    // Verificar se não está "morto" (última atividade há mais de 3 minutos)
const ultimaAtividade = new Date(usuario.lastActivity);
const agora = new Date();
                    const derencaMinutos = (agora - ultimaAtividade) / (1000 * 60);
                    const diferencaMinutos = (agora - ultimaAtividade) / (1000 * 60);

                     (derencaMinutos < 3) { // Considerar online se ativo nos últimos 3 minutos
                    if (diferencaMinutos < 3) { // Considerar online se ativo nos últimos 3 minutos
usuariosOnlineFirebase.push(usuario);
}
});

// Atualizar lista local
                 (typeof app !== 'undefined') {
                if (typeof app !== 'undefined') {
// Salvar no localStorage para o app.js usar
                    localStorage.setItem('porter_online_firebase', JSON.stringy({
                    localStorage.setItem('porter_online_firebase', JSON.stringify({
timestamp: new Date().toISOString(),
users: usuariosOnlineFirebase
}));

// Forçar atualização da lista de online
                     (app.currentUser) {
                    if (app.currentUser) {
app.updateOnlineUsers();
}
}
@@ -228,77 +225,78 @@ const firebaseHelper = {
});
},

    // Configurar listener em tempo real para chat
    configurarChatTempoReal() {
         (!window.db) return;
        
        window.db.collection('chat')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const mensagens = [];
                snapshot.forEach(doc => {
                    mensagens.push({ ...doc.data(), firebaseId: doc.id });
                });
                
                // Atualizar localStorage
                localStorage.setItem('porter_chat', JSON.stringy(mensagens));
                
                // Atualizar interface se estiver na aba de chat
                 (document.getElementById('tab-chat') && 
                    !document.getElementById('tab-chat').classList.contains('hidden')) {
                     (typeof chatSystem !== 'undefined') {
                        chatSystem.loadChat();
                    }
                }
                
                // Atualizar badge
                 (typeof app !== 'undefined') {
                    app.atualizarBadgeChat();
                }
            }, error => {
                console.error('Erro no listener do chat:', error);
            });
    },
// Configurar listener em tempo real para chat
configurarChatTempoReal() {
if (!window.db) return;

    // Configurar listener em tempo real para noticações
    configurarNoticacoesTempoReal() {
         (!window.db) return;
        
        window.db.collection('noticacoes')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const noticacoes = [];
                snapshot.forEach(doc => {
                    noticacoes.push(doc.data());
                });
                
                // Atualizar localStorage
                localStorage.setItem('porter_noticacoes', JSON.stringy(noticacoes));
                
                // Atualizar interface
                if (typeof app !== 'undefined') {
                    app.loadNotifications();
                    app.updateNotificationBadges();
                }
            }, error => {
                console.error('Erro no listener de notificações:', error);
            });
    },
window.db.collection('chat')
.orderBy('timestamp', 'desc')
.limit(50)
.onSnapshot(snapshot => {
const mensagens = [];
snapshot.forEach(doc => {
mensagens.push({ ...doc.data(), firebaseId: doc.id });
});

    // Inicializar todos os listeners
    inicializarFirebase() {
        if (!window.db) {
            console.log('Firebase não inicializado, usando localStorage');
            return;
        }
        
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
console.log('✅ Firebase inicializado com sucesso');
        
        // Sincronizar dados iniciais
        this.sincronizarDados();
        

// Sincronizar dados iniciais
this.sincronizarDados();

// 🔧 FIX 3: Configurar monitoramento de status online
this.configurarMonitoramentoOnlineFirebase();

@@ -309,22 +307,22 @@ const firebaseHelper = {
}
}, 10000); // A cada 10 segundos

        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        
        // Sincronizar periodicamente
        setInterval(() => {
            this.sincronizarDados();
        }, 30000); // Sincronizar a cada 30 segundos
    }
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
document.addEventListener('DOMContentLoaded', () => {
firebaseHelper.inicializarFirebase();
});
} else {
    firebaseHelper.inicializarFirebase();
firebaseHelper.inicializarFirebase();
}
