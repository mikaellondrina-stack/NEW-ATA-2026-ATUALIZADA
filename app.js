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
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const sunIcon = themeToggle.querySelector('.fa-sun');
            const moonIcon = themeToggle.querySelector('.fa-moon');
            if (sunIcon && moonIcon) {
                sunIcon.classList.toggle('active', savedTheme === 'light');
                moonIcon.classList.toggle('active', savedTheme === 'dark');
            }
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('porter_theme', newTheme);
        
        const sunIcon = document.querySelector('#theme-toggle .fa-sun');
        const moonIcon = document.querySelector('#theme-toggle .fa-moon');
        if (sunIcon && moonIcon) {
            sunIcon.classList.toggle('active', newTheme === 'light');
            moonIcon.classList.toggle('active', newTheme === 'dark');
        }
    },

    showToast(message, type = 'info', title = '') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
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
        const loginPass = document.getElementById('login-pass');
        if (loginPass) {
            loginPass.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
        }

        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }

        const privateChatSelect = document.getElementById('private-chat-target');
        if (privateChatSelect) {
            privateChatSelect.addEventListener('change', (e) => {
                this.currentPrivateChatTarget = e.target.value;
                this.loadPrivateChat();
            });
        }

        const chatPrivateInput = document.getElementById('chat-private-input');
        if (chatPrivateInput) {
            chatPrivateInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendPrivateChatMessage();
                }
            });
        }

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

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
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
        
        const osFuncionario = document.getElementById('os-funcionario');
        const osEmail = document.getElementById('os-email');
        if (osFuncionario) osFuncionario.value = this.currentUser.nome;
        if (osEmail) osEmail.value = `${this.currentUser.user}@porter.com.br`;
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
        
        const selectedEl = document.querySelector(`.mood-option[data-id="${moodId}"]`);
        if (selectedEl) {
            selectedEl.classList.add('selected');
        }
        
        const moodStatus = document.getElementById('mood-status');
        if (moodStatus) {
            moodStatus.innerHTML = `
                <i class="fas fa-check-circle" style="color: ${selectedEl ? selectedEl.style.color : '#2ecc71'}"></i>
                <span>Selecionado: <strong>${this.selectedMood.status}</strong></span>
            `;
        }
        
        const submitBtn = document.getElementById('mood-submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    },

    enviarMood() {
        if (!this.selectedMood || !this.currentUser) return;
        
        const hoje = new Date();
        const dataISO = hoje.toISOString().split('T')[0];
        
        let moods = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        const indexExistente = moods.findIndex(m => m.user === this.currentUser.user && m.dataISO === dataISO);
        
        const mood
