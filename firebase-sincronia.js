// firebase-sincronia.js - SISTEMA UNIVERSAL
const firebaseConfig = {
  apiKey: "AIzaSyDma392hveHDF6NShluBGbmGc3FYxc7ogA",
  authDomain: "porter-ata-2026-v2.firebaseapp.com",
  projectId: "porter-ata-2026-v2",
  storageBucket: "porter-ata-2026-v2.firebasestorage.app",
  messagingSenderId: "474353492973",
  appId: "1:474353492973:web:a0409eeabf13cb201ffde4"
};

// INICIALIZAR
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

window.db = firebase.firestore();

// 🔥 SISTEMA DE SINCRONIZAÇÃO
const SincroniaPorter = {
    listenerAtivo: null,
    
    // 1. INICIAR LISTENER PARA USUÁRIOS ONLINE
    iniciarSincronia: function() {
        if (!window.db) {
            console.error('❌ Firebase não disponível');
            return;
        }
        
        console.log('🌐 Iniciando sincronia universal...');
        
        // PARAR listener anterior se existir
        if (this.listenerAtivo) {
            this.listenerAtivo();
        }
        
        // 🔥 LISTENER EM TEMPO REAL para online_users
        this.listenerAtivo = window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuarios = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const ultimaAtividade = new Date(data.lastActivity);
                    const segundosInativo = (agora - ultimaAtividade) / 1000;
                    
                    // Apenas usuários ativos (últimos 2 minutos)
                    if (segundosInativo < 120) {
                        usuarios.push({
                            ...data,
                            id: doc.id,
                            isCurrentUser: data.user === (app?.currentUser?.user || '')
                        });
                    }
                });
                
                console.log(`👥 Sincronizado: ${usuarios.length} usuários`);
                
                // SALVAR NO LOCALSTORAGE (para app.js usar)
                localStorage.setItem('porter_online_universal', JSON.stringify({
                    timestamp: agora.toISOString(),
                    users: usuarios
                }));
                
                // ATUALIZAR INTERFACE IMEDIATAMENTE
                this.atualizarInterface(usuarios);
                
            }, error => {
                console.error('❌ Erro na sincronia:', error);
            });
    },
    
    // 2. ATUALIZAR MEU STATUS
    atualizarMeuStatus: function() {
        if (!window.db || !app || !app.currentUser) return;
        
        const userData = {
            user: app.currentUser.user, // ⚠️ ID ESPECÍFICO
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: app.getMoodAtual ? app.getMoodAtual() : '😐',
            lastActivity: new Date().toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno',
            timestamp: Date.now(),
            loginDate: app.currentUser.loginDate,
            loginHour: app.currentUser.loginHour
        };
        
        // 🔥 USAR .doc() com ID específico + merge: true
        window.db.collection('online_users')
            .doc(app.currentUser.user)
            .set(userData, { merge: true })
            .then(() => {
                console.log('✅ Status sincronizado com todas as máquinas');
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar:', error);
            });
    },
    
    // 3. ATUALIZAR INTERFACE
    atualizarInterface: function(usuarios) {
        // Atualizar app.onlineUsers
        if (typeof app !== 'undefined') {
            app.onlineUsers = usuarios;
            
            // Atualizar contador
            const onlineCount = document.getElementById('online-count');
            if (onlineCount) {
                onlineCount.textContent = usuarios.length;
                onlineCount.style.color = usuarios.length > 1 ? '#2ecc71' : '#f39c12';
            }
            
            // Atualizar lista se visível
            const onlineList = document.getElementById('online-users-list');
            if (onlineList && onlineList.style.display === 'block') {
                app.renderOnlineUsersList();
            }
        }
    },
    
    // 4. TESTAR SINCRONIA
    testarSincronia: function() {
        if (!window.db) return;
        
        window.db.collection('sincronia_teste').doc('ping').set({
            timestamp: new Date().toISOString(),
            user: app?.currentUser?.user || 'teste',
            url: window.location.href
        });
        
        // Verificar outros pings
        setTimeout(() => {
            window.db.collection('sincronia_teste').get()
                .then(snapshot => {
                    console.log(`📡 ${snapshot.size} máquinas conectadas:`);
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const tempo = Math.floor((Date.now() - new Date(data.timestamp).getTime()) / 1000);
                        console.log(`   🖥️ ${data.user} - ${tempo}s atrás`);
                    });
                });
        }, 2000);
    }
};

// INICIALIZAR
setTimeout(() => {
    SincroniaPorter.iniciarSincronia();
    SincroniaPorter.testarSincronia();
    
    // Atualizar status a cada 30 segundos
    setInterval(() => {
        if (app && app.currentUser) {
            SincroniaPorter.atualizarMeuStatus();
        }
    }, 30000);
    
    console.log('✅ Sincronia Porter inicializada!');
}, 3000);

// EXPORTAR
window.SincroniaPorter = SincroniaPorter;
