const appEmail = {
    setupOSPreview() {
        const gravidadeSelect = document.getElementById('os-gravidade');
        if (gravidadeSelect) {
            gravidadeSelect.addEventListener('change', function() {
                appEmail.atualizarPreviewGravidade(this.value);
            });
            this.atualizarPreviewGravidade(gravidadeSelect.value);
        }
    },

    atualizarPreviewGravidade(gravidade) {
        const previewDiv = document.getElementById('os-preview-prioridade');
        const previewTexto = document.getElementById('os-preview-gravidade');
        const previewIcone = document.getElementById('os-preview-icone');
        const previewPrazo = document.getElementById('os-preview-prazo');
        
        if (!previewDiv) return;
        
        const configs = {
            'Baixa': {
                texto: '🟢 GRAVIDADE BAIXA',
                icone: 'fa-info-circle',
                cor: '#27ae60',
                prazo: 'Prazo: 7 dias úteis'
            },
            'Média': {
                texto: '🟡 GRAVIDADE MÉDIA',
                icone: 'fa-exclamation-circle',
                cor: '#f39c12',
                prazo: 'Prazo: 3 dias úteis'
            },
            'Alta': {
                texto: '🔴 GRAVIDADE ALTA',
                icone: 'fa-exclamation-triangle',
                cor: '#e74c3c',
                prazo: 'Prazo: 24 horas'
            },
            'Emergência': {
                texto: '🚨 EMERGÊNCIA',
                icone: 'fa-bell',
                cor: '#8b0000',
                prazo: 'Prazo: 4 horas - ATENÇÃO MÁXIMA'
            }
        };
        
        const config = configs[gravidade] || configs['Média'];
        
        if (previewTexto) {
            previewTexto.textContent = config.texto;
            previewTexto.style.color = config.cor;
        }
        if (previewIcone) {
            previewIcone.innerHTML = `<i class="fas ${config.icone}" style="color: ${config.cor}"></i>`;
        }
        if (previewPrazo) {
            previewPrazo.textContent = config.prazo;
        }
        previewDiv.style.display = 'block';
        previewDiv.style.borderLeft = `4px solid ${config.cor}`;
    },

    calcularPrazoPorGravidade(gravidade) {
        const prazos = {
            'Baixa': '7 dias úteis',
            'Média': '3 dias úteis',
            'Alta': '24 horas',
            'Emergência': '4 horas'
        };
        return prazos[gravidade] || '3 dias úteis';
    },

    getCorGravidade(gravidade) {
        const cores = {
            'Baixa': '#27ae60',
            'Média': '#f39c12',
            'Alta': '#e74c3c',
            'Emergência': '#8b0000'
        };
        return cores[gravidade] || '#666';
    },

    getIconeGravidade(gravidade) {
        const icones = {
            'Baixa': 'fa-info-circle',
            'Média': 'fa-exclamation-circle',
            'Alta': 'fa-exclamation-triangle',
            'Emergência': 'fa-bell'
        };
        return icones[gravidade] || 'fa-circle';
    },

    adicionarCamposOcultosForm(osId, dataHora, prazoResposta) {
        const form = document.getElementById('os-form-email');
        
        ['os-id', 'data-hora', 'prazo-resposta'].forEach(name => {
            const existing = form.querySelector(`input[name="${name}"]`);
            if (existing) existing.remove();
        });
        
        const camposOcultos = [
            { name: 'os-id', value: osId },
            { name: 'data-hora', value: dataHora },
            { name: 'prazo-resposta', value: prazoResposta },
            { name: 'sistema', value: 'Porter OS System' },
            { name: 'prioridade', value: document.getElementById('os-gravidade').value }
        ];
        
        camposOcultos.forEach(campo => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = campo.name;
            input.value = campo.value;
            form.appendChild(input);
        });
    },

    mostrarConfirmacaoOS(osData) {
        const formContainer = document.getElementById('os-form-container');
        const confirmationScreen = document.getElementById('os-confirmation-screen');
        
        if (formContainer) formContainer.classList.add('hidden');
        if (confirmationScreen) {
            confirmationScreen.classList.remove('hidden');
            
            document.getElementById('os-confirmation-id').textContent = osData.osId;
            document.getElementById('os-confirmation-condo').textContent = osData.condo;
            document.getElementById('os-confirmation-gravidade').textContent = osData.gravidade;
            document.getElementById('os-confirmation-funcionario').textContent = osData.funcionario;
            document.getElementById('os-confirmation-email').textContent = osData.email;
            document.getElementById('os-confirmation-data').textContent = `${osData.data} ${osData.hora}`;
        }
        
        this.registrarEnvioDetalhadoOS(osData);
    },

    voltarParaFormOS() {
        const formContainer = document.getElementById('os-form-container');
        const confirmationScreen = document.getElementById('os-confirmation-screen');
        const form = document.getElementById('os-form-email');
        
        if (formContainer) formContainer.classList.remove('hidden');
        if (confirmationScreen) confirmationScreen.classList.add('hidden');
        if (form) form.reset();
        
        if (typeof app !== 'undefined' && app.updateCityOS) {
            app.updateCityOS();
        }
        
        if (typeof app !== 'undefined' && app.currentUser) {
            const osFuncionario = document.getElementById('os-funcionario');
            const osEmail = document.getElementById('os-email');
            if (osFuncionario) osFuncionario.value = app.currentUser.nome;
            if (osEmail) osEmail.value = `${app.currentUser.user}@porter.com.br`;
        }
    },

    registrarEnvioDetalhadoOS(osData) {
        let historico = JSON.parse(localStorage.getItem('porter_os_emails') || '[]');
        
        const registro = {
            id: Date.now(),
            os_id: osData.id,
            os_number: osData.osId,
            data: new Date().toLocaleString('pt-BR'),
            destinatarios: ['londrina.tecnica1@porter.com.br', 'londrina.tecnicaplantao@porter.com.br', 'londrina.tenicaplantão1@porter.com.br'],
            condo: osData.condo,
            gravidade: osData.gravidade,
            funcionario: osData.funcionario,
            setor: osData.setor,
            email: osData.email,
            assunto: `[NOVA O.S] - ${osData.setor} - ${osData.funcionario}`,
            sucesso: true,
            data_envio: new Date().toISOString()
        };
        
        historico.unshift(registro);
        if (historico.length > 50) historico.pop();
        localStorage.setItem('porter_os_emails', JSON.stringify(historico));
    },

    gerarCorpoEmailOS(osData) {
        return `========================================
ORDEM DE SERVIÇO - PORTER 2026
========================================

📋 INFORMAÇÕES DA OS
----------------------------------------
• Número: ${osData.osId}
• Condomínio: ${osData.condo}
• Cidade: ${osData.cidade}
• Setor: ${osData.setor}
• Gravidade: ${osData.gravidade}
• Prazo: ${osData.prazoResposta || '3 dias úteis'}
• Data OS: ${new Date(osData.dataOS).toLocaleDateString('pt-BR')}
• Técnico responsável: ${osData.tecnicoResponsavel || 'Não definido'}

👤 INFORMAÇÕES DO SOLICITANTE
----------------------------------------
• Funcionário: ${osData.funcionario}
• E-mail: ${osData.email}
• Operador: ${osData.operador}

📅 DATAS E HORÁRIOS
----------------------------------------
• Aberta em: ${osData.data} às ${osData.hora}
• Turno: ${osData.turno}
• Status: ${osData.statusOS || 'Em branco'}

📝 DESCRIÇÃO DO PROBLEMA/SERVIÇO
----------------------------------------
${osData.desc}

========================================
ATA OPERACIONAL PORTER - 2026
E-mail automático - Não responda
========================================`;
    },

    criarModal(titulo, conteudo) {
        this.fecharModalEmail();
        
        const modal = document.createElement('div');
        modal.id = 'modal-email-detalhes';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999; padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--white); border-radius: 12px; max-width: 900px;
                width: 100%; max-height: 90vh; overflow-y: auto;
                box-shadow: 0 10px 30px var(--shadow);">
                <div style="padding: 20px; border-bottom: 1px solid var(--border-color);">
                    <h3 style="margin: 0; display: flex; justify-content: space-between; align-items: center; color: var(--text-primary);">
                        ${titulo}
                        <button onclick="appEmail.fecharModalEmail()" style="background: none; border: none;
                        font-size: 1.5rem; cursor: pointer; color: var(--gray);">&times;</button>
                    </h3>
                </div>
                <div>${conteudo}</div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    fecharModalEmail() {
        const modal = document.getElementById('modal-email-detalhes');
        if (modal) modal.remove();
    },

    copiarConteudoEmail() {
        const modal = document.getElementById('modal-email-detalhes');
        const conteudo = modal?.querySelector('pre, .conteudo-email, div[style*="white-space: pre-wrap"]')?.innerText || '';
        
        if (conteudo) {
            navigator.clipboard.writeText(conteudo)
                .then(() => {
                    if (typeof app !== 'undefined') app.showToast('Conteúdo copiado!', 'success');
                })
                .catch(() => {
                    const textarea = document.createElement('textarea');
                    textarea.value = conteudo;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    if (typeof app !== 'undefined') app.showToast('Conteúdo copiado!', 'success');
                });
        }
    },

    abrirClienteEmail(condo, emails) {
        const assunto = encodeURIComponent(`[PORTER OS] ${condo}`);
        const corpo = encodeURIComponent(`Prezado,\n\nSegue Ordem de Serviço do condomínio ${condo}.\n\nAtenciosamente,\nSistema Porter`);
        
        window.open(`mailto:${emails}?subject=${assunto}&body=${corpo}`, '_blank');
        if (typeof app !== 'undefined') app.showToast('Cliente de e-mail aberto!', 'info');
    },

    verDetalhesEmailOS(osId) {
        let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
        let historico = JSON.parse(localStorage.getItem('porter_os_emails') || '[]');
        
        const os = osList.find(o => o.id === osId);
        const envio = historico.find(h => h.os_id === osId);
        
        if (!os) return;
        
        const corpoEmail = this.gerarCorpoEmailOS(os);
        const emails = ['londrina.tecnica1@porter.com.br', 'londrina.tecnicaplantao@porter.com.br'];
        
        const modalContent = `
            <div style="padding: 20px;">
                <h3><i class="fas fa-envelope"></i> E-mail da OS - ${os.condo}</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div style="background: var(--hover-bg); padding: 15px; border-radius: 8px;">
                        <h4><i class="fas fa-info-circle"></i> Informações</h4>
                        <p><strong>Destinatários:</strong> ${emails.length}</p>
                        <p><strong>Gravidade:</strong> ${os.gravidade}</p>
                        <p><strong>Data:</strong> ${os.data} ${os.hora}</p>
                        ${envio ? `<p><strong>Registrado em:</strong> ${envio.data}</p>` : ''}
                    </div>
                    <div style="background: var(--info)20; padding: 15px; border-radius: 8px;">
                        <h4><i class="fas fa-users"></i> Destinatários</h4>
                        <div style="max-height: 100px; overflow-y: auto;">
                            ${emails.map(email => `<div style="padding: 3px 0;">📧 ${email}</div>`).join('')}
                        </div>
                    </div>
                </div>
                <div style="margin: 20px 0;">
                    <h4><i class="fas fa-file-alt"></i> Conteúdo do E-mail</h4>
                    <div style="background: var(--white); border: 1px solid var(--border-color); padding: 15px;
                        border-radius: 6px; font-family: monospace; white-space: pre-wrap;
                        max-height: 300px; overflow-y: auto; margin-top: 10px; color: var(--text-primary);">
                        ${corpoEmail}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="appEmail.copiarConteudoEmail()">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                    <button class="btn btn-success" onclick="appEmail.abrirClienteEmail('${os.condo}', '${emails.join(',')}')">
                        <i class="fas fa-envelope-open"></i> Abrir Cliente
                    </button>
                    <button class="btn btn-clear" onclick="appEmail.fecharModalEmail()">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        this.criarModal(`E-mail da OS - ${os.condo}`, modalContent);
    }
};
