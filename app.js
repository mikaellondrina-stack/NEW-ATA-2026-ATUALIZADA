// Aplicação principal
const app = {
    currentUser: null,
    selectedMood: null,
    currentCondoFilter: '',
    notifications: [],
    lastLogoffTime: null,
    chatInterval: null,
    privateChatInterval: null,
    moodInterval: null,
    onlineInterval: null,
    onlineUsers: [],
    lastOSId: null,
    currentPrivateChatTarget: null,
    filtrosAtas: {},
    filtrosPresenca: {},

    init() {
        // Restaurar sessão
        this.restaurarSessao();
        
        if (!this.currentUser) {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('main-content').classList.add('hidden');
        } else {
            this.showApp();
        }

        // Limpar campos de login
        setTimeout(() => {
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            document.getElementById('login-turno').value = 'Diurno';
        }, 100);

        this.loadCondos();
        this.loadFiltros();
        this.loadNotifications();
        this.setupEventListeners();
        this.setupAutoSave();
        this.setupOSPreview();
        this.setupResponsive();

        // Configurar datas padrão
        const hoje = new Date();
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        
        document.getElementById('filter-data-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('filter-data-fim').value = hoje.toISOString().split('T')[0];
        document.getElementById('filter-presenca-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('filter-presenca-fim').value = hoje.toISOString().split('T')[0];
        document.getElementById('os-data').value = hoje.toISOString().split('T')[0];

        this.carregarFiltrosSalvos();

        // Configurar clique fora da lista de online
        document.addEventListener('click', (e) => {
            const onlineList = document.getElementById('online-users-list');
            const onlineDropdown = document.getElementById('online-users');
            if (onlineList && onlineList.style.display === 'block' &&
                !onlineDropdown.contains(e.target) &&
                !onlineList.contains(e.target)) {
                onlineList.style.display = 'none';
            }
        });

        // Configurar clique fora das notificações
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-bell') && !e.target.closest('.notifications-panel')) {
                document.getElementById('notifications-panel').classList.remove('show');
            }
        });
    },

    restaurarSessao() {
        try {
            const sessaoSalva = localStorage.getItem('porter_session');
            if (sessaoSalva) {
                const usuario = JSON.parse(sessaoSalva);
                const ultimaAtividade = new Date(usuario.loginTimestamp || usuario.lastActivity);
                const agora = new Date();
                const horasDesdeLogin = (agora - ultimaAtividade) / (1000 * 60 * 60);
                
                if (horasDesdeLogin < 24) {
                    this.currentUser = usuario;
                    console.log('✅ Sessão restaurada:', usuario.nome);
                    return true;
                } else {
                    localStorage.removeItem('porter_session');
                }
            }
        } catch (e) {
            console.log('❌ Erro ao restaurar sessão:', e);
        }
        return false;
    },

    setupEventListeners() {
        // Enter no login
        document.getElementById('login-pass').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        // Enter no chat
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        // Chat privado
        const privateChatSelect = document.getElementById('private-chat-target');
        if (privateChatSelect) {
            privateChatSelect.addEventListener('change', (e) => {
                this.currentPrivateChatTarget = e.target.value;
                this.loadPrivateChat();
            });
        }

        // Enter no chat privado
        document.getElementById('chat-private-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendPrivateChatMessage();
            }
        });

        // Botão online
        const onlineDropdown = document.getElementById('online-users');
        if (onlineDropdown) {
            onlineDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleOnlineUsers();
            });
        }

        // Formulário OS
        const osForm = document.getElementById('os-form-email');
        if (osForm) {
            osForm.addEventListener('submit', (e) => {
                this.abrirOSComEmail(e);
            });
        }

        window.addEventListener('pageshow', () => {
            if (this.currentUser) {
                this.updateOnlineUsers();
            }
        });
    },

    setupAutoSave() {
        setInterval(() => {
            if (this.currentUser) {
                this.salvarSessao();
            }
        }, 30000);
    },

    setupResponsive() {
        window.addEventListener('resize', () => {
            if (this.currentUser) {
                if (window.innerWidth > 1200) {
                    document.getElementById('sidebar').style.display = 'block';
                    document.getElementById('sidebar').classList.remove('show');
                } else {
                    document.getElementById('sidebar').style.display = 'none';
                }
            }
        });
    },

    setupOSPreview() {
        if (typeof appEmail !== 'undefined' && appEmail.setupOSPreview) {
            appEmail.setupOSPreview();
        }
    },

    setupOnlineTracking() {
        this.onlineInterval = setInterval(() => {
            if (this.currentUser) {
                this.updateOnlineUsers();
            }
        }, 10000);
        this.updateOnlineUsers();
    },

    getMoodStatusTexto(mood) {
        const statusMap = {
            '😠': 'Zangado',
            '😔': 'Triste',
            '😐': 'Neutro',
            '🙂': 'Feliz',
            '😄': 'Radiante'
        };
        return statusMap[mood] || 'Não avaliado';
    },

    updateOnlineUsers() {
        if (!this.currentUser) return;
        
        const agora = new Date();
        this.salvarSessao();
        
        let usuariosOnline = [];
        
        const moodAtual = this.getMoodAtual();
        usuariosOnline.push({
            ...this.currentUser,
            lastActivity: agora.toISOString(),
            mood: moodAtual,
            moodStatus: this.getMoodStatusTexto(moodAtual),
            isCurrentUser: true,
            online: true
        });
        
        // Buscar do Firebase
        try {
            const onlineData = localStorage.getItem('porter_online_firebase');
            if (onlineData) {
                const data = JSON.parse(onlineData);
                const dataTime = new Date(data.timestamp);
                const diferencaSegundos = (agora - dataTime) / 1000;
                
                if (diferencaSegundos < 10) {
                    data.users.forEach(usuario => {
                        if (usuario.user === this.currentUser.user) return;
                        
                        usuariosOnline.push({
                            nome: usuario.nome,
                            user: usuario.user,
                            role: usuario.role,
                            lastActivity: usuario.lastActivity,
                            mood: usuario.mood || '😐',
                            moodStatus: this.getMoodStatusTexto(usuario.mood || '😐'),
                            isCurrentUser: false,
                            online: true,
                            turno: usuario.turno || 'Diurno'
                        });
                    });
                }
            }
        } catch (e) {
            console.log('Erro ao buscar usuários online:', e);
        }
        
        this.onlineUsers = usuariosOnline;
        
        const onlineCount = document.getElementById('online-count');
        if (onlineCount) {
            onlineCount.textContent = this.onlineUsers.length;
        }
        
        const onlineList = document.getElementById('online-users-list');
        if (onlineList && onlineList.style.display === 'block') {
            this.renderOnlineUsersList();
        }
    },

    toggleOnlineUsers() {
        const onlineList = document.getElementById('online-users-list');
        if (onlineList.style.display === 'block') {
            onlineList.style.display = 'none';
        } else {
            this.renderOnlineUsersList();
            onlineList.style.display = 'block';
        }
    },

    renderOnlineUsersList() {
        const onlineList = document.getElementById('online-users-list');
        onlineList.innerHTML = '';
        
        if (this.onlineUsers.length === 0) {
            onlineList.innerHTML = `
                <div class="online-user-item">
                    <div class="online-user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="online-user-info">
                        <div class="online-user-name">Nenhum operador online</div>
                        <div class="online-user-role">Apenas você está conectado</div>
                    </div>
                </div>
            `;
            return;
        }
        
        this.onlineUsers.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'online-user-item';
            
            const ultimaAtividade = new Date(user.lastActivity);
            const agora = new Date();
            const diferencaMinutos = Math.floor((agora - ultimaAtividade) / (1000 * 60));
            
            userItem.innerHTML = `
                <div class="online-user-avatar" style="background: ${this.getCorPorMood(user.mood)}">
                    <i class="fas fa-user"></i>
                </div>
                <div class="online-user-info">
                    <div class="online-user-name">
                        ${user.nome.split(' ')[0]} ${user.isCurrentUser ? '(Você)' : ''}
                        ${user.role === 'ADMIN' ? ' 👑' : ''}
                        ${user.role === 'TÉCNICO' ? ' 🔧' : ''}
                    </div>
                    <div class="online-user-role">
                        ${user.turno || 'Diurno'} | ${diferencaMinutos < 1 ? 'Online agora' : `Há ${diferencaMinutos} min`}
                    </div>
                </div>
                <div class="online-status" style="background: ${diferencaMinutos < 5 ? '#2ecc71' : '#f39c12'}"></div>
            `;
            onlineList.appendChild(userItem);
        });
    },

    getCorPorMood(mood) {
        const cores = {
            '😠': '#ff7675',
            '😔': '#a8e6cf',
            '😐': '#dfe6e9',
            '🙂': '#74b9ff',
            '😄': '#55efc4'
        };
        return cores[mood] || '#e8f4fc';
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show');
    },

    registrarLogoff() {
        if (!this.currentUser) return;
        
        const logoffs = JSON.parse(localStorage.getItem('porter_logoffs') || '[]');
        const logoffData = {
            user: this.currentUser.user,
            nome: this.currentUser.nome,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR'),
            timestamp: new Date().toISOString(),
            turno: this.currentUser.turno
        };
        
        logoffs.unshift(logoffData);
        localStorage.setItem('porter_logoffs', JSON.stringify(logoffs));
        
        // Limpar intervalos
        if (this.chatInterval) clearInterval(this.chatInterval);
        if (this.privateChatInterval) clearInterval(this.privateChatInterval);
        if (this.moodInterval) clearInterval(this.moodInterval);
        if (this.onlineInterval) clearInterval(this.onlineInterval);
        
        localStorage.removeItem('porter_session');
        this.removeFromOnlineUsers();
    },

    removeFromOnlineUsers() {
        try {
            if (window.db && this.currentUser) {
                window.db.collection('online_users').doc(this.currentUser.user).update({
                    online: false,
                    lastActivity: new Date().toISOString()
                }).catch(() => {});
            }
        } catch (e) {}
    },

    salvarSessao() {
        if (!this.currentUser) return;
        
        const sessionData = {
            ...this.currentUser,
            lastActivity: new Date().toISOString(),
            mood: this.getMoodAtual()
        };
        
        localStorage.setItem('porter_session', JSON.stringify(sessionData));
        
        if (typeof firebaseHelper !== 'undefined' && firebaseHelper.sincronizarStatusOnlineComFirebase) {
            firebaseHelper.sincronizarStatusOnlineComFirebase();
        }
    },

    loadCondos() {
        const sidebarList = document.getElementById('condo-list');
        sidebarList.innerHTML = '';
        
        const ataSelect = document.getElementById('ata-condo');
        const osSelect = document.getElementById('os-condo');
        const filterSelect = document.getElementById('filter-condo');
        const reportSelect = document.getElementById('report-condo');
        
        ataSelect.innerHTML = '<option value="">Selecione um condomínio...</option>';
        osSelect.innerHTML = '<option value="">Selecione um condomínio...</option>';
        filterSelect.innerHTML = '<option value="">Todos os condomínios</option>';
        reportSelect.innerHTML = '<option value="">Todos os condomínios</option>';
        
        DATA.condominios.sort((a,b) => a.n.localeCompare(b.n)).forEach(c => {
            const condoItem = document.createElement('div');
            condoItem.className = 'condo-item';
            condoItem.dataset.condo = c.n;
            condoItem.onclick = () => this.filtrarPorCondominio(c.n);
            condoItem.innerHTML = `
                <div class="condo-name">${c.n}</div>
                <div class="condo-badge" id="badge-${c.n.replace(/\s+/g, '-')}">0</div>
            `;
            sidebarList.appendChild(condoItem);
            
            [ataSelect, osSelect, filterSelect, reportSelect].forEach(select => {
                const opt = document.createElement('option');
                opt.value = c.n;
                opt.textContent = c.n;
                select.appendChild(opt);
            });
        });
    },

    loadFiltros() {
        const filterOperador = document.getElementById('filter-presenca-operador');
        filterOperador.innerHTML = '<option value="">Todos os operadores</option>';
        
        DATA.funcionarios.sort((a,b) => a.nome.localeCompare(b.nome)).forEach(f => {
            let opt = document.createElement('option');
            opt.value = f.nome;
            opt.textContent = f.nome;
            filterOperador.appendChild(opt);
        });
    },

    carregarMoodOptions() {
        const MOOD_OPTIONS = [
            { id: 1, label: "Zangado", color: "#e74c3c", status: "😠 Zangado" },
            { id: 2, label: "Triste", color: "#e67e22", status: "😔 Triste" },
            { id: 3, label: "Neutro", color: "#f1c40f", status: "😐 Neutro" },
            { id: 4, label: "Feliz", color: "#2ecc71", status: "🙂 Feliz" },
            { id: 5, label: "Radiante", color: "#27ae60", status: "😄 Radiante" }
        ];
        
        const container = document.getElementById('mood-options');
        container.innerHTML = '';
        
        MOOD_OPTIONS.forEach(mood => {
            const moodElement = document.createElement('div');
            moodElement.className = 'mood-option';
            moodElement.dataset.id = mood.id;
            moodElement.style.color = mood.color;
            moodElement.onclick = () => this.selecionarMood(mood.id);
            
            let svgContent = '';
            switch(mood.id) {
                case 1: svgContent = `<circle cx="18" cy="18" r="3" fill="${mood.color}" /><circle cx="32" cy="18" r="3" fill="${mood.color}" /><path d="M15 35 Q25 25 35 35" stroke="${mood.color}" stroke-width="3" fill="none" />`; break;
                case 2: svgContent = `<circle cx="18" cy="18" r="3" fill="${mood.color}" /><circle cx="32" cy="18" r="3" fill="${mood.color}" /><path d="M15 32 Q25 28 35 32" stroke="${mood.color}" stroke-width="3" fill="none" />`; break;
                case 3: svgContent = `<circle cx="18" cy="18" r="3" fill="${mood.color}" /><circle cx="32" cy="18" r="3" fill="${mood.color}" /><line x1="15" y1="30" x2="35" y2="30" stroke="${mood.color}" stroke-width="3" />`; break;
                case 4: svgContent = `<circle cx="18" cy="18" r="3" fill="${mood.color}" /><circle cx="32" cy="18" r="3" fill="${mood.color}" /><path d="M15 28 Q25 33 35 28" stroke="${mood.color}" stroke-width="3" fill="none" />`; break;
                case 5: svgContent = `<circle cx="18" cy="18" r="3" fill="${mood.color}" /><circle cx="32" cy="18" r="3" fill="${mood.color}" /><path d="M12 25 Q25 40 38 25" stroke="${mood.color}" stroke-width="3" fill="none" />`; break;
            }
            
            moodElement.innerHTML = `
                <div class="mood-face" style="border-color: ${mood.color}">
                    <svg viewBox="0 0 50 50">${svgContent}</svg>
                </div>
                <div class="mood-label">${mood.label}</div>
            `;
            
            container.appendChild(moodElement);
        });
    },

    selecionarMood(moodId) {
        const MOOD_OPTIONS = [
            { id: 1, status: "😠 Zangado" },
            { id: 2, status: "😔 Triste" },
            { id: 3, status: "😐 Neutro" },
            { id: 4, status: "🙂 Feliz" },
            { id: 5, status: "😄 Radiante" }
        ];
        
        this.selectedMood = MOOD_OPTIONS.find(m => m.id === moodId);
        
        document.querySelectorAll('.mood-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        document.querySelector(`.mood-option[data-id="${moodId}"]`).classList.add('selected');
        
        document.getElementById('mood-status').innerHTML = `
            <i class="fas fa-check-circle" style="color: ${document.querySelector(`.mood-option[data-id="${moodId}"]`).style.color}"></i>
            <span>Selecionado: <strong>${this.selectedMood.status}</strong></span>
        `;
        
        document.getElementById('mood-submit-btn').disabled = false;
    },

    enviarMood() {
        if (!this.selectedMood || !this.currentUser) return;
        
        const hoje = new Date();
        const dataISO = hoje.toISOString().split('T')[0];
        
        let moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        const indexExistente = moods.findIndex(m => m.user === this.currentUser.user && m.dataISO === dataISO);
        
        const moodData = {
            user: this.currentUser.user,
            nome: this.currentUser.nome,
            moodStatus: this.selectedMood.status,
            data: hoje.toLocaleDateString('pt-BR'),
            dataISO: dataISO,
            hora: hoje.toLocaleTimeString('pt-BR'),
            turno: this.currentUser.turno,
            timestamp: hoje.toISOString()
        };
        
        if (indexExistente !== -1) {
            moods[indexExistente] = moodData;
        } else {
            moods.unshift(moodData);
        }
        
        localStorage.setItem('porter_moods', JSON.stringify(moods));
        
        const resultDiv = document.getElementById('mood-result');
        resultDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <strong>Sentimento registrado com sucesso!</strong>
            <span>${this.selectedMood.status}</span>
        `;
        resultDiv.classList.remove('hidden');
        
        document.getElementById('mood-submit-btn').disabled = true;
        
        this.updateOnlineUsers();
        this.updateUserInfo();
        
        setTimeout(() => {
            resultDiv.classList.add('hidden');
            this.verificarMoodHoje();
        }, 5000);
        
        showToast('Sentimento registrado com sucesso!', 'success');
    },

    verificarMoodHoje() {
        if (!this.currentUser) return;
        
        const hojeISO = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        const jaAvaliouHoje = moods.some(m => m.user === this.currentUser.user && m.dataISO === hojeISO);
        
        if (jaAvaliouHoje) {
            setTimeout(() => {
                const moodContainer = document.getElementById('mood-check-container');
                moodContainer.classList.add('hidden');
            }, 2000);
        }
    },

    getMoodAtual() {
        if (!this.currentUser) return '😐';
        
        const hojeISO = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        const moodHoje = moods.find(m => m.user === this.currentUser.user && m.dataISO === hojeISO);
        
        return moodHoje ? moodHoje.moodStatus.split(' ')[0] : '😐';
    },

    updateCity() {
        const condoName = document.getElementById('ata-condo').value;
        const condo = DATA.condominios.find(c => c.n === condoName);
        document.getElementById('ata-cidade').value = condo ? condo.c : "";
    },

    updateCityOS() {
        const condoName = document.getElementById('os-condo').value;
        const condo = DATA.condominios.find(c => c.n === condoName);
        document.getElementById('os-cidade').value = condo ? condo.c : "";
    },

    login() {
        const u = document.getElementById('login-user').value.trim();
        const p = document.getElementById('login-pass').value;
        const t = document.getElementById('login-turno').value;
        
        const user = DATA.funcionarios.find(f => f.user === u && f.pass === p);
        
        if (user) {
            this.currentUser = {
                ...user,
                turno: t,
                loginTime: new Date().toLocaleString('pt-BR'),
                loginTimestamp: new Date().toISOString(),
                loginDate: new Date().toLocaleDateString('pt-BR'),
                loginHour: new Date().toLocaleTimeString('pt-BR')
            };
            
            localStorage.setItem('porter_session', JSON.stringify(this.currentUser));
            
            let presencas = JSON.parse(localStorage.getItem('porter_presencas') || '[]');
            presencas.unshift({
                nome: user.nome,
                turno: t,
                data: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR'),
                timestamp: new Date().toISOString(),
                dataISO: new Date().toISOString().split('T')[0],
                tipo: 'login'
            });
            
            localStorage.setItem('porter_presencas', JSON.stringify(presencas));
            
            this.showApp();
            this.loadPrivateChatUsers();
            showToast(`Bem-vindo, ${user.nome.split(' ')[0]}!`, 'success');
        } else {
            const tecnico = DATA.tecnicos.find(t => {
                const nomeTecnico = t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
                return u === nomeTecnico && p === "Tecnico@2026";
            });
            
            if (tecnico) {
                this.currentUser = {
                    nome: tecnico.nome,
                    user: tecnico.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.'),
                    role: "TÉCNICO",
                    turno: t,
                    loginTime: new Date().toLocaleString('pt-BR'),
                    loginTimestamp: new Date().toISOString(),
                    loginDate: new Date().toLocaleDateString('pt-BR'),
                    loginHour: new Date().toLocaleTimeString('pt-BR')
                };
                
                localStorage.setItem('porter_session', JSON.stringify(this.currentUser));
                
                let presencas = JSON.parse(localStorage.getItem('porter_presencas') || '[]');
                presencas.unshift({
                    nome: tecnico.nome,
                    turno: t,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR'),
                    timestamp: new Date().toISOString(),
                    dataISO: new Date().toISOString().split('T')[0],
                    tipo: 'login'
                });
                
                localStorage.setItem('porter_presencas', JSON.stringify(presencas));
                
                this.showApp();
                this.loadPrivateChatUsers();
                showToast(`Bem-vindo, Técnico ${tecnico.nome.split(' ')[0]}!`, 'success');
            } else {
                showToast('Credenciais inválidas!', 'error');
            }
        }
    },

    showApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        
        if (window.innerWidth > 1200) {
            document.getElementById('sidebar').style.display = 'block';
        }
        
        this.updateUserInfo();
        this.carregarMoodOptions();
        
        const jaAvaliou = this.jaAvaliouHoje();
        if (!jaAvaliou) {
            document.getElementById('mood-check-container').classList.remove('hidden');
        }
        
        this.renderAll();
        this.updateNotificationBadges();
        this.salvarSessao();
        this.updateOnlineUsers();
        
        if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'TÉCNICO') {
            document.getElementById('admin-controls').style.display = 'flex';
        }
        
        this.loadChat();
        this.chatInterval = setInterval(() => this.loadChat(), 5000);
        
        this.loadPrivateChatUsers();
        this.privateChatInterval = setInterval(() => {
            if (this.currentPrivateChatTarget) {
                this.loadPrivateChat();
            }
        }, 5000);
        
        this.setupOnlineTracking();
        this.registrarVisualizacaoChat();
        
        document.getElementById('os-funcionario').value = this.currentUser.nome;
        document.getElementById('os-email').value = `${this.currentUser.user}@porter.com.br`;
    },

    updateUserInfo() {
        const userInfo = document.getElementById('user-info');
        if (this.currentUser) {
            const moodAtual = this.getMoodAtual();
            userInfo.innerHTML = `
                <div class="user-info-name">
                    <span style="font-size: 1.2rem;">${moodAtual}</span>
                    <strong>${this.currentUser.nome.split(' ')[0]}</strong>
                </div>
                <div class="user-info-time">
                    <i class="far fa-calendar"></i> ${this.currentUser.loginDate}
                    <i class="far fa-clock"></i> ${this.currentUser.loginHour}
                </div>
                <div class="user-info-role">
                    ${this.currentUser.turno} | ${this.currentUser.role}
                </div>
            `;
        }
    },

    jaAvaliouHoje() {
        if (!this.currentUser) return true;
        
        const hojeISO = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        return moods.some(m => m.user === this.currentUser.user && m.dataISO === hojeISO);
    },

    logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            this.registrarLogoff();
            
            if (this.chatInterval) clearInterval(this.chatInterval);
            if (this.privateChatInterval) clearInterval(this.privateChatInterval);
            if (this.moodInterval) clearInterval(this.moodInterval);
            if (this.onlineInterval) clearInterval(this.onlineInterval);
            
            localStorage.removeItem('porter_session');
            
            this.currentUser = null;
            
            document.getElementById('main-content').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            
            showToast('Logoff realizado com sucesso!', 'success');
        }
    },

    switchTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        document.getElementById(tabId).classList.remove('hidden');
        btn.classList.add('active');
        
        if (tabId === 'tab-chat') {
            this.loadChat();
            this.marcarChatComoVisualizado();
        }
        
        if (tabId === 'tab-chat-privado') {
            this.loadPrivateChatUsers();
        }
    },

    updateTabCounts() {
        const atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const fixas = atas.filter(a => a.tipo && a.tipo.includes('Informações Fixas'));
        const os = JSON.parse(localStorage.getItem('porter_os') || '[]');
        
        document.getElementById('tab-count-ata').textContent = atas.length;
        document.getElementById('tab-count-fixas').textContent = fixas.length;
        document.getElementById('tab-count-os').textContent = os.length;
        
        this.atualizarBadgeChat();
        this.atualizarBadgeChatPrivado();
    },

    atualizarBadgeChat() {
        const chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        const ultimaVisualizacao = localStorage.getItem('porter_chat_last_view') || '0';
        const ultimaVisualizacaoTime = parseInt(ultimaVisualizacao);
        
        const mensagensNaoVisualizadas = chat.filter(msg => {
            if (!msg.timestamp) return false;
            const msgTime = new Date(msg.timestamp).getTime();
            return msgTime > ultimaVisualizacaoTime;
        }).length;
        
        const badge = document.getElementById('chat-badge');
        if (mensagensNaoVisualizadas > 0) {
            badge.textContent = mensagensNaoVisualizadas > 99 ? '99+' : mensagensNaoVisualizadas;
            badge.style.display = 'inline-block';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
        
        return mensagensNaoVisualizadas;
    },

    atualizarBadgeChatPrivado() {
        if (!this.currentUser) return 0;
        
        const privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        let totalNaoVisualizadas = 0;
        
        Object.keys(privateChats).forEach(chatId => {
            const [user1, user2] = chatId.split('_');
            if (user1 === this.currentUser.user || user2 === this.currentUser.user) {
                const mensagens = privateChats[chatId];
                const ultimaVisualizacaoKey = `porter_chat_privado_last_view_${chatId}`;
                const ultimaVisualizacao = localStorage.getItem(ultimaVisualizacaoKey) || '0';
                const ultimaVisualizacaoTime = parseInt(ultimaVisualizacao);
                
                const mensagensNaoVisualizadas = mensagens.filter(msg => {
                    if (!msg.timestamp) return false;
                    const msgTime = new Date(msg.timestamp).getTime();
                    return msgTime > ultimaVisualizacaoTime && msg.sender !== this.currentUser.user;
                }).length;
                
                totalNaoVisualizadas += mensagensNaoVisualizadas;
            }
        });
        
        const badge = document.getElementById('chat-private-badge');
        if (totalNaoVisualizadas > 0) {
            badge.textContent = totalNaoVisualizadas > 99 ? '99+' : totalNaoVisualizadas;
            badge.style.display = 'inline-block';
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
        
        return totalNaoVisualizadas;
    },

    marcarChatComoVisualizado() {
        localStorage.setItem('porter_chat_last_view', Date.now().toString());
        this.atualizarBadgeChat();
    },

    registrarVisualizacaoChat() {
        if (!this.currentUser) return;
        
        const visualizacoes = JSON.parse(localStorage.getItem('porter_chat_views') || '{}');
        const agora = Date.now();
        
        visualizacoes[this.currentUser.user] = {
            nome: this.currentUser.nome,
            hora: new Date().toLocaleTimeString('pt-BR'),
            data: new Date().toLocaleDateString('pt-BR'),
            timestamp: agora,
            mood: this.getMoodAtual()
        };
        
        Object.keys(visualizacoes).forEach(user => {
            if (agora - visualizacoes[user].timestamp > 60 * 60 * 1000) {
                delete visualizacoes[user];
            }
        });
        
        localStorage.setItem('porter_chat_views', JSON.stringify(visualizacoes));
    },

    aplicarFiltrosAtas() {
        this.filtrosAtas = {
            condo: document.getElementById('filter-condo').value,
            dataInicio: document.getElementById('filter-data-inicio').value,
            dataFim: document.getElementById('filter-data-fim').value,
            tipo: document.getElementById('filter-tipo').value,
            status: document.getElementById('filter-status').value
        };
        
        localStorage.setItem('porter_filtros_atas', JSON.stringify(this.filtrosAtas));
        this.mostrarFiltrosAtivosAtas();
        this.renderAta();
    },

    limparFiltrosAtas() {
        const hoje = new Date();
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        
        document.getElementById('filter-condo').value = '';
        document.getElementById('filter-data-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('filter-data-fim').value = hoje.toISOString().split('T')[0];
        document.getElementById('filter-tipo').value = '';
        document.getElementById('filter-status').value = '';
        
        this.filtrosAtas = {};
        localStorage.removeItem('porter_filtros_atas');
        
        this.mostrarFiltrosAtivosAtas();
        this.renderAta();
        showToast('Filtros limpos!', 'success');
    },

    filtrarPorCondominio(condoName) {
        document.getElementById('filter-condo').value = condoName;
        this.currentCondoFilter = condoName;
        this.aplicarFiltrosAtas();
        
        document.querySelectorAll('.condo-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const condoItem = document.querySelector(`.condo-item[data-condo="${condoName}"]`);
        if (condoItem) {
            condoItem.classList.add('active');
        }
        
        if (window.innerWidth <= 1200) {
            this.toggleSidebar();
        }
    },

    aplicarFiltrosPresenca() {
        this.filtrosPresenca = {
            operador: document.getElementById('filter-presenca-operador').value,
            dataInicio: document.getElementById('filter-presenca-inicio').value,
            dataFim: document.getElementById('filter-presenca-fim').value,
            turno: document.getElementById('filter-presenca-turno').value
        };
        
        localStorage.setItem('porter_filtros_presenca', JSON.stringify(this.filtrosPresenca));
        this.renderPresenca();
    },

    limparFiltrosPresenca() {
        const hoje = new Date();
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        
        document.getElementById('filter-presenca-operador').value = '';
        document.getElementById('filter-presenca-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('filter-presenca-fim').value = hoje.toISOString().split('T')[0];
        document.getElementById('filter-presenca-turno').value = '';
        
        this.filtrosPresenca = {};
        localStorage.removeItem('porter_filtros_presenca');
        
        this.renderPresenca();
        showToast('Filtros limpos!', 'success');
    },

    carregarFiltrosSalvos() {
        const filtrosAtasSalvos = localStorage.getItem('porter_filtros_atas');
        if (filtrosAtasSalvos) {
            this.filtrosAtas = JSON.parse(filtrosAtasSalvos);
            document.getElementById('filter-condo').value = this.filtrosAtas.condo || '';
            document.getElementById('filter-data-inicio').value = this.filtrosAtas.dataInicio || '';
            document.getElementById('filter-data-fim').value = this.filtrosAtas.dataFim || '';
            document.getElementById('filter-tipo').value = this.filtrosAtas.tipo || '';
            document.getElementById('filter-status').value = this.filtrosAtas.status || '';
        }
        
        const filtrosPresencaSalvos = localStorage.getItem('porter_filtros_presenca');
        if (filtrosPresencaSalvos) {
            this.filtrosPresenca = JSON.parse(filtrosPresencaSalvos);
            document.getElementById('filter-presenca-operador').value = this.filtrosPresenca.operador || '';
            document.getElementById('filter-presenca-inicio').value = this.filtrosPresenca.dataInicio || '';
            document.getElementById('filter-presenca-fim').value = this.filtrosPresenca.dataFim || '';
            document.getElementById('filter-presenca-turno').value = this.filtrosPresenca.turno || '';
        }
    },

    mostrarFiltrosAtivosAtas() {
        const container = document.getElementById('filtros-ativos-ata');
        const filtros = [];
        
        if (this.filtrosAtas.condo) filtros.push(`Condomínio: ${this.filtrosAtas.condo}`);
        if (this.filtrosAtas.dataInicio) filtros.push(`De: ${this.formatarDataBR(this.filtrosAtas.dataInicio)}`);
        if (this.filtrosAtas.dataFim) filtros.push(`Até: ${this.formatarDataBR(this.filtrosAtas.dataFim)}`);
        if (this.filtrosAtas.tipo) filtros.push(`Tipo: ${this.filtrosAtas.tipo}`);
        if (this.filtrosAtas.status) filtros.push(`Status: ${this.filtrosAtas.status}`);
        
        if (filtros.length > 0) {
            container.innerHTML = `<strong>Filtros ativos:</strong> ${filtros.join(' | ')}`;
        } else {
            container.innerHTML = 'Nenhum filtro ativo';
        }
    },

    formatarDataBR(dataISO) {
        if (!dataISO) return '';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    },

    saveAta() {
        const condo = document.getElementById('ata-condo').value;
        const desc = document.getElementById('ata-desc').value.trim();
        const tipo = document.getElementById('ata-tipo').value;
        
        if (!condo || !desc) {
            showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        const novaAta = {
            id: Date.now(),
            condo,
            cidade: document.getElementById('ata-cidade').value,
            tipo: tipo,
            status: document.getElementById('ata-status').value,
            desc,
            operador: this.currentUser.nome,
            user: this.currentUser.user,
            turno: this.currentUser.turno,
            data: new Date().toLocaleDateString('pt-BR'),
            dataISO: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR'),
            timestamp: new Date().toISOString(),
            comentarios: [],
            fixa: tipo.includes('Informações Fixas')
        };
        
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        atas.unshift(novaAta);
        
        localStorage.setItem('porter_atas', JSON.stringify(atas));
        
        this.criarNotificacao(condo, tipo, desc);
        
        document.getElementById('ata-desc').value = "";
        document.getElementById('ata-condo').value = "";
        document.getElementById('ata-cidade').value = "";
        
        showToast('Registro salvo com sucesso!', 'success');
        this.renderAll();
        this.updateNotificationBadges();
    },

    criarNotificacao(condo, tipo, desc) {
        const notificacao = {
            id: Date.now(),
            condo,
            tipo,
            desc: desc.length > 100 ? desc.substring(0, 100) + '...' : desc,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR'),
            timestamp: new Date().toISOString(),
            lida: false
        };
        
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        notificacoes.unshift(notificacao);
        
        if (notificacoes.length > 50) notificacoes.pop();
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        if (tipo === 'Ordem de Serviço') {
            this.criarNotificacaoChat(`Nova OS criada em ${condo}`);
        }
        
        this.loadNotifications();
        updateCondoBadges(); // Atualizar badges dos condomínios
    },

    loadNotifications() {
        const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        this.notifications = notificacoes;
        
        const list = document.getElementById('notifications-list');
        list.innerHTML = '';
        
        if (notificacoes.length === 0) {
            list.innerHTML = `
                <div class="notification-item">
                    <div style="text-align: center; color: var(--gray); padding: 2rem;">
                        <i class="fas fa-bell-slash" style="font-size: 2rem;"></i>
                        <p>Nenhuma notificação</p>
                    </div>
                </div>
            `;
            return;
        }
        
        notificacoes.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notification-item ${notif.lida ? '' : 'unread'}`;
            item.onclick = () => this.marcarNotificacaoComoLida(notif.id);
            
            let icon = '📝';
            if (notif.tipo.includes('Ordem de Serviço')) icon = '🔧';
            if (notif.tipo.includes('chat')) icon = '💬';
            
            item.innerHTML = `
                <div class="notification-condo">${icon} ${notif.condo}</div>
                <div>${notif.desc}</div>
                <div class="notification-time">${notif.data} ${notif.hora}</div>
            `;
            
            list.appendChild(item);
        });
        
        this.updateNotificationBadges();
    },

    updateNotificationBadges() {
        const notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        const naoLidas = notificacoes.filter(n => !n.lida).length;
        
        const badge = document.getElementById('notification-count');
        if (naoLidas > 0) {
            badge.textContent = naoLidas > 99 ? '99+' : naoLidas;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
        
        this.updateTabCounts();
    },

    toggleNotifications() {
        const panel = document.getElementById('notifications-panel');
        panel.classList.toggle('show');
        
        if (panel.classList.contains('show')) {
            this.marcarTodasNotificacoesComoLidas();
        }
    },

    marcarTodasNotificacoesComoLidas() {
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        notificacoes = notificacoes.map(notif => ({ ...notif, lida: true }));
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        this.loadNotifications();
        this.updateNotificationBadges();
        updateCondoBadges();
    },

    marcarNotificacaoComoLida(id) {
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        const index = notificacoes.findIndex(n => n.id === id);
        
        if (index !== -1) {
            notificacoes[index].lida = true;
            localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
            this.loadNotifications();
            updateCondoBadges();
        }
    },

    clearNotifications() {
        localStorage.removeItem('porter_notificacoes');
        this.loadNotifications();
        updateCondoBadges();
        showToast('Notificações limpas!', 'success');
    },

    adicionarComentario(ataId, texto) {
        if (!texto.trim()) return;
        
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const index = atas.findIndex(a => a.id === ataId);
        
        if (index !== -1) {
            if (!atas[index].comentarios) atas[index].comentarios = [];
            atas[index].comentarios.unshift({
                id: Date.now(),
                autor: this.currentUser.nome,
                user: this.currentUser.user,
                texto: texto,
                data: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR'),
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('porter_atas', JSON.stringify(atas));
            this.renderAta();
            this.renderFixas();
            showToast('Comentário adicionado!', 'success');
        }
    },

    abrirComentarios(ataId) {
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const ata = atas.find(a => a.id === ataId);
        
        if (!ata) return;
        
        const modalContent = document.getElementById('comments-modal-content');
        modalContent.innerHTML = `
            <h4>${ata.condo} - ${ata.data}</h4>
            <div style="margin: 1rem 0; padding: 1rem; background: var(--bg); border-radius: 8px;">
                <strong>Descrição:</strong>
                <p style="margin-top: 8px;">${ata.desc}</p>
            </div>
            <div class="comment-form">
                <h5>Adicionar Comentário</h5>
                <textarea id="novo-comentario-texto" placeholder="Digite seu comentário..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="app.adicionarComentarioModal(${ataId})">
                    Enviar Comentário
                </button>
            </div>
            <div class="comments-title">Comentários (${ata.comentarios ? ata.comentarios.length : 0})</div>
            <div class="comment-list">
                ${ata.comentarios && ata.comentarios.length > 0 ?
                    ata.comentarios.map(c => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <span class="comment-author">${c.autor}</span>
                                <span class="comment-time">${c.data} ${c.hora}</span>
                            </div>
                            <div class="comment-text">${c.texto}</div>
                        </div>
                    `).join('') :
                    '<p style="text-align: center; color: var(--gray);">Nenhum comentário ainda.</p>'
                }
            </div>
        `;
        
        document.getElementById('comments-modal').classList.add('show');
    },

    adicionarComentarioModal(ataId) {
        const texto = document.getElementById('novo-comentario-texto').value.trim();
        if (!texto) {
            showToast('Digite um comentário!', 'error');
            return;
        }
        
        this.adicionarComentario(ataId, texto);
        document.getElementById('novo-comentario-texto').value = '';
        this.abrirComentarios(ataId);
    },

    closeCommentsModal() {
        document.getElementById('comments-modal').classList.remove('show');
    },

    renderFixas() {
        const list = document.getElementById('fixas-lista');
        const atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const fixas = atas.filter(a => a.fixa);
        
        if (fixas.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-thumbtack"></i>
                    <h3>Nenhuma informação fixa</h3>
                    <p>Para criar uma informação fixa, selecione "Informações Fixas" no tipo de registro.</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        fixas.forEach(a => {
            const card = document.createElement('div');
            card.className = 'ata-card fixed';
            card.innerHTML = `
                <div class="ata-header">
                    <span>${a.data} ${a.hora}</span>
                    <span class="status-badge status-fixo">📌 FIXA</span>
                </div>
                <div class="ata-condo">${a.condo} (${a.cidade})</div>
                <div class="ata-type fixed">${a.tipo}</div>
                <div style="margin: 15px 0; padding: 15px; background: var(--bg); border-radius: 6px;">
                    ${a.desc}
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div>Operador: ${a.operador}</div>
                    <button class="btn btn-info" onclick="app.abrirComentarios(${a.id})">
                        <i class="fas fa-comments"></i> (${a.comentarios ? a.comentarios.length : 0})
                    </button>
                </div>
            `;
            
            list.appendChild(card);
        });
    },

    saveOSComFirebase(osData) {
        let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        osList.unshift(osData);
        
        if (osList.length > 100) osList = osList.slice(0, 100);
        localStorage.setItem('porter_os', JSON.stringify(osList));
        
        if (typeof firebaseHelper !== 'undefined' && firebaseHelper.salvarOSNoFirebase) {
            firebaseHelper.salvarOSNoFirebase(osData);
        }
        
        return osData;
    },

    abrirOSComEmail(event) {
        event.preventDefault();
        
        const condo = document.getElementById('os-condo').value;
        const funcionario = document.getElementById('os-funcionario').value.trim();
        const email = document.getElementById('os-email').value.trim();
        const setor = document.getElementById('os-setor').value;
        const gravidade = document.getElementById('os-gravidade').value;
        const desc = document.getElementById('os-desc').value.trim();
        
        if (!condo || !funcionario || !email || !setor || !gravidade || !desc) {
            showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('E-mail inválido!', 'error');
            return;
        }
        
        const osId = 'OS-' + Date.now().toString().slice(-6);
        this.lastOSId = osId;
        
        const agora = new Date();
        const dataISO = agora.toISOString().split('T')[0];
        
        const novaOS = {
            id: Date.now(),
            osId: osId,
            condo,
            cidade: document.getElementById('os-cidade').value,
            gravidade,
            desc,
            dataOS: document.getElementById('os-data').value || dataISO,
            data: agora.toLocaleDateString('pt-BR'),
            dataISO: dataISO,
            hora: agora.toLocaleTimeString('pt-BR'),
            funcionario: funcionario,
            email: email,
            setor: setor,
            operador: this.currentUser.nome,
            user: this.currentUser.user,
            turno: this.currentUser.turno,
            status: 'Em branco',
            statusOS: 'Em branco',
            timestamp: agora.toISOString(),
            prazoResposta: appEmail ? appEmail.calcularPrazoPorGravidade(gravidade) : '3 dias úteis',
            tecnicoResponsavel: document.getElementById('os-tecnico').value || ''
        };
        
        this.saveOSComFirebase(novaOS);
        this.updateTabCounts();
        
        if (typeof appEmail !== 'undefined' && appEmail.adicionarCamposOcultosForm) {
            appEmail.adicionarCamposOcultosForm(osId, agora.toLocaleString(), novaOS.prazoResposta);
        }
        
        setTimeout(() => {
            document.getElementById('os-form-email').submit();
            
            if (typeof appEmail !== 'undefined' && appEmail.mostrarConfirmacaoOS) {
                appEmail.mostrarConfirmacaoOS(novaOS);
            }
            
            this.criarNotificacao(condo, 'Ordem de Serviço', `Nova OS ${osId}: ${gravidade}`);
            showToast('Ordem de Serviço aberta com sucesso!', 'success');
        }, 100);
    },

    renderOS() {
        const osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        this.renderOSList(osList);
    },

    renderOSList(osList) {
        const list = document.getElementById('os-lista');
        
        if (osList.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tools"></i>
                    <h3>Nenhuma Ordem de Serviço</h3>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        osList.forEach(os => {
            const card = document.createElement('div');
            card.className = 'ata-card os';
            card.innerHTML = `
                <div class="ata-header">
                    <span>${os.data} ${os.hora}</span>
                    <span class="status-badge" style="background: ${this.getCorGravidade(os.gravidade)};">
                        ${os.gravidade}
                    </span>
                </div>
                <div class="ata-condo">${os.condo}</div>
                <div class="ata-type os">OS: ${os.osId}</div>
                <div style="margin: 10px 0; padding: 10px; background: var(--bg); border-radius: 6px;">
                    <strong>Solicitante:</strong> ${os.funcionario}<br>
                    <strong>E-mail:</strong> ${os.email}
                </div>
                <div style="margin: 10px 0; padding: 10px; background: var(--bg); border-radius: 6px;">
                    ${os.desc}
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div>Operador: ${os.operador}</div>
                    <button class="btn btn-danger" onclick="app.excluirOS(${os.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            list.appendChild(card);
        });
    },

    getCorGravidade(gravidade) {
        const cores = {
            'Baixa': '#27ae60',
            'Média': '#f39c12',
            'Alta': '#e74c3c',
            'Emergência': '#8b0000'
        };
        return cores[gravidade] || '#666';
    },

    excluirOS(id) {
        if (!confirm('Excluir esta Ordem de Serviço?')) return;
        
        let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        osList = osList.filter(os => os.id !== id);
        localStorage.setItem('porter_os', JSON.stringify(osList));
        
        if (window.db) {
            window.db.collection('ordens_servico').doc(id.toString()).delete().catch(() => {});
        }
        
        this.renderOS();
        showToast('OS excluída!', 'success');
    },

    loadPrivateChatUsers() {
        if (!this.currentUser) return;
        
        const select = document.getElementById('private-chat-target');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        let usuariosDisponiveis = [];
        
        // Adicionar funcionários
        DATA.funcionarios.forEach(f => {
            if (f.user !== this.currentUser.user) {
                usuariosDisponiveis.push({
                    nome: f.nome,
                    user: f.user,
                    role: f.role
                });
            }
        });
        
        // Adicionar técnicos
        DATA.tecnicos.forEach(t => {
            const tecUser = t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
            if (tecUser !== this.currentUser.user) {
                usuariosDisponiveis.push({
                    nome: t.nome,
                    user: tecUser,
                    role: 'TÉCNICO'
                });
            }
        });
        
        usuariosDisponiveis.sort((a, b) => a.nome.localeCompare(b.nome));
        
        usuariosDisponiveis.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.user;
            option.textContent = `${usuario.nome} ${usuario.role === 'ADMIN' ? '👑' : ''} ${usuario.role === 'TÉCNICO' ? '🔧' : ''}`;
            select.appendChild(option);
        });
    },

    loadPrivateChat() {
        if (!this.currentUser || !this.currentPrivateChatTarget) return;
        
        if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChat) {
            chatSystem.loadPrivateChat();
        }
    },

    sendPrivateChatMessage() {
        if (!this.currentUser || !this.currentPrivateChatTarget) {
            showToast('Selecione um destinatário!', 'error');
            return;
        }
        
        if (typeof chatSystem !== 'undefined' && chatSystem.sendPrivateChatMessage) {
            chatSystem.sendPrivateChatMessage();
        }
    },

    loadChat() {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadChat) {
            chatSystem.loadChat();
        }
    },

    sendChatMessage() {
        if (!this.currentUser) {
            showToast('Você precisa estar logado!', 'error');
            return;
        }
        
        if (typeof chatSystem !== 'undefined' && chatSystem.sendChatMessage) {
            chatSystem.sendChatMessage();
        }
    },

    renderPresenca() {
        const list = document.getElementById('presenca-lista');
        let presencas = JSON.parse(localStorage.getItem('porter_presencas') || '[]');
        let logoffs = JSON.parse(localStorage.getItem('porter_logoffs') || '[]');
        
        let historicoCombinado = [];
        
        presencas.forEach(login => {
            const logoffCorrespondente = logoffs.find(logoff => 
                logoff.user === login.user && 
                logoff.data === login.data &&
                new Date(logoff.timestamp) > new Date(login.timestamp)
            );
            
            historicoCombinado.push({
                nome: login.nome,
                turno: login.turno,
                data: login.data,
                horaLogin: login.hora,
                horaLogoff: logoffCorrespondente ? logoffCorrespondente.hora : '—',
                timestampLogin: login.timestamp
            });
        });
        
        historicoCombinado.sort((a, b) => new Date(b.timestampLogin) - new Date(a.timestampLogin));
        
        if (this.filtrosPresenca.operador) {
            historicoCombinado = historicoCombinado.filter(p => p.nome === this.filtrosPresenca.operador);
        }
        
        if (this.filtrosPresenca.dataInicio) {
            historicoCombinado = historicoCombinado.filter(p => p.data >= this.filtrosPresenca.dataInicio);
        }
        
        if (this.filtrosPresenca.dataFim) {
            historicoCombinado = historicoCombinado.filter(p => p.data <= this.filtrosPresenca.dataFim);
        }
        
        if (this.filtrosPresenca.turno) {
            historicoCombinado = historicoCombinado.filter(p => p.turno === this.filtrosPresenca.turno);
        }
        
        historicoCombinado = historicoCombinado.slice(0, 100);
        
        if (historicoCombinado.length === 0) {
            list.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem;">
                        Nenhum registro encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        list.innerHTML = historicoCombinado.map(p => `
            <tr>
                <td>${p.nome}</td>
                <td>${p.turno}</td>
                <td>${p.data}</td>
                <td>${p.horaLogin}</td>
                <td>${p.horaLogoff}</td>
            </tr>
        `).join('');
    },

    renderAll() {
        this.renderAta();
        this.renderFixas();
        this.renderOS();
        this.renderPresenca();
    },

    renderAta() {
        const list = document.getElementById('ata-lista');
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        atas = atas.filter(a => !a.fixa);
        
        if (this.filtrosAtas.condo) {
            atas = atas.filter(a => a.condo === this.filtrosAtas.condo);
        }
        
        if (this.filtrosAtas.dataInicio) {
            atas = atas.filter(a => a.dataISO >= this.filtrosAtas.dataInicio);
        }
        
        if (this.filtrosAtas.dataFim) {
            atas = atas.filter(a => a.dataISO <= this.filtrosAtas.dataFim);
        }
        
        if (this.filtrosAtas.tipo) {
            atas = atas.filter(a => a.tipo === this.filtrosAtas.tipo);
        }
        
        if (this.filtrosAtas.status) {
            atas = atas.filter(a => a.status === this.filtrosAtas.status);
        }
        
        document.getElementById('resultados-info-ata').innerHTML = `
            Mostrando ${atas.length} registros
        `;
        
        if (atas.length === 0) {
            list.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum registro encontrado</h3>
                </div>
            `;
            return;
        }
        
        list.innerHTML = '';
        
        atas.forEach(a => {
            const card = document.createElement('div');
            card.className = 'ata-card';
            card.innerHTML = `
                <div class="ata-header">
                    <span>${a.data} ${a.hora} | Turno: ${a.turno}</span>
                    <span class="status-badge ${a.status === 'Finalizado' ? 'status-finalizado' : 'status-andamento'}">
                        ${a.status}
                    </span>
                </div>
                <div class="ata-condo">${a.condo}</div>
                <div class="ata-type">${a.tipo}</div>
                <div style="margin: 15px 0; padding: 15px; background: var(--bg); border-radius: 6px;">
                    ${a.desc}
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <div>Operador: ${a.operador}</div>
                    <button class="btn btn-info" onclick="app.abrirComentarios(${a.id})">
                        <i class="fas fa-comments"></i> (${a.comentarios ? a.comentarios.length : 0})
                    </button>
                </div>
            `;
            
            list.appendChild(card);
        });
    },

    openReportModal() {
        document.getElementById('report-modal').classList.add('show');
    },

    closeReportModal() {
        document.getElementById('report-modal').classList.remove('show');
    },

    openAdminPanel() {
        const modalContent = document.getElementById('admin-modal-content');
        
        modalContent.innerHTML = `
            <h4>Painel Administrativo</h4>
            <div style="margin: 1rem 0;">
                <button class="btn btn-warning" onclick="app.exportBackup()">
                    <i class="fas fa-download"></i> Exportar Backup
                </button>
                <button class="btn btn-danger" onclick="app.clearAllData()" style="margin-left: 10px;">
                    <i class="fas fa-trash"></i> Limpar Todos os Dados
                </button>
            </div>
        `;
        
        document.getElementById('admin-modal').classList.add('show');
    },

    closeAdminModal() {
        document.getElementById('admin-modal').classList.remove('show');
    },

    exportBackup() {
        const backup = {
            atas: JSON.parse(localStorage.getItem('porter_atas') || '[]'),
            os: JSON.parse(localStorage.getItem('porter_os') || '[]'),
            presencas: JSON.parse(localStorage.getItem('porter_presencas') || '[]'),
            logoffs: JSON.parse(localStorage.getItem('porter_logoffs') || '[]'),
            moods: JSON.parse(localStorage.getItem('porter_moods') || '[]'),
            notificacoes: JSON.parse(localStorage.getItem('porter_notificacoes') || '[]'),
            chat: JSON.parse(localStorage.getItem('porter_chat') || '[]'),
            chat_privado: JSON.parse(localStorage.getItem('porter_chat_privado') || '{}'),
            exportDate: new Date().toISOString(),
            exportBy: this.currentUser.nome
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `backup-porter-${new Date().toISOString().slice(0, 10)}.json`);
        linkElement.click();
        
        showToast('Backup exportado!', 'success');
    },

    clearAllData() {
        if (confirm('ATENÇÃO: Esta ação irá APAGAR TODOS os dados. Tem certeza?')) {
            localStorage.clear();
            location.reload();
        }
    },

    showMessage(text, type) {
        showToast(text, type);
    }
};

// Tornar app global
window.app = app;
