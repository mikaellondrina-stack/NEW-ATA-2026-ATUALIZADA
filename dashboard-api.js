// ==============================================
// DASHBOARD API - Integração com Dashboard TV
// NÃO ALTERA NENHUMA FUNÇÃO EXISTENTE
// ==============================================

const DashboardAPI = {
    // Configuração
    config: {
        apiKey: 'porter_dashboard_2026',
        dashboardUrl: 'http://tv.seudominio.com', // Altere para URL do dashboard
        enabled: true
    },

    // Inicializar
    init() {
        console.log('📡 Dashboard API carregada');
        this.adicionarCheckboxes();
    },

    // Adicionar checkboxes nos formulários
    adicionarCheckboxes() {
        // Aguardar DOM carregar
        setTimeout(() => {
            this.adicionarCheckboxAta();
            this.adicionarCheckboxInfoFixa();
        }, 2000);
    },

    // Checkbox no formulário de ATA
    adicionarCheckboxAta() {
        const formAta = document.querySelector('#ata-form .form-actions');
        if (!formAta || document.getElementById('dashboard-checkbox-ata')) return;

        const checkbox = document.createElement('label');
        checkbox.id = 'dashboard-checkbox-ata';
        checkbox.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-right: 15px; cursor: pointer;';
        checkbox.innerHTML = `
            <input type="checkbox" id="enviar-dashboard-ata" style="width: 18px; height: 18px; cursor: pointer;">
            <span style="color: var(--text-primary); font-size: 14px;">📺 Enviar para Dashboard</span>
        `;

        formAta.insertBefore(checkbox, formAta.firstChild);
    },

    // Checkbox no modal de Informação Fixa
    adicionarCheckboxInfoFixa() {
        const modalFooter = document.querySelector('#info-fixa-modal .modal-footer');
        if (!modalFooter || document.getElementById('dashboard-checkbox-info')) return;

        const checkbox = document.createElement('label');
        checkbox.id = 'dashboard-checkbox-info';
        checkbox.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-right: 15px; cursor: pointer;';
        checkbox.innerHTML = `
            <input type="checkbox" id="enviar-dashboard-info" style="width: 18px; height: 18px; cursor: pointer;">
            <span style="color: var(--text-primary);">📺 Enviar para Dashboard</span>
        `;

        modalFooter.insertBefore(checkbox, modalFooter.firstChild);
    },

    // Enviar informação para o dashboard
    enviarInfo(condo, descricao, autor, tipo) {
        if (!this.config.enabled) return;
        
        const enviar = tipo === 'ata' 
            ? document.getElementById('enviar-dashboard-ata')?.checked
            : document.getElementById('enviar-dashboard-info')?.checked;

        if (!enviar || !condo) return;

        const dados = {
            condo: condo,
            descricao: descricao,
            autor: autor || 'Sistema',
            tipo: tipo,
            timestamp: new Date().toISOString(),
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        // Enviar via fetch (não bloqueante)
        fetch(`${this.config.dashboardUrl}/api/receber-info.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.config.apiKey
            },
            body: JSON.stringify(dados),
            mode: 'no-cors'
        }).catch(() => {
            // Falha silenciosa
            console.log('Dashboard não disponível');
        });

        // Também salvar localmente como backup
        this.salvarBackupLocal(dados);
        
        console.log('📤 Enviado para dashboard:', dados);
    },

    // Backup local
    salvarBackupLocal(dados) {
        try {
            let backup = JSON.parse(localStorage.getItem('dashboard_backup') || '[]');
            backup.unshift(dados);
            if (backup.length > 100) backup.pop();
            localStorage.setItem('dashboard_backup', JSON.stringify(backup));
        } catch (e) {
            console.log('Erro ao salvar backup:', e);
        }
    }
};

// Inicializar quando o app estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DashboardAPI.init());
} else {
    DashboardAPI.init();
}
