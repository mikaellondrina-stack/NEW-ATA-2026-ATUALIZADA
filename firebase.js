// Configuração do Firebase
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

// Funções auxiliares
const firebaseHelper = {

    salvarAtaNoFirebase(ata) {
        if (!window.db) return Promise.resolve(false);
        return window.db.collection('atas').doc(ata.id.toString()).set(ata);
    },

    buscarAtasDoFirebase() {
        return window.db.collection('atas').orderBy('timestamp', 'desc').get()
            .then(s => s.docs.map(d => d.data()));
    },

    salvarOSNoFirebase(os) {
        return window.db.collection('ordens_servico').doc(os.id.toString()).set(os);
    },

    buscarOSDoFirebase() {
        return window.db.collection('ordens_servico').orderBy('timestamp', 'desc').get()
            .then(s => s.docs.map(d => d.data()));
    },

    sincronizarDados() {
        const atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        atas.forEach(a => this.salvarAtaNoFirebase(a));

        const os = JSON.parse(localStorage.getItem('porter_os') || '[]');
        os.forEach(o => this.salvarOSNoFirebase(o));
    },

    // -------- ONLINE REAL --------

    sincronizarStatusOnlineComFirebase() {
        if (!window.db || !window.app || !app.currentUser) return;

        const statusOnline = {
            user: app.currentUser.user,
            nome: app.currentUser.nome,
            role: app.currentUser.role,
            lastActivity: Date.now(),
            online: true
        };

        window.db.collection('online_users')
            .doc(app.currentUser.user)
            .set(statusOnline);
    },

    configurarMonitoramentoOnlineFirebase() {
        if (!window.db) return;

        window.db.collection('online_users')
            .onSnapshot(snapshot => {

                const agora = Date.now();
                const online = [];

                snapshot.forEach(doc => {
                    const u = doc.data();
                    if (agora - u.lastActivity < 30000) { // 30s
                        online.push(u);
                    }
                });

                localStorage.setItem('porter_online_firebase', JSON.stringify(online));

                if (window.app && app.updateOnlineUsers) {
                    app.updateOnlineUsers();
                }
            });
    },

    // Quando fecha aba = offline
    marcarOfflineAoSair() {
        window.addEventListener("beforeunload", () => {
            if (window.app && app.currentUser) {
                window.db.collection('online_users')
                    .doc(app.currentUser.user)
                    .update({ online: false });
            }
        });
    },

    // -------- CHAT --------

    configurarChatTempoReal() {
        window.db.collection('chat')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const msgs = [];
                snapshot.forEach(doc => {
                    msgs.push({ ...doc.data(), firebaseId: doc.id });
                });
                localStorage.setItem('porter_chat', JSON.stringify(msgs));
                if (window.chatSystem) chatSystem.loadChat();
                if (window.app && app.atualizarBadgeChat) app.atualizarBadgeChat();
            });
    },

    configurarNotificacoesTempoReal() {
        window.db.collection('notificacoes')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot(snapshot => {
                const nots = [];
                snapshot.forEach(doc => nots.push(doc.data()));
                localStorage.setItem('porter_notificacoes', JSON.stringify(nots));
                if (window.app && app.loadNotifications) app.loadNotifications();
            });
    },

    inicializarFirebase() {
        console.log('✅ Firebase online');

        this.sincronizarDados();
        this.configurarMonitoramentoOnlineFirebase();
        this.marcarOfflineAoSair();
        this.configurarChatTempoReal();
        this.configurarNotificacoesTempoReal();

        // Ping a cada 10s
        setInterval(() => {
            this.sincronizarStatusOnlineComFirebase();
        }, 10000);
    }
};

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        firebaseHelper.inicializarFirebase();
    });
} else {
    firebaseHelper.inicializarFirebase();
}
