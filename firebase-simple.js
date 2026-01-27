// ==============================================
// firebase-simple.js - CONFIGURAÇÃO ÚNICA
// ==============================================

// ⚠️ CREDENCIAIS DO SEU PROJETO NOVO "porter-ata-2026-v2"
const firebaseConfig = {
  apiKey: "AIzaSyDma392hveHDF6NShluBGbmGc3FYxc7ogA",
  authDomain: "porter-ata-2026-v2.firebaseapp.com",
  projectId: "porter-ata-2026-v2",
  storageBucket: "porter-ata-2026-v2.firebasestorage.app",
  messagingSenderId: "474353492973",
  appId: "1:474353492973:web:a0409eeabf13cb201ffde4"
};

console.log('🚀 Inicializando Firebase...');

// Inicializar Firebase (apenas se não existir)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado! Projeto:', firebaseConfig.projectId);
} else {
    console.log('⚠️ Firebase já está inicializado');
}

// Tornar disponível globalmente
window.db = firebase.firestore();
window.auth = firebase.auth();

// ==============================================
// FUNÇÃO SIMPLES PARA USUÁRIOS ONLINE
// ==============================================
window.FirebaseSimple = {
    
    // Atualizar status do usuário atual
    atualizarMeuStatus: function() {
        if (!window.db || !app || !app.currentUser) return;
        
        const userData = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual ? app.getMoodAtual() : '😐',
            lastActivity: new Date().toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno'
        };
        
        // 🔥 USAR ID ESPECÍFICO (não aleatório)
        window.db.collection('online_users')
            .doc(app.currentUser.user) // ID = user ID
            .set(userData, { merge: true })
            .then(() => {
                console.log('✅ Status atualizado:', app.currentUser.nome);
            })
            .catch(error => {
                console.error('❌ Erro:', error.message);
            });
    },
    
    // Buscar outros usuários online
    buscarOutrosUsuarios: function() {
        return new Promise((resolve) => {
            if (!window.db) {
                resolve([]);
                return;
            }
            
            window.db.collection('online_users')
                .where('online', '==', true)
                .limit(10)
                .get()
                .then(snapshot => {
                    const usuarios = [];
                    const agora = new Date();
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        // Não incluir usuário atual
                        if (data.user !== (app.currentUser ? app.currentUser.user : '')) {
                            usuarios.push(data);
                        }
                    });
                    
                    resolve(usuarios);
                })
                .catch(() => {
                    resolve([]); // Retorna vazio se erro
                });
        });
    }
};

// ==============================================
// TESTAR CONEXÃO AO CARREGAR
// ==============================================
setTimeout(() => {
    if (window.db) {
        window.db.collection('sistema').doc('status').set({
            online: true,
            timestamp: new Date().toISOString(),
            projeto: firebaseConfig.projectId
        }, { merge: true }).then(() => {
            console.log('🔥 Conexão Firebase testada com sucesso!');
        }).catch(error => {
            console.warn('⚠️ Firebase pode ter limite:', error.message);
        });
    }
}, 3000);
