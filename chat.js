// Sistema de Chat - ADAPTADO PARA SUPABASE
const chatSystem = {
    // 🔧 Inicialização do chat
    init() {
        console.log('💬 Chat System iniciado');
        // O listener do Supabase já está configurado em supabase.js
        // Aqui apenas carregamos as mensagens iniciais
        this.carregarMensagensIniciais();
    },

    // 🔧 Carregar mensagens iniciais do Supabase
    async carregarMensagensIniciais() {
        if (!window.supabaseClient) {
            console.log('⚠️ Supabase não disponível para chat');
            // Usar localStorage como fallback
            this.loadChat();
            return;
        }

        try {
            const { data, error } = await window.supabaseClient
                .from('chat_geral')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (error) throw error;

            console.log('📨 Mensagens carregadas do Supabase:', data.length);

            // Converter para formato local
            const mensagensLocais = data.map(item => ({
                id: parseInt(item.firebase_id) || Date.now(),
                sender: item.sender,
                senderRole: item.sender_role,
                senderMood: item.sender_mood,
                message: item.message,
                time: item.time,
                timestamp: item.timestamp,
                date: item.date,
                firebaseSync: true,
                supabase_id: item.id
            }));

            // Salvar no localStorage
            localStorage.setItem('porter_chat', JSON.stringify(mensagensLocais));
            
            // Atualizar interface
            this.loadChat();
            
        } catch (error) {
            console.error('❌ Erro ao carregar mensagens:', error);
            // Fallback para localStorage
            this.loadChat();
        }
    },

    // 🔧 Função principal de carregar chat (compatível com interface)
    loadChat() {
        if (!document.getElementById('chat-messages')) return;
        
        const container = document.getElementById('chat-messages');
        const chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        // Mostrar controles admin se for admin ou técnico
        if (window.app && window.app.currentUser && 
            (window.app.currentUser.role === 'ADMIN' || window.app.currentUser.role === 'TÉCNICO')) {
            const adminControls = document.getElementById('chat-admin-controls');
            if (adminControls) adminControls.style.display = 'flex';
        }
        
        if (chat.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por timestamp (mais antigas primeiro)
        const chatOrdenado = [...chat].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        container.innerHTML = '';
        
        chatOrdenado.forEach(msg => {
            const isSent = msg.sender === (window.app?.currentUser?.nome || '');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
            messageDiv.dataset.id = msg.id;
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        <span style="font-size: 1.1rem; margin-right: 5px;">${msg.senderMood || '😐'}</span>
                        ${msg.sender} ${msg.senderRole === 'ADMIN' ? ' 👑' : ''} ${msg.senderRole === 'TÉCNICO' ? ' 🔧' : ''}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.message}</div>
                ${window.app && window.app.currentUser && 
                 (window.app.currentUser.role === 'ADMIN' || window.app.currentUser.role === 'TÉCNICO') && !isSent ?
                    `<div style="margin-top: 5px; text-align: right;">
                        <button class="btn btn-danger btn-sm" onclick="chatSystem.deleteChatMessage(${msg.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>` :
                    ''
                }
            `;
            
            container.appendChild(messageDiv);
        });
        
        // Scroll para baixo
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
        
        // Atualizar badge
        if (window.app && window.app.atualizarBadgeChat) {
            window.app.atualizarBadgeChat();
        }
    },

    // 🔧 Enviar mensagem (adaptado para Supabase)
    async sendChatMessage() {
        if (!window.app || !window.app.currentUser) {
            alert('Você precisa estar logado para enviar mensagens.');
            return;
        }
        
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const sendBtn = document.getElementById('chat-send-btn');
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = '<div class="loading"></div>';
        sendBtn.disabled = true;
        
        // Criar objeto da mensagem
        const chatMessage = {
            id: Date.now(),
            sender: window.app.currentUser.nome,
            senderRole: window.app.currentUser.role,
            senderMood: window.app.getMoodAtual ? window.app.getMoodAtual() : '😐',
            message: message,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR'),
            firebaseSync: false
        };
        
        // 1. Salvar localmente
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chat.push(chatMessage);
        
        if (chat.length > 200) chat = chat.slice(-200);
        localStorage.setItem('porter_chat', JSON.stringify(chat));
        
        // 2. Enviar para Supabase (se disponível)
        if (window.supabaseHelper && window.supabaseHelper.enviarMensagemChatSupabase) {
            await window.supabaseHelper.enviarMensagemChatSupabase(chatMessage);
        }
        
        // 3. Limpar campo e restaurar botão
        input.value = '';
        
        setTimeout(() => {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }, 500);
        
        // 4. Recarregar chat
        this.loadChat();
        
        // 5. Criar notificação
        if (window.app && window.app.criarNotificacaoChatComAcao) {
            window.app.criarNotificacaoChatComAcao(chatMessage);
        }
    },

    // 🔧 Deletar mensagem (apenas para admin/tecnico)
    async deleteChatMessage(id) {
        if (!window.app || !window.app.currentUser || 
            (window.app.currentUser.role !== 'ADMIN' && window.app.currentUser.role !== 'TÉCNICO')) {
            alert('Apenas administradores ou técnicos podem excluir mensagens.');
            return;
        }
        
        if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;
        
        // 1. Remover do localStorage
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chat = chat.filter(msg => msg.id !== id);
        localStorage.setItem('porter_chat', JSON.stringify(chat));
        
        // 2. Remover do Supabase se possível (pela firebase_id)
        if (window.supabaseClient) {
            try {
                // Primeiro encontrar a mensagem para obter o firebase_id
                const mensagemRemovida = chat.find(msg => msg.id === id);
                if (mensagemRemovida && mensagemRemovida.firebase_id) {
                    await window.supabaseClient
                        .from('chat_geral')
                        .delete()
                        .eq('firebase_id', mensagemRemovida.firebase_id.toString());
                }
            } catch (error) {
                console.error('❌ Erro ao excluir mensagem do Supabase:', error);
            }
        }
        
        this.loadChat();
        
        if (window.app && window.app.updateTabCounts) {
            window.app.updateTabCounts();
        }
    },

    // 🔧 Limpar chat (apenas para admin/tecnico)
    async clearChat() {
        if (!window.app || !window.app.currentUser || 
            (window.app.currentUser.role !== 'ADMIN' && window.app.currentUser.role !== 'TÉCNICO')) {
            alert('Apenas administradores ou técnicos podem limpar o chat.');
            return;
        }
        
        if (!confirm('Tem certeza que deseja limpar todas as mensagens do chat?')) return;
        
        // 1. Limpar localStorage
        localStorage.removeItem('porter_chat');
        
        // 2. Limpar do Supabase se possível
        if (window.supabaseClient) {
            try {
                await window.supabaseClient
                    .from('chat_geral')
                    .delete()
                    .neq('id', 0); // Delete all
            } catch (error) {
                console.error('❌ Erro ao limpar chat do Supabase:', error);
            }
        }
        
        this.loadChat();
        
        if (window.app) {
            if (window.app.updateTabCounts) window.app.updateTabCounts();
            if (window.app.showMessage) window.app.showMessage('Chat limpo com sucesso!', 'success');
        }
    },

    // 🔧 Funções do chat privado (mantidas do sistema original)
    loadPrivateChatUsers() {
        if (!window.app || !window.app.currentUser) return;
        
        const select = document.getElementById('private-chat-target');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        // Usar lista de usuários do sistema
        const todosUsuarios = [
            ...window.DATA.funcionarios.filter(f => f.user !== window.app.currentUser.user),
            ...window.DATA.tecnicos.map(t => ({
                nome: t.nome,
                user: t.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.'),
                role: 'TÉCNICO'
            })).filter(t => t.user !== window.app.currentUser.user)
        ];
        
        todosUsuarios.sort((a, b) => a.nome.localeCompare(b.nome));
        
        todosUsuarios.forEach(user => {
            const option = document.createElement('option');
            option.value = user.user;
            option.textContent = `${user.nome} ${user.role === 'ADMIN' ? '👑' : ''} ${user.role === 'TÉCNICO' ? '🔧' : ''}`;
            select.appendChild(option);
        });
    },

    loadPrivateChat() {
        if (!window.app || !window.app.currentPrivateChatTarget) return;
        
        const container = document.getElementById('chat-private-messages');
        const privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        const chatId = this.getPrivateChatId(window.app.currentUser.user, window.app.currentPrivateChatTarget);
        const messages = privateChats[chatId] || [];
        
        // Habilitar campos
        const input = document.getElementById('chat-private-input');
        const sendBtn = document.getElementById('chat-private-send-btn');
        
        if (window.app.currentPrivateChatTarget) {
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
        }
        
        if (messages.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--gray);">
                        <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Nenhuma mensagem ainda. Comece a conversa!</p>
                    </div>
                `;
            }
            return;
        }
        
        const messagesOrdenado = [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (container) {
            container.innerHTML = '';
            
            messagesOrdenado.forEach(msg => {
                const isSent = msg.sender === window.app.currentUser.user;
                const messageDiv = document.createElement('div');
                messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
                
                const senderInfo = window.DATA.funcionarios.find(f => f.user === msg.sender) || 
                                  { nome: msg.sender, role: 'OPERADOR' };
                
                messageDiv.innerHTML = `
                    <div class="chat-message-header">
                        <span class="chat-message-sender">
                            <span style="font-size: 1.1rem; margin-right: 5px;">${msg.senderMood || '😐'}</span>
                            ${senderInfo.nome.split(' ')[0]} ${senderInfo.role === 'ADMIN' ? '👑' : ''}
                        </span>
                        <span class="chat-message-time">${msg.date} ${msg.time}</span>
                    </div>
                    <div class="chat-message-text">${msg.message}</div>
                `;
                
                container.appendChild(messageDiv);
            });
            
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    },

    sendPrivateChatMessage() {
        if (!window.app || !window.app.currentUser || !window.app.currentPrivateChatTarget) {
            alert('Selecione um destinatário primeiro.');
            return;
        }
        
        const input = document.getElementById('chat-private-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        const sendBtn = document.getElementById('chat-private-send-btn');
        const originalHTML = sendBtn.innerHTML;
        sendBtn.innerHTML = '<div class="loading"></div>';
        sendBtn.disabled = true;
        
        const chatId = this.getPrivateChatId(window.app.currentUser.user, window.app.currentPrivateChatTarget);
        
        const chatMessage = {
            id: Date.now(),
            sender: window.app.currentUser.user,
            senderName: window.app.currentUser.nome,
            senderRole: window.app.currentUser.role,
            senderMood: window.app.getMoodAtual ? window.app.getMoodAtual() : '😐',
            receiver: window.app.currentPrivateChatTarget,
            message: message,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        let privateChats = JSON.parse(localStorage.getItem('porter_chat_privado') || '{}');
        
        if (!privateChats[chatId]) {
            privateChats[chatId] = [];
        }
        
        privateChats[chatId].push(chatMessage);
        
        if (privateChats[chatId].length > 100) {
            privateChats[chatId] = privateChats[chatId].slice(-100);
        }
        
        localStorage.setItem('porter_chat_privado', JSON.stringify(privateChats));
        
        input.value = '';
        
        setTimeout(() => {
            sendBtn.innerHTML = originalHTML;
            sendBtn.disabled = false;
            input.focus();
        }, 500);
        
        this.loadPrivateChat();
        
        // Atualizar badge
        if (window.app && window.app.atualizarBadgeChatPrivado) {
            window.app.atualizarBadgeChatPrivado();
        }
    },

    getPrivateChatId(user1, user2) {
        const users = [user1, user2].sort();
        return `${users[0]}_${users[1]}`;
    }
};

// 🔧 Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        chatSystem.init();
    }, 2000);
});

// 🔧 Inicializar também quando o app estiver pronto
if (typeof window.app !== 'undefined') {
    // Manter compatibilidade com chamadas do app
    window.app.loadChat = function() {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadChat) {
            chatSystem.loadChat();
        }
    };
    
    window.app.sendChatMessage = function() {
        if (typeof chatSystem !== 'undefined' && chatSystem.sendChatMessage) {
            chatSystem.sendChatMessage();
        }
    };
    
    window.app.loadPrivateChat = function() {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChat) {
            chatSystem.loadPrivateChat();
        }
    };
    
    window.app.sendPrivateChatMessage = function() {
        if (typeof chatSystem !== 'undefined' && chatSystem.sendPrivateChatMessage) {
            chatSystem.sendPrivateChatMessage();
        }
    };
}
