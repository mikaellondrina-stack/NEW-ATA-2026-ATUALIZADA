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

    // 🔥 SISTEMA ONLINE ESTÁVEL - Mantém usuário online
    manterUsuarioOnline() {
        if (!window.db || !window.app || !window.app.currentUser) return;
        
        const userData = {
            user: window.app.currentUser.user,
            nome: window.app.currentUser.nome,
            role: window.app.currentUser.role,
            mood: window.app.currentUser.mood || '😐',
            turno: window.app.currentUser.turno || 'Diurno',
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            online: true
        };
        
        // Usar set com merge para não sobrescrever outros campos
        window.db.collection('online_users').doc(window.app.currentUser.user)
            .set(userData, { merge: true })
            .then(() => {
                console.log('💓 Heartbeat enviado:', window.app.currentUser.user);
            })
            .catch(error => {
                console.log('⚠️ Falha no heartbeat:', error);
            });
    },

    // 🔥 SISTEMA ONLINE ESTÁVEL - Monitorar TODOS os usuários
    monitorarUsuariosOnline() {
        if (!window.db) {
            console.log('⚠️ Firebase não disponível para monitoramento');
            return;
        }
        
        console.log('👀 Iniciando monitoramento de usuários online...');
        
        // Listener QUE FUNCIONA - sem filtro where inicial
        window.db.collection('online_users').onSnapshot(
            (snapshot) => {
                const usuariosAtivos = [];
                const agora = new Date();
                
                snapshot.forEach((doc) => {
                    const usuario = doc.data();
                    
                    // Verificar se está marcado como online
                    if (usuario.online === true) {
                        // Verificar se está ativo (últimos 30 segundos)
                        if (usuario.lastActivity) {
                            const lastActivity = usuario.lastActivity.toDate 
                                ? usuario.lastActivity.toDate() 
                                : new Date(usuario.lastActivity);
                            
                            const segundosDesdeAtividade = (agora - lastActivity) / 1000;
                            
                            if (segundosDesdeAtividade < 45) { // 45 segundos de tolerância
                                usuariosAtivos.push(usuario);
                            } else {
                                // Limpeza automática - marcar como offline
                                doc.ref.update({ online: false }).catch(() => {});
                            }
                        } else {
                            // Se não tem lastActivity, inclui mesmo assim
                            usuariosAtivos.push(usuario);
                        }
                    }
                });
                
                console.log('👥 Usuários online detectados:', usuariosAtivos.length);
                
                // SALVAR NO LOCALSTORAGE (FORMATO SIMPLES)
                localStorage.setItem('online_users_firebase', JSON.stringify(usuariosAtivos));
                
                // ATUALIZAR INTERFACE IMEDIATAMENTE
                this.atualizarInterfaceOnline(usuariosAtivos);
            },
            (error) => {
                console.log('❌ Erro no monitoramento:', error);
            }
        );
    },

    // 🔥 SISTEMA ONLINE ESTÁVEL - Atualizar interface
    atualizarInterfaceOnline(usuarios) {
        // Atualizar contador PRINCIPAL
        const onlineCountElement = document.getElementById('online-count');
        if (onlineCountElement) {
            onlineCountElement.textContent = usuarios.length;
        }
        
        // Atualizar contador do DASHBOARD também
        const dashboardCount = document.getElementById('dashboard-online-count');
        if (dashboardCount) {
            dashboardCount.textContent = usuarios.length;
        }
        
        // Atualizar lista se estiver visível
        const onlineList = document.getElementById('online-users-list');
        if (!onlineList) return;
        
        // Limpar e reconstruir lista
        onlineList.innerHTML = '';
        
        if (usuarios.length === 0) {
            onlineList.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="fas fa-users-slash text-2xl mb-2"></i>
                    <p>Nenhum usuário online</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por último ativo (mais recente primeiro)
        usuarios.sort((a, b) => {
            const timeA = a.lastActivity ? (a.lastActivity.toDate ? a.lastActivity.toDate().getTime() : new Date(a.lastActivity).getTime()) : 0;
            const timeB = b.lastActivity ? (b.lastActivity.toDate ? b.lastActivity.toDate().getTime() : new Date(b.lastActivity).getTime()) : 0;
            return timeB - timeA;
        });
        
        // Adicionar cada usuário
        usuarios.forEach((user, index) => {
            const div = document.createElement('div');
            div.className = `p-3 ${index !== usuarios.length - 1 ? 'border-b' : ''} hover:bg-gray-50`;
            
            // Calcular tempo desde última atividade
            let tempoAtivo = 'Agora';
            if (user.lastActivity) {
                const lastActive = user.lastActivity.toDate ? user.lastActivity.toDate() : new Date(user.lastActivity);
                const minutos = Math.floor((new Date() - lastActive) / (1000 * 60));
                
                if (minutos === 0) tempoAtivo = 'Agora mesmo';
                else if (minutos === 1) tempoAtivo = 'Há 1 minuto';
                else if (minutos < 60) tempoAtivo = `Há ${minutos} minutos`;
                else tempoAtivo = `Há ${Math.floor(minutos/60)}h`;
            }
            
            div.innerHTML = `
                <div class="flex items-center">
                    <div class="relative">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'TÉCNICO' ? 'bg-orange-100' : 'bg-blue-100'}">
                            <i class="fas fa-user ${user.role === 'TÉCNICO' ? 'text-orange-600' : 'text-blue-600'}"></i>
                        </div>
                        <div class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.online ? 'bg-green-500' : 'bg-gray-400'}"></div>
                    </div>
                    <div class="ml-3 flex-1">
                        <div class="font-medium text-gray-800">${user.nome || user.user}</div>
                        <div class="text-sm text-gray-600">
                            ${user.role || 'Operador'} • ${user.turno || 'Diurno'}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">
                            <i class="far fa-clock"></i> ${tempoAtivo}
                        </div>
                    </div>
                    <div class="text-2xl">${user.mood || '😐'}</div>
                </div>
            `;
            
            onlineList.appendChild(div);
        });
    },

    // 🔥 SISTEMA ONLINE ESTÁVEL - Inicializar
    inicializarSistemaOnline() {
        if (!window.db) {
            console.log('⚠️ Firebase offline - online desativado');
            return;
        }
        
        console.log('🚀 Iniciando sistema online...');
        
        // A. Iniciar monitoramento de outros usuários
        this.monitorarUsuariosOnline();
        
        // B. Registrar usuário atual imediatamente
        if (window.app && window.app.currentUser) {
            setTimeout(() => this.manterUsuarioOnline(), 1000);
        }
        
        // C. Manter heartbeat a cada 10 segundos
        const heartbeatInterval = setInterval(() => {
            if (window.app && window.app.currentUser) {
                this.manterUsuarioOnline();
            } else {
                clearInterval(heartbeatInterval);
            }
        }, 10000); // 10 segundos
        
        // D. Configurar para marcar como offline ao sair
        window.addEventListener('beforeunload', () => {
            if (window.db && window.app && window.app.currentUser) {
                window.db.collection('online_users').doc(window.app.currentUser.user)
                    .update({ online: false })
                    .catch(() => {});
            }
        });
        
        console.log('✅ Sistema online inicializado');
    },

    // 🔥 Marcar usuário como offline (para logout)
    marcarUsuarioOffline() {
        if (!window.db || !window.app || !window.app.currentUser) return;
        
        window.db.collection('online_users').doc(window.app.currentUser.user)
            .update({ 
                online: false,
                lastActivity: new Date().toISOString()
            })
            .then(() => {
                console.log('✅ Usuário marcado como offline:', window.app.currentUser.user);
            })
            .catch(error => {
                console.error('❌ Erro ao marcar usuário como offline:', error);
            });
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
                    if (app.loadNotifications) app.loadNotifications();
                    if (app.updateNotificationBadges) app.updateNotificationBadges();
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
        
        console.log('✅ Firebase inicializado com sucesso');
        
        // Configurar listener para OS
        this.configurarOSFirebase();
        
        // 🔥 INICIAR SISTEMA ONLINE (IMPORTANTE!)
        this.inicializarSistemaOnline();
        
        // Configurar listeners em tempo real
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();
        
        // Sincronizar dados periodicamente
        setInterval(() => {
            this.sincronizarDados();
        }, 30000);
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

// Exportar para uso global
window.firebaseHelper = firebaseHelper;
