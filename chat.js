    // CHAT PRIVADO
    loadPrivateChatUsers() {
        if (!app.currentUser) return;
        
        const select = document.getElementById('private-chat-target');
        if (!select) return;
        
        select.innerHTML = '<option value="">Selecione um operador...</option>';
        
        // 🆕 ADICIONAR: OPÇÃO PARA SELECIONAR TODOS OS USUÁRIOS
        const selectAllOption = document.createElement('option');
        selectAllOption.value = "TODOS_USUARIOS";
        selectAllOption.textContent = "🔄 ENVIAR PARA TODOS OS USUÁRIOS";
        selectAllOption.style.fontWeight = "bold";
        selectAllOption.style.backgroundColor = "#e3f2fd";
        select.appendChild(selectAllOption);
        
        // Separador visual
        const separator = document.createElement('option');
        separator.disabled = true;
        separator.textContent = "──────────── OPERADORES ────────────";
        select.appendChild(separator);
        
        // Filtrar para não incluir o usuário atual
        const outrosOperadores = DATA.funcionarios.filter(f => 
            f.user !== app.currentUser.user
        );
        
        // Agrupar por função/role
        const operadoresNormais = outrosOperadores.filter(op => op.role === 'OPERADOR');
        const adminsETecnicos = outrosOperadores.filter(op => op.role !== 'OPERADOR');
        
        // Adicionar operadores normais
        operadoresNormais.forEach(op => {
            const option = document.createElement('option');
            option.value = op.user;
            option.textContent = `${op.nome} (${op.role})`;
            option.dataset.role = op.role;
            select.appendChild(option);
        });
        
        // Separador para ADMIN/TÉCNICOS
        if (adminsETecnicos.length > 0) {
            const separator2 = document.createElement('option');
            separator2.disabled = true;
            separator2.textContent = "──────────── ADMIN/TÉCNICOS ────────────";
            select.appendChild(separator2);
            
            adminsETecnicos.forEach(op => {
                const option = document.createElement('option');
                option.value = op.user;
                option.textContent = `${op.nome} (${op.role})`;
                option.dataset.role = op.role;
                if (op.role === 'ADMIN') {
                    option.style.color = "#d32f2f";
                    option.style.fontWeight = "bold";
                }
                select.appendChild(option);
            });
        }
        
        // Separador para TÉCNICOS EXTERNOS
        const separator3 = document.createElement('option');
        separator3.disabled = true;
        separator3.textContent = "──────────── TÉCNICOS EXTERNOS ────────────";
        select.appendChild(separator3);
        
        // 🆕 ADICIONAR TÉCNICOS À LISTA com categorias
        const tecnicosPorCategoria = {};
        DATA.tecnicos.forEach(tec => {
            const tecUser = tec.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
            if (tecUser !== app.currentUser.user) {
                if (!tecnicosPorCategoria[tec.categoria]) {
                    tecnicosPorCategoria[tec.categoria] = [];
                }
                tecnicosPorCategoria[tec.categoria].push(tec);
            }
        });
        
        // Adicionar técnicos por categoria
        Object.keys(tecnicosPorCategoria).forEach(categoria => {
            const categoriaGroup = document.createElement('optgroup');
            categoriaGroup.label = categoria;
            
            tecnicosPorCategoria[categoria].forEach(tec => {
                const tecUser = tec.nome.split(' - ')[0].toLowerCase().replace(/\s+/g, '.');
                const option = document.createElement('option');
                option.value = tecUser;
                option.textContent = tec.nome;
                option.dataset.role = 'TÉCNICO';
                categoriaGroup.appendChild(option);
            });
            
            select.appendChild(categoriaGroup);
        });
        
        // 🆕 ADICIONAR: Event listener para mudança de seleção
        select.addEventListener('change', function() {
            const selectedValue = this.value;
            const selectedOption = this.options[this.selectedIndex];
            
            // Se selecionar "ENVIAR PARA TODOS"
            if (selectedValue === "TODOS_USUARIOS") {
                if (confirm("⚠️ ATENÇÃO!\n\nVocê está prestes a enviar uma mensagem para TODOS os usuários do sistema.\n\nEsta mensagem será entregue individualmente para cada operador/administrador/técnico.\n\nDeseja continuar?")) {
                    app.currentPrivateChatTarget = selectedValue;
                    const input = document.getElementById('chat-private-input');
                    const sendBtn = document.getElementById('chat-private-send-btn');
                    input.disabled = false;
                    sendBtn.disabled = false;
                    input.placeholder = "Digite uma mensagem para TODOS os usuários...";
                    input.focus();
                } else {
                    this.value = "";
                    app.currentPrivateChatTarget = null;
                    const input = document.getElementById('chat-private-input');
                    const sendBtn = document.getElementById('chat-private-send-btn');
                    input.disabled = true;
                    sendBtn.disabled = true;
                    input.placeholder = "Selecione um destinatário para começar...";
                }
            } else if (selectedValue) {
                app.currentPrivateChatTarget = selectedValue;
                const input = document.getElementById('chat-private-input');
                const sendBtn = document.getElementById('chat-private-send-btn');
                input.disabled = false;
                sendBtn.disabled = false;
                input.placeholder = `Mensagem para ${selectedOption.textContent.split('(')[0].trim()}...`;
                input.focus();
                
                // Carregar histórico do chat com este usuário
                chatSystem.loadPrivateChat();
            } else {
                app.currentPrivateChatTarget = null;
                const input = document.getElementById('chat-private-input');
                const sendBtn = document.getElementById('chat-private-send-btn');
                input.disabled = true;
                sendBtn.disabled = true;
                input.placeholder = "Selecione um destinatário para começar...";
                document.getElementById('chat-private-messages').innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--gray);">
                        <i class="fas fa-comments" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Selecione um destinatário para visualizar o histórico de conversas</p>
                    </div>
                `;
            }
        });
    },
