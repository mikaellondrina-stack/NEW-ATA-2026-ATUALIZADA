// app-email.js - Sistema de Envio de Emails
// Configuração do EmailJS (substitua com suas credenciais)
(function() {
    emailjs.init("SEU_USER_ID_AQUI");
})();

// Template ID do EmailJS
const EMAIL_TEMPLATES = {
    criacao_ata: "template_criacao_ata",
    atualizacao_ata: "template_atualizacao_ata"
};

// Configurações de email
const EMAIL_CONFIG = {
    service_id: "SEU_SERVICE_ID_AQUI",
    from_name: "Sistema Porter 2026",
    from_email: "sistema@porter2026.com",
    reply_to: "nao-responder@porter2026.com"
};

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
