// Configuração do Firebase - NOVO PROJETO
const firebaseConfig = {
    apiKey: "AIzaSyCqYN7aqNo_HXVHRSTY6b9qRDMSlPCrMNg",
    authDomain: "ataporter-8a06a.firebaseapp.com",
    projectId: "ataporter-8a06a",
    storageBucket: "ataporter-8a06a.firebasestorage.app",
    messagingSenderId: "1046205675591",
    appId: "1:1046205675591:web:4731578a5d102c563e1962"
};

// Inicializa o Firebase apenas se ainda não foi inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado com novo projeto:', firebaseConfig.projectId);
}

// Disponibiliza globalmente
window.db = firebase.firestore();
window.auth = firebase.auth();

const firebaseHelper = {
    salvarOSNoFirebase(os) {
        if (!window.db) return Promise.resolve(false);
        
        return window.db.collection('ordens_servico').doc(os.id.toString()).set(os)
            .then(() => {
                console.log('✅ OS salva no Firebase:', os.id);
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao salvar OS:', error);
                return false;
            });
    },

    configurarOSFirebase() {
        if (!window.db) return;
        
        window.db.collection('ordens_servico')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    osList.push(doc.data());
                });
                
                localStorage.setItem('porter_os_firebase', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    data: osList
                }));
                
                console.log('📋 OS recebidas do Firebase:', osList.length);
            }, error => {
                console.error('❌ Erro listener OS:', error);
            });
    },

    sincronizarStatusOnlineComFirebase() {
        if (!window.db || typeof app === 'undefined' || !app.currentUser) return;
        
        const statusOnline = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual ? app.getMoodAtual() : null,
            lastActivity: new Date().toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno'
        };
        
        window.db.collection('online_users').doc(app.currentUser.user).set(statusOnline)
            .then(() => {
                console.log('✅ Status online atualizado');
            })
            .catch(error => {
                console.error('❌ Erro status online:', error);
            });
    },

    configurarMonitoramentoOnlineFirebase() {
        if (!window.db) return;
        
        window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuariosOnlineFirebase = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
                    const ultimaAtividade = new Date(usuario.lastActivity);
                    const diferencaMinutos = (agora - ultimaAtividade) / (1000 * 60);
                    
                    if (diferencaMinutos < 2) {
                        usuariosOnlineFirebase.push(usuario);
                    } else {
                        window.db.collection('online_users').doc(doc.id).update({
                            online: false
                        }).catch(() => {});
                    }
                });
                
                localStorage.setItem('porter_online_firebase', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    users: usuariosOnlineFirebase
                }));
                
                if (typeof app !== 'undefined' && app.currentUser && app.updateOnlineUsers) {
                    app.updateOnlineUsers();
                }
                
                console.log('👥 Usuários online:', usuariosOnlineFirebase.length);
            }, error => {
                console.error('❌ Erro monitoramento online:', error);
            });
    },

    inicializarFirebase() {
        if (!window.db) {
            console.log('⚠️ Firebase não inicializado');
            return;
        }
        
        console.log('✅ Firebase Helper inicializado com projeto:', firebaseConfig.projectId);
        
        this.configurarOSFirebase();
        this.configurarMonitoramentoOnlineFirebase();
        
        setInterval(() => {
            if (typeof app !== 'undefined' && app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 10000);
    }
};

// Inicializa quando o documento estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        firebaseHelper.inicializarFirebase();
    });
} else {
    firebaseHelper.inicializarFirebase();
}
