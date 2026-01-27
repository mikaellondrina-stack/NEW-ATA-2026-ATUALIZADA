// Sistema de chat geral e privado
const chatSystem = {
    // ... mantém todo o resto do código que já está lá ...
    
    loadPrivateChatUsers() {
        if (!app.currentUser) return;
        
        const select = document.getElementById('private-chat-target');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        // Filtrar para não incluir o usuário atual
        const outrosOperadores = DATA.funcionarios.filter(f => 
            f.user !== app.currentUser.user
        );
        
        outrosOperadores.forEach(op => {
            const option = document.createElement('option');
            option.value = op.user;
            option.textContent = `${op.nome} (${op.role})`;
            select.appendChild(option);
        });
        
        // 🆕 ADICIONAR TÉCNICOS À LISTA
        DATA.tecnicos.forEach(tec => {
            const tecUser = tec.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
            if (tecUser !== app.currentUser.user) {
                const option = document.createElement('option');
                option.value = tecUser;
                option.textContent = `${tec.nome} (TÉCNICO)`;
                select.appendChild(option);
            }
        });
        
        // Configurar evento de mudança
        select.addEventListener('change', (e) => {
            app.currentPrivateChatTarget = e.target.value;
            this.loadPrivateChat();
        });
    },
    
    // ... resto das funções ...
};
// Sistema de chat geral e privado
const chatSystem = {
loadChat() {
const container = document.getElementById('chat-messages');
