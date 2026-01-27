// firebase-optimized.js - VERSÃO OTIMIZADA PARA EVITAR QUOTA

const firebaseConfig = {
    apiKey: "AIzaSyARRqLJJFdaHpcmUtrSStqmx90ZYm8ERe8",
    authDomain: "ata-porter-2026-new-98c61.firebaseapp.com",
    projectId: "ata-porter-2026-new-98c61",
    storageBucket: "ata-porter-2026-new-98c61.firebasestorage.app",
    messagingSenderId: "196023937983",
    appId: "1:196023937983:web:090b010284141d2edecf0a"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

window.db = firebase.firestore();
window.auth = firebase.auth();

// 🔥 SISTEMA OTIMIZADO PARA EVITAR QUOTA
const FirebaseOptimized = {
    // CONTADORES para limitar uso
    counters: {
        reads: 0,
        writes: 0,
        lastReset: Date.now()
    },
    
    // CONFIGURAÇÕES de limite (ajuste conforme necessidade)
    limits: {
        maxReadsPerMinute: 30,      // Máximo 30 leituras por minuto
        maxWritesPerMinute: 20,      // Máximo 20 escritas por minuto
        cacheTime: 30000,            // Cache de 30 segundos
        updateInterval: 60000        // Atualizar a cada 60 segundos
    },
    
    // CACHE para reduzir leituras
    cache: {
        onlineUsers: null,
        onlineUsersTimestamp: 0,
        chat: null,
        chatTimestamp: 0
    },
    
    // 🔥 FUNÇÃO PRINCIPAL: Atualizar status online com QUOTA CONTROL
    sincronizarStatusOnline: function() {
        if (!window.db || !app || !app.currentUser) return;
        
        // Verificar se pode escrever (limite de quota)
        if (!this.canWrite()) {
            console.log('⚠️ Limite de escrita atingido, usando cache');
            this.useLocalBackup();
            return;
        }
        
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
        
        // CONTAR escrita
        this.counters.writes++;
        
        // Usar set com merge para 1 operação em vez de 2
        window.db.collection('online_users').doc(app.currentUser.user)
            .set(userData, { merge: true })
            .then(() => {
                console.log('✅ Status online (otimizado)');
                this.saveLocalBackup(userData);
            })
            .catch(error => {
                console.error('❌ Erro (usando local):', error.message);
                this.useLocalBackup();
            });
    },
    
    // 🔥 FUNÇÃO: Buscar usuários online com CACHE
    buscarUsuariosOnline: function() {
        return new Promise((resolve) => {
            // 1. Tentar CACHE primeiro (30 segundos)
            const agora = Date.now();
            if (this.cache.onlineUsers && 
                (agora - this.cache.onlineUsersTimestamp < this.limits.cacheTime)) {
                console.log('📦 Usando cache de usuários online');
                resolve(this.cache.onlineUsers);
                return;
            }
            
            // 2. Verificar se pode LER (limite de quota)
            if (!this.canRead()) {
                console.log('⚠️ Limite de leitura, usando cache antigo');
                resolve(this.cache.onlineUsers || []);
                return;
            }
            
            // 3. Buscar do Firebase (com LIMITE)
            if (!window.db) {
                resolve([]);
                return;
            }
            
            // CONTAR leitura
            this.counters.reads++;
            
            window.db.collection('online_users')
                .where('online', '==', true)
                .limit(10) // 🔥 LIMITAR a 10 usuários apenas!
                .get()
                .then(snapshot => {
                    const usuarios = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        // Filtrar apenas ativos (últimos 5 minutos)
                        const lastActive = new Date(data.lastActivity);
                        if ((agora - lastActive.getTime()) < 300000) {
                            usuarios.push(data);
                        }
                    });
                    
                    // Salvar no CACHE
                    this.cache.onlineUsers = usuarios;
                    this.cache.onlineUsersTimestamp = agora;
                    
                    // Salvar backup local
                    localStorage.setItem('porter_online_cache', JSON.stringify({
                        users: usuarios,
                        timestamp: agora
                    }));
                    
                    resolve(usuarios);
                })
                .catch(error => {
                    console.error('❌ Erro ao buscar (usando local):', error.message);
                    // Tentar backup local
                    try {
                        const backup = JSON.parse(localStorage.getItem('porter_online_cache') || '{}');
                        resolve(backup.users || []);
                    } catch {
                        resolve([]);
                    }
                });
        });
    },
    
    // 🔥 VERIFICAR limites de quota
    canRead: function() {
        const agora = Date.now();
        const umMinuto = 60000;
        
        // Resetar contadores se passou 1 minuto
        if (agora - this.counters.lastReset > umMinuto) {
            this.counters.reads = 0;
            this.counters.writes = 0;
            this.counters.lastReset = agora;
            console.log('🔄 Contadores de quota resetados');
        }
        
        return this.counters.reads < this.limits.maxReadsPerMinute;
    },
    
    canWrite: function() {
        const agora = Date.now();
        const umMinuto = 60000;
        
        if (agora - this.counters.lastReset > umMinuto) {
            this.counters.reads = 0;
            this.counters.writes = 0;
            this.counters.lastReset = agora;
        }
        
        return this.counters.writes < this.limits.maxWritesPerMinute;
    },
    
    // 🔥 BACKUP LOCAL para quando Firebase falhar
    saveLocalBackup: function(userData) {
        const backup = JSON.parse(localStorage.getItem('porter_online_backup') || '{"users":[]}');
        
        // Adicionar/atualizar usuário
        const index = backup.users.findIndex(u => u.user === userData.user);
        if (index !== -1) {
            backup.users[index] = userData;
        } else {
            backup.users.push(userData);
        }
        
        // Manter só últimos 20 usuários
        if (backup.users.length > 20) {
            backup.users = backup.users.slice(-20);
        }
        
        backup.timestamp = Date.now();
        localStorage.setItem('porter_online_backup', JSON.stringify(backup));
    },
    
    useLocalBackup: function() {
        try {
            const backup = JSON.parse(localStorage.getItem('porter_online_backup') || '{"users":[]}');
            const agora = Date.now();
            
            // Filtrar usuários ativos (últimos 5 minutos)
            const usuariosAtivos = backup.users.filter(user => {
                const lastActive = new Date(user.lastActivity).getTime();
                return (agora - lastActive) < 300000; // 5 minutos
            });
            
            return usuariosAtivos;
        } catch {
            return [];
        }
    },
    
    // 🔥 LIMPEZA AUTOMÁTICA no Firebase (evita dados antigos)
    limpezaAutomatica: function() {
        if (!window.db) return;
        
        // Executar apenas 1 vez por hora para economizar quota
        const ultimaLimpeza = localStorage.getItem('porter_last_cleanup') || 0;
        const agora = Date.now();
        
        if (agora - ultimaLimpeza < 3600000) { // 1 hora
            return;
        }
        
        // Marcar como offline usuários inativos (> 1 hora)
        const umaHoraAtras = new Date(agora - 3600000);
        
        window.db.collection('online_users')
            .where('lastActivity', '<', umaHoraAtras.toISOString())
            .where('online', '==', true)
            .limit(5) // 🔥 LIMITAR a 5 para economizar quota!
            .get()
            .then(snapshot => {
                const batch = window.db.batch();
                snapshot.forEach(doc => {
                    batch.update(doc.ref, { online: false });
                });
                return batch.commit();
            })
            .then(() => {
                localStorage.setItem('porter_last_cleanup', agora.toString());
                console.log('🧹 Limpeza automática realizada');
            })
            .catch(() => {
                // Ignorar erros silenciosamente
            });
    },
    
    // 🔥 INICIALIZAR SISTEMA OTIMIZADO
    init: function() {
        console.log('🔥 Firebase Optimized inicializado');
        
        // Configurar atualização periódica (60 segundos)
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnline();
            }
        }, this.limits.updateInterval);
        
        // Limpeza automática a cada hora
        setInterval(() => {
            this.limpezaAutomatica();
        }, 3600000); // 1 hora
        
        // Primeira execução após 5 segundos
        setTimeout(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnline();
            }
        }, 5000);
    }
};

// Inicializar quando documento carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => FirebaseOptimized.init(), 3000);
    });
} else {
    setTimeout(() => FirebaseOptimized.init(), 3000);
}

// 🔥 EXPORTAR para uso global
window.FirebaseOptimized = FirebaseOptimized;
