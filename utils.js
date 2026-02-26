const utils = {
    fecharModalEmail() {
        const modal = document.getElementById('modal-email-detalhes');
        if (modal) modal.remove();
    },

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

    sendChatMessage() {
        chatSystem.sendChatMessage();
    },

    loadPrivateChat() {
        chatSystem.loadPrivateChat();
    },

    sendPrivateChatMessage() {
        chatSystem.sendPrivateChatMessage();
    },

    generatePDF() {
        pdfGenerator.generatePDF();
    },

    voltarParaFormOS() {
        appEmail.voltarParaFormOS();
    },

    verDetalhesEmailOS(osId) {
        appEmail.verDetalhesEmailOS(osId);
    }
};

function detectarAtualizacaoPagina() {
    if (window.performance && window.performance.navigation) {
        const tipoNavegacao = window.performance.navigation.type;
        
        if (tipoNavegacao === 1) {
            console.log('🔄 Página foi atualizada (F5)');
            
            if (typeof app !== 'undefined' && app.currentUser) {
                console.log('✅ Mantendo sessão do usuário:', app.currentUser.nome);
                app.salvarSessao();
            }
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectarAtualizacaoPagina);
} else {
    detectarAtualizacaoPagina();
}

window.addEventListener('beforeunload', function() {
    if (typeof app !== 'undefined' && app.currentUser) {
        app.salvarSessao();
    }
});

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (typeof app !== 'undefined' && app.currentUser) {
            console.log('📱 Página voltou a ficar visível');
            if (app && typeof app.salvarSessao === 'function') {
                app.salvarSessao();
            } else {
                if (app && app.currentUser) {
                    localStorage.setItem('porter_sessao', JSON.stringify({
                        user: app.currentUser,
                        timestamp: new Date().toISOString()
                    }));
                }
            }
        }
    }
});

window.sendChatMessage = chatSystem ? chatSystem.sendChatMessage : utils.sendChatMessage;
window.loadPrivateChat = chatSystem ? chatSystem.loadPrivateChat : utils.loadPrivateChat;
window.sendPrivateChatMessage = chatSystem ? chatSystem.sendPrivateChatMessage : utils.sendPrivateChatMessage;
window.generatePDF = pdfGenerator ? pdfGenerator.generatePDF : utils.generatePDF;
window.voltarParaFormOS = appEmail ? appEmail.voltarParaFormOS : utils.voltarParaFormOS;
window.verDetalhesEmailOS = appEmail ? appEmail.verDetalhesEmailOS : utils.verDetalhesEmailOS;
window.destacarMensagemChat = utils.destacarMensagemChat;
window.fecharModalEmail = utils.fecharModalEmail;
