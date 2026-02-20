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
        console.log('🚀 Inicializando app...');
        
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
        this
