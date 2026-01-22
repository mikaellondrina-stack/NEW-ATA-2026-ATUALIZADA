// ============================================
// 🔧 SISTEMA DE SCROLL INTELIGENTE PARA CHAT
// ============================================

// Adicionar estas variáveis ao objeto app
const app = {
    // ... (código existente mantido)
    
    chatScrollPosition: 0,
    chatLoadingOldMessages: false,
    chatHasMoreMessages: true,
    chatMessagesPerPage: 20,
    chatCurrentPage: 1,
    
    // 🔧 FUNÇÃO LOADCHAT COM SCROLL INTELIGENTE - VERSÃO CORRIGIDA
    loadChat(loadMore = false) {
        const container = document.getElementById('chat-messages');
        if (!container) {
            console.log("❌ Container de chat não encontrado");
            return;
        }
        
        // Se estiver carregando mais mensagens, mostrar indicador
        if (loadMore && !this.chatLoadingOldMessages) {
            this.chatLoadingOldMessages = true;
            
            // Adicionar indicador de carregamento no topo
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'chat-loading-old';
            loadingIndicator.innerHTML = `
                <div style="text-align: center; padding: 10px; color: #666;">
                    <div class="loading" style="display: inline-block; width: 20px; height: 20px;"></div>
                    <span style="margin-left: 10px;">Carregando mensagens antigas...</span>
                </div>
            `;
            container.insertBefore(loadingIndicator, container.firstChild);
            
            // Incrementar página
            this.chatCurrentPage++;
        }
        
        const chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        // Corrigir dados do chat se necessário
        const chatCorrigido = chat.map(msg => {
            return {
                id: msg.id || `chat_${Date.now()}`,
                sender: msg.sender || "Usuário",
                senderRole: msg.senderRole || "OPERADOR",
                senderMood: msg.senderMood || "😐",
                senderUser: msg.senderUser || "anonimo",
                message: msg.message || "(mensagem vazia)",
                time: msg.time || new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                timestamp: msg.timestamp || new Date().toISOString(),
                date: msg.date || new Date().toLocaleDateString('pt-BR')
            };
        });
        
        // Atualizar localStorage com dados corrigidos
        localStorage.setItem('porter_chat', JSON.stringify(chatCorrigido));
        
        // Ordenar por data (mais recentes primeiro)
        const chatOrdenado = [...chatCorrigido].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Calcular quais mensagens mostrar (paginação)
        const mensagensParaMostrar = chatOrdenado.slice(
            0, 
            this.chatCurrentPage * this.chatMessagesPerPage
        );
        
        // Verificar se há mais mensagens para carregar
        this.chatHasMoreMessages = mensagensParaMostrar.length < chatOrdenado.length;
        
        // Salvar scroll position antes de atualizar
        const oldScrollTop = container.scrollTop;
        const oldScrollHeight = container.scrollHeight;
        const wasAtBottom = this.isChatAtBottom(container);
        
        // Se não for loadMore, limpar container
        if (!loadMore) {
            container.innerHTML = '';
        } else {
            // Remover indicador de carregamento
            const loadingIndicator = document.getElementById('chat-loading-old');
            if (loadingIndicator) {
                loadingIndicator.remove();
            }
        }
        
        // Se não há mensagens
        if (mensagensParaMostrar.length === 0 && !loadMore) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--gray);">
                    <i class="fas fa-comment-slash" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
                </div>
            `;
            this.chatLoadingOldMessages = false;
            return;
        }
        
        // Renderizar mensagens (ordem reversa para carregamento de antigas)
        const mensagensParaRenderizar = loadMore ? 
            mensagensParaMostrar.slice(0, this.chatMessagesPerPage).reverse() :
            mensagensParaMostrar.reverse();
        
        mensagensParaRenderizar.forEach(msg => {
            const isSent = msg.senderUser === this.currentUser?.user;
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'} fade-in`;
            messageDiv.dataset.id = msg.id;
            
            messageDiv.innerHTML = `
                <div class="chat-message-header">
                    <span class="chat-message-sender">
                        <span style="font-size: 1.1rem; margin-right: 5px;">${msg.senderMood || '😐'}</span>
                        ${msg.sender} ${msg.senderRole === 'ADMIN' ? ' 👑' : ''}
                    </span>
                    <span class="chat-message-time">${msg.date} ${msg.time}</span>
                </div>
                <div class="chat-message-text">${msg.message}</div>
                ${this.currentUser && this.currentUser.role === 'ADMIN' && !isSent ? 
                    `<div style="margin-top: 5px; text-align: right;">
                        <button class="btn btn-danger btn-sm" onclick="app.deleteChatMessage(${msg.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>` : 
                    ''
                }
            `;
            
            if (loadMore) {
                container.insertBefore(messageDiv, container.firstChild);
            } else {
                container.appendChild(messageDiv);
            }
        });
        
        // Restaurar posição do scroll
        setTimeout(() => {
            if (loadMore) {
                // Manter posição após carregar mensagens antigas
                const newScrollHeight = container.scrollHeight;
                container.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
            } else if (wasAtBottom) {
                // Scroll para baixo se estava no final
                container.scrollTop = container.scrollHeight;
            }
            
            this.chatLoadingOldMessages = false;
        }, 50);
        
        // Mostrar "visto por"
        if (!loadMore) {
            this.mostrarVistoPor(container);
        }
        
        // Configurar scroll infinito
        this.setupChatScrollListener(container);
        
        // Registrar visualização
        this.registrarVisualizacaoChat();
        this.atualizarBadgeChat();
    },
    
    // 🔧 VERIFICAR SE SCROLL ESTÁ NO FINAL
    isChatAtBottom(container, threshold = 100) {
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    },
    
    // 🔧 CONFIGURAR LISTENER DE SCROLL PARA CARREGAMENTO INFINITO
    setupChatScrollListener(container) {
        // Remover listener antigo se existir
        if (container._scrollListener) {
            container.removeEventListener('scroll', container._scrollListener);
        }
        
        container._scrollListener = () => {
            // Se estiver no topo e houver mais mensagens
            if (container.scrollTop === 0 && 
                this.chatHasMoreMessages && 
                !this.chatLoadingOldMessages) {
                this.loadChat(true);
            }
            
            // Atualizar botão "rolar para baixo" se necessário
            this.updateScrollToBottomButton(container);
        };
        
        container.addEventListener('scroll', container._scrollListener);
    },
    
    // 🔧 BOTÃO PARA ROLAR PARA BAIXO
    updateScrollToBottomButton(container) {
        let scrollButton = document.getElementById('chat-scroll-to-bottom');
        const isAtBottom = this.isChatAtBottom(container, 150);
        
        if (!isAtBottom && !scrollButton) {
            // Criar botão
            scrollButton = document.createElement('button');
            scrollButton.id = 'chat-scroll-to-bottom';
            scrollButton.innerHTML = '<i class="fas fa-arrow-down"></i>';
            scrollButton.title = 'Rolar para as mensagens mais recentes';
            
            scrollButton.style.cssText = `
                position: absolute;
                bottom: 80px;
                right: 20px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1000;
                transition: all 0.3s ease;
                opacity: 0.9;
            `;
            
            scrollButton.onclick = () => {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            };
            
            scrollButton.onmouseover = () => {
                scrollButton.style.transform = 'scale(1.1)';
                scrollButton.style.opacity = '1';
            };
            
            scrollButton.onmouseout = () => {
                scrollButton.style.transform = 'scale(1)';
                scrollButton.style.opacity = '0.9';
            };
            
            container.parentElement.style.position = 'relative';
            container.parentElement.appendChild(scrollButton);
        } else if (isAtBottom && scrollButton) {
            scrollButton.remove();
        }
    },
    
    // 🔧 FUNÇÃO PARA ENVIAR MENSAGEM COM SCROLL AUTOMÁTICO
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        
        if (!message) return;
        if (!this.currentUser) {
            alert('Você precisa estar logado para enviar mensagens.');
            return;
        }

        const sendBtn = document.getElementById('chat-send-btn');
        const originalHTML = sendBtn?.innerHTML || '';
        if (sendBtn) {
            sendBtn.innerHTML = '<div class="loading"></div>';
            sendBtn.disabled = true;
        }
        
        const chatMessage = {
            id: Date.now(),
            sender: this.currentUser.nome,
            senderRole: this.currentUser.role,
            senderMood: this.getMoodAtual(),
            senderUser: this.currentUser.user,
            message: message,
            time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString('pt-BR')
        };
        
        // Salvar no localStorage
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        chat.unshift(chatMessage);
        if (chat.length > 500) chat = chat.slice(0, 500);
        localStorage.setItem('porter_chat', JSON.stringify(chat));
        
        // Sincronizar com Firebase se disponível
        if (this.firebaseEnabled) {
            this.sincronizarChatFirebase(chatMessage)
                .then(() => {
                    console.log("✅ Mensagem sincronizada com Firebase");
                })
                .catch(error => {
                    console.log("⚠️ Mensagem salva apenas localmente:", error);
                });
        }
        
        this.criarNotificacaoChatComAcao(chatMessage);
        if (input) input.value = '';
        
        setTimeout(() => {
            if (sendBtn) {
                sendBtn.innerHTML = originalHTML;
                sendBtn.disabled = false;
            }
        }, 500);
        
        // Carregar chat com scroll para baixo
        this.loadChat();
        
        // Forçar scroll para o final após um pequeno delay
        setTimeout(() => {
            const container = document.getElementById('chat-messages');
            if (container) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
        
        this.updateTabCounts();
    },
    
    // 🔧 SINCRONIZAR CHAT DO FIREBASE COM PERFORMANCE
    sincronizarChatDoFirebase() {
        if (!this.firebaseEnabled || this.chatLoadingOldMessages) return;
        
        try {
            db.collection("chat_messages")
                .orderBy("firebaseTimestamp", "desc")
                .limit(50)
                .get()
                .then(snapshot => {
                    if (snapshot.empty) return;
                    
                    let chatLocal = JSON.parse(localStorage.getItem('porter_chat') || '[]');
                    let atualizou = false;
                    
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        const msgId = data.id || parseInt(doc.id);
                        
                        // Verificar se já existe localmente
                        const existeLocal = chatLocal.some(msg => msg.id === msgId);
                        
                        if (!existeLocal && data.sender && data.message) {
                            chatLocal.unshift({
                                id: msgId,
                                sender: data.sender,
                                senderRole: data.senderRole,
                                senderMood: data.senderMood,
                                senderUser: data.senderUser,
                                message: data.message,
                                time: data.time,
                                date: data.date,
                                timestamp: data.timestamp || data.firebaseTimestamp?.toDate?.()?.toISOString() || new Date().toISOString()
                            });
                            atualizou = true;
                        }
                    });
                    
                    if (atualizou) {
                        // Manter limite de 500 mensagens para performance
                        if (chatLocal.length > 500) {
                            chatLocal = chatLocal.slice(0, 500);
                        }
                        
                        localStorage.setItem('porter_chat', JSON.stringify(chatLocal));
                        
                        // Atualizar apenas se estiver na aba de chat
                        const chatTab = document.getElementById('tab-chat');
                        if (chatTab && !chatTab.classList.contains('hidden')) {
                            setTimeout(() => {
                                this.loadChat();
                            }, 1000); // Debounce para evitar muitos updates
                        }
                    }
                })
                .catch(error => {
                    console.warn("⚠️ Erro ao sincronizar chat do Firebase:", error);
                });
        } catch (error) {
            console.warn("⚠️ Erro no Firebase durante sincronização do chat:", error);
        }
    },
    
    // 🔧 MOSTRAR VISTO POR (OTIMIZADO)
    mostrarVistoPor(container) {
        // Remover anterior se existir
        const existing = container.querySelector('.chat-visto-por');
        if (existing) existing.remove();
        
        const vistoPorDiv = document.createElement('div');
        vistoPorDiv.className = 'chat-visto-por';
        vistoPorDiv.style.cssText = `
            margin-top: 20px;
            padding: 10px 15px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #666;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        `;
        
        const visualizacoes = this.obterVisualizacoesRecentes();
        
        if (visualizacoes.length > 0) {
            const usuarios = visualizacoes.map(v => 
                `${v.nome.split(' ')[0]} ${v.mood}`
            ).join(', ');
            
            const ultimaVisualizacao = visualizacoes[0];
            const tempoUltima = this.formatarTempoAtivo(new Date(ultimaVisualizacao.timestamp));
            
            vistoPorDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 5px;">
                    <i class="fas fa-eye" style="color: #3498db;"></i> 
                    <strong style="color: #1a3a5f;">Visto por:</strong>
                    <span>${usuarios}</span>
                </div>
                <div style="font-size: 0.75rem; color: #888;">
                    <i class="far fa-clock"></i> Última visualização: ${tempoUltima}
                    ${this.firebaseEnabled ? '<br><i class="fas fa-cloud" style="color:#27ae60"></i> Sincronizado' : '<br><i class="fas fa-laptop" style="color:#f39c12"></i> Local'}
                </div>
            `;
        } else {
            vistoPorDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <i class="fas fa-eye-slash" style="color: #999;"></i> 
                    <span style="color: #999;">Ninguém viu o chat recentemente</span>
                </div>
            `;
        }
        
        container.appendChild(vistoPorDiv);
    },
    
    // 🔧 DESTACAR MENSAGEM COM SCROLL SUAVE
    destacarMensagemChat(mensagemId) {
        const container = document.getElementById('chat-messages');
        const mensagens = container.querySelectorAll('.chat-message');
        
        let found = false;
        mensagens.forEach(msg => {
            msg.classList.remove('mensagem-destacada');
            
            if (msg.dataset.id === String(mensagemId)) {
                msg.classList.add('mensagem-destacada');
                found = true;
                
                // Scroll suave para a mensagem
                setTimeout(() => {
                    msg.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 100);
                
                // Remover destaque após 5 segundos
                setTimeout(() => {
                    msg.classList.remove('mensagem-destacada');
                }, 5000);
            }
        });
        
        if (!found) {
            // Se não encontrou, carregar mais mensagens e tentar novamente
            this.loadChat(true);
            setTimeout(() => {
                this.destacarMensagemChat(mensagemId);
            }, 500);
        }
    },
    
    // 🔧 CONFIGURAR SCROLL PARA OUTRAS LISTAS (ATAS, OS, etc)
    setupScrollParaListas() {
        // Configurar scroll infinito para ATAs
        const ataLista = document.getElementById('ata-lista');
        if (ataLista) {
            let ataLoading = false;
            let ataPage = 1;
            const atasPorPagina = 15;
            
            ataLista.addEventListener('scroll', () => {
                if (ataLista.scrollTop + ataLista.clientHeight >= ataLista.scrollHeight - 100) {
                    if (!ataLoading) {
                        ataLoading = true;
                        ataPage++;
                        this.carregarMaisAtas(ataPage, atasPorPagina);
                    }
                }
            });
        }
        
        // Configurar scroll infinito para OS
        const osLista = document.getElementById('os-lista');
        if (osLista) {
            let osLoading = false;
            let osPage = 1;
            const osPorPagina = 15;
            
            osLista.addEventListener('scroll', () => {
                if (osLista.scrollTop + osLista.clientHeight >= osLista.scrollHeight - 100) {
                    if (!osLoading) {
                        osLoading = true;
                        osPage++;
                        this.carregarMaisOS(osPage, osPorPagina);
                    }
                }
            });
        }
    },
    
    // 🔧 CARREGAR MAIS ATAS (PAGINAÇÃO)
    carregarMaisAtas(pagina, porPagina) {
        const atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        const atasNormais = atas.filter(a => !a.fixa);
        const inicio = (pagina - 1) * porPagina;
        const fim = inicio + porPagina;
        const maisAtas = atasNormais.slice(inicio, fim);
        
        if (maisAtas.length === 0) {
            return;
        }
        
        // Renderizar mais ATAs
        const container = document.getElementById('ata-lista');
        maisAtas.forEach(ata => {
            // ... (código de renderização similar ao renderAta)
        });
        
        setTimeout(() => {
            this.setupScrollParaListas();
        }, 100);
    },
    
    // 🔧 CARREGAR MAIS OS (PAGINAÇÃO)
    carregarMaisOS(pagina, porPagina) {
        const osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        const inicio = (pagina - 1) * porPagina;
        const fim = inicio + porPagina;
        const maisOS = osList.slice(inicio, fim);
        
        if (maisOS.length === 0) {
            return;
        }
        
        // Renderizar mais OS
        const container = document.getElementById('os-lista');
        maisOS.forEach(os => {
            // ... (código de renderização similar ao renderOS)
        });
        
        setTimeout(() => {
            this.setupScrollParaListas();
        }, 100);
    }
};

// ============================================
// 🔧 INICIALIZAR SISTEMA DE SCROLL
// ============================================

// Adicionar ao init do app
app.init = function() {
    // ... (código existente mantido)
    
    // Inicializar sistema de scroll após login
    setTimeout(() => {
        if (app.currentUser) {
            app.setupScrollParaListas();
        }
    }, 2000);
    
    // ... (resto do código init mantido)
};

// ============================================
// 🔧 CSS PARA ANIMAÇÕES E SCROLL SUAVE
// ============================================

// Adicionar este CSS ao seu arquivo de estilo
const scrollCSS = `
/* Scroll suave */
html {
    scroll-behavior: smooth;
}

/* Animações para mensagens */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.3s ease forwards;
}

/* Estilo para mensagem destacada */
.mensagem-destacada {
    background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%) !important;
    border-left: 4px solid #ff9800 !important;
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2) !important;
    transition: all 0.3s ease;
}

/* Loading spinner */
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Scrollbar personalizada */
#chat-messages::-webkit-scrollbar,
#ata-lista::-webkit-scrollbar,
#os-lista::-webkit-scrollbar {
    width: 8px;
}

#chat-messages::-webkit-scrollbar-track,
#ata-lista::-webkit-scrollbar-track,
#os-lista::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

#chat-messages::-webkit-scrollbar-thumb,
#ata-lista::-webkit-scrollbar-thumb,
#os-lista::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

#chat-messages::-webkit-scrollbar-thumb:hover,
#ata-lista::-webkit-scrollbar-thumb:hover,
#os-lista::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Container do chat com posição relativa para botão de scroll */
#chat-messages-container {
    position: relative;
    height: 100%;
}
`;

// Adicionar CSS dinamicamente
const style = document.createElement('style');
style.textContent = scrollCSS;
document.head.appendChild(style);
