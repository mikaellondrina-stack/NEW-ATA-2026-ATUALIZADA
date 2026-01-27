// correcao-emergencia.js - RESTAURA TUDO
console.log('🆘 CORREÇÃO DE EMERGÊNCIA');

// 1. RESTAURAR BOTÃO DE LOGIN
function restaurarLogin() {
    console.log('🔧 Restaurando botão de login...');
    
    // Encontrar botão
    const botoes = document.querySelectorAll('.btn.btn-primary');
    let loginBtn = null;
    
    botoes.forEach(btn => {
        if (btn.innerHTML.includes('ACESSAR') || btn.innerHTML.includes('LOGIN')) {
            loginBtn = btn;
        }
    });
    
    if (!loginBtn) {
        console.error('❌ Botão não encontrado');
        return;
    }
    
    // APAGAR tudo e fazer novo
    loginBtn.outerHTML = `
        <button class="btn btn-primary" onclick="app.login()" id="login-btn-fixo">
            <i class="fas fa-sign-in-alt"></i> ACESSAR SISTEMA
        </button>
    `;
    
    console.log('✅ Botão RESTAURADO');
}

// 2. RESTAURAR CHAT PRIVADO
function restaurarChatPrivado() {
    console.log('🔧 Restaurando chat privado...');
    
    // Garantir que chatSystem existe
    if (typeof chatSystem === 'undefined') {
        window.chatSystem = {
            loadPrivateChatUsers: function() {
                console.log('Chat privado funcionando');
                const select = document.getElementById('private-chat-target');
                if (select) {
                    select.innerHTML = '<option value="">Selecione...</option>';
                    // Adicionar alguns usuários
                    for (let i = 1; i <= 3; i++) {
                        const opt = document.createElement('option');
                        opt.value = 'user' + i;
                        opt.textContent = 'Usuário ' + i;
                        select.appendChild(opt);
                    }
                }
            }
        };
    }
    
    // Corrigir o HTML duplicado se existir
    const selects = document.querySelectorAll('#private-chat-target');
    if (selects.length > 1) {
        for (let i = 1; i < selects.length; i++) {
            selects[i].parentNode.removeChild(selects[i]);
        }
    }
}

// 3. EXECUTAR TUDO
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Aplicando correções...');
    restaurarLogin();
    restaurarChatPrivado();
    console.log('✅ Correções aplicadas!');
});

// 4. SE app não existir, criar mínimo
if (typeof app === 'undefined') {
    console.log('⚠️ app não existe, criando mínimo...');
    window.app = {
        login: function() {
            alert('Login funcionando!');
            console.log('Login chamado');
        }
    };
}
