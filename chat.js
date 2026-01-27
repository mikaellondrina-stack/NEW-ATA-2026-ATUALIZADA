// chat.js - VERSÃO SIMPLIFICADA E FUNCIONAL
console.log('=== chat.js CARREGADO ===');

// CRIAR chatSystem apenas SE não existir
if (typeof window.chatSystem === 'undefined') {
    window.chatSystem = {
        // 1. FUNÇÃO para carregar usuários no chat privado
        loadPrivateChatUsers: function() {
            console.log('Carregando usuários para chat privado...');
            
            const select = document.getElementById('private-chat-target');
            if (!select) {
                console.log('Select não encontrado');
                return;
            }
            
            // Limpar e adicionar opções
            select.innerHTML = '<option value="">Selecione um operador...</option>';
            
            if (window.DATA && window.DATA.funcionarios) {
                window.DATA.funcionarios.forEach(func => {
                    if (window.app && window.app.currentUser && 
                        func.user !== window.app.currentUser.user) {
                        const option = document.createElement('option');
                        option.value = func.user;
                        option.textContent = func.nome.split(' ')[0] + ' (' + func.role + ')';
                        select.appendChild(option);
                    }
                });
            }
        },
        
        // 2. FUNÇÃO básica para enviar mensagem no chat geral
        sendChatMessage: function() {
            console.log('Enviando mensagem no chat geral');
            const input = document.getElementById('chat-input');
            if (input && input.value.trim()) {
                console.log('Mensagem:', input.value);
                input.value = '';
            }
        },
        
        // 3. FUNÇÃO básica para enviar mensagem privada
        sendPrivateChatMessage: function() {
            console.log('Enviando mensagem privada');
            const input = document.getElementById('chat-private-input');
            if (input && input.value.trim()) {
                console.log('Mensagem privada:', input.value);
                input.value = '';
            }
        }
    };
    console.log('✅ chatSystem criado');
}
