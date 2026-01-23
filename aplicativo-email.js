// app-email.js - Sistema de Envio de Emails Porter 2026
// Configuração do EmailJS (substitua com suas credenciais)
(function() {
    emailjs.init("SEU_USER_ID_AQUI");
})();

// Template ID do EmailJS
const EMAIL_TEMPLATES = {
    criacao_ata: "template_criacao_ata",
    atualizacao_ata: "template_atualizacao_ata",
    mudanca_status: "template_mudanca_status"
};

// Configurações de email
const EMAIL_CONFIG = {
    service_id: "SEU_SERVICE_ID_AQUI",
    from_name: "Sistema Porter 2026",
    from_email: "sistema@porter2026.com",
    reply_to: "nao-responder@porter2026.com"
};

// Configurações de e-mails da Porter (do aplicativo-email.js)
const PORTER_EMAIL_CONFIG = {
    // Remetente (sistema Porter)
    FROM_EMAIL: "londrina.operacional@porter.com.br",
    FROM_NAME: "Sistema Porter - Operacional",
    
    // Destinatários técnicos (múltiplos)
    TO_EMAILS: [
        "londrina.tecnica1@porter.com.br",
        "londrina.tecnicaplantao@porter.com.br", 
        "londrina.tecnicaplantao1@porter.com.br"
    ],
    
    // Configuração do EmailJS (para envio real)
    EMAILJS_SERVICE_ID: 'service_porter_operacional',
    EMAILJS_TEMPLATE_ID: 'template_porter_tecnica',
    EMAILJS_PUBLIC_KEY: 'c99DBcA6cuFkXU2xZ' // Chave pública exemplo - substitua pela sua
};

// Função para inicializar o sistema de email Porter
function initPorterEmailSystem() {
    // Inicializar EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init(PORTER_EMAIL_CONFIG.EMAILJS_PUBLIC_KEY);
    }
    
    // Configurar botão de e-mail
    setupEmailButton();
    
    // Gerar CAPTCHA inicial
    generateCaptcha();
    
    console.log('Sistema de e-mail Porter inicializado');
}

// Configurar botão de e-mail
function setupEmailButton() {
    const emailButton = document.getElementById('email-button');
    if (emailButton) {
        emailButton.onclick = () => openEmailModal();
    }
}

// Gerar CAPTCHA
function generateCaptcha() {
    const questions = [
        { question: "Quanto é 3 + 4?", answer: "7" },
        { question: "Quanto é 5 + 2?", answer: "7" },
        { question: "Quanto é 8 - 1?", answer: "7" },
        { question: "Quanto é 10 - 3?", answer: "7" },
        { question: "Digite o número sete por extenso", answer: "sete" },
        { question: "Ano atual? (apenas últimos 2 números)", answer: "26" },
        { question: "Quantas letras tem 'PORTER'?", answer: "6" }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    if (document.getElementById('captcha-question')) {
        document.getElementById('captcha-question').textContent = randomQuestion.question;
        document.getElementById('captcha-question').dataset.answer = randomQuestion.answer.toLowerCase();
    }
}

// Abrir modal de email
function openEmailModal() {
    // Fechar outros modais abertos
    document.querySelectorAll('.modal.show').forEach(modal => {
        modal.classList.remove('show');
    });
    
    // Preencher nome automaticamente se usuário estiver logado
    if (app && app.currentUser) {
        document.getElementById('email-sender-name').value = app.currentUser.nome;
    } else {
        document.getElementById('email-sender-name').value = '';
    }
    
    // Limpar outros campos
    document.getElementById('email-condominio').value = '';
    document.getElementById('email-subject').value = '';
    document.getElementById('email-message').value = '';
    document.getElementById('captcha-answer').value = '';
    
    // Resetar status
    const statusDiv = document.getElementById('email-status');
    if (statusDiv) {
        statusDiv.className = 'email-status';
        statusDiv.style.display = 'none';
        statusDiv.innerHTML = '';
    }
    
    // Gerar novo CAPTCHA
    generateCaptcha();
    
    // Mostrar modal
    document.getElementById('email-modal').classList.add('show');
    
    // Focar no primeiro campo
    setTimeout(() => {
        const nameField = document.getElementById('email-sender-name');
        if (nameField && !nameField.value) {
            nameField.focus();
        } else {
            document.getElementById('email-subject').focus();
        }
    }, 300);
}

// Fechar modal de email
function closeEmailModal() {
    document.getElementById('email-modal').classList.remove('show');
}

// Validar formulário de email
function validateEmailForm() {
    const name = document.getElementById('email-sender-name').value.trim();
    const subject = document.getElementById('email-subject').value.trim();
    const message = document.getElementById('email-message').value.trim();
    const captchaAnswer = document.getElementById('captcha-answer').value.trim().toLowerCase();
    const correctAnswer = document.getElementById('captcha-question').dataset.answer;
    
    // Validações básicas
    if (!name || name.length < 3) {
        showEmailStatus('Por favor, digite seu nome completo.', 'error');
        return false;
    }
    
    if (!subject || subject.length < 5) {
        showEmailStatus('Por favor, digite um assunto.', 'error');
        return false;
    }
    
    if (!message || message.length < 10) {
        showEmailStatus('Por favor, digite uma mensagem mais detalhada.', 'error');
        return false;
    }
    
    if (!captchaAnswer || captchaAnswer !== correctAnswer) {
        showEmailStatus('Resposta de segurança incorreta. Tente novamente.', 'error');
        generateCaptcha();
        return false;
    }
    
    return true;
}

// Mostrar status do email
function showEmailStatus(message, type) {
    const statusDiv = document.getElementById('email-status');
    if (!statusDiv) return;
    
    statusDiv.className = `email-status ${type}`;
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'sending': 'fa-spinner fa-spin'
    };
    
    statusDiv.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        ${message}
    `;
    statusDiv.style.display = 'block';
    
    // Rolar para mostrar o status
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    if (type === 'success') {
        setTimeout(() => {
            closeEmailModal();
        }, 3000);
    }
}

// Enviar email Porter
async function sendPorterEmail() {
    // Validar formulário
    if (!validateEmailForm()) return;
    
    const name = document.getElementById('email-sender-name').value.trim();
    const condominio = document.getElementById('email-condominio').value.trim();
    const subject = document.getElementById('email-subject').value.trim();
    const message = document.getElementById('email-message').value.trim();
    
    // Obter informações adicionais
    const userInfo = app && app.currentUser ? `
Operador: ${app.currentUser.nome}
Turno: ${app.currentUser.turno}
Data/Hora: ${new Date().toLocaleString('pt-BR')}
    ` : `
Remetente: ${name}
Data/Hora: ${new Date().toLocaleString('pt-BR')}
    `;
    
    const condominioInfo = condominio ? `Condomínio: ${condominio}\n` : '';
    
    // Construir mensagem completa
    const fullMessage = `${message}

----------------------------------------
INFORMAÇÕES ADICIONAIS:
${condominioInfo}${userInfo}
----------------------------------------
* E-mail enviado via Sistema Porter Operacional *
    `;
    
    // Mostrar status de envio
    showEmailStatus('Enviando e-mail para a equipe técnica...', 'sending');
    
    // Desabilitar botão
    const sendBtn = document.getElementById('email-send-btn');
    const originalText = sendBtn.innerHTML;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<div class="loading"></div> Enviando...';
    
    try {
        // Tentar usar EmailJS para envio real
        if (typeof emailjs !== 'undefined' && PORTER_EMAIL_CONFIG.EMAILJS_PUBLIC_KEY) {
            // Enviar para cada destinatário técnico
            const sendPromises = PORTER_EMAIL_CONFIG.TO_EMAILS.map(toEmail => {
                const templateParams = {
                    from_name: name,
                    from_email: PORTER_EMAIL_CONFIG.FROM_EMAIL,
                    to_name: "Equipe Técnica Porter",
                    to_email: toEmail,
                    subject: `[PORTER] ${subject}`,
                    message: fullMessage,
                    condominio: condominio || 'Não informado',
                    data_envio: new Date().toLocaleString('pt-BR'),
                    reply_to: PORTER_EMAIL_CONFIG.FROM_EMAIL
                };
                
                return emailjs.send(
                    PORTER_EMAIL_CONFIG.EMAILJS_SERVICE_ID,
                    PORTER_EMAIL_CONFIG.EMAILJS_TEMPLATE_ID,
                    templateParams
                );
            });
            
            // Aguardar todos os envios
            await Promise.all(sendPromises);
            
            showEmailStatus(`✅ E-mail enviado com sucesso para ${PORTER_EMAIL_CONFIG.TO_EMAILS.length} destinatário(s)!`, 'success');
            
        } else {
            // Fallback: Simulação de envio (para demonstração)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Registrar no localStorage para histórico
            saveEmailToHistory({
                name: name,
                condominio: condominio,
                subject: subject,
                message: message,
                to_emails: PORTER_EMAIL_CONFIG.TO_EMAILS,
                from_email: PORTER_EMAIL_CONFIG.FROM_EMAIL,
                date: new Date().toLocaleString('pt-BR'),
                status: 'sent_simulation',
                user: app && app.currentUser ? app.currentUser.nome : 'Visitante'
            });
            
            showEmailStatus(`✅ E-mail registrado! (Modo simulação) Seria enviado para ${PORTER_EMAIL_CONFIG.TO_EMAILS.length} destinatário(s).`, 'success');
            
            // Log para demonstração
            console.log('📧 E-mail simulado:', {
                from: PORTER_EMAIL_CONFIG.FROM_EMAIL,
                to: PORTER_EMAIL_CONFIG.TO_EMAILS,
                subject: `[PORTER] ${subject}`,
                message: fullMessage
            });
        }
        
        // Registrar no sistema de notificações
        registerEmailNotification(name, subject, condominio);
        
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        
        // Salvar como falha no histórico
        saveEmailToHistory({
            name: name,
            condominio: condominio,
            subject: subject,
            message: message,
            to_emails: PORTER_EMAIL_CONFIG.TO_EMAILS,
            from_email: PORTER_EMAIL_CONFIG.FROM_EMAIL,
            date: new Date().toLocaleString('pt-BR'),
            status: 'error',
            error: error.message,
            user: app && app.currentUser ? app.currentUser.nome : 'Visitante'
        });
        
        showEmailStatus('❌ Erro ao enviar e-mail. Tente novamente ou contate o administrador.', 'error');
        
    } finally {
        // Reabilitar botão
        sendBtn.disabled = false;
        sendBtn.innerHTML = originalText;
        
        // Gerar novo CAPTCHA
        generateCaptcha();
    }
}

// Salvar email no histórico
function saveEmailToHistory(emailData) {
    let emailsHistory = JSON.parse(localStorage.getItem('porter_emails_history') || '[]');
    
    const historyEntry = {
        id: Date.now(),
        ...emailData,
        timestamp: new Date().toISOString()
    };
    
    emailsHistory.unshift(historyEntry);
    
    // Manter apenas os últimos 100 e-mails
    if (emailsHistory.length > 100) {
        emailsHistory = emailsHistory.slice(0, 100);
    }
    
    localStorage.setItem('porter_emails_history', JSON.stringify(emailsHistory));
}

// Registrar notificação de email
function registerEmailNotification(senderName, subject, condominio) {
    const notification = {
        id: Date.now(),
        condo: condominio || 'Sistema Porter',
        tipo: 'email',
        desc: `E-mail enviado por ${senderName}: ${subject}`,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
        timestamp: new Date().toISOString(),
        lida: false
    };
    
    let notificacoes = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
    notificacoes.unshift(notification);
    
    if (notificacoes.length > 50) notificacoes.pop();
    localStorage.setItem('porter_notificacoes', JSON.stringify(notificacoes));
    
    // Atualizar notificações no sistema principal
    if (app && app.loadNotifications) {
        app.loadNotifications();
        app.updateNotificationBadges();
    }
}

// Função para enviar email sobre ATA
async function enviarEmailAta(ataData, ataId, tipo) {
    try {
        // Buscar emails dos participantes
        const participantesEmails = await obterEmailsParticipantes(ataData.participantes);
        
        if (participantesEmails.length === 0 && !ataData.responsavel) {
            console.log('Nenhum email para enviar');
            return;
        }
        
        // Preparar dados do email
        const templateParams = {
            to_name: ataData.responsavel,
            to_email: await obterEmailResponsavel(ataData.responsavel),
            ata_titulo: ataData.titulo,
            ata_descricao: ataData.descricao,
            ata_data: formatarData(ataData.data),
            ata_condominio: ataData.condominio,
            ata_status: ataData.status,
            ata_id: ataId,
            participantes: ataData.participantes?.join(', ') || 'Não informados',
            criado_por: ataData.criadoPorNome,
            data_criacao: new Date().toLocaleDateString('pt-BR'),
            link_ata: `${window.location.origin}/ata/${ataId}`,
            tipo_operacao: tipo === 'criacao' ? 'criação' : 'atualização'
        };
        
        // Determinar template
        const templateId = tipo === 'criacao' ? EMAIL_TEMPLATES.criacao_ata : EMAIL_TEMPLATES.atualizacao_ata;
        
        // Enviar email para o responsável
        if (templateParams.to_email) {
            await emailjs.send(
                EMAIL_CONFIG.service_id,
                templateId,
                templateParams
            );
            console.log(`Email enviado para ${templateParams.to_email}`);
        }
        
        // Enviar email para participantes (cópia)
        if (participantesEmails.length > 0) {
            await enviarEmailParticipantes(ataData, ataId, tipo, participantesEmails);
        }
        
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        // Não mostrar erro para o usuário para não interromper o fluxo principal
    }
}

// Função auxiliar para obter emails dos participantes
async function obterEmailsParticipantes(participantes) {
    if (!participantes || participantes.length === 0) {
        return [];
    }
    
    try {
        const emails = [];
        
        // Para cada participante, buscar no banco de dados
        for (const participante of participantes) {
            const userSnapshot = await db.collection('users')
                .where('name', '==', participante.trim())
                .limit(1)
                .get();
            
            if (!userSnapshot.empty) {
                const user = userSnapshot.docs[0].data();
                if (user.email) {
                    emails.push(user.email);
                }
            }
        }
        
        return emails;
        
    } catch (error) {
        console.error('Erro ao buscar emails dos participantes:', error);
        return [];
    }
}

// Função para obter email do responsável
async function obterEmailResponsavel(responsavelNome) {
    try {
        const userSnapshot = await db.collection('users')
            .where('name', '==', responsavelNome.trim())
            .limit(1)
            .get();
        
        if (!userSnapshot.empty) {
            const user = userSnapshot.docs[0].data();
            return user.email || null;
        }
        
        return null;
        
    } catch (error) {
        console.error('Erro ao buscar email do responsável:', error);
        return null;
    }
}

// Função para enviar email para participantes
async function enviarEmailParticipantes(ataData, ataId, tipo, emails) {
    try {
        const templateId = tipo === 'criacao' ? EMAIL_TEMPLATES.criacao_ata : EMAIL_TEMPLATES.atualizacao_ata;
        
        for (const email of emails) {
            const templateParams = {
                to_name: "Participante",
                to_email: email,
                ata_titulo: ataData.titulo,
                ata_descricao: ataData.descricao,
                ata_data: formatarData(ataData.data),
                ata_condominio: ataData.condominio,
                ata_status: ataData.status,
                ata_id: ataId,
                responsavel: ataData.responsavel,
                criado_por: ataData.criadoPorNome,
                data_criacao: new Date().toLocaleDateString('pt-BR'),
                link_ata: `${window.location.origin}/ata/${ataId}`,
                tipo_operacao: tipo === 'criacao' ? 'criação' : 'atualização'
            };
            
            await emailjs.send(
                EMAIL_CONFIG.service_id,
                templateId,
                templateParams
            );
            
            console.log(`Email de cópia enviado para ${email}`);
            
            // Pequena pausa para evitar limite de taxa
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
    } catch (error) {
        console.error('Erro ao enviar email para participantes:', error);
    }
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Função para notificar sobre mudança de status
async function notificarMudancaStatus(ataId, antigoStatus, novoStatus) {
    try {
        const ataDoc = await db.collection('atas').doc(ataId).get();
        if (!ataDoc.exists) return;
        
        const ataData = ataDoc.data();
        
        // Preparar dados do email de notificação
        const templateParams = {
            to_name: ataData.responsavel,
            to_email: await obterEmailResponsavel(ataData.responsavel),
            ata_titulo: ataData.titulo,
            ata_id: ataId,
            antigo_status: antigoStatus,
            novo_status: novoStatus,
            data_mudanca: new Date().toLocaleDateString('pt-BR'),
            hora_mudanca: new Date().toLocaleTimeString('pt-BR'),
            link_ata: `${window.location.origin}/ata/${ataId}`
        };
        
        // Enviar email de notificação
        await emailjs.send(
            EMAIL_CONFIG.service_id,
            "template_mudanca_status",
            templateParams
        );
        
        console.log(`Notificação de mudança de status enviada para ${templateParams.to_email}`);
        
    } catch (error) {
        console.error('Erro ao enviar notificação de status:', error);
    }
}

// Exportar funções para uso em app.js
window.enviarEmailAta = enviarEmailAta;
window.notificarMudancaStatus = notificarMudancaStatus;
window.initPorterEmailSystem = initPorterEmailSystem;
window.openEmailModal = openEmailModal;
window.closeEmailModal = closeEmailModal;
window.sendPorterEmail = sendPorterEmail;
window.showEmailStatus = showEmailStatus;
window.saveEmailToHistory = saveEmailToHistory;
window.registerEmailNotification = registerEmailNotification;
window.generateCaptcha = generateCaptcha;
window.validateEmailForm = validateEmailForm;
window.setupEmailButton = setupEmailButton;

// Exportar configurações
window.EMAIL_TEMPLATES = EMAIL_TEMPLATES;
window.EMAIL_CONFIG = EMAIL_CONFIG;
window.PORTER_EMAIL_CONFIG = PORTER_EMAIL_CONFIG;

// Inicialização automática do sistema de email Porter
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar carregamento do app principal
    setTimeout(function() {
        if (typeof emailjs !== 'undefined') {
            initPorterEmailSystem();
        }
    }, 1000);
});

// Backup das funções originais do aplicativo-email.js
window.emailApp = {
    init: initPorterEmailSystem,
    setupEmailButton: setupEmailButton,
    generateCaptcha: generateCaptcha,
    openEmailModal: openEmailModal,
    closeEmailModal: closeEmailModal,
    validateEmailForm: validateEmailForm,
    showStatus: showEmailStatus,
    sendEmail: sendPorterEmail,
    saveEmailToHistory: saveEmailToHistory,
    registerEmailNotification: registerEmailNotification,
    EMAIL_CONFIG: PORTER_EMAIL_CONFIG
};
