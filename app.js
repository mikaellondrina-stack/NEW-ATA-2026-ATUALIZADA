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
        this.initTheme();
        this.restaurarSessao();
        
        if (!this.currentUser) {
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('main-content').classList.add('hidden');
        } else {
            this.showApp();
        }

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

        const hoje = new Date();
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
        
        document.getElementById('filter-data-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('filter-data-fim').value = hoje.toISOString().split('T')[0];
        document.getElementById('filter-presenca-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('filter-presenca-fim').value = hoje.toISOString().split('T')[0];
        document.getElementById('os-data').value = hoje.toISOString().split('T')[0];
        document.getElementById('report-data-inicio').value = umaSemanaAtras.toISOString().split('T')[0];
        document.getElementById('report-data-fim').value = hoje.toISOString().split('T')[0];

        this.carregarFiltrosSalvos();
        this.setupClickOutsideHandlers();
    },

    initTheme() {
        const savedTheme = localStorage.getItem('porter_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('porter_theme', newTheme);
        
        document.querySelectorAll('#theme-toggle i').forEach((icon, index) => {
            icon.classList.toggle('active', 
                (index === 0 && newTheme === 'light') || 
                (index === 1 && newTheme === 'dark')
            );
        });
    },

    showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Aviso',
            info: 'Informação'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${title || titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    showCondoNotification(condo, message, type = 'info') {
        this.showToast(message, type, condo);
    },

    setupClickOutsideHandlers() {
        document.addEventListener('click', (e) => {
            const onlineList = document.getElementById('online-users-list');
            const onlineDropdown = document.getElementById('online-users');
            if (onlineList && onlineList.style.display === 'block' &&
                !onlineDropdown.contains(e.target) &&
                !onlineList.contains(e.target)) {
                onlineList.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-bell') && !e.target.closest('.notifications-panel')) {
                document.getElementById('notifications-panel').classList.remove('show');
            }
        });
    },

    setupEventListeners() {
        document.getElementById('login-pass').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });

        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });

        const privateChatSelect = document.getElementById('private-chat-target');
        if (privateChatSelect) {
            privateChatSelect.addEventListener('change', (e) => {
                this.currentPrivateChatTarget = e.target.value;
                this.loadPrivateChat();
            });
        }

        document.getElementById('chat-private-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendPrivateChatMessage();
            }
        });

        window.addEventListener('beforeunload', () => {
            if (this.currentUser) {
                this.salvarSessao();
            }
        });

        const onlineDropdown = document.getElementById('online-users');
        if (onlineDropdown) {
            onlineDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleOnlineUsers();
            });
        }

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
                    return true;
                } else {
                    localStorage.removeItem('porter_session');
                }
            }
        } catch (e) {
            console.log('Erro ao restaurar sessão:', e);
        }
        return false;
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

    login() {
        const u = document.getElementById('login-user').value.trim();
        const p = document.getElementById('login-pass').value;
        const t = document.getElementById('login-turno').value;
        
        if (!u || !p) {
            this.showToast('Preencha usuário e senha', 'error');
            return;
        }
        
        const user = DATA.funcionarios.find(f => f.user === u && f.pass === p);
        
        if (user) {
            this.currentUser = {
                ...user,
                turno: t,
                loginTime: new Date().toLocaleString('pt-BR'),
                loginTimestamp: new Date().toISOString(),
                loginDate: new Date().toLocaleDateString('pt-BR'),
                loginHour: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
            };
            
            localStorage.setItem('porter_session', JSON.stringify(this.currentUser));
            this.registrarPresenca('login');
            this.showApp();
            this.loadPrivateChatUsers();
            this.showToast(`Bem-vindo, ${user.nome}!`, 'success');
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
                    loginHour: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
                };
                
                localStorage.setItem('porter_session', JSON.stringify(this.currentUser));
                this.registrarPresenca('login');
                this.showApp();
                this.loadPrivateChatUsers();
                this.showToast(`Bem-vindo, ${tecnico.nome}!`, 'success');
            } else {
                this.showToast('Credenciais inválidas!', 'error');
            }
        }
    },

    registrarPresenca(tipo) {
        let presencas = JSON.parse(localStorage.getItem('porter_presencas') || '[]');
        presencas.unshift({
            nome: this.currentUser.nome,
            turno: this.currentUser.turno,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            dataISO: new Date().toISOString().split('T')[0],
            tipo: tipo
        });
        
        if (presencas.length > 100) presencas = presencas.slice(0, 100);
        localStorage.setItem('porter_presencas', JSON.stringify(presencas));
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
            const moodDisplay = this.currentUser.role === 'ADMIN' ? 
                `<span style="font-size: 1.2rem; margin-right: 5px;">${moodAtual}</span>` : '';
            
            userInfo.innerHTML = `
                <div class="user-info-name">
                    ${moodDisplay}
                    <strong>${this.currentUser.nome.split(' ')[0]}</strong>
                    ${this.currentUser.role === 'TÉCNICO' ? '<span style="background: #f39c12; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; margin-left: 5px;">TÉCNICO</span>' : ''}
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

    logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            this.registrarLogoff();
            
            clearInterval(this.chatInterval);
            clearInterval(this.privateChatInterval);
            clearInterval(this.moodInterval);
            clearInterval(this.onlineInterval);
            
            localStorage.removeItem('porter_session');
            
            this.currentUser = null;
            
            document.getElementById('main-content').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            
            this.showToast('Logoff realizado com sucesso!', 'success');
        }
    },

    registrarLogoff() {
        if (!this.currentUser) return;
        
        const logoffs = JSON.parse(localStorage.getItem('porter_logoffs') || '[]');
        const logoffData = {
            user: this.currentUser.user,
            nome: this.currentUser.nome,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            turno: this.currentUser.turno
        };
        
        logoffs.unshift(logoffData);
        if (logoffs.length > 200) logoffs.pop();
        localStorage.setItem('porter_logoffs', JSON.stringify(logoffs));
        
        this.lastLogoffTime = new Date().toISOString();
        localStorage.setItem('porter_last_logoff', this.lastLogoffTime);
        
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
        } catch (e) {
            console.log('Erro ao remover usuário dos online:', e);
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('show');
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
            { id: 1, label: "Zangado", color: "#e74c3c", status: "😠 Zangado", description: "Raiva ou tristeza profunda" },
            { id: 2, label: "Triste", color: "#e67e22", status: "😔 Triste", description: "Desânimo ou insatisfação" },
            { id: 3, label: "Neutro", color: "#f1c40f", status: "😐 Neutro", description: "Indiferente ou tédio" },
            { id: 4, label: "Feliz", color: "#2ecc71", status: "🙂 Feliz", description: "Bem-estar e satisfação" },
            { id: 5, label: "Radiante", color: "#27ae60", status: "😄 Radiante", description: "Felicidade plena e euforia" }
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
                <div class="mood-description">${mood.description}</div>
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
            hora: hoje.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            turno: this.currentUser.turno,
            timestamp: hoje.toISOString(),
            role: this.currentUser.role
        };
        
        if (indexExistente !== -1) {
            moods[indexExistente] = moodData;
        } else {
            moods.unshift(moodData);
        }
        
        if (moods.length > 500) moods = moods.slice(0, 500);
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
        
        this.showToast('Humor registrado com sucesso!', 'success');
        
        setTimeout(() => {
            resultDiv.classList.add('hidden');
            this.verificarMoodHoje();
        }, 5000);
    },

    verificarMoodHoje() {
        if (!this.currentUser) return;
        
        const hojeISO = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        const jaAvaliouHoje = moods.some(m => m.user === this.currentUser.user && m.dataISO === hojeISO);
        
        if (jaAvaliouHoje) {
            setTimeout(() => {
                document.getElementById('mood-check-container').classList.add('hidden');
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

    jaAvaliouHoje() {
        if (!this.currentUser) return true;
        
        const hojeISO = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        return moods.some(m => m.user === this.currentUser.user && m.dataISO === hojeISO);
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

    updateOnlineUsers() {
        if (!this.currentUser) return;
        
        const agora = new Date();
        
        this.salvarSessao();
        
        let usuariosOnline = [];
        
        const moodAtual = this.getMoodAtual();
        const statusMood = this.getMoodStatusTexto(moodAtual);
        
        usuariosOnline.push({
            ...this.currentUser,
            lastActivity: agora.toISOString(),
            mood: moodAtual,
            moodStatus: statusMood,
            isCurrentUser: true,
            online: true
        });
        
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
            if (this.onlineUsers.length === 1) {
                onlineCount.textContent = '1 (apenas você)';
                onlineCount.style.color = '#f39c12';
            } else {
                onlineCount.textContent = this.onlineUsers.length;
                onlineCount.style.color = '#2ecc71';
            }
        }
        
        const onlineList = document.getElementById('online-users-list');
        if (onlineList && onlineList.style.display === 'block') {
            this.renderOnlineUsersList();
        }
    },

    getMoodStatusTexto(mood) {
        const statusMap = {
            '😠': 'Zangado hoje',
            '😔': 'Triste hoje',
            '😐': 'Neutro hoje',
            '🙂': 'Feliz hoje',
            '😄': 'Radiante hoje'
        };
        return statusMap[mood] || 'Não avaliado';
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
                    <div class="online-user-avatar"><i class="fas fa-user"></i></div>
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
            
            let statusTexto = user.isCurrentUser ? 'Online agora' :
                diferencaMinutos < 1 ? 'Online agora' :
                diferencaMinutos < 5 ? `Online há ${diferencaMinutos} min` : 'Online há +5 min';
            
            const moodIcon = (user.isCurrentUser || this.currentUser.role === 'ADMIN') ? 
                user.mood || '😐' : '';
            
            userItem.innerHTML = `
                <div class="online-user-avatar" style="background: ${this.getCorPorMood(user.mood)}">
                    <i class="fas fa-user"></i>
                </div>
                <div class="online-user-info">
                    <div class="online-user-name">
                        ${moodIcon} ${user.nome.split(' ')[0]} ${user.isCurrentUser ? '(Você)' : ''}
                        ${user.role === 'ADMIN' ? ' 👑' : ''}
                        ${user.role === 'TÉCNICO' ? ' 🔧' : ''}
                    </div>
                    <div class="online-user-role">
                        ${user.turno || 'Diurno'} | ${statusTexto}
                    </div>
                </div>
                <div class="online-status" style="background: ${user.isCurrentUser || diferencaMinutos < 5 ? '#2ecc71' : '#f39c12'}"></div>
            `;
            onlineList.appendChild(userItem);
        });
    },

    getCorPorMood(mood) {
        const cores = {
            '😠': '#ffeaa7',
            '😔': '#fd79a8',
            '😐': '#dfe6e9',
            '🙂': '#a29bfe',
            '😄': '#55efc4'
        };
        return cores[mood] || '#e8f4fc';
    },

    setupOnlineTracking() {
        this.onlineInterval = setInterval(() => {
            if (this.currentUser) {
                this.updateOnlineUsers();
            }
        }, 10000);
        this.updateOnlineUsers();
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
            
            const chatTab = document.querySelector('.chat-tab');
            if (chatTab) {
                chatTab.classList.add('has-new-message');
            }
        } else {
            badge.textContent = '0';
            badge.style.display = 'none';
            
            const chatTab = document.querySelector('.chat-tab');
            if (chatTab) {
                chatTab.classList.remove('has-new-message');
            }
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
        this.registrarVisualizacaoChat();
    },

    registrarVisualizacaoChat() {
        if (!this.currentUser) return;
        
        const visualizacoes = JSON.parse(localStorage.getItem('porter_chat_views') || '{}');
        const agora = Date.now();
        
        visualizacoes[this.currentUser.user] = {
            nome: this.currentUser.nome,
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
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
        
        this.filtrosAtas = { condo: '', dataInicio: '', dataFim: '', tipo: '', status: '' };
        localStorage.removeItem('porter_filtros_atas');
        
        this.mostrarFiltrosAtivosAtas();
        this.renderAta();
        this.showToast('Filtros limpos!', 'success');
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
        
        this.filtrosPresenca = { operador: '', dataInicio: '', dataFim: '', turno: '' };
        localStorage.removeItem('porter_filtros_presenca');
        
        this.renderPresenca();
        this.showToast('Filtros limpos!', 'success');
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
        
        container.innerHTML = filtros.length > 0 ? 
            `<strong>Filtros ativos:</strong> ${filtros.join(' | ')}` : 
            'Nenhum filtro ativo';
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
            this.showToast('Preencha todos os campos obrigatórios!', 'error');
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
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            comentarios: [],
            fixa: tipo.includes('Informações Fixas')
        };
        
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        atas.unshift(novaAta);
        
        if (atas.length > 200) atas = atas.slice(0, 200);
        localStorage.setItem('porter_atas', JSON.stringify(atas));
        
        this.criarNotificacao(condo, tipo, desc);
        
        document.getElementById('ata-desc').value = "";
        document.getElementById('ata-condo').value = "";
        document.getElementById('ata-cidade').value = "";
        
        this.showToast('Registro salvo com sucesso!', 'success');
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
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            lida: false
        };
        
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        notificacoes.unshift(notificacao);
        
        if (notificacoes.length > 50) notificacoes.pop();
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        this.showCondoNotification(condo, desc, 'info');
        
        if (tipo === 'Ordem de Serviço') {
            this.criarNotificacaoChat(`Nova OS criada em ${condo}: ${desc.substring(0, 80)}...`);
        }
        
        this.loadNotifications();
    },

    criarNotificacaoChat(texto) {
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        const notificacao = {
            id: Date.now(),
            condo: 'Chat Geral',
            tipo: 'chat',
            desc: texto,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            lida: false
        };
        
        notificacoes.unshift(notificacao);
        if (notificacoes.length > 50) notificacoes.pop();
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        this.loadNotifications();
    },

    criarNotificacaoChatComAcao(chatMessage) {
        const notificacao = {
            id: Date.now(),
            condo: 'Chat Geral',
            tipo: 'chat_mensagem',
            desc: `Nova mensagem de ${chatMessage.sender}: ${chatMessage.message.substring(0, 50)}${chatMessage.message.length > 50 ? '...' : ''}`,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            lida: false,
            acao: {
                tipo: 'ir_para_chat',
                mensagemId: chatMessage.id,
                sender: chatMessage.sender
            },
            destaque: true
        };
        
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        notificacoes.unshift(notificacao);
        
        if (notificacoes.length > 50) notificacoes.pop();
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        this.loadNotifications();
        this.updateNotificationBadges();
        this.atualizarBadgeChat();
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
                        <i class="fas fa-bell-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Nenhuma notificação</p>
                    </div>
                </div>
            `;
            return;
        }
        
        notificacoes.forEach(notif => {
            const item = document.createElement('div');
            item.className = `notification-item ${notif.lida ? '' : 'unread'} ${notif.destaque ? 'destaque' : ''}`;
            item.dataset.tipo = notif.tipo;
            item.onclick = (e) => {
                e.stopPropagation();
                this.processarNotificacao(notif);
            };
            
            let icon = '📝';
            if (notif.tipo === 'chat_mensagem') icon = '💬';
            if (notif.tipo.includes('Ocorrência')) icon = '⚠️';
            if (notif.tipo.includes('Incidente')) icon = '🚨';
            if (notif.tipo.includes('Fixas')) icon = '📌';
            if (notif.tipo === 'chat') icon = '💬';
            if (notif.tipo === 'Ordem de Serviço') icon = '🔧';
            
            item.innerHTML = `
                <div class="notification-condo">${icon} ${notif.condo}</div>
                <div style="margin: 5px 0;">${notif.desc}</div>
                <div class="notification-time">${notif.data} ${notif.hora}</div>
            `;
            
            list.appendChild(item);
        });
        
        this.updateNotificationBadges();
    },

    processarNotificacao(notificacao) {
        this.marcarNotificacaoComoLida(notificacao.id);
        
        if (notificacao.acao && notificacao.acao.tipo === 'ir_para_chat') {
            this.irParaChat(notificacao.acao.mensagemId);
        }
        
        document.getElementById('notifications-panel').classList.remove('show');
    },

    irParaChat(mensagemId = null) {
        const chatTabBtn = document.querySelector('.chat-tab');
        if (chatTabBtn) {
            this.switchTab('tab-chat', chatTabBtn);
        }
        
        this.loadChat();
        this.marcarChatComoVisualizado();
        
        if (mensagemId) {
            setTimeout(() => {
                utils.destacarMensagemChat(mensagemId);
            }, 500);
        }
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
        
        DATA.condominios.forEach(condo => {
            const condoNotificacoes = notificacoes.filter(n => n.condo === condo.n && !n.lida);
            const condoBadge = document.getElementById(`badge-${condo.n.replace(/\s+/g, '-')}`);
            
            if (condoBadge) {
                if (condoNotificacoes.length > 0) {
                    condoBadge.textContent = condoNotificacoes.length > 9 ? '9+' : condoNotificacoes.length;
                    condoBadge.classList.add('has-notification');
                } else {
                    condoBadge.classList.remove('has-notification');
                }
            }
        });
        
        this.updateTabCounts();
    },

    toggleNotifications() {
        const panel = document.getElementById('notifications-panel');
        const estaAberto = panel.classList.contains('show');
        
        if (!estaAberto) {
            this.marcarTodasNotificacoesComoLidas();
        }
        
        panel.classList.toggle('show');
    },

    marcarTodasNotificacoesComoLidas() {
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        notificacoes = notificacoes.map(notif => ({ ...notif, lida: true }));
        localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
        
        this.loadNotifications();
        this.updateNotificationBadges();
    },

    marcarNotificacaoComoLida(id) {
        let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        const index = notificacoes.findIndex(n => n.id === id);
        
        if (index !== -1) {
            notificacoes[index].lida = true;
            localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
            this.loadNotifications();
        }
    },

    clearNotifications() {
        localStorage.removeItem('porter_notificacoes');
        this.loadNotifications();
        this.showToast('Notificações limpas!', 'success');
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
                hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('porter_atas', JSON.stringify(atas));
            this.renderAta();
            this.renderFixas();
            this.showToast('Comentário adicionado!', 'success');
        }
    },

    abrirComentarios(ataId) {
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const ata = atas.find(a => a.id === ataId);
        
        if (!ata) return;
        
        const modalContent = document.getElementById('comments-modal-content');
        modalContent.innerHTML = `
            <h4><i class="fas fa-building"></i> ${ata.condo} - ${ata.data} ${ata.hora}</h4>
            <div style="margin: 1rem 0; padding: 1rem; background: var(--hover-bg); border-radius: 8px; border-left: 4px solid var(--accent);">
                <strong><i class="fas fa-align-left"></i> Descrição:</strong>
                <p style="white-space: pre-wrap; margin-top: 8px; padding: 10px; background: var(--white); border-radius: 6px;">${ata.desc}</p>
            </div>
            <div class="comment-form">
                <h5><i class="fas fa-edit"></i> Adicionar Comentário</h5>
                <textarea
                    id="novo-comentario-texto"
                    placeholder="Digite seu comentário aqui..."
                    rows="4"
                    data-ata-id="${ataId}"
                ></textarea>
                <button class="btn btn-primary" onclick="app.adicionarComentarioModal(${ataId})" style="align-self: flex-end;">
                    <i class="fas fa-paper-plane"></i> Enviar Comentário
                </button>
            </div>
            <div class="comments-title" style="margin-top: 2rem;">
                <i class="fas fa-comments"></i> Comentários (${ata.comentarios ? ata.comentarios.length : 0})
            </div>
            <div class="comment-list" id="modal-comment-list">
                ${ata.comentarios && ata.comentarios.length > 0 ?
                    ata.comentarios.map(c => `
                        <div class="comment-item">
                            <div class="comment-header">
                                <span class="comment-author"><i class="fas fa-user"></i> ${c.autor}</span>
                                <span class="comment-time">${c.data} ${c.hora}</span>
                            </div>
                            <div class="comment-text">${c.texto}</div>
                        </div>
                    `).join('') :
                    '<p style="text-align: center; color: var(--gray); padding: 2rem; background: var(--hover-bg); border-radius: 8px;">Nenhum comentário ainda.</p>'
                }
            </div>
        `;
        
        document.getElementById('comments-modal').classList.add('show');
    },

    adicionarComentarioModal(ataId) {
        const textoInput = document.getElementById('novo-comentario-texto');
        if (!textoInput) return;
        
        const texto = textoInput.value.trim();
        if (!texto) {
            alert('Por favor, digite um comentário antes de enviar!');
            textoInput.focus();
            return;
        }
        
        this.adicionarComentario(ataId, texto);
        textoInput.value = '';
        
        setTimeout(() => {
            this.abrirComentarios(ataId);
        }, 100);
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
            const podeExcluir = this.currentUser && (this.currentUser.role === 'ADMIN' || a.user === this.currentUser.user);
            
            const card = document.createElement('div');
            card.className = 'ata-card fixed fade-in';
            card.innerHTML = `
                <div class="ata-header">
                    <span><i class="far fa-calendar"></i> ${a.data} | <i class="far fa-clock"></i> ${a.hora} | <i class="fas fa-user-clock"></i> Turno: ${a.turno}</span>
                    <span class="status-badge status-fixo"><i class="fas fa-thumbtack"></i> FIXA</span>
                </div>
                <div class="ata-condo"><i class="fas fa-building"></i> ${a.condo} (${a.cidade})</div>
                <div class="ata-type fixed"><i class="fas fa-tag"></i> ${a.tipo}</div>
                <div style="white-space: pre-wrap; margin: 15px 0; padding: 15px; background: #fff3cd30; border-radius: 6px; line-height: 1.5;">
                    ${a.desc}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div><i class="fas fa-user-edit"></i> Operador: ${a.operador}</div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-info" onclick="app.abrirComentarios(${a.id})">
                            <i class="fas fa-comments"></i> Comentários (${a.comentarios ? a.comentarios.length : 0})
                        </button>
                        ${podeExcluir ?
                            `<button class="btn btn-danger" onclick="app.deleteAta(${a.id})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>` : ''
                        }
                    </div>
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
        
        this.showToast('OS salva com sucesso!', 'success');
        return osData;
    },

    abrirOSComEmail(event) {
        if (event) event.preventDefault();
        
        const condo = document.getElementById('os-condo').value;
        const funcionario = document.getElementById('os-funcionario').value.trim();
        const email = document.getElementById('os-email').value.trim();
        const setor = document.getElementById('os-setor').value;
        const gravidade = document.getElementById('os-gravidade').value;
        const desc = document.getElementById('os-desc').value.trim();
        
        if (!condo || !funcionario || !email || !setor || !gravidade || !desc) {
            this.showToast('Preencha todos os campos obrigatórios!', 'error');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showToast('E-mail inválido!', 'error');
            document.getElementById('os-email').focus();
            return;
        }
        
        const osId = 'OS-' + Date.now().toString().slice(-6);
        this.lastOSId = osId;
        
        const agora = new Date();
        const dataISO = agora.toISOString().split('T')[0];
        const hora = agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        
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
            hora: hora,
            funcionario: funcionario,
            email: email,
            setor: setor,
            operador: this.currentUser ? this.currentUser.nome : funcionario,
            user: this.currentUser ? this.currentUser.user : 'anonimo',
            turno: this.currentUser ? this.currentUser.turno : 'Não informado',
            status: 'Em branco',
            statusOS: 'Em branco',
            timestamp: agora.toISOString(),
            prazoResposta: appEmail ? appEmail.calcularPrazoPorGravidade(gravidade) : '3 dias úteis',
            corGravidade: appEmail ? appEmail.getCorGravidade(gravidade) : '#666',
            enviadoPorEmail: true,
            dataEnvioEmail: agora.toISOString(),
            tecnicoResponsavel: document.getElementById('os-tecnico').value || ''
        };
        
        this.saveOSComFirebase(novaOS);
        this.updateTabCounts();
        
        if (typeof appEmail !== 'undefined' && appEmail.adicionarCamposOcultosForm) {
            appEmail.adicionarCamposOcultosForm(osId, agora.toLocaleString('pt-BR'), novaOS.prazoResposta);
        }
        
        this.showToast('Processando OS...', 'info');
        
        setTimeout(() => {
            const form = document.getElementById('os-form-email');
            form.submit();
            
            if (typeof appEmail !== 'undefined' && appEmail.mostrarConfirmacaoOS) {
                appEmail.mostrarConfirmacaoOS(novaOS);
            } else {
                this.mostrarConfirmacaoOSFallback(novaOS);
            }
            
            this.criarNotificacao(condo, 'Ordem de Serviço', `Nova OS ${osId}: ${gravidade} - ${desc.substring(0, 50)}...`);
            this.showToast('Ordem de Serviço aberta com sucesso!', 'success');
        }, 100);
    },

    mostrarConfirmacaoOSFallback(osData) {
        document.getElementById('os-form-container').classList.add('hidden');
        
        const confirmationScreen = document.getElementById('os-confirmation-screen');
        confirmationScreen.classList.remove('hidden');
        
        document.getElementById('os-confirmation-id').textContent = osData.osId;
        document.getElementById('os-confirmation-condo').textContent = osData.condo;
        document.getElementById('os-confirmation-gravidade').textContent = osData.gravidade;
        document.getElementById('os-confirmation-funcionario').textContent = osData.funcionario;
        document.getElementById('os-confirmation-email').textContent = osData.email;
        document.getElementById('os-confirmation-data').textContent = `${osData.data} ${osData.hora}`;
    },

    filtrarOSTodas() {
        this.renderOS();
    },

    filtrarOSGravidade(gravidade) {
        const osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        const filtradas = osList.filter(os => os.gravidade === gravidade);
        this.renderOSList(filtradas, `Filtradas por gravidade: ${gravidade}`);
    },

    atualizarStatusOS(osId, novoStatus) {
        let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        const index = osList.findIndex(os => os.id === osId);
        
        if (index !== -1) {
            osList[index].statusOS = novoStatus;
            osList[index].status = novoStatus;
            osList[index].dataAtualizacao = new Date().toISOString();
            osList[index].atualizadoPor = this.currentUser.nome;
            
            localStorage.setItem('porter_os', JSON.stringify(osList));
            
            if (typeof firebaseHelper !== 'undefined' && firebaseHelper.salvarOSNoFirebase) {
                firebaseHelper.salvarOSNoFirebase(osList[index]);
            }
            
            this.renderOS();
            this.showToast('Status atualizado com sucesso!', 'success');
        }
    },

    excluirOS(osId) {
        if (this.currentUser.role !== 'TÉCNICO') {
            this.showToast('Apenas técnicos podem excluir OS', 'error');
            return;
        }
        
        if (!confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
            return;
        }
        
        let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        const osIndex = osList.findIndex(os => os.id === osId);
        
        if (osIndex !== -1) {
            let exclusoes = JSON.parse(localStorage.getItem('porter_exclusoes_os') || '[]');
            exclusoes.unshift({
                osId: osList[osIndex].osId,
                condo: osList[osIndex].condo,
                excluidoPor: this.currentUser.nome,
                data: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('porter_exclusoes_os', JSON.stringify(exclusoes));
            
            osList.splice(osIndex, 1);
            localStorage.setItem('porter_os', JSON.stringify(osList));
            
            if (window.db) {
                window.db.collection('ordens_servico').doc(osId.toString()).delete().catch(() => {});
            }
            
            this.renderOS();
            this.showToast('Ordem de Serviço excluída com sucesso!', 'success');
        }
    },

    renderOSList(osList, titulo = '') {
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
            const podeExcluir = this.currentUser && (this.currentUser.role === 'TÉCNICO');
            const podeMudarStatus = this.currentUser && (
                this.currentUser.role === 'TÉCNICO' || 
                (this.currentUser.role === 'OPERADOR' && os.statusOS === 'Técnico compareceu ao local')
            );
            
            const botoesStatus = this.gerarBotoesStatusOS(os, podeMudarStatus);
            
            const card = document.createElement('div');
            card.className = 'ata-card os fade-in';
            card.innerHTML = `
                <div class="ata-header">
                    <span><i class="far fa-calendar"></i> ${os.data} | <i class="far fa-clock"></i> ${os.hora}</span>
                    <span class="status-badge status-os" style="background: ${os.corGravidade || '#d6eaf8'};">
                        <i class="fas ${appEmail ? appEmail.getIconeGravidade(os.gravidade) : 'fa-circle'}"></i> ${os.gravidade}
                    </span>
                </div>
                <div class="ata-condo"><i class="fas fa-building"></i> ${os.condo} (${os.cidade})</div>
                <div class="ata-type os">
                    <i class="fas fa-business-time"></i> Prazo: ${os.prazoResposta || '3 dias úteis'}
                </div>
                ${os.tecnicoResponsavel ? `
                    <div style="margin: 10px 0; padding: 10px; background: var(--warning)20; border-radius: 6px; border-left: 4px solid var(--warning);">
                        <i class="fas fa-user-cog"></i> <strong>Técnico responsável:</strong> ${os.tecnicoResponsavel}
                    </div>
                ` : ''}
                ${os.funcionario ? `
                    <div style="margin: 10px 0; padding: 10px; background: var(--info)20; border-radius: 6px; border-left: 4px solid var(--info);">
                        <i class="fas fa-user"></i> <strong>Solicitante:</strong> ${os.funcionario} (${os.setor || 'Não informado'})<br>
                        <i class="fas fa-envelope"></i> <strong>E-mail:</strong> ${os.email || 'Não informado'}
                    </div>
                ` : ''}
                <div style="margin: 15px 0; padding: 15px; background: var(--hover-bg); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong><i class="fas fa-flag"></i> Status da OS:</strong>
                        <span class="os-status-badge ${this.getClasseStatusOS(os.statusOS)}">
                            ${this.getIconeStatusOS(os.statusOS)} ${os.statusOS || 'Em branco'}
                        </span>
                    </div>
                    ${os.atualizadoPor ? `
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            <i class="fas fa-user-edit"></i> Atualizado por: ${os.atualizadoPor}
                            ${os.dataAtualizacao ? ` em ${new Date(os.dataAtualizacao).toLocaleString('pt-BR')}` : ''}
                        </div>
                    ` : ''}
                    <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 5px;">
                        ${botoesStatus}
                    </div>
                </div>
                <div style="white-space: pre-wrap; margin: 15px 0; padding: 15px; background: var(--hover-bg); border-radius: 6px;">
                    ${os.desc}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; justify-content: space-between;">
                    <div>
                        <i class="fas fa-user-edit"></i> Operador: ${os.operador}
                        ${os.osId ? `<br><i class="fas fa-hashtag"></i> OS: ${os.osId}` : ''}
                    </div>
                    ${podeExcluir ?
                        `<button class="btn btn-danger" onclick="app.excluirOS(${os.id})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>` : ''
                    }
                </div>
            `;
            
            list.appendChild(card);
        });
    },

    gerarBotoesStatusOS(os, podeMudarStatus) {
        if (!podeMudarStatus) return '';
        
        const statusOptions = [
            { value: 'Resolvida', label: '✅ Resolvida', class: 'tec-only', icon: 'fa-check-circle' },
            { value: 'Técnico resolveu remotamente', label: '🖥️ Remotamente', class: 'tec-only', icon: 'fa-desktop' },
            { value: 'Em espera', label: '⏳ Em espera', class: 'tec-only', icon: 'fa-clock' },
            { value: 'Técnico compareceu ao local', label: '📍 Compareceu', class: 'all', icon: 'fa-map-marker-alt' },
            { value: 'Manutenção por conta do condomínio', label: '🏢 Condomínio', class: 'tec-only', icon: 'fa-building' },
            { value: 'Em branco', label: '📄 Em branco', class: 'tec-only', icon: 'fa-file' }
        ];
        
        let botoes = '';
        
        statusOptions.forEach(status => {
            const podeUsar = status.class === 'all' || 
                           (status.class === 'tec-only' && this.currentUser.role === 'TÉCNICO');
            
            if (podeUsar) {
                botoes += `
                    <button class="status-action-btn" 
                            onclick="app.atualizarStatusOS(${os.id}, '${status.value}')"
                            style="background: ${os.statusOS === status.value ? 'var(--accent)' : 'var(--info)'}; color: white;">
                        <i class="fas ${status.icon}"></i> ${status.label}
                    </button>
                `;
            }
        });
        
        return botoes;
    },

    getClasseStatusOS(status) {
        const classes = {
            'Resolvida': 'os-status-resolvida',
            'Técnico resolveu remotamente': 'os-status-remotamente',
            'Em espera': 'os-status-espera',
            'Técnico compareceu ao local': 'os-status-compareceu',
            'Manutenção por conta do condomínio': 'os-status-condominio',
            'Em branco': 'os-status-branco'
        };
        return classes[status] || 'os-status-branco';
    },

    getIconeStatusOS(status) {
        const icones = {
            'Resolvida': '✅',
            'Técnico resolveu remotamente': '🖥️',
            'Em espera': '⏳',
            'Técnico compareceu ao local': '📍',
            'Manutenção por conta do condomínio': '🏢',
            'Em branco': '📄'
        };
        return icones[status] || '📄';
    },

    renderOS() {
        const osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        this.renderOSList(osList);
    },

    deleteOS(id) {
        let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        const os = osList.find(o => o.id === id);
        
        if (!os) {
            this.showToast('Ordem de Serviço não encontrada.', 'error');
            return;
        }
        
        const ehAutor = os.user === this.currentUser.user;
        const ehAdmin = this.currentUser.role === 'ADMIN';
        const ehTecnico = this.currentUser.role === 'TÉCNICO';
        
        if (!ehAdmin && !ehAutor && !ehTecnico) {
            this.showToast('Sem permissão para excluir.', 'error');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
            osList = osList.filter(os => os.id !== id);
            localStorage.setItem('porter_os', JSON.stringify(osList));
            this.renderOS();
            this.showToast('Ordem de Serviço excluída!', 'success');
        }
    },

    deleteAta(id) {
        let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const ata = atas.find(a => a.id === id);
        
        if (!ata) {
            this.showToast('Registro não encontrado.', 'error');
            return;
        }
        
        const ehAutor = ata.user === this.currentUser.user;
        const ehAdmin = this.currentUser.role === 'ADMIN';
        const ehTecnico = this.currentUser.role === 'TÉCNICO';
        
        if (!ehAdmin && !ehAutor && !ehTecnico) {
            this.showToast('Sem permissão para excluir.', 'error');
            return;
        }
        
        if (confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
            let remocoes = JSON.parse(localStorage.getItem('porter_remocoes') || '[]');
            remocoes.unshift({
                id: Date.now(),
                tipo: ata.fixa ? 'Ata Fixa' : 'Ata',
                dados: ata,
                removidoPor: this.currentUser.nome,
                data: new Date().toLocaleDateString('pt-BR'),
                hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('porter_remocoes', JSON.stringify(remocoes));
            
            atas = atas.filter(a => a.id !== id);
            localStorage.setItem('porter_atas', JSON.stringify(atas));
            
            this.renderAll();
            this.showToast('Registro excluído com sucesso!', 'success');
        }
    },

    openReportModal() {
        document.getElementById('report-modal').classList.add('show');
    },

    closeReportModal() {
        document.getElementById('report-modal').classList.remove('show');
    },

    openAdminPanel() {
        const modalContent = document.getElementById('admin-modal-content');
        const sessions = JSON.parse(localStorage.getItem('porter_last_session') ? 
            [JSON.parse(localStorage.getItem('porter_last_session'))] : []);
        
        const operadoresLogados = DATA.funcionarios.filter(f => 
            sessions.some(s => s.user === f.user &&
                (new Date() - new Date(s.lastActivity)) < 300000));
        
        const tecnicosLogados = DATA.tecnicos.filter(t => {
            const tecUser = t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
            return sessions.some(s => s.user === tecUser &&
                (new Date() - new Date(s.lastActivity)) < 300000);
        });
        
        const todosLogados = [...operadoresLogados, ...tecnicosLogados.map(t => ({
            nome: t.nome,
            user: t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.'),
            role: 'TÉCNICO'
        }))];
        
        modalContent.innerHTML = `
            <h4><i class="fas fa-users"></i> Operadores Logados</h4>
            <div style="margin: 1rem 0; max-height: 200px; overflow-y: auto;">
                ${todosLogados.length > 0 ?
                    todosLogados.map(op => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-color);">
                            <div>
                                <strong>${op.nome}</strong>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">${op.role}</div>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="app.forceLogoff('${op.user}')">
                                <i class="fas fa-sign-out-alt"></i> Deslogar
                            </button>
                        </div>
                    `).join('') :
                    '<p style="text-align: center; color: #888; padding: 2rem;">Nenhum operador logado</p>'
                }
            </div>
            <h4 style="margin-top: 2rem;"><i class="fas fa-history"></i> Histórico de Remoções</h4>
            <div style="margin: 1rem 0; max-height: 200px; overflow-y: auto;">
                ${this.renderHistoricoRemocoes()}
            </div>
            <h4 style="margin-top: 2rem;"><i class="fas fa-trash"></i> Histórico de Exclusões de OS</h4>
            <div style="margin: 1rem 0; max-height: 200px; overflow-y: auto;">
                ${this.renderHistoricoExclusoesOS()}
            </div>
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
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

    renderHistoricoExclusoesOS() {
        const exclusoes = JSON.parse(localStorage.getItem('porter_exclusoes_os') || '[]');
        
        if (exclusoes.length === 0) {
            return '<p style="text-align: center; color: #888; padding: 1rem;">Nenhuma exclusão de OS registrada</p>';
        }
        
        return exclusoes.slice(0, 10).map(e => `
            <div style="padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
                <div><strong>OS ${e.osId}</strong> - ${e.condo || 'N/A'}</div>
                <div style="color: var(--text-secondary);">Excluído por: ${e.excluidoPor} | ${e.data} ${e.hora}</div>
            </div>
        `).join('');
    },

    closeAdminModal() {
        document.getElementById('admin-modal').classList.remove('show');
    },

    renderHistoricoRemocoes() {
        const remocoes = JSON.parse(localStorage.getItem('porter_remocoes') || '[]');
        
        if (remocoes.length === 0) {
            return '<p style="text-align: center; color: #888; padding: 1rem;">Nenhuma remoção registrada</p>';
        }
        
        return remocoes.slice(0, 10).map(r => `
            <div style="padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem;">
                <div><strong>${r.tipo}</strong> - ${r.dados.condo || 'N/A'}</div>
                <div style="color: var(--text-secondary);">Removido por: ${r.removidoPor} | ${r.data} ${r.hora}</div>
            </div>
        `).join('');
    },

    forceLogoff(user) {
        if (confirm(`Tem certeza que deseja deslogar este usuário?`)) {
            let usuario = DATA.funcionarios.find(f => f.user === user);
            if (!usuario) {
                usuario = DATA.tecnicos.find(t => 
                    t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.') === user
                );
                if (usuario) {
                    usuario = {
                        nome: usuario.nome,
                        user: usuario.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.'),
                        role: 'TÉCNICO'
                    };
                }
            }
            
            if (usuario) {
                const logoffs = JSON.parse(localStorage.getItem('porter_logoffs') || '[]');
                logoffs.unshift({
                    user: usuario.user,
                    nome: usuario.nome,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                    timestamp: new Date().toISOString(),
                    turno: 'Forçado',
                    forçado: true,
                    por: this.currentUser.nome
                });
                localStorage.setItem('porter_logoffs', JSON.stringify(logoffs));
            }
            
            localStorage.removeItem('porter_last_session');
            this.showToast('Usuário deslogado com sucesso!', 'success');
            this.openAdminPanel();
        }
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
            remocoes: JSON.parse(localStorage.getItem('porter_remocoes') || '[]'),
            exportDate: new Date().toISOString(),
            exportBy: this.currentUser.nome
        };
        
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `backup-porter-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showToast('Backup exportado com sucesso!', 'success');
    },

    clearAllData() {
        if (confirm('ATENÇÃO: Esta ação irá APAGAR TODOS os dados do sistema. Tem certeza?')) {
            localStorage.clear();
            
            localStorage.setItem('porter_condominios', JSON.stringify(DATA.condominios));
            localStorage.setItem('porter_funcionarios', JSON.stringify(DATA.funcionarios));
            localStorage.setItem('porter_tecnicos', JSON.stringify(DATA.tecnicos));
            
            location.reload();
        }
    },

    renderAll() {
        this.renderAta();
        this.renderFixas();
        this.renderOS();
        this.renderPresenca();
    },

    renderAta() {
        const list = document.getElementById('ata-lista');
        const info = document.getElementById('resultados-info-ata');
        
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
        
        const totalAtas = JSON.parse(localStorage.getItem('porter_atas') || '[]').filter(a => !a.fixa).length;
        
        info.innerHTML = `
            <div class="active-filters">
                <i class="fas fa-chart-bar"></i>
                Mostrando ${atas.length} de ${totalAtas} registros
                ${this.filtrosAtas.condo ? `<span>Condomínio: ${this.filtrosAtas.condo}</span>` : ''}
                ${this.filtrosAtas.dataInicio || this.filtrosAtas.dataFim ? `<span>Período: ${this.formatarDataBR(this.filtrosAtas.dataInicio)} a ${this.formatarDataBR(this.filtrosAtas.dataFim)}</span>` : ''}
                ${this.filtrosAtas.tipo ? `<span>Tipo: ${this.filtrosAtas.tipo}</span>` : ''}
                ${this.filtrosAtas.status ? `<span>Status: ${this.filtrosAtas.status}</span>` : ''}
            </div>
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
            const podeExcluir = this.currentUser && (this.currentUser.role === 'ADMIN' || a.user === this.currentUser.user || this.currentUser.role === 'TÉCNICO');
            
            const card = document.createElement('div');
            card.className = 'ata-card fade-in';
            card.innerHTML = `
                <div class="ata-header">
                    <span><i class="far fa-calendar"></i> ${a.data} | <i class="far fa-clock"></i> ${a.hora} | <i class="fas fa-user-clock"></i> Turno: ${a.turno}</span>
                    <span class="status-badge ${a.status === 'Finalizado' ? 'status-finalizado' : 'status-andamento'}">
                        <i class="fas fa-${a.status === 'Finalizado' ? 'check-circle' : 'sync-alt'}"></i> ${a.status}
                    </span>
                </div>
                <div class="ata-condo"><i class="fas fa-building"></i> ${a.condo} (${a.cidade})</div>
                <div class="ata-type"><i class="fas fa-tag"></i> ${a.tipo}</div>
                <div style="white-space: pre-wrap; margin: 15px 0; padding: 15px; background: var(--hover-bg); border-radius: 6px;">
                    ${a.desc}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); border-top: 1px solid var(--border-color); padding-top: 10px; display: flex; justify-content: space-between;">
                    <div><i class="fas fa-user-edit"></i> Operador: ${a.operador}</div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-info" onclick="app.abrirComentarios(${a.id})">
                            <i class="fas fa-comments"></i> Comentários (${a.comentarios ? a.comentarios.length : 0})
                        </button>
                        ${podeExcluir ?
                            `<button class="btn btn-danger" onclick="app.deleteAta(${a.id})">
                                <i class="fas fa-trash"></i> Excluir
                            </button>` : ''
                        }
                    </div>
                </div>
            `;
            
            list.appendChild(card);
        });
        
        this.mostrarFiltrosAtivosAtas();
    },

    loadPrivateChatUsers() {
        if (!this.currentUser) return;
        
        const select = document.getElementById('private-chat-target');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        const onlineData = localStorage.getItem('porter_online_firebase');
        let usuariosDisponiveis = [];
        
        if (onlineData) {
            try {
                const data = JSON.parse(onlineData);
                const dataTime = new Date(data.timestamp);
                const agora = new Date();
                const diferencaSegundos = (agora - dataTime) / 1000;
                
                if (diferencaSegundos < 10) {
                    data.users.forEach(usuario => {
                        if (usuario.user === app.currentUser.user) return;
                        usuariosDisponiveis.push({
                            nome: usuario.nome,
                            user: usuario.user,
                            role: usuario.role,
                            online: true
                        });
                    });
                }
            } catch (e) {
                console.error('Erro ao parsear dados online:', e);
            }
        }
        
        if (usuariosDisponiveis.length === 0) {
            DATA.funcionarios.forEach(f => {
                if (f.user !== app.currentUser.user) {
                    usuariosDisponiveis.push({
                        nome: f.nome,
                        user: f.user,
                        role: f.role,
                        online: false
                    });
                }
            });
            
            DATA.tecnicos.forEach(t => {
                const tecUser = t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
                if (tecUser !== app.currentUser.user) {
                    usuariosDisponiveis.push({
                        nome: t.nome,
                        user: tecUser,
                        role: 'TÉCNICO',
                        online: false
                    });
                }
            });
        }
        
        usuariosDisponiveis.sort((a, b) => a.nome.localeCompare(b.nome));
        
        usuariosDisponiveis.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.user;
            
            let texto = usuario.nome;
            if (usuario.role === 'ADMIN') texto += ' 👑';
            if (usuario.role === 'TÉCNICO') texto += ' 🔧';
            if (usuario.online) texto += ' 🟢';
            else texto += ' ⚫';
            
            option.textContent = texto;
            select.appendChild(option);
        });
    },

    loadPrivateChat() {
        if (!app.currentUser || !app.currentPrivateChatTarget) return;
        
        if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChat) {
            chatSystem.loadPrivateChat();
        }
    },

    sendPrivateChatMessage() {
        if (!app.currentUser || !app.currentPrivateChatTarget) {
            this.showToast('Selecione um destinatário primeiro.', 'warning');
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
        if (!app.currentUser) {
            this.showToast('Você precisa estar logado para enviar mensagens.', 'warning');
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
            const loginDate = login.dataISO || login.data;
            const loginTime = new Date(login.timestamp).getTime();
            
            const logoffCorrespondente = logoffs.find(logoff => 
                logoff.user === login.user && 
                (logoff.dataISO || logoff.data) === loginDate &&
                new Date(logoff.timestamp).getTime() > loginTime
            );
            
            historicoCombinado.push({
                nome: login.nome,
                turno: login.turno,
                data: login.data,
                horaLogin: login.hora,
                horaLogoff: logoffCorrespondente ? logoffCorrespondente.hora : '—',
                timestampLogin: login.timestamp,
                timestampLogoff: logoffCorrespondente ? logoffCorrespondente.timestamp : null
            });
        });
        
        logoffs.forEach(logoff => {
            const jaExiste = historicoCombinado.some(item => 
                item.nome === logoff.nome && 
                item.data === logoff.data &&
                item.horaLogoff === logoff.hora
            );
            
            if (!jaExiste) {
                historicoCombinado.push({
                    nome: logoff.nome,
                    turno: logoff.turno || '—',
                    data: logoff.data,
                    horaLogin: '—',
                    horaLogoff: logoff.hora,
                    timestampLogin: null,
                    timestampLogoff: logoff.timestamp
                });
            }
        });
        
        historicoCombinado.sort((a, b) => {
            const timeA = a.timestampLogoff || a.timestampLogin || 0;
            const timeB = b.timestampLogoff || b.timestampLogin || 0;
            return new Date(timeB) - new Date(timeA);
        });
        
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
                    <td colspan="5" style="text-align: center; padding: 3rem; color: var(--gray);">
                        <i class="fas fa-history" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                        Nenhum registro encontrado
                    </td>
                </tr>
            `;
            return;
        }
        
        list.innerHTML = historicoCombinado.map(p => `
            <tr>
                <td><i class="fas fa-user-circle"></i> ${p.nome}</td>
                <td><span style="padding: 4px 10px; background: ${p.turno === 'Diurno' ? 'var(--warning)20' : 'var(--info)20'}; border-radius: 4px;">${p.turno}</span></td>
                <td>${p.data}</td>
                <td><i class="fas fa-sign-in-alt" style="color: var(--success);"></i> ${p.horaLogin}</td>
                <td><i class="fas fa-sign-out-alt" style="color: var(--danger);"></i> ${p.horaLogoff}</td>
            </tr>
        `).join('');
    }
};
