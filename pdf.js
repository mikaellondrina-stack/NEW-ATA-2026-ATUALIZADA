// Sistema de geração de PDF - Compatível com Supabase
const pdfGenerator = {
    async generatePDF() {
        const condo = document.getElementById('report-condo').value;
        const dataInicio = document.getElementById('report-data-inicio').value;
        const dataFim = document.getElementById('report-data-fim').value;
        const tipo = document.getElementById('report-tipo').value;
        
        let dados = [];
        let titulo = '';
        
        // 🔧 SUPABASE: Buscar dados do Supabase se disponível
        if (window.supabaseClient && (tipo === 'os' || tipo === 'all')) {
            try {
                // Buscar OS do Supabase
                let query = window.supabaseClient
                    .from('ordens_servico')
                    .select('*');
                
                if (condo) query = query.eq('condo', condo);
                if (dataInicio) query = query.gte('data_iso', dataInicio);
                if (dataFim) query = query.lte('data_iso', dataFim);
                
                const { data: osData, error } = await query.order('timestamp', { ascending: false });
                
                if (!error && osData) {
                    if (tipo === 'os') {
                        dados = osData.map(this.formatarOSParaPDF);
                        titulo = 'Relatório de Ordens de Serviço - Supabase';
                    } else if (tipo === 'all') {
                        dados = dados.concat(osData.map(item => ({
                            ...this.formatarOSParaPDF(item),
                            tipoRegistro: 'Ordem de Serviço'
                        })));
                    }
                }
            } catch (error) {
                console.error('❌ Erro ao buscar OS do Supabase:', error);
                // Fallback para localStorage
                this.gerarPDFLocal(condo, dataInicio, dataFim, tipo);
                return;
            }
        } else {
            // Fallback para localStorage
            this.gerarPDFLocal(condo, dataInicio, dataFim, tipo);
            return;
        }
        
        if (dados.length === 0) {
            alert('Nenhum registro encontrado para os filtros selecionados.');
            return;
        }
        
        this.criarPDF(dados, titulo, condo, dataInicio, dataFim);
    },
    
    gerarPDFLocal(condo, dataInicio, dataFim, tipo) {
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
        
        this.criarPDF(dados, titulo, condo, dataInicio, dataFim);
    },
    
    formatarOSParaPDF(osSupabase) {
        return {
            id: osSupabase.firebase_id || osSupabase.id,
            osId: osSupabase.os_id,
            condo: osSupabase.condo,
            cidade: osSupabase.cidade,
            gravidade: osSupabase.gravidade,
            desc: osSupabase.descricao,
            data: osSupabase.data,
            dataISO: osSupabase.data_iso,
            hora: osSupabase.hora,
            funcionario: osSupabase.funcionario,
            operador: osSupabase.operador,
            status: osSupabase.status,
            statusOS: osSupabase.status_os,
            prazoResposta: osSupabase.prazo_resposta,
            tecnicoResponsavel: osSupabase.tecnico_responsavel
        };
    },
    
    criarPDF(dados, titulo, condo, dataInicio, dataFim) {
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
        
        // Fonte de dados
        const fonteDados = window.supabaseClient ? 'Supabase' : 'Local';
        doc.setFontSize(10);
        doc.text(`Fonte: ${fonteDados}`, 10, 35);
        
        // Título do relatório
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text(titulo, 105, 45, { align: 'center' });
        
        // Filtros aplicados
        doc.setFontSize(10);
        let filtrosTexto = `Condomínio: ${condo || 'Todos'} | Período: ${dataInicio || 'Início'} a ${dataFim || 'Fim'}`;
        doc.text(filtrosTexto, 105, 55, { align: 'center' });
        
        // Data de geração
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 105, 60, { align: 'center' });
        
        // Conteúdo
        let y = 75;
        
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
            
            if (item.osId) {
                doc.text(`OS: ${item.osId} | Gravidade: ${item.gravidade || ''}`, 10, y);
                y += 5;
            }
            
            doc.text(`Data: ${item.data} ${item.hora || ''} | Tipo: ${item.tipoRegistro || item.tipo || ''}`, 10, y);
            y += 5;
            
            if (item.statusOS) {
                doc.text(`Status: ${item.statusOS}`, 10, y);
                y += 5;
            }
            
            if (item.operador) {
                doc.text(`Operador: ${item.operador} | Status: ${item.status || ''}`, 10, y);
                y += 5;
            }
            
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
        doc.text('Porter - Ata Operacional 2026 | Sistema Supabase', 105, 290, { align: 'center' });
        
        const nomeArquivo = `relatorio-porter-${new Date().toISOString().slice(0, 10)}.pdf`;
        doc.save(nomeArquivo);
        
        if (typeof app !== 'undefined' && app.closeReportModal) {
            app.closeReportModal();
        }
        
        if (typeof app !== 'undefined' && app.showMessage) {
            app.showMessage('Relatório gerado com sucesso!', 'success');
        }
    },
    
    // 🔧 SUPABASE: Gerar relatório estatístico do Supabase
    async gerarRelatorioEstatistico() {
        if (!window.supabaseClient) {
            alert('Supabase não disponível para relatórios estatísticos');
            return;
        }
        
        try {
            // Obter estatísticas do Supabase
            const estatisticas = await window.supabaseHelper?.obterEstatisticas();
            
            if (!estatisticas) {
                alert('Não foi possível obter estatísticas do Supabase');
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
            doc.text('Relatório Estatístico - Supabase', 105, 22, { align: 'center' });
            
            // Título
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text('Estatísticas do Sistema', 105, 40, { align: 'center' });
            
            doc.setFontSize(10);
            doc.text(`Atualizado em: ${new Date(estatisticas.atualizado_em).toLocaleString('pt-BR')}`, 105, 48, { align: 'center' });
            
            let y = 65;
            
            // Seção: Atividade Hoje
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('📊 Atividade Hoje', 10, y);
            y += 10;
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`• Ordens de Serviço: ${estatisticas.os_hoje}`, 15, y);
            y += 7;
            doc.text(`  - 🔴 Alta: ${estatisticas.os_alta}`, 20, y);
            y += 7;
            doc.text(`  - 🟡 Média: ${estatisticas.os_media}`, 20, y);
            y += 7;
            doc.text(`  - 🟢 Baixa: ${estatisticas.os_baixa}`, 20, y);
            y += 7;
            doc.text(`• Atas Registradas: ${estatisticas.atas_hoje}`, 15, y);
            y += 10;
            
            // Seção: Usuários
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('👥 Usuários Online', 10, y);
            y += 10;
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`• Online agora: ${estatisticas.usuarios_online}`, 15, y);
            y += 10;
            
            // Gráfico simplificado
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('📈 Distribuição de OS por Gravidade', 10, y);
            y += 10;
            
            const totalOS = estatisticas.os_alta + estatisticas.os_media + estatisticas.os_baixa;
            if (totalOS > 0) {
                const larguraGrafico = 150;
                const alturaBarra = 20;
                
                // Barra Alta
                const larguraAlta = (estatisticas.os_alta / totalOS) * larguraGrafico;
                doc.setFillColor(231, 76, 60); // Vermelho
                doc.rect(15, y, larguraAlta, alturaBarra, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text(`Alta: ${estatisticas.os_alta} (${Math.round((estatisticas.os_alta/totalOS)*100)}%)`, 20, y + 12);
                
                // Barra Média
                const larguraMedia = (estatisticas.os_media / totalOS) * larguraGrafico;
                doc.setFillColor(243, 156, 18); // Laranja
                doc.rect(15 + larguraAlta, y, larguraMedia, alturaBarra, 'F');
                doc.text(`Média: ${estatisticas.os_media} (${Math.round((estatisticas.os_media/totalOS)*100)}%)`, 20 + larguraAlta, y + 12);
                
                // Barra Baixa
                const larguraBaixa = (estatisticas.os_baixa / totalOS) * larguraGrafico;
                doc.setFillColor(39, 174, 96); // Verde
                doc.rect(15 + larguraAlta + larguraMedia, y, larguraBaixa, alturaBarra, 'F');
                doc.text(`Baixa: ${estatisticas.os_baixa} (${Math.round((estatisticas.os_baixa/totalOS)*100)}%)`, 20 + larguraAlta + larguraMedia, y + 12);
                
                y += alturaBarra + 15;
            }
            
            // Rodapé
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text('Relatório gerado automaticamente pelo sistema Porter', 105, 285, { align: 'center' });
            doc.text('Powered by Supabase PostgreSQL', 105, 290, { align: 'center' });
            
            doc.save(`estatisticas-porter-${new Date().toISOString().slice(0, 10)}.pdf');
            
            if (typeof app !== 'undefined' && app.showMessage) {
                app.showMessage('Relatório estatístico gerado!', 'success');
            }
            
        } catch (error) {
            console.error('❌ Erro ao gerar relatório estatístico:', error);
            alert('Erro ao gerar relatório estatístico: ' + error.message);
        }
    }
};

// 🔧 SUPABASE: Adicionar botão de relatório estatístico se Supabase estiver disponível
if (typeof window.supabaseClient !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const reportModal = document.querySelector('.modal-content');
            if (reportModal) {
                const btnEstatistico = document.createElement('button');
                btnEstatistico.className = 'btn btn-info';
                btnEstatistico.innerHTML = '<i class="fas fa-chart-bar"></i> Relatório Estatístico';
                btnEstatistico.onclick = () => pdfGenerator.gerarRelatorioEstatistico();
                btnEstatistico.style.marginTop = '10px';
                reportModal.querySelector('.form-group:last-child').appendChild(btnEstatistico);
            }
        }, 2000);
    });
}
