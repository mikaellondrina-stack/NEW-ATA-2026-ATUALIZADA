// firebase-universal.js - VERSÃO ULTRA SIMPLIFICADA
// REMOVA todo o código antigo e cole ESTE:

const firebaseConfig = {
  apiKey: "AIzaSyDma392hveHDF6NShluBGbmGc3FYxc7ogA",
  authDomain: "porter-ata-2026-v2.firebaseapp.com",
  projectId: "porter-ata-2026-v2",
  storageBucket: "porter-ata-2026-v2.firebasestorage.app",
  messagingSenderId: "474353492973",
  appId: "1:474353492973:web:a0409eeabf13cb201ffde4"
};

// 1. INICIALIZAR FIREBASE (APENAS UMA VEZ)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase Universal conectado:', firebaseConfig.projectId);
}

// 2. VARIÁVEIS GLOBAIS (simples)
window.db = firebase.firestore();

// 3. SISTEMA DE SINCRONIZAÇÃO ULTRA SIMPLES
const PorterSync = {
    
    // A) ATUALIZAR MEU STATUS
    atualizarMeuStatus: function() {
        if (!window.db || !app || !app.currentUser) return;
        
        const userData = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual ? app.getMoodAtual() : '😐',
            lastActivity: new Date().toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno',
            timestamp: Date.now()
        };
        
        window.db.collection('online_users')
            .doc(app.currentUser.user)
            .set(userData, { merge: true })
            .then(() => {
                console.log('✅ Status atualizado:', app.currentUser.nome);
            })
            .catch(error => {
                console.error('❌ Erro Firebase:', error.message);
            });
    },
    
    // B) OUVIR TODOS OS USUÁRIOS (EM TEMPO REAL)
    iniciarEscuta: function() {
        if (!window.db) return;
        
        console.log('👂 Iniciando escuta de usuários...');
        
        // ESCUTAR MUDANÇAS EM TEMPO REAL
        window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuarios = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const ultimaAtividade = new Date(data.lastActivity);
                    const minutos = (agora - ultimaAtividade) / (1000 * 60);
                    
                    if (minutos < 5) { // Ativo nos últimos 5 minutos
                        usuarios.push({
                            ...data,
                            id: doc.id,
                            isCurrentUser: data.user === (app?.currentUser?.user || '')
                        });
                    }
                });
                
                console.log(`👥 ${usuarios.length} usuários online`);
                
                // 1. SALVAR NO LOCALSTORAGE
                localStorage.setItem('porter_usuarios_online', JSON.stringify({
                    timestamp: agora.toISOString(),
                    users: usuarios
                }));
                
                // 2. ATUALIZAR APP.JS
                if (typeof app !== 'undefined') {
                    app.atualizarListaOnline(usuarios);
                }
                
            }, error => {
                console.error('❌ Erro na escuta:', error);
            });
    },
    
    // C) TESTE DE CONEXÃO
    testarConexao: function() {
        if (!window.db) return;
        
        window.db.collection('teste_sincronia').doc('ping').set({
            timestamp: new Date().toISOString(),
            user: app?.currentUser?.user || 'teste'
        }).then(() => {
            console.log('📡 Ping enviado ao Firebase');
        });
    }
};

// 4. INICIALIZAR AUTOMATICAMENTE
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        PorterSync.iniciarEscuta();
        PorterSync.testarConexao();
        console.log('🚀 PorterSync inicializado');
        
        // Atualizar status a cada 40 segundos
        setInterval(() => {
            if (app && app.currentUser) {
                PorterSync.atualizarMeuStatus();
            }
        }, 40000);
    }, 2000);
});

// 5. EXPORTAR GLOBALMENTE
window.PorterSync = PorterSync;
