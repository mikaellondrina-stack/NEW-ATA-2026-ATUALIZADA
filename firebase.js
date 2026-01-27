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
    // CORREÇÃO: Flag para controlar se o Firebase está pronto
    firebaseReady: false,
    
    // CORREÇÃO: Função para verificar se Firebase está pronto
    isFirebaseReady() {
        return this.firebaseReady && window.db;
    },

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

    // Configurar listener em tempo real para OS
    configurarOSFirebase() {
        if (!window.db) {
            console.log('Firebase não disponível para OS');
            return;
        }
        
        // Listener para ordens de serviço
        window.db.collection('ordens_servico')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot(snapshot => {
                const osList = [];
                snapshot.forEach(doc => {
                    osList.push(doc.data());
                });
                
                // Atualizar localStorage com dados do Firebase
                localStorage.setItem('porter_os', JSON.stringify(osList));
                
                // Atualizar interface se estiver na aba de OS
                if (document.getElementById('tab-os') && 
                    !document.getElementById('tab-os').classList.contains('hidden')) {
                    if (typeof app !== 'undefined' && app.renderOS) {
                        app.renderOS();
                    }
                }
                
                // Atualizar contagem de OS
                if (typeof app !== 'undefined' && app.updateTabCounts) {
                    app.updateTabCounts();
                }
                
                console.log('✅ OS sincronizadas do Firebase:', osList.length);
            }, error => {
                console.error('Erro no listener de OS do Firebase:', error);
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
        
        console.log('✅ Dados sincronizados com Firebase');
    },

    // Sincronizar status online com Firebase
    sincronizarStatusOnlineComFirebase() {
        if (!window.db || !app || !app.currentUser) return;
        
        const userData = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            mood: this.getMoodAtualDoUsuario(),
            lastActivity: new Date().toISOString(),
            online: true,
            turno: app.currentUser.turno || 'Diurno',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Salvar/atualizar no Firebase
        window.db.collection('online_users').doc(app.currentUser.user).set(userData)
            .then(() => {
                console.log('✅ Status online atualizado no Firebase:', app.currentUser.user);
            })
            .catch(error => {
                console.error('❌ Erro ao atualizar status online:', error);
            });
    },

    // Obter humor atual do usuário
    getMoodAtualDoUsuario() {
        if (!app || !app.currentUser) return 'Normal';
        
        // Tenta pegar do sistema de mood do app
        if (typeof app.getMoodAtual === 'function') {
            return app.getMoodAtual();
        }
        
        // Tenta pegar do localStorage de moods
        try {
            const hojeISO = new Date().toISOString().split('T')[0];
            const moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
            const moodHoje = moods.find(m => m.user === app.currentUser.user && m.dataISO === hojeISO);
            
            return moodHoje ? moodHoje.mood : (app.currentUser.mood || 'Normal');
        } catch (e) {
            return 'Normal';
        }
    },

    // Monitorar usuários online no Firebase
    configurarMonitoramentoOnlineFirebase() {
        if (!window.db) return;
        
        console.log('🔧 Configurando monitoramento de usuários online...');
        
        // Listener para TODOS os usuários online
        window.db.collection('online_users')
            .onSnapshot(snapshot => {
                const usuariosOnline = [];
                const agora = new Date();
                
                snapshot.forEach(doc => {
                    const usuario = doc.data();
                    
                    // Verificar se está marcado como online
                    if (usuario.online === true) {
                        // Verificar atividade recente (3 minutos)
                        if (usuario.lastActivity) {
                            const ultimaAtividade = new Date(usuario.lastActivity);
                            const diferencaSegundos = (agora - ultimaAtividade) / 1000;
                            
                            if (diferencaSegundos < 180) { // Ativo nos últimos 3 minutos
                                usuariosOnline.push(usuario);
                            } else {
                                // Limpeza automática: marcar como offline
                                window.db.collection('online_users').doc(doc.id).update({
                                    online: false
                                }).catch(() => {});
                            }
                        } else {
                            usuariosOnline.push(usuario);
                        }
                    }
                });
                
                console.log('👥 Usuários online detectados:', usuariosOnline.map(u => u.nome));
                
                // Salvar no localStorage para ser usado pela interface
                localStorage.setItem('porter_online_users', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    users: usuariosOnline
                }));
                
                // Atualizar a interface da aba "online" se estiver aberta
                this.atualizarInterfaceOnline(usuariosOnline);
                
            }, error => {
                console.error('❌ Erro no monitoramento online do Firebase:', error);
            });
    },

    // Atualizar interface da aba online
    atualizarInterfaceOnline(usuariosOnline) {
        // Verificar se estamos na aba "online"
        const tabOnline = document.getElementById('tab-online');
        if (!tabOnline || tabOnline.classList.contains('hidden')) {
            return;
        }
        
        // Atualizar contador
        const onlineCountElement = document.getElementById('online-count');
        if (onlineCountElement) {
            onlineCountElement.textContent = usuariosOnline.length;
        }
        
        // Atualizar lista de usuários
        const onlineList = document.getElementById('online-users-list');
        if (!onlineList) return;
        
        // Limpar lista atual
        onlineList.innerHTML = '';
        
        // Adicionar cada usuário
        usuariosOnline.forEach(user => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-gray-100 mb-2';
            
            // Ícone de status online
            const statusIcon = document.createElement('div');
            statusIcon.className = 'w-3 h-3 rounded-full bg-green-500 mr-3';
            
            // Informações do usuário
            const userInfo = document.createElement('div');
            userInfo.className = 'flex-1';
            
            const userName = document.createElement('span');
            userName.className = 'font-medium text-gray-800 block';
            userName.textContent = user.nome || user.user;
            
            const userDetails = document.createElement('div');
            userDetails.className = 'flex items-center text-sm text-gray-600 mt-1';
            
            const userRole = document.createElement('span');
            userRole.className = 'mr-3';
            userRole.textContent = user.role || 'Operador';
            
            const userMood = document.createElement('span');
            userMood.className = 'mr-3';
            userMood.textContent = `${this.getMoodEmoji(user.mood)} ${user.mood || 'Normal'}`;
            
            const userTurno = document.createElement('span');
            userTurno.className = 'px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded';
            userTurno.textContent = user.turno || 'Diurno';
            
            userDetails.appendChild(userRole);
            userDetails.appendChild(userMood);
            userDetails.appendChild(userTurno);
            
            userInfo.appendChild(userName);
            userInfo.appendChild(userDetails);
            
            // Indicador de atividade recente
            if (user.lastActivity) {
                const lastActive = document.createElement('div');
                lastActive.className = 'text-xs text-gray-400 mt-1';
                
                const now = new Date();
                const lastActiveDate = new Date(user.lastActivity);
                const diffMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));
                
                if (diffMinutes === 0) {
                    lastActive.textContent = 'Ativo agora';
                } else if (diffMinutes === 1) {
                    lastActive.textContent = 'Ativo há 1 minuto';
                } else if (diffMinutes < 60) {
                    lastActive.textContent = `Ativo há ${diffMinutes} minutos`;
                } else {
                    const diffHours = Math.floor(diffMinutes / 60);
                    lastActive.textContent = `Ativo há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
                }
                
                userInfo.appendChild(lastActive);
            }
            
            li.appendChild(statusIcon);
            li.appendChild(userInfo);
            
            onlineList.appendChild(li);
        });
        
        // Se não houver usuários online, mostrar mensagem
        if (usuariosOnline.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'text-center text-gray-500 p-6';
            emptyMessage.textContent = 'Nenhum usuário online no momento';
            onlineList.appendChild(emptyMessage);
        }
    },

    // Obter emoji do humor
    getMoodEmoji(mood) {
        const moodEmojis = {
            'Feliz': '😊',
            'Normal': '😐',
            'Triste': '😔',
            'Estressado': '😫',
            'Animado': '😄',
            'Cansado': '😴',
            'Concentrado': '🧠',
            'default': '👤'
        };
        return moodEmojis[mood] || moodEmojis.default;
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
                    if (typeof chatSystem !== 'undefined' && chatSystem.loadChat) {
                        chatSystem.loadChat();
                    }
                }
                
                // Atualizar badge
                if (typeof app !== 'undefined' && app.atualizarBadgeChat) {
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

    // Marcar usuário como offline ao sair
    marcarUsuarioOffline() {
        if (!window.db || !app || !app.currentUser) return;
        
        window.db.collection('online_users').doc(app.currentUser.user).update({
            online: false,
            lastActivity: new Date().toISOString()
        }).then(() => {
            console.log('✅ Usuário marcado como offline:', app.currentUser.user);
        }).catch(error => {
            console.error('❌ Erro ao marcar usuário como offline:', error);
        });
    },

    // Inicializar todos os listeners
    inicializarFirebase() {
        if (!window.db) {
            console.log('Firebase não inicializado, usando localStorage');
            // CORREÇÃO: Mesmo sem Firebase, marca como pronto para não mostrar alerta
            this.firebaseReady = true;
            return;
        }
        
        console.log('✅ Firebase inicializado com sucesso');
        
        // Configurar listener para OS
        this.configurarOSFirebase();
        
        // Configurar monitoramento de status online
        this.configurarMonitoramentoOnlineFirebase();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        
        // CORREÇÃO: Marcar Firebase como pronto após 1 segundo
        setTimeout(() => {
            this.firebaseReady = true;
            console.log('✅ Firebase marcado como pronto');
        }, 1000);
        
        // Sincronizar status online periodicamente (a cada 10 segundos)
        setInterval(() => {
            if (app && app.currentUser) {
                this.sincronizarStatusOnlineComFirebase();
            }
        }, 10000);
        
        // Sincronizar dados periodicamente
        setInterval(() => {
            this.sincronizarDados();
        }, 30000);
        
        // Configurar para marcar como offline quando a página for fechada
        window.addEventListener('beforeunload', () => {
            this.marcarUsuarioOffline();
        });
        
        // Inicializar status online do usuário atual
        if (app && app.currentUser) {
            setTimeout(() => {
                this.sincronizarStatusOnlineComFirebase();
            }, 1000);
        }
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

// CORREÇÃO: Adicionar função global para verificar se Firebase está pronto
window.isFirebaseReady = function() {
    return firebaseHelper.isFirebaseReady();
};
