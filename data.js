// Dados do sistema Ata Operacional Porter - 2026
// Arquivo otimizado e corrigido

const DATA = {
    funcionarios: [
        { nome: "LAÍSSA PEREIRA DOS SANTOS XAVIER", user: "laissa.xavier", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "VANESSA LOPES SOUZA DE OLIVEIRA", user: "vanessa.oliveira", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "MARIA LUIZA ALEIXO ANTUNES", user: "maria.antunes", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "MARISA MENEGHETTI", user: "marisa.meneghetti", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "LUDMILA R CASSIANO", user: "ludmila.cassiano", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "MARIA GABRIELA ANTONIO", user: "maria.antonio", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "DENISE CRISTINA DE SOUSA", user: "denise.sousa", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "EDSON SILVA MACÊDO", user: "edson.macedo", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "MARIA CLARA RAMOS", user: "maria.ramos", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "GABRIELY AMORIM CAMPOS", user: "gabriely.campos", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "SANDRA REGINA DA FRANÇA SILVA", user: "sandra.silva", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "THAIS BENA LIMA", user: "thais.lima", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "ABNER CAVALCANTE", user: "abner.cavalcante", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "DAIANE LUCY RODRIGUES DE ALMEIDA", user: "daiane.almeida", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "ALINY MELQUIADES DE SOUZA", user: "aliny.souza", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "LOUISE COSTA", user: "louise.costa", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "ROSALIA TAIT KLINKERFUS", user: "rosalia.klinkerfus", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "MARIO ALEXANDRE CLEMENTIN", user: "mario.clementin", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "VANIA DO SOCORRO LEOCADIO", user: "vania.leocadio", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "JACKELINE ARAUJO SAMPAIO DIAS", user: "jackeline.dias", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "LUCAS VINICIUS DA SILVA", user: "lucas.v.silva", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "CARLOS HENRIQUE FERREIRA LEITE", user: "carlos.leite", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "LUIZ FERNANDO S MORYAMA DOS SANTOS", user: "luiz.santos", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "ERICK DE SOUZA RODRIGUES", user: "erick.rodrigues", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "MATHEUS ROBERTO BRASIL SILVA", user: "matheus.silva", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "WELINGTON FELIPE ALVES BARBOSA", user: "wellington.barbosa", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "KAIC VITOR MARTINS DE BRITO", user: "kaic.brito", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "DEISY SANTOS CRUZ", user: "deisy.cruz", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "DANIELE DA SILVA ROCHA", user: "daniele.rocha", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "ANA BEATRIZ PEREIRA", user: "ana.pereira", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "LUCAS DANIEL", user: "lucas.daniel", pass: "Porter@2026", role: "OPERADOR" },
        { nome: "ADMINISTRADOR PORTER", user: "admin.porter", pass: "Admin@2026", role: "ADMIN" }
    ],
    condominios: [
        { n: "ALAMEDA PINHEIROS", c: "Londrina" }, { n: "ALGARVE", c: "Londrina" }, { n: "AMADEUS", c: "Londrina" },
        { n: "AMARILIS", c: "Londrina" }, { n: "AMERICA", c: "Londrina" }, { n: "ANITA GARIBALDI", c: "Londrina" },
        { n: "AQUALUNA", c: "Londrina" }, { n: "ARIANE", c: "Londrina" }, { n: "ARQUITETO JULIO RIBEIRO", c: "Londrina" },
        { n: "ATHENAS", c: "Londrina" }, { n: "BARAO CATUAI", c: "Londrina" }, { n: "BASE - PORTER LONDRINA", c: "Londrina" },
        { n: "BELLEVILLE", c: "Londrina" }, { n: "BENTO MUNHOZ DA ROCHA NETTO II", c: "Maringá" },
        { n: "BIARRITZ", c: "Londrina" }, { n: "BOSQUE", c: "Londrina" }, { n: "CAMPOS ELISEOS", c: "Londrina" },
        { n: "CASABLANCA", c: "Londrina" }, { n: "CASA CONDOMINIO (Londrina)", c: "Londrina" },
        { n: "CASA CONDOMÍNIO (Maringá)", c: "Maringá" }, { n: "CASARIO DO PORTO", c: "Londrina" },
        { n: "CENTRO EMPRESARIAL NEWTON CAMARA", c: "Londrina" }, { n: "CIDADE DOS PASSAROS", c: "Arapongas" },
        { n: "CITZEN PARK", c: "Maringá" }, { n: "COMERCIAL CAMBARA", c: "Londrina" }, { n: "DOLCE VIE", c: "Londrina" },
        { n: "EBANO", c: "Londrina" }, { n: "ENSEADAS", c: "Londrina" }, { n: "EUROCENTER", c: "Londrina" },
        { n: "FERNANDA", c: "Londrina" }, { n: "FLOR DA MATA", c: "Londrina" }, { n: "FLOR DE LOTUS", c: "Londrina" },
        { n: "FLORENZA", c: "Londrina" }, { n: "GOLDEN GATE", c: "Londrina" }, { n: "GOLDENVILLE", c: "Londrina" },
        { n: "GRAO PARA", c: "Londrina" }, { n: "GREENFIELDS", c: "Londrina" }, { n: "HEIMTAL PARK", c: "Londrina" },
        { n: "HYDE PARK", c: "Londrina" }, { n: "INDREL INDUSTRIA DE REFRIGERACAO LONDRINENSE LTDA", c: "Londrina" },
        { n: "INEDITO", c: "Londrina" }, { n: "JOAO DINARDI", c: "Londrina" }, { n: "LAKE VAN GOGH", c: "Londrina" },
        { n: "LA SENA", c: "Cambé" }, { n: "LE REVE", c: "Londrina" }, { n: "MAR DEL PLATA", c: "Londrina" },
        { n: "MAXIMUS RESIDENCE", c: "Londrina" }, { n: "MGL - MECANICA EIRELI", c: "Cambé" },
        { n: "MONT BLANC", c: "Londrina" }, { n: "MORADA IMPERIAL", c: "Londrina" }, { n: "MUNDO NOVO", c: "Londrina" },
        { n: "NEW PLAZA RESIDENCE", c: "Maringá" }, { n: "NICOLA PAGAN", c: "Londrina" },
        { n: "ORTIZ (Cambé)", c: "Cambé" }, { n: "PALAIS LAC DOR", c: "Londrina" }, { n: "PARQUE IMPERIAL", c: "Londrina" },
        { n: "PEROLA NEGRA", c: "Londrina" }, { n: "PETIT VILLE", c: "Londrina" }, { n: "POLARIS", c: "Londrina" },
        { n: "PORTLAND RESIDENCE", c: "Londrina" }, { n: "PRIME HOUSE", c: "Londrina" }, { n: "PRIVILEGE JAMAICA", c: "Londrina" },
        { n: "QUINTA DA BOA VISTA III A", c: "Londrina" }, { n: "QUINTA DA BOA VISTA VI", c: "Londrina" },
        { n: "RIO TEJO", c: "Maringá" }, { n: "RIO TEVERE", c: "Maringá" }, { n: "SANTOS", c: "Londrina" },
        { n: "SAO GABRIEL", c: "Maringá" }, { n: "SERRA VERDE", c: "Londrina" }, { n: "SIRMIONE", c: "Maringá" },
        { n: "SOLAR MONTREAUX", c: "Londrina" }, { n: "SPAZIO LAS PALMAS", c: "Londrina" },
        { n: "SPEZIA", c: "Londrina" }, { n: "STRAUSS BOULEVARD", c: "Londrina" }, { n: "TAPUIAS JARDIM", c: "Londrina" },
        { n: "TERRALIS JARDIN RESIDENCE", c: "Londrina" }, { n: "TERRASSE JARDIN", c: "Londrina" },
        { n: "TORRES BRASIL", c: "Londrina" }, { n: "UNIVERSITOP", c: "Londrina" },
        { n: "VENICE DOWNTOWN", c: "Londrina" }, { n: "VILLA BELLA (Cambé)", c: "Cambé" },
        { n: "VILLA DAS TORRES", c: "Cambé" }, { n: "VILLAGE LA CORUNA", c: "Londrina" },
        { n: "VILLAGGIO DO ENGENHO", c: "Cambé" }, { n: "VILLA ROMANA", c: "Londrina" },
        { n: "VISCONDE DE BARBACENA", c: "Londrina" }, { n: "VITTACE BOULEVARD", c: "Londrina" },
        { n: "VIVALDI BOULEVARD", c: "Londrina" }, { n: "VIVENDA DOS PESCADORES", c: "Maringá" }
    ]
};

// Funções utilitárias para manipulação de dados
const DataUtils = {
    
    // Validação de login
    validarLogin: function(usuario, senha, turno) {
        // Validações básicas
        if (!usuario || !senha || !turno) {
            return { sucesso: false, mensagem: "Preencha todos os campos" };
        }
        
        // Validar formato do usuário (nome.sobrenome)
        const usuarioRegex = /^[a-z]+\.[a-z]+$/;
        if (!usuarioRegex.test(usuario)) {
            return { sucesso: false, mensagem: "Usuário deve estar no formato: nome.sobrenome" };
        }
        
        // Validar senha
        if (senha.length < 6) {
            return { sucesso: false, mensagem: "Senha deve ter pelo menos 6 caracteres" };
        }
        
        // Buscar funcionário
        const funcionario = DATA.funcionarios.find(f => f.user === usuario);
        
        if (!funcionario) {
            return { sucesso: false, mensagem: "Usuário não encontrado" };
        }
        
        if (funcionario.pass !== senha) {
            return { sucesso: false, mensagem: "Senha incorreta" };
        }
        
        // Validar turno
        const turnosValidos = ["Diurno", "Noturno"];
        if (!turnosValidos.includes(turno)) {
            return { sucesso: false, mensagem: "Turno inválido" };
        }
        
        return { 
            sucesso: true, 
            funcionario: {
                nome: funcionario.nome,
                usuario: funcionario.user,
                role: funcionario.role,
                turno: turno
            }
        };
    },
    
    // Obter condomínios por cidade
    getCondominiosPorCidade: function(cidade) {
        if (!cidade) return DATA.condominios;
        return DATA.condominios.filter(cond => cond.c === cidade);
    },
    
    // Obter todas as cidades únicas
    getCidades: function() {
        const cidades = new Set();
        DATA.condominios.forEach(cond => cidades.add(cond.c));
        return Array.from(cidades);
    },
    
    // Obter funcionário por usuário
    getFuncionarioPorUsuario: function(usuario) {
        return DATA.funcionarios.find(f => f.user === usuario);
    },
    
    // Obter funcionários por role
    getFuncionariosPorRole: function(role) {
        return DATA.funcionarios.filter(f => f.role === role);
    },
    
    // Validar condomínio
    validarCondominio: function(nomeCondominio) {
        return DATA.condominios.some(cond => cond.n === nomeCondominio);
    },
    
    // Obter informações do condomínio
    getInfoCondominio: function(nomeCondominio) {
        const condominio = DATA.condominios.find(cond => cond.n === nomeCondominio);
        if (condominio) {
            return {
                nome: condominio.n,
                cidade: condominio.c,
                tipo: this.getTipoCondominio(condominio.n)
            };
        }
        return null;
    },
    
    // Determinar tipo de condomínio baseado no nome
    getTipoCondominio: function(nome) {
        const nomeLower = nome.toLowerCase();
        
        if (nomeLower.includes("comercial") || nomeLower.includes("empresarial") || nomeLower.includes("center")) {
            return "Comercial";
        } else if (nomeLower.includes("industria") || nomeLower.includes("ltda") || nomeLower.includes("eireli")) {
            return "Industrial";
        } else if (nomeLower.includes("base") || nomeLower.includes("porter")) {
            return "Sede";
        } else {
            return "Residencial";
        }
    },
    
    // Gerar estatísticas
    getEstatisticas: function() {
        return {
            totalFuncionarios: DATA.funcionarios.length,
            totalCondominios: DATA.condominios.length,
            adminCount: DATA.funcionarios.filter(f => f.role === "ADMIN").length,
            operadorCount: DATA.funcionarios.filter(f => f.role === "OPERADOR").length,
            condominiosPorCidade: this.getCondominiosPorCidadeCount()
        };
    },
    
    getCondominiosPorCidadeCount: function() {
        const counts = {};
        DATA.condominios.forEach(cond => {
            counts[cond.c] = (counts[cond.c] || 0) + 1;
        });
        return counts;
    },
    
    // Exportar dados em diferentes formatos
    exportarDados: function(formato = 'json') {
        const dadosParaExportar = {
            sistema: "Ata Operacional Porter",
            versao: "2.0.0",
            dataExportacao: new Date().toISOString(),
            funcionarios: DATA.funcionarios,
            condominios: DATA.condominios
        };
        
        switch(formato.toLowerCase()) {
            case 'json':
                return JSON.stringify(dadosParaExportar, null, 2);
                
            case 'csv':
                return this.converterParaCSV(dadosParaExportar);
                
            default:
                return JSON.stringify(dadosParaExportar, null, 2);
        }
    },
    
    converterParaCSV: function(dados) {
        let csv = '';
        
        // Funcionários
        csv += "FUNCIONÁRIOS\n";
        csv += "Nome,Usuário,Cargo\n";
        dados.funcionarios.forEach(func => {
            csv += `"${func.nome}","${func.user}","${func.role}"\n`;
        });
        
        csv += "\nCONDOMÍNIOS\n";
        csv += "Nome,Cidade\n";
        dados.condominios.forEach(cond => {
            csv += `"${cond.n}","${cond.c}"\n`;
        });
        
        return csv;
    },
    
    // Backup de dados (localStorage)
    criarBackup: function() {
        const backup = {
            timestamp: new Date().getTime(),
            data: JSON.stringify(DATA),
            hash: this.criarHash(JSON.stringify(DATA))
        };
        
        // Salvar no localStorage
        localStorage.setItem('porter_backup_' + backup.timestamp, JSON.stringify(backup));
        
        // Limitar a 5 backups
        this.limitarBackups(5);
        
        return {
            sucesso: true,
            timestamp: backup.timestamp,
            data: new Date(backup.timestamp).toLocaleString('pt-BR')
        };
    },
    
    criarHash: function(string) {
        let hash = 0;
        for (let i = 0; i < string.length; i++) {
            const char = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    },
    
    limitarBackups: function(limite) {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('porter_backup_')) {
                backups.push({
                    key: key,
                    timestamp: parseInt(key.replace('porter_backup_', ''))
                });
            }
        }
        
        backups.sort((a, b) => a.timestamp - b.timestamp);
        
        while (backups.length > limite) {
            const backupParaRemover = backups.shift();
            localStorage.removeItem(backupParaRemover.key);
        }
    },
    
    listarBackups: function() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('porter_backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        timestamp: backup.timestamp,
                        data: new Date(backup.timestamp).toLocaleString('pt-BR'),
                        size: backup.data.length
                    });
                } catch (e) {
                    console.error('Erro ao ler backup:', key, e);
                }
            }
        }
        
        backups.sort((a, b) => b.timestamp - a.timestamp);
        return backups;
    },
    
    restaurarBackup: function(timestamp) {
        const key = 'porter_backup_' + timestamp;
        const backup = JSON.parse(localStorage.getItem(key));
        
        if (!backup) {
            return { sucesso: false, mensagem: "Backup não encontrado" };
        }
        
        // Verificar integridade
        const hashAtual = this.criarHash(backup.data);
        if (hashAtual !== backup.hash) {
            return { sucesso: false, mensagem: "Backup corrompido" };
        }
        
        try {
            const dadosRestaurados = JSON.parse(backup.data);
            
            // Atualizar DATA com dados restaurados
            Object.keys(dadosRestaurados).forEach(key => {
                if (DATA.hasOwnProperty(key)) {
                    DATA[key] = dadosRestaurados[key];
                }
            });
            
            return { 
                sucesso: true, 
                mensagem: "Backup restaurado com sucesso",
                data: new Date(backup.timestamp).toLocaleString('pt-BR')
            };
            
        } catch (e) {
            return { sucesso: false, mensagem: "Erro ao restaurar backup: " + e.message };
        }
    },
    
    // Log de atividades
    logAtividade: function(usuario, acao, detalhes = null) {
        const log = {
            timestamp: new Date().getTime(),
            usuario: usuario,
            acao: acao,
            detalhes: detalhes
        };
        
        const logs = JSON.parse(localStorage.getItem('porter_logs') || '[]');
        logs.push(log);
        
        // Limitar a 500 logs
        if (logs.length > 500) {
            logs.shift();
        }
        
        localStorage.setItem('porter_logs', JSON.stringify(logs));
        return log;
    },
    
    getLogs: function(limite = 100) {
        const logs = JSON.parse(localStorage.getItem('porter_logs') || '[]');
        return logs.slice(-limite).reverse();
    },
    
    // Limpar logs antigos
    limparLogsAntigos: function(dias = 30) {
        const logs = JSON.parse(localStorage.getItem('porter_logs') || '[]');
        const limite = Date.now() - (dias * 24 * 60 * 60 * 1000);
        
        const logsAtualizados = logs.filter(log => log.timestamp > limite);
        localStorage.setItem('porter_logs', JSON.stringify(logsAtualizados));
        
        return {
            removidos: logs.length - logsAtualizados.length,
            restantes: logsAtualizados.length
        };
    },
    
    // Validação de e-mail para OS
    validarEmailsOS: function(emails) {
        if (!emails || emails.trim() === '') {
            return { valido: true, emails: [] };
        }
        
        const listaEmails = emails.split(',').map(email => email.trim());
        const emailsValidos = [];
        const emailsInvalidos = [];
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        listaEmails.forEach(email => {
            if (emailRegex.test(email)) {
                emailsValidos.push(email);
            } else {
                emailsInvalidos.push(email);
            }
        });
        
        return {
            valido: emailsInvalidos.length === 0,
            emails: emailsValidos,
            invalidos: emailsInvalidos
        };
    },
    
    // Gerar ID único
    gerarIdUnico: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DATA = DATA;
    window.DataUtils = DataUtils;
}
