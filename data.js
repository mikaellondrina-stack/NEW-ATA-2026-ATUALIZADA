// DADOS DO SISTEMA PORTER - ATA OPERACIONAL 2026
// Arquivo corrigido e otimizado

// Dados dos funcionários
const funcionarios = [
    { nome: "LAÍSSA PEREIRA DOS SANTOS XAVIER", usuario: "laissa.xavier", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "VANESSA LOPES SOUZA DE OLIVEIRA", usuario: "vanessa.oliveira", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "MARIA LUIZA ALEIXO ANTUNES", usuario: "maria.antunes", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "MARISA MENEGHETTI", usuario: "marisa.meneghetti", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "LUDMILA R CASSIANO", usuario: "ludmila.cassiano", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "MARIA GABRIELA ANTONIO", usuario: "maria.antonio", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "DENISE CRISTINA DE SOUSA", usuario: "denise.sousa", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "EDSON SILVA MACÊDO", usuario: "edson.macedo", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "MARIA CLARA RAMOS", usuario: "maria.ramos", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "GABRIELY AMORIM CAMPOS", usuario: "gabriely.campos", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "SANDRA REGINA DA FRANÇA SILVA", usuario: "sandra.silva", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "THAIS BENA LIMA", usuario: "thais.lima", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "ABNER CAVALCANTE", usuario: "abner.cavalcante", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "DAIANE LUCY RODRIGUES DE ALMEIDA", usuario: "daiane.almeida", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "ALINY MELQUIADES DE SOUZA", usuario: "aliny.souza", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "LOUISE COSTA", usuario: "louise.costa", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "ROSALIA TAIT KLINKERFUS", usuario: "rosalia.klinkerfus", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "MARIO ALEXANDRE CLEMENTIN", usuario: "mario.clementin", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "VANIA DO SOCORRO LEOCADIO", usuario: "vania.leocadio", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "JACKELINE ARAUJO SAMPAIO DIAS", usuario: "jackeline.dias", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "LUCAS VINICIUS DA SILVA", usuario: "lucas.v.silva", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "CARLOS HENRIQUE FERREIRA LEITE", usuario: "carlos.leite", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "LUIZ FERNANDO S MORYAMA DOS SANTOS", usuario: "luiz.santos", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "ERICK DE SOUZA RODRIGUES", usuario: "erick.rodrigues", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "MATHEUS ROBERTO BRASIL SILVA", usuario: "matheus.silva", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "WELINGTON FELIPE ALVES BARBOSA", usuario: "wellington.barbosa", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "KAIC VITOR MARTINS DE BRITO", usuario: "kaic.brito", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "DEISY SANTOS CRUZ", usuario: "deisy.cruz", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "DANIELE DA SILVA ROCHA", usuario: "daniele.rocha", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "ANA BEATRIZ PEREIRA", usuario: "ana.pereira", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "LUCAS DANIEL", usuario: "lucas.daniel", senha: "Porter@2026", cargo: "OPERADOR" },
    { nome: "ADMINISTRADOR PORTER", usuario: "admin.porter", senha: "Admin@2026", cargo: "ADMIN" }
];

// Dados dos condomínios
const condominios = [
    { nome: "ALAMEDA PINHEIROS", cidade: "Londrina" },
    { nome: "ALGARVE", cidade: "Londrina" },
    { nome: "AMADEUS", cidade: "Londrina" },
    { nome: "AMARILIS", cidade: "Londrina" },
    { nome: "AMERICA", cidade: "Londrina" },
    { nome: "ANITA GARIBALDI", cidade: "Londrina" },
    { nome: "AQUALUNA", cidade: "Londrina" },
    { nome: "ARIANE", cidade: "Londrina" },
    { nome: "ARQUITETO JULIO RIBEIRO", cidade: "Londrina" },
    { nome: "ATHENAS", cidade: "Londrina" },
    { nome: "BARAO CATUAI", cidade: "Londrina" },
    { nome: "BASE - PORTER LONDRINA", cidade: "Londrina" },
    { nome: "BELLEVILLE", cidade: "Londrina" },
    { nome: "BENTO MUNHOZ DA ROCHA NETTO II", cidade: "Maringá" },
    { nome: "BIARRITZ", cidade: "Londrina" },
    { nome: "BOSQUE", cidade: "Londrina" },
    { nome: "CAMPOS ELISEOS", cidade: "Londrina" },
    { nome: "CASABLANCA", cidade: "Londrina" },
    { nome: "CASA CONDOMINIO (Londrina)", cidade: "Londrina" },
    { nome: "CASA CONDOMÍNIO (Maringá)", cidade: "Maringá" },
    { nome: "CASARIO DO PORTO", cidade: "Londrina" },
    { nome: "CENTRO EMPRESARIAL NEWTON CAMARA", cidade: "Londrina" },
    { nome: "CIDADE DOS PASSAROS", cidade: "Arapongas" },
    { nome: "CITZEN PARK", cidade: "Maringá" },
    { nome: "COMERCIAL CAMBARA", cidade: "Londrina" },
    { nome: "DOLCE VIE", cidade: "Londrina" },
    { nome: "EBANO", cidade: "Londrina" },
    { nome: "ENSEADAS", cidade: "Londrina" },
    { nome: "EUROCENTER", cidade: "Londrina" },
    { nome: "FERNANDA", cidade: "Londrina" },
    { nome: "FLOR DA MATA", cidade: "Londrina" },
    { nome: "FLOR DE LOTUS", cidade: "Londrina" },
    { nome: "FLORENZA", cidade: "Londrina" },
    { nome: "GOLDEN GATE", cidade: "Londrina" },
    { nome: "GOLDENVILLE", cidade: "Londrina" },
    { nome: "GRAO PARA", cidade: "Londrina" },
    { nome: "GREENFIELDS", cidade: "Londrina" },
    { nome: "HEIMTAL PARK", cidade: "Londrina" },
    { nome: "HYDE PARK", cidade: "Londrina" },
    { nome: "INDREL INDUSTRIA DE REFRIGERACAO LONDRINENSE LTDA", cidade: "Londrina" },
    { nome: "INEDITO", cidade: "Londrina" },
    { nome: "JOAO DINARDI", cidade: "Londrina" },
    { nome: "LAKE VAN GOGH", cidade: "Londrina" },
    { nome: "LA SENA", cidade: "Cambé" },
    { nome: "LE REVE", cidade: "Londrina" },
    { nome: "MAR DEL PLATA", cidade: "Londrina" },
    { nome: "MAXIMUS RESIDENCE", cidade: "Londrina" },
    { nome: "MGL - MECANICA EIRELI", cidade: "Cambé" },
    { nome: "MONT BLANC", cidade: "Londrina" },
    { nome: "MORADA IMPERIAL", cidade: "Londrina" },
    { nome: "MUNDO NOVO", cidade: "Londrina" },
    { nome: "NEW PLAZA RESIDENCE", cidade: "Maringá" },
    { nome: "NICOLA PAGAN", cidade: "Londrina" },
    { nome: "ORTIZ (Cambé)", cidade: "Cambé" },
    { nome: "PALAIS LAC DOR", cidade: "Londrina" },
    { nome: "PARQUE IMPERIAL", cidade: "Londrina" },
    { nome: "PEROLA NEGRA", cidade: "Londrina" },
    { nome: "PETIT VILLE", cidade: "Londrina" },
    { nome: "POLARIS", cidade: "Londrina" },
    { nome: "PORTLAND RESIDENCE", cidade: "Londrina" },
    { nome: "PRIME HOUSE", cidade: "Londrina" },
    { nome: "PRIVILEGE JAMAICA", cidade: "Londrina" },
    { nome: "QUINTA DA BOA VISTA III A", cidade: "Londrina" },
    { nome: "QUINTA DA BOA VISTA VI", cidade: "Londrina" },
    { nome: "RIO TEJO", cidade: "Maringá" },
    { nome: "RIO TEVERE", cidade: "Maringá" },
    { nome: "SANTOS", cidade: "Londrina" },
    { nome: "SAO GABRIEL", cidade: "Maringá" },
    { nome: "SERRA VERDE", cidade: "Londrina" },
    { nome: "SIRMIONE", cidade: "Maringá" },
    { nome: "SOLAR MONTREAUX", cidade: "Londrina" },
    { nome: "SPAZIO LAS PALMAS", cidade: "Londrina" },
    { nome: "SPEZIA", cidade: "Londrina" },
    { nome: "STRAUSS BOULEVARD", cidade: "Londrina" },
    { nome: "TAPUIAS JARDIM", cidade: "Londrina" },
    { nome: "TERRALIS JARDIN RESIDENCE", cidade: "Londrina" },
    { nome: "TERRASSE JARDIN", cidade: "Londrina" },
    { nome: "TORRES BRASIL", cidade: "Londrina" },
    { nome: "UNIVERSITOP", cidade: "Londrina" },
    { nome: "VENICE DOWNTOWN", cidade: "Londrina" },
    { nome: "VILLA BELLA (Cambé)", cidade: "Cambé" },
    { nome: "VILLA DAS TORRES", cidade: "Cambé" },
    { nome: "VILLAGE LA CORUNA", cidade: "Londrina" },
    { nome: "VILLAGGIO DO ENGENHO", cidade: "Cambé" },
    { nome: "VILLA ROMANA", cidade: "Londrina" },
    { nome: "VISCONDE DE BARBACENA", cidade: "Londrina" },
    { nome: "VITTACE BOULEVARD", cidade: "Londrina" },
    { nome: "VIVALDI BOULEVARD", cidade: "Londrina" },
    { nome: "VIVENDA DOS PESCADORES", cidade: "Maringá" }
];

// Configurações do sistema
const CONFIG = {
    nomeSistema: "Ata Operacional Porter",
    versao: "2026.1.0",
    timeoutSessao: 3600, // segundos
    maxTentativasLogin: 3,
    emailsTecnica: [
        "londrina.tecnica1@porter.com.br",
        "londrina.tecnicaplantao@porter.com.br",
        "londrina.tecnicaplantao1@porter.com.br"
    ]
};

// Tipos de ocorrência
const TIPOS_OCORRENCIA = [
    { id: "info", nome: "📝 Informação", cor: "#3498db" },
    { id: "ocorrencia", nome: "⚠️ Ocorrência", cor: "#f39c12" },
    { id: "incidente", nome: "🚨 Incidente", cor: "#e74c3c" },
    { id: "fixas", nome: "📌 Informações Fixas", cor: "#9b59b6" }
];

// Status
const STATUS = [
    { id: "andamento", nome: "🔄 Em andamento", cor: "#f39c12" },
    { id: "finalizado", nome: "✅ Finalizado", cor: "#27ae60" },
    { id: "cancelado", nome: "❌ Cancelado", cor: "#95a5a6" }
];

// Gravidade OS
const GRAVIDADE_OS = [
    { id: "baixa", nome: "🟢 Baixa", prazo: "7 dias", cor: "#27ae60" },
    { id: "media", nome: "🟡 Média", prazo: "3 dias", cor: "#f39c12" },
    { id: "alta", nome: "🔴 Alta", prazo: "24h", cor: "#e74c3c" },
    { id: "emergencia", nome: "🚨 Emergência", prazo: "Imediato", cor: "#8b0000" }
];

// Turnos
const TURNOS = [
    { id: "diurno", nome: "🌞 Diurno", horario: "06:00 - 18:00" },
    { id: "noturno", nome: "🌙 Noturno", horario: "18:00 - 06:00" }
];

// Opções de humor
const HUMOR_OPCOES = [
    { id: "excelente", emoji: "😊", nome: "Excelente", cor: "#27ae60" },
    { id: "bom", emoji: "🙂", nome: "Bom", cor: "#2ecc71" },
    { id: "normal", emoji: "😐", nome: "Normal", cor: "#f39c12" },
    { id: "ruim", emoji: "😕", nome: "Ruim", cor: "#e74c3c" },
    { id: "pessimo", emoji: "😞", nome: "Péssimo", cor: "#c0392b" }
];

// Objeto DATA para compatibilidade (mantém estrutura original)
const DATA = {
    funcionarios: funcionarios.map(f => ({
        nome: f.nome,
        user: f.usuario,
        pass: f.senha,
        role: f.cargo
    })),
    condominios: condominios.map(c => ({
        n: c.nome,
        c: c.cidade
    }))
};

// Funções utilitárias
const SistemaUtils = {
    // Validação de login
    validarLogin: function(usuario, senha) {
        if (!usuario || !senha) {
            return { sucesso: false, erro: "Preencha usuário e senha" };
        }
        
        const funcionario = funcionarios.find(f => 
            f.usuario === usuario && f.senha === senha
        );
        
        if (!funcionario) {
            return { sucesso: false, erro: "Usuário ou senha inválidos" };
        }
        
        return {
            sucesso: true,
            dados: {
                nome: funcionario.nome,
                usuario: funcionario.usuario,
                cargo: funcionario.cargo,
                eAdmin: funcionario.cargo === "ADMIN"
            }
        };
    },
    
    // Buscar condomínio
    buscarCondominio: function(nome) {
        return condominios.find(c => c.nome === nome);
    },
    
    // Listar condomínios por cidade
    listarCondominiosPorCidade: function(cidade) {
        if (!cidade) return condominios;
        return condominios.filter(c => c.cidade === cidade);
    },
    
    // Listar cidades únicas
    listarCidades: function() {
        const cidades = [];
        condominios.forEach(c => {
            if (!cidades.includes(c.cidade)) {
                cidades.push(c.cidade);
            }
        });
        return cidades.sort();
    },
    
    // Gerar ID único
    gerarId: function() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Formatar data
    formatarData: function(data, incluirHora = true) {
        if (!data) return '';
        
        const d = new Date(data);
        if (incluirHora) {
            return d.toLocaleString('pt-BR');
        } else {
            return d.toLocaleDateString('pt-BR');
        }
    },
    
    // Obter data atual
    getDataAtual: function() {
        return new Date().toISOString();
    },
    
    // Salvar no localStorage
    salvarLocal: function(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
            return true;
        } catch (e) {
            console.error("Erro ao salvar:", e);
            return false;
        }
    },
    
    // Carregar do localStorage
    carregarLocal: function(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (e) {
            console.error("Erro ao carregar:", e);
            return null;
        }
    },
    
    // Limpar localStorage
    limparLocal: function(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (e) {
            console.error("Erro ao limpar:", e);
            return false;
        }
    },
    
    // Log de atividade
    logAtividade: function(usuario, acao, detalhes = null) {
        const log = {
            id: this.gerarId(),
            usuario: usuario,
            acao: acao,
            detalhes: detalhes,
            data: this.getDataAtual(),
            dataFormatada: this.formatarData(new Date())
        };
        
        // Salvar log
        const logs = this.carregarLocal('porter_logs') || [];
        logs.push(log);
        
        // Manter apenas últimos 200 logs
        if (logs.length > 200) {
            logs.splice(0, logs.length - 200);
        }
        
        this.salvarLocal('porter_logs', logs);
        
        return log;
    },
    
    // Obter estatísticas
    getEstatisticas: function() {
        const totalFuncionarios = funcionarios.length;
        const totalCondominios = condominios.length;
        const admins = funcionarios.filter(f => f.cargo === "ADMIN").length;
        const operadores = funcionarios.filter(f => f.cargo === "OPERADOR").length;
        
        // Contar condomínios por cidade
        const porCidade = {};
        condominios.forEach(c => {
            if (!porCidade[c.cidade]) {
                porCidade[c.cidade] = 0;
            }
            porCidade[c.cidade]++;
        });
        
        return {
            funcionarios: {
                total: totalFuncionarios,
                admins: admins,
                operadores: operadores
            },
            condominios: {
                total: totalCondominios,
                porCidade: porCidade
            },
            sistema: {
                nome: CONFIG.nomeSistema,
                versao: CONFIG.versao
            }
        };
    },
    
    // Validar e-mails
    validarEmails: function(emailsString) {
        if (!emailsString || emailsString.trim() === '') {
            return { valido: true, emails: [] };
        }
        
        const emails = emailsString.split(',').map(e => e.trim());
        const emailsValidos = [];
        const emailsInvalidos = [];
        
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        emails.forEach(email => {
            if (regexEmail.test(email)) {
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
    
    // Exportar dados
    exportarDados: function(formato = 'json') {
        const dados = {
            sistema: CONFIG,
            exportadoEm: this.formatarData(new Date()),
            funcionarios: funcionarios,
            condominios: condominios
        };
        
        if (formato === 'json') {
            return JSON.stringify(dados, null, 2);
        }
        
        if (formato === 'csv') {
            let csv = "Sistema;Versão;Data Exportação\n";
            csv += `${CONFIG.nomeSistema};${CONFIG.versao};${this.formatarData(new Date())}\n\n`;
            
            csv += "FUNCIONÁRIOS\n";
            csv += "Nome;Usuário;Cargo\n";
            funcionarios.forEach(f => {
                csv += `"${f.nome}";${f.usuario};${f.cargo}\n`;
            });
            
            csv += "\nCONDOMÍNIOS\n";
            csv += "Nome;Cidade\n";
            condominios.forEach(c => {
                csv += `"${c.nome}";${c.cidade}\n`;
            });
            
            return csv;
        }
        
        return JSON.stringify(dados, null, 2);
    },
    
    // Backup de dados
    criarBackup: function() {
        const backup = {
            id: this.gerarId(),
            data: this.getDataAtual(),
            dados: {
                funcionarios: funcionarios,
                condominios: condominios
            }
        };
        
        const chave = 'backup_porter_' + Date.now();
        this.salvarLocal(chave, backup);
        
        return {
            sucesso: true,
            chave: chave,
            data: this.formatarData(new Date())
        };
    },
    
    // Listar backups
    listarBackups: function() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave.startsWith('backup_porter_')) {
                try {
                    const backup = this.carregarLocal(chave);
                    if (backup) {
                        backups.push({
                            chave: chave,
                            data: this.formatarData(new Date(backup.data)),
                            tamanho: JSON.stringify(backup).length
                        });
                    }
                } catch (e) {
                    console.error("Erro ao carregar backup:", chave, e);
                }
            }
        }
        
        return backups.sort((a, b) => b.chave.localeCompare(a.chave));
    }
};

// Disponibilizar no escopo global
window.DATA = DATA;
window.SistemaUtils = SistemaUtils;
window.CONFIG = CONFIG;
window.TIPOS_OCORRENCIA = TIPOS_OCORRENCIA;
window.STATUS = STATUS;
window.GRAVIDADE_OS = GRAVIDADE_OS;
window.TURNOS = TURNOS;
window.HUMOR_OPCOES = HUMOR_OPCOES;

// Log inicial
console.log("Sistema Porter carregado com sucesso!");
console.log("Funcionários:", funcionarios.length);
console.log("Condomínios:", condominios.length);
