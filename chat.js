// chat.js - VERSÃO CORRIGIDA
console.log('=== chat.js CARREGADO ===');

// Criar chatSystem imediatamente
window.chatSystem = {
    // CARREGAR USUÁRIOS PARA CHAT PRIVADO
    loadPrivateChatUsers: function() {
        console.log('🚀 chatSystem.loadPrivateChatUsers() executando...');
        
        // Esperar um pouco se app ainda não estiver pronto
        if (!window.app || !window.app.currentUser) {
            console.log('⏳ Aguardando app.currentUser...');
            setTimeout(() => this.loadPrivateChatUsers(), 500);
            return;
        }
        
        console.log('✅ Usuário logado:', window.app.currentUser.nome);
        
        const select = document.getElementById('private-chat-target');
        if (!select) {
            console.error('❌ Elemento #private-chat-target não encontrado!');
            return;
        }
        
        console.log('📋 Select encontrado, limpando opções...');
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        // Verificar DATA
        if (!window.DATA || !window.DATA.funcionarios) {
            console.error('❌ DATA.funcionarios não disponível');
            return;
        }
        
        console.log(`👥 Total de funcionários: ${window.DATA.funcionarios.length}`);
        
        // Adicionar TODOS os funcionários (exceto o atual)
        let contador = 0;
        window.DATA.funcionarios.forEach(func => {
            if (func.user !== window.app.currentUser.user) {
                const option = document.createElement('option');
                option.value = func.user;
                // Nome mais curto para display
                const nomeCurto = func.nome.split(' ')[0] + 
                                 (func.nome.split(' ')[1] ? ' ' + func.nome.split(' ')[1].charAt(0) + '.' : '');
                option.textContent = `${nomeCurto} (${func.role})`;
                option.title = func.nome; // Nome completo no tooltip
                select.appendChild(option);
                contador++;
            }
        });
        
        // Adicionar técnicos
        if (window.DATA.tecnicos && window.DATA.tecnicos.length > 0) {
            window.DATA.tecnicos.forEach(tec => {
                const tecUser = tec.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
                if (tecUser !== window.app.currentUser.user) {
                    const option = document.createElement('option');
                    option.value = tecUser;
                    option.textContent = `${tec.nome.split(' - ')[0]} (TÉCNICO)`;
                    select.appendChild(option);
                    contador++;
                }
            });
        }
        
        console.log(`✅ ${contador} usuários adicionados ao select`);
        
        // Habilitar campo de entrada
        const input = document.getElementById('chat-private-input');
        const sendBtn = document.getElementById('chat-private-send-btn');
        
        select.onchange = (e) => {
            const targetUser = e.target.value;
            window.app.currentPrivateChatTarget = targetUser;
            console.log('🎯 Destinatário selecionado:', targetUser);
            
            // Habilitar/desabilitar input
            if (input && sendBtn) {
                if (targetUser) {
                    input.disabled = false;
                    sendBtn.disabled = false;
                    input.placeholder = `Digite mensagem para ${targetUser}...`;
                } else {
                    input.disabled = true;
                    sendBtn.disabled = true;
                    input.placeholder = 'Selecione um destinatário primeiro...';
                }
            }
        };
    },
    
    // FUNÇÕES BÁSICAS
    sendChatMessage: function() {
        console.log('💬 Mensagem enviada ao chat geral');
        // Implementação básica
        const input = document.getElementById('chat-input');
        if (input && input.value.trim()) {
            console.log('Mensagem:', input.value);
            input.value = '';
        }
    },
    
    sendPrivateChatMessage: function() {
        console.log('🔒 Enviando mensagem privada');
        const input = document.getElementById('chat-private-input');
        if (input && input.value.trim() && window.app.currentPrivateChatTarget) {
            console.log(`Para: ${window.app.currentPrivateChatTarget}`);
            console.log('Mensagem:', input.value);
            input.value = '';
        }
    }
};

console.log('✅ chatSystem criado e disponível globalmente');
