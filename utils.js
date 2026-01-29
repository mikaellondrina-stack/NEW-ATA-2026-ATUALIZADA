// Funções utilitárias - Compatível com Supabase
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
        if (typeof chatSystem !== 'undefined' && chatSystem.sendChatMessage) {
            chatSystem.sendChatMessage();
        }
    },

    // FIX: função para carregar chat privado (compatibilidade)
    loadPrivateChat() {
        if (typeof chatSystem !== 'undefined' && chatSystem.loadPrivateChat) {
            chatSystem.loadPrivateChat();
        }
    },

    // FIX: função para enviar mensagem privada (compatibilidade)
    sendPrivateChatMessage() {
        if (typeof chatSystem !== 'undefined' && chatSystem.sendPrivateChatMessage) {
            chatSystem.sendPrivateChatMessage();
        }
    },

    // FIX: função para gerar PDF (compatibilidade)
    generatePDF() {
        if (typeof pdfGenerator !== 'undefined' && pdfGenerator.generatePDF) {
            pdfGenerator.generatePDF();
        }
    },

    // FIX: função para voltar ao formulário OS (compatibilidade)
    voltarParaFormOS() {
        if (typeof appEmail !== 'undefined' && appEmail.voltarParaFormOS) {
            appEmail.voltarParaFormOS();
        }
    },

    // FIX: função para ver detalhes do email da OS (compatibilidade)
    verDetalhesEmailOS(osId) {
        if (typeof appEmail !== 'undefined' && appEmail.verDetalhesEmailOS) {
            appEmail.verDetalhesEmailOS(osId);
        }
    },
    
    // 🔧 SUPABASE: Testar conexão com Supabase
    testarConexaoSupabase() {
        if (typeof window.supabaseClient === 'undefined') {
            console.error('❌ Supabase não está disponível');
            return false;
        }
        
        return window.supabaseClient
            .from('ordens_servico')
            .select('count')
            .limit(1)
            .then(({ data, error }) => {
                if (error) {
                    console.error('❌ Erro na conexão Supabase:', error);
                    return false;
                }
                console.log('✅ Conexão Supabase OK');
                return true;
            })
            .catch(error => {
                console.error('❌ Falha na conexão Supabase:', error);
                return false;
            });
    },
    
    // 🔧 SUPABASE: Sincronizar dados manualmente
    sincronizarDadosManualmente() {
        if (typeof window.supabaseHelper === 'undefined') {
            alert('Supabase Helper não está disponível');
            return;
        }
        
        if (confirm('Deseja sincronizar todos os dados com o Supabase?\nEsta operação pode levar alguns segundos.')) {
            const btn = event.target;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<div class="loading"></div> Sincronizando...';
            btn.disabled = true;
            
            window.supabaseHelper.sincronizarDadosLocais()
                .then(() => {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    alert('✅ Sincronização concluída com sucesso!');
                })
                .catch(error => {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                    alert('❌ Erro na sincronização: ' + error.message);
                });
        }
    },
    
    // 🔧 SUPABASE: Verificar status da sincronização
    verificarStatusSincronizacao() {
        const status = {
            supabaseDisponivel: typeof window.supabaseClient !== 'undefined',
            helperDisponivel: typeof window.supabaseHelper !== 'undefined',
            ultimaSincronizacaoOS: localStorage.getItem('porter_os_supabase_sync'),
            ultimaSincronizacaoAtas: localStorage.getItem('porter_atas_supabase_sync'),
            totalOSLocal: JSON.parse(localStorage.getItem('porter_os') || '[]').length,
            totalAtasLocal: JSON.parse(localStorage.getItem('porter_atas') || '[]').length,
            usuarioLogado: app?.currentUser?.nome || 'Nenhum'
        };
        
        const mensagem = `
📊 Status da Sincronização Supabase:

✅ Supabase: ${status.supabaseDisponivel ? 'CONECTADO' : 'DESCONECTADO'}
✅ Helper: ${status.helperDisponivel ? 'DISPONÍVEL' : 'INDISPONÍVEL'}

📅 Última Sincronização:
• OS: ${status.ultimaSincronizacaoOS ? new Date(status.ultimaSincronizacaoOS).toLocaleString('pt-BR') : 'Nunca'}
• Atas: ${status.ultimaSincronizacaoAtas ? new Date(status.ultimaSincronizacaoAtas).toLocaleString('pt-BR') : 'Nunca'}

📁 Dados Locais:
• Ordens de Serviço: ${status.totalOSLocal}
• Atas Registradas: ${status.totalAtasLocal}

👤 Usuário: ${status.usuarioLogado}
        `;
        
        alert(mensagem);
        
        if (status.supabaseDisponivel && status.helperDisponivel) {
            console.log('Status Supabase:', status);
        }
    },
    
    // 🔧 SUPABASE: Configurar interface para Supabase
    configurarInterfaceSupabase() {
        if (typeof window.supabaseClient === 'undefined') {
            console.log('⚠️ Supabase não disponível para configuração de interface');
            return;
        }
        
        // Adicionar indicador de status Supabase no header
        setTimeout(() => {
            const header = document.querySelector('header');
            if (header) {
                const statusIndicator = document.createElement('div');
                statusIndicator.id = 'supabase-status';
                statusIndicator.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 10px;
                    background: rgba(52, 152, 219, 0.1);
                    border-radius: 20px;
                    font-size: 0.8rem;
                    color: #3498db;
                    border: 1px solid rgba(52, 152, 219, 0.3);
                `;
                statusIndicator.innerHTML = `
                    <i class="fas fa-database"></i>
                    <span>Supabase</span>
                    <div class="status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #2ecc71; animation: pulse 2s infinite;"></div>
                `;
                
                header.appendChild(statusIndicator);
            }
        }, 3000);
        
        // Adicionar botões de admin para Supabase
        if (app?.currentUser && (app.currentUser.role === 'ADMIN' || app.currentUser.role === 'TÉCNICO')) {
            setTimeout(() => {
                const adminControls = document.getElementById('admin-controls');
                if (adminControls) {
                    // Botão de status
                    const statusBtn = document.createElement('button');
                    statusBtn.className = 'btn btn-info btn-sm';
                    statusBtn.innerHTML = '<i class="fas fa-sync"></i> Status Supabase';
                    statusBtn.onclick = () => this.verificarStatusSincronizacao();
                    statusBtn.style.marginLeft = '5px';
                    
                    // Botão de sincronização
                    const syncBtn = document.createElement('button');
                    syncBtn.className = 'btn btn-success btn-sm';
                    syncBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Sincronizar';
                    syncBtn.onclick = () => this.sincronizarDadosManualmente();
                    syncBtn.style.marginLeft = '5px';
                    
                    adminControls.appendChild(statusBtn);
                    adminControls.appendChild(syncBtn);
                }
            }, 4000);
        }
    }
};

// 🔧 SUPABASE: Inicializar interface quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof utils !== 'undefined' && utils.configurarInterfaceSupabase) {
            utils.configurarInterfaceSupabase();
        }
    }, 2000);
});

// 🔧 SUPABASE: Detectar atualização de página (F5)
function detectarAtualizacaoPagina() {
    if (window.performance && window.performance.navigation) {
        const tipoNavegacao = window.performance.navigation.type;
        
        // TYPE_RELOAD = 1 (atualização da página)
        if (tipoNavegacao === 1) {
            console.log('🔄 Página foi atualizada (F5)');
            
            // Manter sessão ativa
            if (typeof app !== 'undefined' && app.currentUser) {
                console.log('✅ Mantendo sessão do usuário:', app.currentUser.nome);
                
                // 🔧 SUPABASE: Atualizar status online
                if (typeof window.supabaseHelper !== 'undefined' && window.supabaseHelper.sincronizarStatusOnlineComSupabase) {
                    setTimeout(() => {
                        window.supabaseHelper.sincronizarStatusOnlineComSupabase();
                    }, 1000);
                }
            }
        }
    }
}

// Executar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectarAtualizacaoPagina);
} else {
    detectarAtualizacaoPagina();
}

// 🔧 SUPABASE: Monitorar o evento beforeunload para salvar sessão
window.addEventListener('beforeunload', function() {
    if (typeof app !== 'undefined' && app.currentUser) {
        // 🔧 SUPABASE: Remover usuário da lista online
        if (typeof window.supabaseHelper !== 'undefined' && window.supabaseHelper.removerUsuarioOnline) {
            window.supabaseHelper.removerUsuarioOnline().catch(() => {
                // Ignorar erros ao fechar a página
            });
        }
    }
});

// 🔧 SUPABASE: Monitorar quando a página volta a ficar visível
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        if (typeof app !== 'undefined' && app.currentUser) {
            console.log('📱 Página voltou a ficar visível');
            
            // 🔧 SUPABASE: Atualizar status online
            if (typeof window.supabaseHelper !== 'undefined' && window.supabaseHelper.sincronizarStatusOnlineComSupabase) {
                setTimeout(() => {
                    window.supabaseHelper.sincronizarStatusOnlineComSupabase();
                }, 500);
            }
        }
    }
});

// 🔧 SUPABASE: Tornar funções disponíveis globalmente para compatibilidade
window.sendChatMessage = utils.sendChatMessage;
window.loadPrivateChat = utils.loadPrivateChat;
window.sendPrivateChatMessage = utils.sendPrivateChatMessage;
window.generatePDF = utils.generatePDF;
window.voltarParaFormOS = utils.voltarParaFormOS;
window.verDetalhesEmailOS = utils.verDetalhesEmailOS;
window.destacarMensagemChat = utils.destacarMensagemChat;
window.fecharModalEmail = utils.fecharModalEmail;
window.testarConexaoSupabase = utils.testarConexaoSupabase;
window.sincronizarDadosManualmente = utils.sincronizarDadosManualmente;
window.verificarStatusSincronizacao = utils.verificarStatusSincronizacao;
