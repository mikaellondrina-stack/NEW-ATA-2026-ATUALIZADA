// firebase-universal.js - VERSÃO DEFINITIVA
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
    console.log('🌐 Firebase Universal inicializado');
}

window.db = firebase.firestore();

// 🔥 SISTEMA UNIVERSAL DE SINCRONIZAÇÃO
const PorterUniversal = {
    listener: null,
    
    // 1. INICIAR SINCRONIZAÇÃO EM TEMPO REAL
    iniciar: function() {
        if (!window.db) {
            console.error('❌ Firebase não disponível');
            return;
        }
        
        console.log('🔄 Iniciando sincronização universal...');
        
        // Parar listener anterior
        if (this.listener) {
            this.listener();
        }
        
        // 🔥 LISTENER EM TEMPO REAL
        this.listener = window.db.collection('online_users')
            .where('online', '==', true)
            .onSnapshot(snapshot => {
                const usuarios = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const ultimaAtividade = new Date(data.lastActivity);
                    const segundosInativo = (agora - ultimaAtividade) / 1000;
                    
                    // Apenas ativos (últimos 2 minutos)
                    if (segundosInativo < 120) {
                        usuarios.push({
                            ...data,
                            id: doc.id,
                            isCurrentUser: data.user === (app?.currentUser?.user || '')
                        });
                    }
                });
                
                console.log(`👥 ${usuarios.length} usuários sincronizados`);
                
                // Salvar no localStorage para app.js
                localStorage.setItem('porter_universal', JSON.stringify({
                    timestamp: agora.toISOString(),
                    users: usuarios
                }));
                
                // Atualizar interface
                this.atualizarApp(usuarios);
                
            }, error => {
                console.error('❌ Erro na sincronização:', error);
            });
    },
    
    // 2. ATUALIZAR MEU STATUS
    atualizarStatus: function() {
        if (!window.db || !app || !app.currentUser) return;
        
        const userData = {
            user: app.currentUser.user,
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
        
        // 🔥 ID ESPECÍFICO + MERGE
        window.db.collection('online_users')
            .doc(app.currentUser.user)
            .set(userData, { merge: true })
            .then(() => {
                console.log('✅ Status universal atualizado');
            })
            .catch(error => {
                console.error('❌ Erro:', error.message);
            });
    },
    
    // 3. ATUALIZAR APP.JS
    atualizarApp: function(usuarios) {
        if (typeof app === 'undefined') return;
        
        // Atualizar lista no app
        app.onlineUsers = usuarios;
        
        // Atualizar contador
        const onlineCount = document.getElementById('online-count');
        if (onlineCount) {
            onlineCount.textContent = usuarios.length;
            onlineCount.style.color = usuarios.length > 1 ? '#2ecc71' : '#f39c12';
        }
        
        // Atualizar lista dropdown se visível
        const onlineList = document.getElementById('online-users-list');
        if (onlineList && onlineList.style.display === 'block') {
            app.renderOnlineUsersList();
        }
        
        // Atualizar chat privado
        if (app.loadPrivateChatUsers) {
            app.loadPrivateChatUsers();
        }
    },
    
    // 4. CONFIGURAR ATUALIZAÇÃO AUTOMÁTICA
    configurarAutoUpdate: function() {
        // Atualizar status a cada 30 segundos
        setInterval(() => {
            if (app && app.currentUser) {
                this.atualizarStatus();
            }
        }, 30000);
        
        // Primeira atualização
        setTimeout(() => {
            if (app && app.currentUser) {
                this.atualizarStatus();
            }
        }, 2000);
    }
};

// INICIALIZAÇÃO AUTOMÁTICA
setTimeout(() => {
    PorterUniversal.iniciar();
    PorterUniversal.configurarAutoUpdate();
    console.log('✅ Sistema universal pronto!');
}, 3000);

// EXPORTAR
window.PorterUniversal = PorterUniversal;
