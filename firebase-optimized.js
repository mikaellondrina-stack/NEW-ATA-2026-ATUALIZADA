// ==============================================
// FIREBASE PORTER - SISTEMA OTIMIZADO
// ==============================================

// CONFIGURAÇÃO DO SEU NOVO PROJETO
const firebaseConfig = {
    apiKey: "AIzaSyDma392hveHDF6NShluBGbmGc3FYxc7ogA",
    authDomain: "porter-ata-2026-v2.firebaseapp.com",
    projectId: "porter-ata-2026-v2",
    storageBucket: "porter-ata-2026-v2.firebasestorage.app",
    messagingSenderId: "474353492973",
    appId: "1:474353492973:web:a0409eeabf13cb201ffde4"
};

// INICIALIZAR FIREBASE
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase v2 inicializado!');
}

// VARIÁVEIS GLOBAIS
window.db = firebase.firestore();
window.auth = firebase.auth();

// ==============================================
// SISTEMA DE USUÁRIOS ONLINE OTIMIZADO
// ==============================================
const PorterFirebase = {
    // CONTROLE DE QUOTA
    quota: {
        reads: 0,
        writes: 0,
        lastReset: Date.now(),
        maxReadsPerHour: 100,
        maxWritesPerHour: 50
    },
    
    // CACHE
    cache: {
        onlineUsers: [],
        lastUpdate: 0,
        duration: 30000 // 30 segundos
    },
    
    // ==============================================
    // 1. SINCRONIZAR STATUS DO USUÁRIO
    // ==============================================
    sincronizarUsuario: function() {
        if (!window.db || !app || !app.currentUser) {
            console.log('❌ Não há usuário logado');
            return;
        }
        
        const usuario = app.currentUser;
        const agora = new Date();
        
        // Dados do usuário
        const userData = {
            user: usuario.user,
            nome: usuario.nome,
            role: usuario.role,
            mood: app.getMoodAtual ? app.getMoodAtual() : '😐',
            lastActivity: agora.toISOString(),
            online: true,
            turno: usuario.turno || 'Diurno',
            timestamp: agora.getTime(),
            loginDate: usuario.loginDate || agora.toLocaleDateString('pt-BR'),
            loginHour: usuario.loginHour || agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
        };
        
        // 🔥 USAR ID ESPECÍFICO (user.user) em vez de ID aleatório
        window.db.collection('online_users')
            .doc(usuario.user) // ← ID ESPECÍFICO
            .set(userData, { merge: true }) // ← merge para atualizar
            .then(() => {
                console.log('✅ Status online atualizado:', usuario.nome);
                
                // Salvar backup local
                this.salvarBackupLocal(userData);
            })
            .catch(error => {
                console.error('❌ Erro ao sincronizar:', error.message);
                // Usar sistema local se Firebase falhar
                this.usarSistemaLocal();
            });
    },
    
    // ==============================================
    // 2. BUSCAR USUÁRIOS ONLINE
    // ==============================================
    buscarUsuariosOnline: function() {
        return new Promise((resolve) => {
            const agora = Date.now();
            
            // 1. Tentar CACHE primeiro
            if (this.cache.onlineUsers.length > 0 && 
                (agora - this.cache.lastUpdate) < this.cache.duration) {
                console.log('📦 Usando cache de usuários');
                resolve(this.cache.onlineUsers);
                return;
            }
            
            // 2. Verificar QUOTA
            if (!this.verificarQuota('read')) {
                console.log('⚠️ Limite de leitura, usando cache');
                resolve(this.cache.onlineUsers);
                return;
            }
            
            // 3. Buscar do Firebase
            if (!window.db) {
                resolve([]);
                return;
            }
            
            window.db.collection('online_users')
                .where('online', '==', true)
                .limit(15) // LIMITAR para economizar quota
                .get()
                .then(snapshot => {
                    const usuarios = [];
                    const agora = new Date();
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const ultimaAtividade = new Date(data.lastActivity);
                        const minutosInativo = (agora - ultimaAtividade) / (1000 * 60);
                        
                        // Filtrar apenas ativos (últimos 5 minutos)
                        if (minutosInativo < 5) {
                            usuarios.push({
                                ...data,
                                id: doc.id,
                                isCurrentUser: data.user === (app.currentUser ? app.currentUser.user : '')
                            });
                        }
                    });
                    
                    // Atualizar cache
                    this.cache.onlineUsers = usuarios;
                    this.cache.lastUpdate = agora.getTime();
                    
                    // Registrar quota
                    this.registrarQuota('read');
                    
                    resolve(usuarios);
                })
                .catch(error => {
                    console.error('❌ Erro ao buscar usuários:', error.message);
                    // Usar backup local
                    const backup = this.carregarBackupLocal();
                    resolve(backup);
                });
        });
    },
    
    // ==============================================
    // 3. SISTEMA DE CHAT
    // ==============================================
    enviarMensagemChat: function(mensagem, senderName, senderRole) {
        if (!window.db) return Promise.resolve(false);
        
        const mensagemData = {
            id: Date.now(),
            sender: senderName,
            senderRole: senderRole,
            senderMood: app.getMoodAtual ? app.getMoodAtual() : '😐',
            message: mensagem,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        return window.db.collection('chat_geral')
            .doc(mensagemData.id.toString())
            .set(mensagemData)
            .then(() => {
                console.log('💬 Mensagem enviada para Firebase');
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao enviar mensagem:', error);
                return false;
            });
    },
    
    buscarMensagensChat: function(limite = 50) {
        if (!window.db) return Promise.resolve([]);
        
        return window.db.collection('chat_geral')
            .orderBy('timestamp', 'desc')
            .limit(limite)
            .get()
            .then(snapshot => {
                const mensagens = [];
                snapshot.forEach(doc => {
                    mensagens.push(doc.data());
                });
                return mensagens;
            })
            .catch(() => []);
    },
    
    // ==============================================
    // 4. SISTEMA DE ORDENS DE SERVIÇO
    // ==============================================
    salvarOS: function(osData) {
        if (!window.db) return Promise.resolve(false);
        
        return window.db.collection('ordens_servico')
            .doc(osData.id.toString())
            .set(osData)
            .then(() => {
                console.log('🔧 OS salva no Firebase:', osData.osId);
                return true;
            })
            .catch(error => {
                console.error('❌ Erro ao salvar OS:', error);
                return false;
            });
    },
    
    buscarOS: function() {
        if (!window.db) return Promise.resolve([]);
        
        return window.db.collection('ordens_servico')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get()
            .then(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    osList.push(doc.data());
                });
                return osList;
            })
            .catch(() => []);
    },
    
    // ==============================================
    // 5. BACKUP LOCAL (quando Firebase falha)
    // ==============================================
    salvarBackupLocal: function(userData) {
        try {
            const backup = JSON.parse(localStorage.getItem('porter_firebase_backup') || '{"users":[]}');
            
            // Adicionar/atualizar usuário
            const index = backup.users.findIndex(u => u.user === userData.user);
            if (index !== -1) {
                backup.users[index] = userData;
            } else {
                backup.users.push(userData);
            }
            
            // Manter só últimos 30 usuários
            if (backup.users.length > 30) {
                backup.users = backup.users.slice(-30);
            }
            
            backup.lastUpdate = new Date().toISOString();
            localStorage.setItem('porter_firebase_backup', JSON.stringify(backup));
            
        } catch (e) {
            console.log('⚠️ Erro ao salvar backup local');
        }
    },
    
    carregarBackupLocal: function() {
        try {
            const backup = JSON.parse(localStorage.getItem('porter_firebase_backup') || '{"users":[]}');
            const agora = new Date();
            
            // Filtrar usuários ativos (últimos 10 minutos)
            return backup.users.filter(user => {
                if (!user.lastActivity) return false;
                const ultimaAtividade = new Date(user.lastActivity);
                const minutosInativo = (agora - ultimaAtividade) / (1000 * 60);
                return minutosInativo < 10;
            });
            
        } catch (e) {
            return [];
        }
    },
    
    usarSistemaLocal: function() {
        console.log('🔄 Usando sistema local (Firebase offline)');
        const backup = this.carregarBackupLocal();
        return backup;
    },
    
    // ==============================================
    // 6. CONTROLE DE QUOTA
    // ==============================================
    verificarQuota: function(tipo) {
        const agora = Date.now();
        const umaHora = 60 * 60 * 1000;
        
        // Resetar se passou 1 hora
        if (agora - this.quota.lastReset > umaHora) {
            this.quota.reads = 0;
            this.quota.writes = 0;
            this.quota.lastReset = agora;
            console.log('🔄 Quota resetada');
        }
        
        if (tipo === 'read') {
            return this.quota.reads < this.quota.maxReadsPerHour;
        } else {
            return this.quota.writes < this.quota.maxWritesPerHour;
        }
    },
    
    registrarQuota: function(tipo) {
        if (tipo === 'read') {
            this.quota.reads++;
        } else {
            this.quota.writes++;
        }
        
        console.log(`📊 Quota: ${this.quota.reads} reads, ${this.quota.writes} writes`);
    },
    
    // ==============================================
    // 7. LIMPEZA AUTOMÁTICA
    // ==============================================
    limparUsuariosInativos: function() {
        if (!window.db) return;
        
        // Executar apenas 1 vez por dia
        const ultimaLimpeza = localStorage.getItem('porter_ultima_limpeza') || 0;
        const agora = Date.now();
        const umDia = 24 * 60 * 60 * 1000;
        
        if (agora - ultimaLimpeza < umDia) {
            return;
        }
        
        const umaHoraAtras = new Date(agora - (60 * 60 * 1000));
        
        window.db.collection('online_users')
            .where('lastActivity', '<', umaHoraAtras.toISOString())
            .where('online', '==', true)
            .limit(10) // Limitar para economizar quota
            .get()
            .then(snapshot => {
                const batch = window.db.batch();
                snapshot.forEach(doc => {
                    batch.update(doc.ref, { online: false });
                });
                return batch.commit();
            })
            .then(() => {
                localStorage.setItem('porter_ultima_limpeza', agora.toString());
                console.log('🧹 Usuários inativos marcados como offline');
            })
            .catch(() => {
                // Ignorar erros silenciosamente
            });
    },
    
    // ==============================================
    // 8. INICIALIZAR SISTEMA
    // ==============================================
    inicializar: function() {
        console.log('🚀 Inicializando Porter Firebase...');
        
        // Testar conexão
        if (window.db) {
            window.db.collection('sistema').doc('status').set({
                inicializado: true,
                timestamp: new Date().toISOString(),
                projeto: firebaseConfig.projectId
            }).then(() => {
                console.log('✅ Firebase conectado com sucesso!');
            }).catch(error => {
                console.error('⚠️ Firebase com problemas:', error.message);
            });
        }
        
        // Configurar sincronização periódica (60 segundos)
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarUsuario();
            }
        }, 60000);
        
        // Limpeza automática a cada 6 horas
        setInterval(() => {
            this.limparUsuariosInativos();
        }, 6 * 60 * 60 * 1000);
        
        // Primeira sincronização após 3 segundos
        setTimeout(() => {
            if (app && app.currentUser) {
                this.sincronizarUsuario();
            }
        }, 3000);
        
        console.log('✅ Porter Firebase inicializado!');
    }
};

// ==============================================
// INICIALIZAR AUTOMATICAMENTE
// ==============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            PorterFirebase.inicializar();
        }, 2000);
    });
} else {
    setTimeout(() => {
        PorterFirebase.inicializar();
    }, 2000);
}

// ==============================================
// EXPORTAR PARA USO GLOBAL
// ==============================================
window.PorterFirebase = PorterFirebase;
