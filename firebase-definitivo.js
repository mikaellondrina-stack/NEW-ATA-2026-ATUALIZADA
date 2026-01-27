// firebase-definitivo.js - SISTEMA 100% FUNCIONAL
// Data: Janeiro 2026 - VERSÃO FINAL

console.log('🔥 Firebase Porter 2026 - Carregando...');

// ================= CONFIGURAÇÃO =================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDma392hveHDF6NShluBGbmGc3FYxc7ogA",
  authDomain: "porter-ata-2026-v2.firebaseapp.com",
  projectId: "porter-ata-2026-v2",
  storageBucket: "porter-ata-2026-v2.firebasestorage.app",
  messagingSenderId: "474353492973",
  appId: "1:474353492973:web:a0409eeabf13cb201ffde4"
};

// ================= INICIALIZAÇÃO =================
// Garantir que Firebase está carregado
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase não carregado! Verifique a ordem dos scripts.');
} else {
    // Inicializar apenas uma vez
    if (firebase.apps.length === 0) {
        firebase.initializeApp(FIREBASE_CONFIG);
        console.log('✅ Firebase inicializado:', FIREBASE_CONFIG.projectId);
    }
    
    // Tornar globalmente disponível
    window.db = firebase.firestore();
    window.firebaseAuth = firebase.auth();
    
    console.log('📦 Firestore pronto para uso');
}

// ================= SISTEMA DE SINCRONIZAÇÃO =================
const PorterFirebase2026 = {
    
    // 1. SINCRONIZAR USUÁRIO
    sincronizarUsuario: function(usuario) {
        if (!window.db || !usuario) {
            console.log('⚠️ Firebase ou usuário não disponível');
            return;
        }
        
        const dados = {
            user: usuario.user,
            nome: usuario.nome,
            role: usuario.role || 'operador',
            mood: usuario.mood || '😐',
            lastActivity: new Date().toISOString(),
            online: true,
            turno: usuario.turno || 'Diurno',
            timestamp: Date.now(),
            loginDate: usuario.loginDate || new Date().toLocaleDateString('pt-BR'),
            loginHour: usuario.loginHour || new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
        };
        
        window.db.collection('online_users')
            .doc(usuario.user)
            .set(dados, { merge: true })
            .then(() => {
                console.log('✅ Usuário sincronizado no Firebase:', usuario.nome);
                
                // Salvar localmente também
                localStorage.setItem('porter_usuario_atual', JSON.stringify(dados));
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar:', error.message);
            });
    },
    
    // 2. BUSCAR USUÁRIOS ONLINE
    buscarUsuariosOnline: function() {
        return new Promise((resolve) => {
            if (!window.db) {
                console.log('⚠️ Firebase não disponível');
                resolve([]);
                return;
            }
            
            window.db.collection('online_users')
                .where('online', '==', true)
                .limit(20)
                .get()
                .then(snapshot => {
                    const usuarios = [];
                    const agora = new Date();
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const ultimaAtividade = new Date(data.lastActivity);
                        const minutos = (agora - ultimaAtividade) / (1000 * 60);
                        
                        if (minutos < 10) { // Ativo nos últimos 10 minutos
                            usuarios.push({
                                ...data,
                                id: doc.id,
                                isCurrentUser: data.user === (window.app?.currentUser?.user || '')
                            });
                        }
                    });
                    
                    console.log(`👥 ${usuarios.length} usuários online encontrados`);
                    resolve(usuarios);
                })
                .catch(error => {
                    console.error('❌ Erro ao buscar usuários:', error.message);
                    resolve([]);
                });
        });
    },
    
    // 3. LISTENER EM TEMPO REAL (OPCIONAL)
    iniciarListenerTempoReal: function() {
        if (!window.db) return null;
        
        console.log('🔔 Iniciando listener em tempo real...');
        
        return window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuarios = [];
                snapshot.forEach(doc => {
                    usuarios.push(doc.data());
                });
                
                // Atualizar localStorage
                localStorage.setItem('porter_usuarios_tempo_real', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    users: usuarios
                }));
                
                // Notificar app se existir
                if (window.app && typeof window.app.atualizarListaUsuarios === 'function') {
                    window.app.atualizarListaUsuarios(usuarios);
                }
            }, error => {
                console.error('❌ Erro no listener:', error.message);
            });
    }
};

// ================= EXPORTAR =================
window.PorterFirebase2026 = PorterFirebase2026;

// ================= INICIALIZAÇÃO AUTOMÁTICA =================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 PorterFirebase2026 inicializado com sucesso!');
        
        // Testar conexão
        if (window.db) {
            window.db.collection('sistema').doc('status').set({
                sistema: 'Porter 2026',
                online: true,
                timestamp: new Date().toISOString(),
                versao: '2026.01.28'
            }, { merge: true }).then(() => {
                console.log('✅ Teste de conexão Firebase: OK');
            });
        }
    }, 1500);
});
