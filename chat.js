const chatSystem = {
    init() {
        this.setupFirebaseListener();
    },

    setupFirebaseListener() {
        if (!window.db) return;

        window.db
            .collection("chat_messages")
            .doc("global")
            .collection("messages")
            .orderBy("timestamp")
            .onSnapshot(snapshot => {
                const mensagens = [];
                snapshot.forEach(doc => mensagens.push(doc.data()));

                if (window.app) {
                    window.app.data.chat = mensagens;
                    window.app.renderChat();
                }
            });
    },

    sendChatMessage() {
        const input = document.getElementById("chat-input");
        const msg = input.value.trim();
        if (!msg || !window.app.currentUser) return;

        const data = {
            sender: app.currentUser.nome,
            senderRole: app.currentUser.role,
            senderMood: app.getMoodAtual(),
            message: msg,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString("pt-BR"),
            date: new Date().toLocaleDateString("pt-BR")
        };

        window.db
            .collection("chat_messages")
            .doc("global")
            .collection("messages")
            .add(data);

        input.value = "";
    }
};
