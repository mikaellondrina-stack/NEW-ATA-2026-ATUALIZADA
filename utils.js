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
        if (typeof chatSystem !== 'undefined') {
            chatSystem.sendChatMessage();
        }
    },

    loadPrivateChat() {
        if (typeof chatSystem !== 'undefined') {
            chatSystem.loadPrivateChat();
        }
    },

    sendPrivateChatMessage() {
        if (typeof chatSystem !== 'undefined') {
            chatSystem.sendPrivateChatMessage();
        }
    },

    generatePDF() {
        if (typeof pdfGenerator !== 'undefined') {
            pdfGenerator.generatePDF();
        }
    },

    voltarParaFormOS() {
        if (typeof appEmail !== 'undefined') {
            appEmail.voltarParaFormOS();
        }
    },

    verDetalhesEmailOS(osId) {
        if (typeof appEmail !== 'undefined') {
            appEmail.verDetalhesEmailOS(osId);
        }
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
            } else if (app && app.currentUser) {
                localStorage.setItem('porter_sessao', JSON.stringify({
                    user: app.currentUser,
                    timestamp: new Date().toISOString()
                }));
            }
        }
    }
});

window.sendChatMessage = function() {
    if (typeof chatSystem !== 'undefined') {
        chatSystem.sendChatMessage();
    } else {
        utils.sendChatMessage();
    }
};

window.loadPrivateChat = function() {
    if (typeof chatSystem !== 'undefined') {
        chatSystem.loadPrivateChat();
    } else {
        utils.loadPrivateChat();
    }
};

window.sendPrivateChatMessage = function() {
    if (typeof chatSystem !== 'undefined') {
        chatSystem.sendPrivateChatMessage();
    } else {
        utils.sendPrivateChatMessage();
    }
};

window.generatePDF = function() {
    if (typeof pdfGenerator !== 'undefined') {
        pdfGenerator.generatePDF();
    } else {
        utils.generatePDF();
    }
};

window.voltarParaFormOS = function() {
    if (typeof appEmail !== 'undefined') {
        appEmail.voltarParaFormOS();
    } else {
        utils.voltarParaFormOS();
    }
};

window.verDetalhesEmailOS = function(osId) {
    if (typeof appEmail !== 'undefined') {
        appEmail.verDetalhesEmailOS(osId);
    } else {
        utils.verDetalhesEmailOS(osId);
    }
};

window.destacarMensagemChat = utils.destacarMensagemChat;
window.fecharModalEmail = utils.fecharModalEmail;
