// Funções utilitárias para compatibilidade
const utils = {
    // Funções de compatibilidade
    fecharModalEmail() {
        const modal = document.getElementById('modal-email-detalhes');
        if (modal) modal.remove();
    },
    
    // Compatibilidade para chat privado
    loadPrivateChatUsers() {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChatUsers) {
            chatSystem.loadPrivateChatUsers();
        }
    },
    
    loadPrivateChat() {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChat) {
            chatSystem.loadPrivateChat();
        }
    },
    
    sendPrivateChatMessage() {
        if (typeof chatSystem !== 'undefined' && chatSystem.sendPrivateChatMessage) {
            chatSystem.sendPrivateChatMessage();
        }
    }
};

// Garantir compatibilidade global
window.loadPrivateChatUsers = utils.loadPrivateChatUsers;
window.loadPrivateChat = utils.loadPrivateChat;
window.sendPrivateChatMessage = utils.sendPrivateChatMessage;

// Outras funções de compatibilidade...
if (typeof chatSystem !== 'undefined') {
    window.sendChatMessage = chatSystem.sendChatMessage;
}

if (typeof pdfGenerator !== 'undefined') {
    window.generatePDF = pdfGenerator.generatePDF;
}

if (typeof appEmail !== 'undefined') {
    window.voltarParaFormOS = appEmail.voltarParaFormOS;
    window.verDetalhesEmailOS = appEmail.verDetalhesEmailOS;
}
// Funções utilitárias
const utils = {
    // FIX: botão de voltar para formulário OS
    fecharModalEmail() {
        const modal = document.getElementById('modal-email-detalhes');
        if (modal) modal.remove();
    },

    // FIX: função para destacar mensagem no chat
    destacarMensagemChat(mensagemId) {
        const mensagens = document.querySelectorAll('.chat-message');
        mensagens.forEach(msg => {
            msg.classList.remove('mensagem-destacada');
            if (msg.dataset.id === String(mensagemId)) {
                msg.classList.add('mensagem-destacada');
                msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    msg.classList.remove('mensagem-destacada');
                }, 5000);
            }
        });
    },

    // FIX: função para enviar mensagem no chat (compatibilidade)
    sendChatMessage() {
        chatSystem.sendChatMessage();
    },

    // FIX: função para carregar chat privado (compatibilidade)
    loadPrivateChat() {
        chatSystem.loadPrivateChat();
    },

    // FIX: função para enviar mensagem privada (compatibilidade)
    sendPrivateChatMessage() {
        chatSystem.sendPrivateChatMessage();
    },

    // FIX: função para gerar PDF (compatibilidade)
    generatePDF() {
        pdfGenerator.generatePDF();
    },

    // FIX: função para voltar ao formulário OS (compatibilidade)
    voltarParaFormOS() {
        appEmail.voltarParaFormOS();
    },

    // FIX: função para ver detalhes do email da OS (compatibilidade)
    verDetalhesEmailOS(osId) {
        appEmail.verDetalhesEmailOS(osId);
    }
};

// Tornar funções disponíveis globalmente para compatibilidade
window.sendChatMessage = chatSystem ? chatSystem.sendChatMessage : utils.sendChatMessage;
window.loadPrivateChat = chatSystem ? chatSystem.loadPrivateChat : utils.loadPrivateChat;
window.sendPrivateChatMessage = chatSystem ? chatSystem.sendPrivateChatMessage : utils.sendPrivateChatMessage;
window.generatePDF = pdfGenerator ? pdfGenerator.generatePDF : utils.generatePDF;
window.voltarParaFormOS = appEmail ? appEmail.voltarParaFormOS : utils.voltarParaFormOS;
window.verDetalhesEmailOS = appEmail ? appEmail.verDetalhesEmailOS : utils.verDetalhesEmailOS;
