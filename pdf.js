// Sistema de geração de PDF
const pdfGenerator = {
    generatePDF() {
        const condo = document.getElementById('report-condo').value;
        const dataInicio = document.getElementById('report-data-inicio').value;
        const dataFim = document.getElementById('report-data-fim').value;
        const tipo = document.getElementById('report-tipo').value;
        
        let dados = [];
        let titulo = '';
        
        if (tipo === 'atas' || tipo === 'all') {
            let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
            if (condo) atas = atas.filter(a => a.condo === condo);
            if (dataInicio) atas = atas.filter(a => a.dataISO >= dataInicio);
            if (dataFim) atas = atas.filter(a => a.dataISO <= dataFim);
            
            if (tipo === 'atas') {
                dados = atas;
                titulo = 'Relatório de Ocorrências';
            } else {
                dados = dados.concat(atas.map(a => ({...a, tipoRegistro: 'Ocorrência'})));
            }
        }
        
        if (tipo === 'fixas' || tipo === 'all') {
            let atas = JSON.parse(localStorage.getItem('porter_atas') || '[]');
            let fixas = atas.filter(a => a.fixa);
            if (condo) fixas = fixas.filter(a => a.condo === condo);
            if (dataInicio) fixas = fixas.filter(a => a.dataISO >= dataInicio);
            if (dataFim) fixas = fixas.filter(a => a.dataISO <= dataFim);
            
            if (tipo === 'fixas') {
                dados = fixas;
                titulo = 'Relatório de Informações Fixas';
            } else {
                dados = dados.concat(fixas.map(a => ({...a, tipoRegistro: 'Informação Fixa'})));
            }
        }
        
        if (tipo === 'os' || tipo === 'all') {
            let osList = JSON.parse(localStorage.getItem('porter_os') || '[]');
            if (condo) osList = osList.filter(os => os.condo === condo);
            if (dataInicio) osList = osList.filter(os => os.dataISO >= dataInicio);
            if (dataFim) osList = osList.filter(os => os.dataISO <= dataFim);
            
            if (tipo === 'os') {
                dados = osList;
                titulo = 'Relatório de Ordens de Serviço';
            } else {
                dados = dados.concat(osList.map(os => ({...os, tipoRegistro: 'Ordem de Serviço'})));
            }
        }
        
        if (tipo === 'all') {
            titulo = 'Relatório Completo';
        }
        
        if (dados.length === 0) {
            alert('Nenhum registro encontrado para os filtros selecionados.');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFillColor(26, 58, 95);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.text('PORTER', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text('Ata Operacional - 2026', 105, 22, { align: 'center' });
        
        // Título do relatório
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(titulo, 105, 40, { align: 'center' });
        
        // Filtros aplicados
        doc.setFontSize(10);
        let filtrosTexto = `Condomínio: ${condo || 'Todos'} | Período: ${dataInicio || 'Início'} a ${dataFim || 'Fim'}`;
        doc.text(filtrosTexto, 105, 50, { align: 'center' });
        
        // Data de geração
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 105, 55, { align: 'center' });
        
        // Conteúdo
        let y = 70;
        
        dados.forEach((item, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${item.condo || ''}`, 10, y);
            doc.setFont(undefined, 'normal');
            y += 7;
            
            doc.setFontSize(10);
            doc.text(`Data: ${item.data} ${item.hora} | Tipo: ${item.tipoRegistro || item.tipo || ''}`, 10, y);
            y += 5;
            
            if (item.gravidade) {
                doc.text(`Gravidade: ${item.gravidade} | Prazo: ${item.prazoResposta || ''}`, 10, y);
                y += 5;
            }
            
            if (item.statusOS) {
                doc.text(`Status: ${item.statusOS}`, 10, y);
                y += 5;
            }
            
            doc.text(`Operador: ${item.operador} | Status: ${item.status || ''}`, 10, y);
            y += 5;
            
            const desc = item.desc || '';
            const descLines = doc.splitTextToSize(desc, 190);
            
            doc.text('Descrição:', 10, y);
            y += 5;
            
            descLines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                doc.text(line, 15, y);
                y += 5;
            });
            
            y += 10;
            
            if (index < dados.length - 1) {
                doc.setDrawColor(200, 200, 200);
                doc.line(10, y, 200, y);
                y += 5;
            }
        });
        
        // Rodapé
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total de registros: ${dados.length}`, 105, 285, { align: 'center' });
        doc.text('Porter - Ata Operacional 2026', 105, 290, { align: 'center' });
        
        doc.save(`relatorio-porter-${new Date().toISOString().slice(0, 10)}.pdf`);
        app.closeReportModal();
        app.showMessage('Relatório gerado com sucesso!', 'success');
    }
};

INDEX.HTML:
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ata Operacional Porter - 2026</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>

<!-- TELA DE LOGIN -->
<section id="login-screen">
    <div class="login-container">
        <div class="login-logo">
            <!-- LOGO DA PORTER ATUALIZADA SEM FUNDO -->
            <div class="login-logo-img"></div>
            <h1>Ata Operacional Porter</h1>
            <p>Sistema de Registro de Ocorrências - 2026</p>
        </div>
        <div class="form-group input-icon">
            <i class="fas fa-user"></i>
            <input type="text" id="login-user" placeholder="nome.sobrenome" autocomplete="off">
        </div>
        <div class="form-group input-icon">
            <i class="fas fa-lock"></i>
            <input type="password" id="login-pass" placeholder="********" autocomplete="off">
        </div>
        <div class="form-group input-icon">
            <i class="fas fa-clock"></i>
            <select id="login-turno">
                <option value="Diurno">Diurno</option>
                <option value="Noturno">Noturno</option>
            </select>
        </div>
        <!-- 🔧 CORREÇÃO: Botão com ID para ser configurado via JavaScript -->
        <button class="btn btn-primary" id="login-button">
            <i class="fas fa-sign-in-alt"></i> ACESSAR SISTEMA
        </button>
        <div style="margin-top: 1.5rem; text-align: center; font-size: 0.8rem; color: var(--gray);">
            <i class="fas fa-info-circle"></i> Use suas credenciais fornecidas pela Porter
        </div>
    </div>
</section>

<!-- SIDEBAR COM LISTA DE CONDOMÍNIOS -->
<div id="sidebar">
    <div class="sidebar-header">
        <h3><i class="fas fa-building"></i> CONDOMÍNIOS</h3>
        <button class="sidebar-toggle" onclick="app.toggleSidebar()">
            <i class="fas fa-times"></i>
        </button>
    </div>
    <div class="condo-list" id="condo-list">
        <!-- Lista de condomínios será gerada dinamicamente -->
    </div>
</div>

<!-- CONTEÚDO PRINCIPAL -->
<div id="main-content" class="hidden">
    <header>
        <div class="header-left">
            <button class="mobile-toggle" onclick="app.toggleSidebar()">
                <i class="fas fa-bars"></i>
            </button>
            <div class="header-logo">
                <!-- LOGO DA PORTER NO HEADER - ATUALIZADA SEM FUNDO -->
                <div class="logo-porter"></div>
                <div class="header-logo-text">
                    <strong>ATA OPERACIONAL PORTER</strong>
                    <div>Sistema de Registro de Ocorrências - 2026</div>
                </div>
            </div>
        </div>
        <!-- ÁREA DE INFORMAÇÕES DO USUÁRIO -->
        <div id="user-info">
            <!-- Será preenchido dinamicamente com informações do login -->
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
            <!-- OPERADORES ONLINE -->
            <div id="online-users" class="online-users-dropdown">
                <i class="fas fa-users" style="color: white;"></i>
                <span style="font-size: 0.9rem;">
                    <span id="online-count">0</span> online
                </span>
                <i class="fas fa-chevron-down" style="font-size: 0.8rem;"></i>
                <div id="online-users-list" class="online-users-list"></div>
            </div>
            <!-- Notificações -->
            <div class="notification-bell" onclick="app.toggleNotifications()">
                <i class="fas fa-bell"></i>
                <span class="notification-badge" id="notification-count" style="display: none;">0</span>
                <div class="notifications-panel" id="notifications-panel">
                    <div class="notification-header">
                        <strong><i class="fas fa-bell"></i> Notificações</strong>
                        <button class="btn btn-clear btn-sm" onclick="app.clearNotifications()">Limpar</button>
                    </div>
                    <div id="notifications-list"></div>
                </div>
            </div>
            <!-- Botão Relatório -->
            <button class="btn btn-success" onclick="app.openReportModal()">
                <i class="fas fa-file-pdf"></i> Relatório
            </button>
            <!-- Botão Admin (apenas para admin) -->
            <div id="admin-controls" class="admin-controls" style="display: none;">
                <button class="btn btn-warning" onclick="app.openAdminPanel()">
                    <i class="fas fa-user-shield"></i> Admin
                </button>
            </div>
            <!-- Botão Sair -->
            <button class="btn btn-accent" onclick="app.logout()">
                <i class="fas fa-sign-out-alt"></i> Sair
            </button>
        </div>
    </header>

    <div class="tabs">
        <button class="tab-btn active" onclick="app.switchTab('tab-ata', this)">
            <i class="fas fa-file-alt"></i> ATA DE OCORRÊNCIAS
            <span class="tab-badge" id="tab-count-ata">0</span>
        </button>
        <button class="tab-btn" onclick="app.switchTab('tab-fixas', this)">
            <i class="fas fa-thumbtack"></i> INFORMAÇÕES FIXAS
            <span class="tab-badge" id="tab-count-fixas">0</span>
        </button>
        <button class="tab-btn" onclick="app.switchTab('tab-os', this)">
            <i class="fas fa-tools"></i> ORDEM DE SERVIÇO
            <span class="tab-badge" id="tab-count-os">0</span>
        </button>
        <!-- NOVA ABA: CHAT GERAL -->
        <button class="tab-btn chat-tab" onclick="app.switchTab('tab-chat', this)">
            <i class="fas fa-comments"></i> CHAT GERAL
            <span class="chat-badge" id="chat-badge">0</span>
        </button>
        <!-- NEW: Nova aba de chat privado -->
        <button class="tab-btn" onclick="app.switchTab('tab-chat-privado', this)" id="tab-chat-privado-btn">
            <i class="fas fa-user-secret"></i> CHAT PRIVADO
            <span class="chat-badge" id="chat-private-badge">0</span>
        </button>
        <button class="tab-btn" onclick="app.switchTab('tab-presenca', this)">
            <i class="fas fa-users"></i> HISTÓRICO
        </button>
    </div>

    <div class="container">
        <!-- Componente de Avaliação de Humor -->
        <div id="mood-check-container" class="mood-check-container hidden">
            <div class="mood-title">
                <i class="fas fa-heart"></i> Como você está se sentindo hoje?
            </div>
            <div class="mood-subtitle">
                Selecione a expressão que melhor representa seu estado emocional atual
            </div>
            <div class="mood-options" id="mood-options">
                <!-- As opções serão geradas via JavaScript -->
            </div>
            <div class="mood-status" id="mood-status">
                <i class="fas fa-mouse-pointer"></i> Clique em uma expressão para selecionar
            </div>
            <div class="mood-submit">
                <button class="btn btn-primary" onclick="app.enviarMood()" id="mood-submit-btn" disabled>
                    <i class="fas fa-paper-plane"></i> Enviar Meu Sentimento
                </button>
            </div>
            <div id="mood-result" class="mood-result hidden"></div>
        </div>

        <!-- ABA: ATA DE OCORRÊNCIAS -->
        <div id="tab-ata" class="tab-content">
            <!-- Filtros -->
            <div class="filters-container">
                <div class="filters-title">
                    <i class="fas fa-filter"></i> Filtrar Registros
                </div>
                <div class="grid-3">
                    <div class="form-group">
                        <label><i class="fas fa-building"></i> Condomínio</label>
                        <select id="filter-condo">
                            <option value="">Todos os condomínios</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Data Inicial</label>
                        <input type="date" id="filter-data-inicio">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Data Final</label>
                        <input type="date" id="filter-data-fim">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Tipo</label>
                        <select id="filter-tipo">
                            <option value="">Todos os tipos</option>
                            <option value="Informação">📝 Informação</option>
                            <option value="Ocorrência">⚠️ Ocorrência</option>
                            <option value="Incidente">🚨 Incidente</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tasks"></i> Status</label>
                        <select id="filter-status">
                            <option value="">Todos os status</option>
                            <option value="Em andamento">🔄 Em andamento</option>
                            <option value="Finalizado">✅ Finalizado</option>
                        </select>
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-filter" onclick="app.aplicarFiltrosAtas()">
                            <i class="fas fa-search"></i> Filtrar
                        </button>
                        <button class="btn btn-clear" onclick="app.limparFiltrosAtas()">
                            <i class="fas fa-times"></i> Limpar
                        </button>
                    </div>
                </div>
                <div id="filtros-ativos-ata" class="filter-info"></div>
            </div>
            <div id="resultados-info-ata" style="margin-bottom: 1rem;"></div>

            <!-- Formulário Nova Ata -->
            <div class="form-card fade-in">
                <h2><i class="fas fa-plus-circle"></i> Novo Registro de Ocorrência</h2>
                <div class="grid-2">
                    <div class="form-group">
                        <label><i class="fas fa-building"></i> Condomínio</label>
                        <select id="ata-condo" onchange="app.updateCity()">
                            <option value="">Selecione um condomínio...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Cidade</label>
                        <input type="text" id="ata-cidade" readonly style="background: #f8f9fa;">
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Tipo de Registro</label>
                        <select id="ata-tipo">
                            <option value="Informação">📝 Informação</option>
                            <option value="Ocorrência">⚠️ Ocorrência</option>
                            <option value="Incidente">🚨 Incidente</option>
                            <option value="Informações Fixas">📌 Informações Fixas</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-tasks"></i> Status</label>
                        <select id="ata-status">
                            <option value="Em andamento">🔄 Em andamento</option>
                            <option value="Finalizado">✅ Finalizado</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-align-left"></i> Descrição dos Fatos</label>
                    <textarea id="ata-desc" rows="5" placeholder="Descreva detalhadamente os fatos ocorridos..."></textarea>
                </div>
                <button class="btn btn-primary" onclick="app.saveAta()">
                    <i class="fas fa-save"></i> SALVAR REGISTRO
                </button>
            </div>

            <!-- Lista de Atas -->
            <div id="ata-lista"></div>
        </div>

        <!-- ABA: INFORMAÇÕES FIXAS -->
        <div id="tab-fixas" class="tab-content hidden">
            <div class="fixed-info-container">
                <div class="fixed-info-header">
                    <i class="fas fa-thumbtack"></i>
                    <h3>Informações Fixas dos Condomínios</h3>
                </div>
                <p style="color: #856404; margin-bottom: 1rem;">
                    <i class="fas fa-info-circle"></i> Estas são informações importantes que permanecem visíveis para todos os operadores.
                </p>
            </div>
            <div id="fixas-lista"></div>
        </div>

        <!-- ABA: ORDEM DE SERVIÇO -->
        <div id="tab-os" class="tab-content hidden">
            <!-- Tela de Confirmação de OS Enviada (oculta por padrão) -->
            <div id="os-confirmation-screen" class="os-confirmation hidden">
                <i class="fas fa-check-circle"></i>
                <h2>Ordem de Serviço Aberta com Sucesso!</h2>
                <p style="font-size: 1.1rem; color: var(--gray); margin-bottom: 2rem;">
                    A sua ordem de serviço foi registrada e enviada por e-mail.
                </p>
                <div class="details">
                    <div style="margin-bottom: 10px;">
                        <strong>📋 Número da OS:</strong> <span id="os-confirmation-id">OS-001</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>🏢 Condomínio:</strong> <span id="os-confirmation-condo">-</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>⚠️ Gravidade:</strong> <span id="os-confirmation-gravidade">-</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>👤 Funcionário:</strong> <span id="os-confirmation-funcionario">-</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>📧 E-mail:</strong> <span id="os-confirmation-email">-</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>📅 Data/Hora:</strong> <span id="os-confirmation-data">-</span>
                    </div>
                </div>
                <p style="margin-top: 1.5rem; color: var(--gray); font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i>
                    Um e-mail foi enviado para <strong>londrina.tecnica1@porter.com.br, londrina.tecnicaplantao@porter.com.br, londrina.tenicaplantão1@porter.com.br</strong> com todos os detalhes.
                    Os técnicos responderão diretamente por e-mail.
                </p>
                <div class="back-to-os">
                    <button class="btn btn-primary" onclick="appEmail.voltarParaFormOS()">
                        <i class="fas fa-plus-circle"></i> Abrir Nova OS
                    </button>
                </div>
            </div>

            <!-- Formulário OS (visível por padrão) -->
            <div id="os-form-container">
                <div class="form-card os-form fade-in">
                    <h2><i class="fas fa-tools"></i> Nova Ordem de Serviço</h2>
                    <!-- FORMULÁRIO COM MÉTODO POST PARA FORMSUBMIT -->
                    <form id="os-form-email" action="https://formsubmit.co/londrina.operacional@porter.com.br" method="POST">
                        <!-- Campos ocultos do FormSubmit -->
                        <input type="hidden" name="_cc" value="londrina.tecnicaplantao@porter.com.br,londrina.tenicaplantao1@porter.com.br,londrina.tecnica1@porter.com.br">
                        <input type="hidden" name="_subject" value="[NOVA O.S] - Sistema Porter">
                        <input type="hidden" name="_template" value="table">
                        <input type="hidden" name="_captcha" value="false">
                        <input type="hidden" name="_next" value="#os-confirmation-screen">
                        
                        <div class="grid-2">
                            <div class="form-group">
                                <label><i class="fas fa-building"></i> Condomínio *</label>
                                <select id="os-condo" name="condominio" onchange="app.updateCityOS()" required>
                                    <option value="">Selecione um condomínio...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-city"></i> Cidade</label>
                                <input type="text" id="os-cidade" name="cidade" readonly style="background: #f8f9fa;">
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label><i class="fas fa-user"></i> Nome do Funcionário *</label>
                                <input type="text" id="os-funcionario" name="funcionario" placeholder="Seu nome completo" required>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-envelope"></i> E-mail do Funcionário *</label>
                                <input type="email" id="os-email" name="email" placeholder="seu.email@porter.com.br" required>
                            </div>
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label><i class="fas fa-sitemap"></i> Setor/Departamento *</label>
                                <select id="os-setor" name="setor" required>
                                    <option value="">Selecione o setor...</option>
                                    <option value="Operação">Operação</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Técnico">Técnico</option>
                                    <option value="RH">Recursos Humanos</option>
                                    <option value="Financeiro">Financeiro</option>
                                    <option value="Comercial">Comercial</option>
                                    <option value="Outro">Outro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-exclamation-triangle"></i> Gravidade da Ocorrência *</label>
                                <select id="os-gravidade" name="gravidade" required>
                                    <option value="Baixa">🟢 Baixa - Manutenção Preventiva/Rotina</option>
                                    <option value="Média" selected>🟡 Média - Reparo Necessário</option>
                                    <option value="Alta">🔴 Alta - Urgente/Problema Crítico</option>
                                    <option value="Emergência">🚨 Emergência - Risco Imediato</option>
                                </select>
                                <small style="font-size: 0.8rem; color: #666;">Define prioridade e tempo de resposta</small>
                            </div>
                        </div>
                        <!-- 🆕 CAMPO: TÉCNICO RESPONSÁVEL -->
                        <div class="form-group">
                            <label><i class="fas fa-user-cog"></i> Técnico responsável</label>
                            <select id="os-tecnico" name="tecnico_responsavel">
                                <option value="">Selecione um técnico (opcional)</option>
                                <optgroup label="TÉCNICOS LONDRINA">
                                    <option value="EVERTON ALAN - TÉCNICO PORTER">EVERTON ALAN - TÉCNICO PORTER</option>
                                    <option value="MARCIO JOSE DE BARROS - TEC PORTER">MARCIO JOSE DE BARROS - TEC PORTER</option>
                                    <option value="VALDEIR COITO - TÉCNICO PORTER">VALDEIR COITO - TÉCNICO PORTER</option>
                                </optgroup>
                                <optgroup label="AUXILIARES">
                                    <option value="WELINGTON SANTOS - AUXILIAR TÉCNICO">WELINGTON SANTOS - AUXILIAR TÉCNICO</option>
                                    <option value="CLEBERSON SILVA - AUXILIAR TÉCNICO TÁTICO PORTER">CLEBERSON SILVA - AUXILIAR TÉCNICO TÁTICO PORTER</option>
                                    <option value="EMANOEL THOMAZ - AUXILIAR TÉCNICO">EMANOEL THOMAZ - AUXILIAR TÉCNICO</option>
                                </optgroup>
                                <optgroup label="TÉCNICOS MARINGÁ">
                                    <option value="VINICIUS MENDES - PORTER MARINGÁ">VINICIUS MENDES - PORTER MARINGÁ</option>
                                    <option value="ITALO - TÉCNICO PORTER">ITALO - TÉCNICO PORTER</option>
                                </optgroup>
                            </select>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-align-left"></i> Descrição do Problema *</label>
                            <textarea id="os-desc" name="descricao" rows="5" placeholder="Descreva detalhadamente o problema ou serviço necessário..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-calendar"></i> Data Preferencial para Atendimento</label>
                            <input type="date" id="os-data" name="data_preferencial">
                        </div>
                        <!-- Botão para enviar o formulário -->
                        <button type="submit" class="btn btn-info" onclick="app.abrirOSComEmail(event)">
                            <i class="fas fa-paper-plane"></i> ABRIR ORDEM DE SERVIÇO
                        </button>
                    </form>
                </div>

                <!-- NOVO: FILTRO POR GRAVIDADE NA LISTA -->
                <div style="margin: 2rem 0 1rem 0; display: flex; justify-content: space-between; align-items: center;">
                    <h3><i class="fas fa-list"></i> Ordens de Serviço Recentes</h3>
                    <div style="display: flex; gap: 10px;">
                        <div class="btn-group">
                            <button class="btn btn-filter" onclick="app.filtrarOSTodas()">
                                Todas
                            </button>
                            <button class="btn btn-filter" style="background: #e74c3c20; color: #e74c3c; border: 1px solid #e74c3c40;" onclick="app.filtrarOSGravidade('Alta')">
                                🔴 Alta
                            </button>
                            <button class="btn btn-filter" style="background: #f39c1220; color: #f39c12; border: 1px solid #f39c1240;" onclick="app.filtrarOSGravidade('Média')">
                                🟡 Média
                            </button>
                            <button class="btn btn-filter" style="background: #27ae6020; color: #27ae60; border: 1px solid #27ae6040;" onclick="app.filtrarOSGravidade('Baixa')">
                                🟢 Baixa
                            </button>
                        </div>
                    </div>
                </div>
                <!-- Lista de OS -->
                <div id="os-lista"></div>
            </div>
        </div>

        <!-- NOVA ABA: CHAT GERAL -->
        <div id="tab-chat" class="tab-content hidden">
            <div class="chat-container">
                <div class="chat-header">
                    <div>
                        <strong><i class="fas fa-comments"></i> Chat Geral dos Operadores</strong>
                        <div style="font-size: 0.85rem; opacity: 0.9;">Comunicação rápida entre a equipe</div>
                    </div>
                    <div class="chat-admin-controls" id="chat-admin-controls" style="display: none;">
                        <button class="chat-clear-btn" onclick="chatSystem.clearChat()">
                            <i class="fas fa-trash"></i> Limpar Chat
                        </button>
                    </div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <!-- Mensagens serão carregadas aqui -->
                </div>
                <div class="chat-input-area">
                    <textarea class="chat-input" id="chat-input" placeholder="Digite sua mensagem..." rows="2"></textarea>
                    <button class="btn btn-info" onclick="chatSystem.sendChatMessage()" id="chat-send-btn">
                        <i class="fas fa-paper-plane"></i> Enviar
                    </button>
                </div>
            </div>
            <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--gray); text-align: center;">
                <i class="fas fa-info-circle"></i> As mensagens são visíveis para todos os operadores logados
            </div>
        </div>

        <!-- NEW: ABA: CHAT PRIVADO -->
        <div id="tab-chat-privado" class="tab-content hidden">
            <div class="chat-container chat-private-container">
                <div class="chat-header chat-private-header">
                    <div>
                        <strong><i class="fas fa-user-secret"></i> Chat Privado</strong>
                        <div style="font-size: 0.85rem; opacity: 0.9;">Conversa privada entre operadores</div>
                    </div>
                </div>
                
                <div class="private-chat-selector">
                    <div class="form-group">
                        <label><i class="fas fa-user-friends"></i> Conversar com:</label>
                        <select id="private-chat-target" onchange="chatSystem.loadPrivateChat()">
                            <option value="">Selecione um operador...</option>
                        </select>
                    </div>
                </div>
                
                <div class="chat-messages chat-private-messages" id="chat-private-messages">
                    <!-- Mensagens privadas serão carregadas aqui -->
                </div>
                
                <div class="chat-input-area">
                    <textarea class="chat-input" id="chat-private-input" placeholder="Digite sua mensagem privada..." rows="2" disabled></textarea>
                    <button class="btn btn-info" onclick="chatSystem.sendPrivateChatMessage()" id="chat-private-send-btn" disabled>
                        <i class="fas fa-paper-plane"></i> Enviar
                    </button>
                </div>
            </div>
            <div style="margin-top: 1rem; font-size: 0.85rem; color: var(--gray); text-align: center;">
                <i class="fas fa-info-circle"></i> As mensagens são visíveis apenas para você e o destinatário selecionado
            </div>
        </div>

        <!-- ABA: HISTÓRICO -->
        <div id="tab-presenca" class="tab-content hidden">
            <div class="filters-container">
                <div class="filters-title">
                    <i class="fas fa-filter"></i> Filtrar Histórico
                </div>
                <div class="grid-3">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Operador</label>
                        <select id="filter-presenca-operador">
                            <option value="">Todos os operadores</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Data Inicial</label>
                        <input type="date" id="filter-presenca-inicio">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Data Final</label>
                        <input type="date" id="filter-presenca-fim">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-clock"></i> Turno</label>
                        <select id="filter-presenca-turno">
                            <option value="">Todos os turnos</option>
                            <option value="Diurno">🌞 Diurno</option>
                            <option value="Noturno">🌙 Noturno</option>
                        </select>
                    </div>
                    <div class="filter-actions">
                        <button class="btn btn-filter" onclick="app.aplicarFiltrosPresenca()">
                            <i class="fas fa-search"></i> Filtrar
                        </button>
                        <button class="btn btn-clear" onclick="app.limparFiltrosPresenca()">
                            <i class="fas fa-times"></i> Limpar
                        </button>
                    </div>
                </div>
            </div>
            <!-- Histórico de Acesso -->
            <h3 style="margin: 2rem 0 1rem 0;"><i class="fas fa-history"></i> Histórico de Acesso</h3>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th><i class="fas fa-user"></i> Operador</th>
                            <th><i class="fas fa-clock"></i> Turno</th>
                            <th><i class="fas fa-calendar"></i> Data</th>
                            <th><i class="fas fa-sign-in-alt"></i> Login</th>
                            <th><i class="fas fa-sign-out-alt"></i> Logoff</th>
                        </tr>
                    </thead>
                    <tbody id="presenca-lista"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<!-- MODAL DE RELATÓRIO -->
<div class="modal" id="report-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-file-pdf"></i> Gerar Relatório PDF</h3>
            <button class="modal-close" onclick="app.closeReportModal()">&times;</button>
        </div>
        <div class="form-group">
            <label><i class="fas fa-building"></i> Condomínio</label>
            <select id="report-condo">
                <option value="">Todos os condomínios</option>
            </select>
        </div>
        <div class="grid-2">
            <div class="form-group">
                <label><i class="fas fa-calendar"></i> Data Inicial</label>
                <input type="date" id="report-data-inicio">
            </div>
            <div class="form-group">
                <label><i class="fas fa-calendar"></i> Data Final</label>
                <input type="date" id="report-data-fim">
            </div>
        </div>
        <div class="form-group">
            <label><i class="fas fa-tag"></i> Tipo de Conteúdo</label>
            <select id="report-tipo">
                <option value="atas">📋 Ocorrências</option>
                <option value="fixas">📌 Informações Fixas</option>
                <option value="os">🔧 Ordens de Serviço</option>
                <option value="all">📊 Todos os Registros</option>
            </select>
        </div>
        <div class="pdf-preview" id="pdf-preview">
            <div class="pdf-icon">
                <i class="fas fa-file-pdf"></i>
            </div>
            <p>Selecione as opções e gere o relatório</p>
            <p style="font-size: 0.9rem; color: var(--gray);">O relatório será gerado em PDF para impressão</p>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
            <button class="btn btn-primary" onclick="pdfGenerator.generatePDF()">
                <i class="fas fa-download"></i> Gerar e Baixar PDF
            </button>
            <button class="btn btn-clear" onclick="app.closeReportModal()">
                Cancelar
            </button>
        </div>
    </div>
</div>

<!-- MODAL DE COMENTÁRIOS -->
<div class="modal" id="comments-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-comments"></i> Comentários</h3>
            <button class="modal-close" onclick="app.closeCommentsModal()">&times;</button>
        </div>
        <div id="comments-modal-content">
            <!-- Conteúdo será carregado dinamicamente -->
        </div>
    </div>
</div>

<!-- MODAL DE CONTROLE ADMIN -->
<div class="modal" id="admin-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-user-shield"></i> Controle Administrativo</h3>
            <button class="modal-close" onclick="app.closeAdminModal()">&times;</button>
        </div>
        <div id="admin-modal-content">
            <!-- Conteúdo será carregado dinamicamente -->
        </div>
    </div>
</div>

<!-- ============================================== -->
<!-- FIREBASE SDKs (MANTENHA ESTES) -->
<!-- ============================================== -->
<!-- ORDEM ATUALIZADA -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<!-- Bibliotecas externas -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

<!-- Nossos scripts (em ordem alfabética) -->
<script src="data.js"></script>
<script src="firebase.js"></script> <!-- APENAS OS e Online -->
<script src="app.js"></script>
<script src="app-email.js"></script>
<script src="chat.js"></script> <!-- Chat independente -->
<script src="pdf.js"></script>
<script src="utils.js"></script>
<!-- 🔧 CORREÇÃO: Inicialização segura do sistema -->
<script>
// 🔧 CORREÇÃO: Inicialização segura do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que app existe globalmente
    if (typeof app === 'undefined') {
        console.error('❌ Erro: app não está definido. Verifique a ordem dos scripts.');
        // Criar objeto app mínimo para evitar erros
        window.app = {
            init: function() {
                console.log('⚠️ App carregado em modo de segurança');
            },
            login: function() {
                alert('Sistema ainda não carregou completamente. Aguarde alguns segundos.');
            }
        };
    }
    
    // Inicializar o sistema
    if (app && typeof app.init === 'function') {
        app.init();
    }
    
    // 🔧 CORREÇÃO: Configurar evento do botão de login
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            if (app && typeof app.login === 'function') {
                app.login();
            } else {
                console.error('❌ Erro: app.login não está disponível');
                alert('Erro: Sistema não carregou corretamente. Recarregue a página.');
            }
        });
    }
    
    // 🔧 CORREÇÃO: Configurar Enter no campo de senha
    const loginPass = document.getElementById('login-pass');
    if (loginPass) {
        loginPass.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (app && typeof app.login === 'function') {
                    app.login();
                }
            }
        });
    }
    
    // 🔧 CORREÇÃO: Forçar sincronização inicial após carregamento
    setTimeout(() => {
        if (app && app.currentUser && typeof app.updateOnlineUsers === 'function') {
            console.log('🔄 Forçando sincronização inicial de usuários online...');
            app.updateOnlineUsers();
        }
        
        // 🔧 CORREÇÃO: Configurar listener para recarregar dados quando voltar à aba
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && app && app.currentUser) {
                console.log('📱 Página visível novamente, atualizando dados...');
                if (typeof app.updateOnlineUsers === 'function') {
                    setTimeout(() => app.updateOnlineUsers(), 1000);
                }
            }
        });
    }, 3000);
    
    // 🔧 CORREÇÃO: Detectar atualização de página (F5)
    if (window.performance && window.performance.navigation) {
        const tipoNavegacao = window.performance.navigation.type;
        if (tipoNavegacao === 1) { // TYPE_RELOAD = 1
            console.log('🔄 Página recarregada (F5), mantendo sessão...');
            if (app && app.currentUser) {
                console.log('✅ Mantendo sessão do usuário:', app.currentUser.nome);
                // Manter sessão ativa
                setTimeout(() => {
                    if (typeof app.salvarSessao === 'function') {
                        app.salvarSessao();
                    }
                }, 500);
            }
        }
    }
});
</script>
</body>
</html>
