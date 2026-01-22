/**
 * Dados do Sistema Ata Operacional Porter - 2026
 * Versão otimizada e corrigida
 */

// Configuração básica do sistema
const SYSTEM_CONFIG = {
    nome: "Ata Operacional Porter",
    versao: "2.0.0",
    ano: "2026",
    empresa: "Porter",
    sessaoTimeout: 3600000, // 1 hora em milisegundos
    maxTentativasLogin: 3
};

// Dados dos funcionários
const FUNCIONARIOS = [
    { id: 1, nome: "LAÍSSA PEREIRA DOS SANTOS XAVIER", usuario: "laissa.xavier", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 2, nome: "VANESSA LOPES SOUZA DE OLIVEIRA", usuario: "vanessa.oliveira", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 3, nome: "MARIA LUIZA ALEIXO ANTUNES", usuario: "maria.antunes", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 4, nome: "MARISA MENEGHETTI", usuario: "marisa.meneghetti", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 5, nome: "LUDMILA R CASSIANO", usuario: "ludmila.cassiano", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 6, nome: "MARIA GABRIELA ANTONIO", usuario: "maria.antonio", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 7, nome: "DENISE CRISTINA DE SOUSA", usuario: "denise.sousa", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 8, nome: "EDSON SILVA MACÊDO", usuario: "edson.macedo", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 9, nome: "MARIA CLARA RAMOS", usuario: "maria.ramos", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 10, nome: "GABRIELY AMORIM CAMPOS", usuario: "gabriely.campos", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 11, nome: "SANDRA REGINA DA FRANÇA SILVA", usuario: "sandra.silva", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 12, nome: "THAIS BENA LIMA", usuario: "thais.lima", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 13, nome: "ABNER CAVALCANTE", usuario: "abner.cavalcante", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 14, nome: "DAIANE LUCY RODRIGUES DE ALMEIDA", usuario: "daiane.almeida", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 15, nome: "ALINY MELQUIADES DE SOUZA", usuario: "aliny.souza", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 16, nome: "LOUISE COSTA", usuario: "louise.costa", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 17, nome: "ROSALIA TAIT KLINKERFUS", usuario: "rosalia.klinkerfus", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 18, nome: "MARIO ALEXANDRE CLEMENTIN", usuario: "mario.clementin", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 19, nome: "VANIA DO SOCORRO LEOCADIO", usuario: "vania.leocadio", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 20, nome: "JACKELINE ARAUJO SAMPAIO DIAS", usuario: "jackeline.dias", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 21, nome: "LUCAS VINICIUS DA SILVA", usuario: "lucas.v.silva", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 22, nome: "CARLOS HENRIQUE FERREIRA LEITE", usuario: "carlos.leite", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 23, nome: "LUIZ FERNANDO S MORYAMA DOS SANTOS", usuario: "luiz.santos", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 24, nome: "ERICK DE SOUZA RODRIGUES", usuario: "erick.rodrigues", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 25, nome: "MATHEUS ROBERTO BRASIL SILVA", usuario: "matheus.silva", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 26, nome: "WELINGTON FELIPE ALVES BARBOSA", usuario: "wellington.barbosa", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 27, nome: "KAIC VITOR MARTINS DE BRITO", usuario: "kaic.brito", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 28, nome: "DEISY SANTOS CRUZ", usuario: "deisy.cruz", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 29, nome: "DANIELE DA SILVA ROCHA", usuario: "daniele.rocha", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 30, nome: "ANA BEATRIZ PEREIRA", usuario: "ana.pereira", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 31, nome: "LUCAS DANIEL", usuario: "lucas.daniel", senha: "Porter@2026", cargo: "OPERADOR", ativo: true },
    { id: 32, nome: "ADMINISTRADOR PORTER", usuario: "admin.porter", senha: "Admin@2026", cargo: "ADMIN", ativo: true }
];

// Dados dos condomínios
const CONDOMINIOS = [
    { id: 1, nome: "ALAMEDA PINHEIROS", cidade: "Londrina" },
    { id: 2, nome: "ALGARVE", cidade: "Londrina" },
    { id: 3, nome: "AMADEUS", cidade: "Londrina" },
    { id: 4, nome: "AMARILIS", cidade: "Londrina" },
    { id: 5, nome: "AMERICA", cidade: "Londrina" },
    { id: 6, nome: "ANITA GARIBALDI", cidade: "Londrina" },
    { id: 7, nome: "AQUALUNA", cidade: "Londrina" },
    { id: 8, nome: "ARIANE", cidade: "Londrina" },
    { id: 9, nome: "ARQUITETO JULIO RIBEIRO", cidade: "Londrina" },
    { id: 10, nome: "ATHENAS", cidade: "Londrina" },
    { id: 11, nome: "BARAO CATUAI", cidade: "Londrina" },
    { id: 12, nome: "BASE - PORTER LONDRINA", cidade: "Londrina" },
    { id: 13, nome: "BELLEVILLE", cidade: "Londrina" },
    { id: 14, nome: "BENTO MUNHOZ DA ROCHA NETTO II", cidade: "Maringá" },
    { id: 15, nome: "BIARRITZ", cidade: "Londrina" },
    { id: 16, nome: "BOSQUE", cidade: "Londrina" },
    { id: 17, nome: "CAMPOS ELISEOS", cidade: "Londrina" },
    { id: 18, nome: "CASABLANCA", cidade: "Londrina" },
    { id: 19, nome: "CASA CONDOMINIO (Londrina)", cidade: "Londrina" },
    { id: 20, nome: "CASA CONDOMÍNIO (Maringá)", cidade: "Maringá" },
    { id: 21, nome: "CASARIO DO PORTO", cidade: "Londrina" },
    { id: 22, nome: "CENTRO EMPRESARIAL NEWTON CAMARA", cidade: "Londrina" },
    { id: 23, nome: "CIDADE DOS PASSAROS", cidade: "Arapongas" },
    { id: 24, nome: "CITZEN PARK", cidade: "Maringá" },
    { id: 25, nome: "COMERCIAL CAMBARA", cidade: "Londrina" },
    { id: 26, nome: "DOLCE VIE", cidade: "Londrina" },
    { id: 27, nome: "EBANO", cidade: "Londrina" },
    { id: 28, nome: "ENSEADAS", cidade: "Londrina" },
    { id: 29, nome: "EUROCENTER", cidade: "Londrina" },
    { id: 30, nome: "FERNANDA", cidade: "Londrina" },
    { id: 31, nome: "FLOR DA MATA", cidade: "Londrina" },
    { id: 32, nome: "FLOR DE LOTUS", cidade: "Londrina" },
    { id: 33, nome: "FLORENZA", cidade: "Londrina" },
    { id: 34, nome: "GOLDEN GATE", cidade: "Londrina" },
    { id: 35, nome: "GOLDENVILLE", cidade: "Londrina" },
    { id: 36, nome: "GRAO PARA", cidade: "Londrina" },
    { id: 37, nome: "GREENFIELDS", cidade: "Londrina" },
    { id: 38, nome: "HEIMTAL PARK", cidade: "Londrina" },
    { id: 39, nome: "HYDE PARK", cidade: "Londrina" },
    { id: 40, nome: "INDREL INDUSTRIA DE REFRIGERACAO LONDRINENSE LTDA", cidade: "Londrina" },
    { id: 41, nome: "INEDITO", cidade: "Londrina" },
    { id: 42, nome: "JOAO DINARDI", cidade: "Londrina" },
    { id: 43, nome: "LAKE VAN GOGH", cidade: "Londrina" },
    { id: 44, nome: "LA SENA", cidade: "Cambé" },
    { id: 45, nome: "LE REVE", cidade: "Londrina" },
    { id: 46, nome: "MAR DEL PLATA", cidade: "Londrina" },
    { id: 47, nome: "MAXIMUS RESIDENCE", cidade: "Londrina" },
    { id: 48, nome: "MGL - MECANICA EIRELI", cidade: "Cambé" },
    { id: 49, nome: "MONT BLANC", cidade: "Londrina" },
    { id: 50, nome: "MORADA IMPERIAL", cidade: "Londrina" },
    { id: 51, nome: "MUNDO NOVO", cidade: "Londrina" },
    { id: 52, nome: "NEW PLAZA RESIDENCE", cidade: "Maringá" },
    { id: 53, nome: "NICOLA PAGAN", cidade: "Londrina" },
    { id: 54, nome: "ORTIZ (Cambé)", cidade: "Cambé" },
    { id: 55, nome: "PALAIS LAC DOR", cidade: "Londrina" },
    { id: 56, nome: "PARQUE IMPERIAL", cidade: "Londrina" },
    { id: 57, nome: "PEROLA NEGRA", cidade: "Londrina" },
    { id: 58, nome: "PETIT VILLE", cidade: "Londrina" },
    { id: 59, nome: "POLARIS", cidade: "Londrina" },
    { id: 60, nome: "PORTLAND RESIDENCE", cidade: "Londrina" },
    { id: 61, nome: "PRIME HOUSE", cidade: "Londrina" },
    { id: 62, nome: "PRIVILEGE JAMAICA", cidade: "Londrina" },
    { id: 63, nome: "QUINTA DA BOA VISTA III A", cidade: "Londrina" },
    { id: 64, nome: "QUINTA DA BOA VISTA VI", cidade: "Londrina" },
    { id: 65, nome: "RIO TEJO", cidade: "Maringá" },
    { id: 66, nome: "RIO TEVERE", cidade: "Maringá" },
    { id: 67, nome: "SANTOS", cidade: "Londrina" },
    { id: 68, nome: "SAO GABRIEL", cidade: "Maringá" },
    { id: 69, nome: "SERRA VERDE", cidade: "Londrina" },
    { id: 70, nome: "SIRMIONE", cidade: "Maringá" },
    { id: 71, nome: "SOLAR MONTREAUX", cidade: "Londrina" },
    { id: 72, nome: "SPAZIO LAS PALMAS", cidade: "Londrina" },
    { id: 73, nome: "SPEZIA", cidade: "Londrina" },
    { id: 74, nome: "STRAUSS BOULEVARD", cidade: "Londrina" },
    { id: 75, nome: "TAPUIAS JARDIM", cidade: "Londrina" },
    { id: 76, nome: "TERRALIS JARDIN RESIDENCE", cidade: "Londrina" },
    { id: 77, nome: "TERRASSE JARDIN", cidade: "Londrina" },
    { id: 78, nome: "TORRES BRASIL", cidade: "Londrina" },
    { id: 79, nome: "UNIVERSITOP", cidade: "Londrina" },
    { id: 80, nome: "VENICE DOWNTOWN", cidade: "Londrina" },
    { id: 81, nome: "VILLA BELLA (Cambé)", cidade: "Cambé" },
    { id: 82, nome: "VILLA DAS TORRES", cidade: "Cambé" },
    { id: 83, nome: "VILLAGE LA CORUNA", cidade: "Londrina" },
    { id: 84, nome: "VILLAGGIO DO ENGENHO", cidade: "Cambé" },
    { id: 85, nome: "VILLA ROMANA", cidade: "Londrina" },
    { id: 86, nome: "VISCONDE DE BARBACENA", cidade: "Londrina" },
    { id: 87, nome: "VITTACE BOULEVARD", cidade: "Londrina" },
    { id: 88, nome: "VIVALDI BOULEVARD", cidade: "Londrina" },
    { id: 89, nome: "VIVENDA DOS PESCADORES", cidade: "Maringá" }
];

// Tipos de registros para ATA
const TIPOS_REGISTRO = [
    { valor: "Informação", texto: "📝 Informação", cor: "#3498db", icone: "fa-info-circle" },
    { valor: "Ocorrência", texto: "⚠️ Ocorrência", cor: "#f39c12", icone: "fa-exclamation-triangle" },
    { valor: "Incidente", texto: "🚨 Incidente", cor: "#e74c3c", icone: "fa-bell" },
    { valor: "Informações Fixas", texto: "📌 Informações Fixas", cor: "#9b59b6", icone: "fa-thumbtack" }
];

// Status de registros
const STATUS_REGISTRO = [
    { valor: "Em andamento", texto: "🔄 Em andamento", cor: "#f39c12", icone: "fa-sync-alt" },
    { valor: "Finalizado", texto: "✅ Finalizado", cor: "#27ae60", icone: "fa-check-circle" },
    { valor: "Cancelado", texto: "❌ Cancelado", cor: "#95a5a6", icone: "fa-times-circle" }
];

// Gravidade para Ordens de Serviço
const GRAVIDADE_OS = [
    { 
        valor: "Baixa", 
        texto: "🟢 Baixa - Manutenção Preventiva/Rotina", 
        cor: "#27ae60",
        prazo: "7 dias úteis",
        icone: "fa-thermometer-empty"
    },
    { 
        valor: "Média", 
        texto: "🟡 Média - Reparo Necessário", 
        cor: "#f39c12",
        prazo: "3 dias úteis",
        icone: "fa-thermometer-quarter"
    },
    { 
        valor: "Alta", 
        texto: "🔴 Alta - Urgente/Problema Crítico", 
        cor: "#e74c3c",
        prazo: "24 horas",
        icone: "fa-thermometer-half"
    },
    { 
        valor: "Emergência", 
        texto: "🚨 Emergência - Risco Imediato", 
        cor: "#8b0000",
        prazo: "Imediato",
        icone: "fa-thermometer-full"
    }
];

// Opções de humor
const OPCOES_HUMOR = [
    { valor: "excelente", emoji: "😊", texto: "Excelente", cor: "#27ae60", icone: "fa-grin-beam" },
    { valor: "bom", emoji: "🙂", texto: "Bom", cor: "#2ecc71", icone: "fa-smile" },
    { valor: "normal", emoji: "😐", texto: "Normal", cor: "#f39c12", icone: "fa-meh" },
    { valor: "ruim", emoji: "😕", texto: "Ruim", cor: "#e74c3c", icone: "fa-frown" },
    { valor: "pessimo", emoji: "😞", texto: "Péssimo", cor: "#c0392b", icone: "fa-sad-tear" }
];

// Turnos de trabalho
const TURNOS = [
    { valor: "Diurno", texto: "Diurno", icone: "fa-sun", cor: "#f39c12" },
    { valor: "Noturno", texto: "Noturno", icone: "fa-moon", cor: "#34495e" }
];

// E-mails para contato
const EMAILS_TECNICA = [
    "londrina.tecnica1@porter.com.br",
    "londrina.tecnicaplantao@porter.com.br",
    "londrina.tecnicaplantao1@porter.com.br"
];

// Classe de utilitários para manipulação de dados
class DataUtils {
    
    // Login
    static login(usuario, senha) {
        if (!usuario || !senha) {
            return { sucesso: false, mensagem: "Preencha usuário e senha" };
        }
        
        const funcionario = FUNCIONARIOS.find(f => 
            f.usuario === usuario && 
            f.ativo === true
        );
        
        if (!funcionario) {
            return { sucesso: false, mensagem: "Usuário não encontrado ou inativo" };
        }
        
        if (funcionario.senha !== senha) {
            return { sucesso: false, mensagem: "Senha incorreta" };
        }
        
        return {
            sucesso: true,
            funcionario: {
                id: funcionario.id,
                nome: funcionario.nome,
                usuario: funcionario.usuario,
                cargo: funcionario.cargo
            }
        };
    }
    
    // Obter condomínios
    static getCondominios() {
        return CONDOMINIOS;
    }
    
    static getCondominioPorNome(nome) {
        return CONDOMINIOS.find(c => c.nome === nome);
    }
    
    static getCondominiosPorCidade(cidade) {
        if (!cidade) return CONDOMINIOS;
        return CONDOMINIOS.filter(c => c.cidade === cidade);
    }
    
    // Obter funcionários
    static getFuncionarios() {
        return FUNCIONARIOS.filter(f => f.ativo);
    }
    
    static getFuncionarioPorUsuario(usuario) {
        return FUNCIONARIOS.find(f => f.usuario === usuario && f.ativo);
    }
    
    static getFuncionariosPorCargo(cargo) {
        return FUNCIONARIOS.filter(f => f.cargo === cargo && f.ativo);
    }
    
    // Obter cidades únicas
    static getCidades() {
        const cidades = new Set(CONDOMINIOS.map(c => c.cidade));
        return Array.from(cidades).sort();
    }
    
    // Validações
    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    static validarEmailsLista(emails) {
        if (!emails || emails.trim() === '') {
            return { valido: true, emails: [] };
        }
        
        const lista = emails.split(',').map(e => e.trim());
        const validos = [];
        const invalidos = [];
        
        lista.forEach(email => {
            if (this.validarEmail(email)) {
                validos.push(email);
            } else {
                invalidos.push(email);
            }
        });
        
        return {
            valido: invalidos.length === 0,
            validos: validos,
            invalidos: invalidos
        };
    }
    
    static validarUsuario(usuario) {
        const regex = /^[a-z]+\.[a-z]+$/;
        return regex.test(usuario);
    }
    
    // Geração de IDs
    static gerarId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    static gerarDataAtual() {
        return new Date().toISOString();
    }
    
    static formatarData(data) {
        if (!data) return '';
        const d = new Date(data);
        return d.toLocaleString('pt-BR');
    }
    
    static formatarDataCurta(data) {
        if (!data) return '';
        const d = new Date(data);
        return d.toLocaleDateString('pt-BR');
    }
    
    // LocalStorage helpers
    static salvarLocal(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
            return true;
        } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
            return false;
        }
    }
    
    static carregarLocal(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (e) {
            console.error('Erro ao carregar do localStorage:', e);
            return null;
        }
    }
    
    static removerLocal(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (e) {
            console.error('Erro ao remover do localStorage:', e);
            return false;
        }
    }
    
    // Logs e histórico
    static logAcao(usuario, acao, detalhes = null) {
        const log = {
            id: this.gerarId(),
            usuario: usuario,
            acao: acao,
            detalhes: detalhes,
            timestamp: this.gerarDataAtual(),
            dataFormatada: this.formatarData(new Date())
        };
        
        // Salvar no localStorage
        const logs = this.carregarLocal('porter_logs') || [];
        logs.push(log);
        
        // Manter apenas últimos 500 logs
        if (logs.length > 500) {
            logs.splice(0, logs.length - 500);
        }
        
        this.salvarLocal('porter_logs', logs);
        
        return log;
    }
    
    static getLogs(limite = 100) {
        const logs = this.carregarLocal('porter_logs') || [];
        return logs.slice(-limite).reverse();
    }
    
    // Backup de dados
    static criarBackup() {
        const backup = {
            timestamp: this.gerarDataAtual(),
            sistema: SYSTEM_CONFIG,
            funcionarios: FUNCIONARIOS,
            condominios: CONDOMINIOS
        };
        
        const backupKey = 'backup_' + new Date().getTime();
        this.salvarLocal(backupKey, backup);
        
        // Limitar backups
        this.limitarBackups(5);
        
        return {
            sucesso: true,
            chave: backupKey,
            data: this.formatarData(new Date())
        };
    }
    
    static limitarBackups(max = 5) {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                backups.push({
                    key: key,
                    timestamp: parseInt(key.replace('backup_', ''))
                });
            }
        }
        
        backups.sort((a, b) => b.timestamp - a.timestamp);
        
        // Remover backups antigos
        for (let i = max; i < backups.length; i++) {
            localStorage.removeItem(backups[i].key);
        }
    }
    
    static listarBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                try {
                    const backup = this.carregarLocal(key);
                    backups.push({
                        chave: key,
                        data: this.formatarData(new Date(parseInt(key.replace('backup_', '')))),
                        timestamp: parseInt(key.replace('backup_', ''))
                    });
                } catch (e) {
                    console.error('Erro ao carregar backup:', key, e);
                }
            }
        }
        
        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Estatísticas
    static getEstatisticas() {
        const funcionariosAtivos = FUNCIONARIOS.filter(f => f.ativo).length;
        const admins = FUNCIONARIOS.filter(f => f.cargo === 'ADMIN' && f.ativo).length;
        const operadores = FUNCIONARIOS.filter(f => f.cargo === 'OPERADOR' && f.ativo).length;
        
        // Contar condomínios por cidade
        const condominiosPorCidade = {};
        CONDOMINIOS.forEach(cond => {
            condominiosPorCidade[cond.cidade] = (condominiosPorCidade[cond.cidade] || 0) + 1;
        });
        
        return {
            funcionarios: {
                total: funcionariosAtivos,
                admins: admins,
                operadores: operadores
            },
            condominios: {
                total: CONDOMINIOS.length,
                porCidade: condominiosPorCidade
            },
            sistema: {
                nome: SYSTEM_CONFIG.nome,
                versao: SYSTEM_CONFIG.versao
            }
        };
    }
    
    // Exportação de dados
    static exportarDados(formato = 'json') {
        const dados = {
            sistema: SYSTEM_CONFIG,
            exportacao: this.formatarData(new Date()),
            funcionarios: FUNCIONARIOS,
            condominios: CONDOMINIOS
        };
        
        switch(formato) {
            case 'json':
                return JSON.stringify(dados, null, 2);
                
            case 'csv':
                return this.converterParaCSV(dados);
                
            default:
                return JSON.stringify(dados, null, 2);
        }
    }
    
    static converterParaCSV(dados) {
        let csv = '';
        
        // Cabeçalho
        csv += "Sistema;Versão;Data Exportação\n";
        csv += `${dados.sistema.nome};${dados.sistema.versao};${dados.exportacao}\n\n`;
        
        // Funcionários
        csv += "FUNCIONÁRIOS\n";
        csv += "ID;Nome;Usuário;Cargo;Ativo\n";
        dados.funcionarios.forEach(func => {
            csv += `${func.id};"${func.nome}";${func.usuario};${func.cargo};${func.ativo}\n`;
        });
        
        csv += "\nCONDOMÍNIOS\n";
        csv += "ID;Nome;Cidade\n";
        dados.condominios.forEach(cond => {
            csv += `${cond.id};"${cond.nome}";${cond.cidade}\n`;
        });
        
        return csv;
    }
}

// Exportar objetos para uso global (compatibilidade)
const DATA = {
    funcionarios: FUNCIONARIOS.map(f => ({
        nome: f.nome,
        user: f.usuario,
        pass: f.senha,
        role: f.cargo
    })),
    condominios: CONDOMINIOS.map(c => ({
        n: c.nome,
        c: c.cidade
    }))
};

// Disponibilizar no escopo global
if (typeof window !== 'undefined') {
    window.DATA = DATA;
    window.DataUtils = DataUtils;
    window.SYSTEM_CONFIG = SYSTEM_CONFIG;
    window.TIPOS_REGISTRO = TIPOS_REGISTRO;
    window.STATUS_REGISTRO = STATUS_REGISTRO;
    window.GRAVIDADE_OS = GRAVIDADE_OS;
    window.OPCOES_HUMOR = OPCOES_HUMOR;
    window.TURNOS = TURNOS;
    window.EMAILS_TECNICA = EMAILS_TECNICA;
}

// Para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DATA,
        DataUtils,
        SYSTEM_CONFIG,
        TIPOS_REGISTRO,
        STATUS_REGISTRO,
        GRAVIDADE_OS,
        OPCOES_HUMOR,
        TURNOS,
        EMAILS_TECNICA,
        FUNCIONARIOS,
        CONDOMINIOS
    };
}
