// ============================================
// Dados do Sistema Porter - Ata Operacional 2026
// Versão melhorada com funcionalidades avançadas
// ============================================

const SYSTEM_DATA = {
    // Configurações do sistema
    version: "2.0.0",
    lastUpdated: "2026-01-23",
    company: "Porter",
    systemName: "Ata Operacional Porter 2026",
    
    // Lista de funcionários com hash de senha (em produção, usar hash real)
    funcionarios: [
        { 
            id: 1, 
            nome: "LAÍSSA PEREIRA DOS SANTOS XAVIER", 
            user: "laissa.xavier", 
            passHash: "Porter@2026", // Em produção usar bcrypt
            role: "OPERADOR", 
            email: "laissa.xavier@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-15"
        },
        { 
            id: 2, 
            nome: "VANESSA LOPES SOUZA DE OLIVEIRA", 
            user: "vanessa.oliveira", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "vanessa.oliveira@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-20"
        },
        { 
            id: 3, 
            nome: "MARIA LUIZA ALEIXO ANTUNES", 
            user: "maria.antunes", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "maria.antunes@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-10"
        },
        { 
            id: 4, 
            nome: "MARISA MENEGHETTI", 
            user: "marisa.meneghetti", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "marisa.meneghetti@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-05"
        },
        { 
            id: 5, 
            nome: "LUDMILA R CASSIANO", 
            user: "ludmila.cassiano", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "ludmila.cassiano@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-15"
        },
        { 
            id: 6, 
            nome: "MARIA GABRIELA ANTONIO", 
            user: "maria.antonio", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "maria.antonio@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-25"
        },
        { 
            id: 7, 
            nome: "DENISE CRISTINA DE SOUSA", 
            user: "denise.sousa", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "denise.sousa@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-10"
        },
        { 
            id: 8, 
            nome: "EDSON SILVA MACÊDO", 
            user: "edson.macedo", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "edson.macedo@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-28"
        },
        { 
            id: 9, 
            nome: "MARIA CLARA RAMOS", 
            user: "maria.ramos", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "maria.ramos@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-30"
        },
        { 
            id: 10, 
            nome: "GABRIELY AMORIM CAMPOS", 
            user: "gabriely.campos", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "gabriely.campos@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-15"
        },
        { 
            id: 11, 
            nome: "SANDRA REGINA DA FRANÇA SILVA", 
            user: "sandra.silva", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "sandra.silva@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-05"
        },
        { 
            id: 12, 
            nome: "THAIS BENA LIMA", 
            user: "thais.lima", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "thais.lima@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-20"
        },
        { 
            id: 13, 
            nome: "ABNER CAVALCANTE", 
            user: "abner.cavalcante", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "abner.cavalcante@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-20"
        },
        { 
            id: 14, 
            nome: "DAIANE LUCY RODRIGUES DE ALMEIDA", 
            user: "daiane.almeida", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "daiane.almeida@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-10"
        },
        { 
            id: 15, 
            nome: "ALINY MELQUIADES DE SOUZA", 
            user: "aliny.souza", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "aliny.souza@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-05"
        },
        { 
            id: 16, 
            nome: "LOUISE COSTA", 
            user: "louise.costa", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "louise.costa@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-25"
        },
        { 
            id: 17, 
            nome: "ROSALIA TAIT KLINKERFUS", 
            user: "rosalia.klinkerfus", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "rosalia.klinkerfus@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-25"
        },
        { 
            id: 18, 
            nome: "MARIO ALEXANDRE CLEMENTIN", 
            user: "mario.clementin", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "mario.clementin@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-08"
        },
        { 
            id: 19, 
            nome: "VANIA DO SOCORRO LEOCADIO", 
            user: "vania.leocadio", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "vania.leocadio@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-08"
        },
        { 
            id: 20, 
            nome: "JACKELINE ARAUJO SAMPAIO DIAS", 
            user: "jackeline.dias", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "jackeline.dias@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-18"
        },
        { 
            id: 21, 
            nome: "LUCAS VINICIUS DA SILVA", 
            user: "lucas.v.silva", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "lucas.silva@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-12"
        },
        { 
            id: 22, 
            nome: "CARLOS HENRIQUE FERREIRA LEITE", 
            user: "carlos.leite", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "carlos.leite@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-12"
        },
        { 
            id: 23, 
            nome: "LUIZ FERNANDO S MORYAMA DOS SANTOS", 
            user: "luiz.santos", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "luiz.santos@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-22"
        },
        { 
            id: 24, 
            nome: "ERICK DE SOUZA RODRIGUES", 
            user: "erick.rodrigues", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "erick.rodrigues@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-18"
        },
        { 
            id: 25, 
            nome: "MATHEUS ROBERTO BRASIL SILVA", 
            user: "matheus.silva", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "matheus.silva@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-18"
        },
        { 
            id: 26, 
            nome: "WELINGTON FELIPE ALVES BARBOSA", 
            user: "wellington.barbosa", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "wellington.barbosa@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-08"
        },
        { 
            id: 27, 
            nome: "KAIC VITOR MARTINS DE BRITO", 
            user: "kaic.brito", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "kaic.brito@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-22"
        },
        { 
            id: 28, 
            nome: "DEISY SANTOS CRUZ", 
            user: "deisy.cruz", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "deisy.cruz@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-22"
        },
        { 
            id: 29, 
            nome: "DANIELE DA SILVA ROCHA", 
            user: "daniele.rocha", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "daniele.rocha@porter.com",
            ativo: true,
            dataAdmissao: "2024-02-12"
        },
        { 
            id: 30, 
            nome: "ANA BEATRIZ PEREIRA", 
            user: "ana.pereira", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "ana.pereira@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-28"
        },
        { 
            id: 31, 
            nome: "LUCAS DANIEL", 
            user: "lucas.daniel", 
            passHash: "Porter@2026", 
            role: "OPERADOR", 
            email: "lucas.daniel@porter.com",
            ativo: true,
            dataAdmissao: "2024-03-28"
        },
        { 
            id: 32, 
            nome: "ADMINISTRADOR PORTER", 
            user: "admin.porter", 
            passHash: "Admin@2026", 
            role: "ADMIN", 
            email: "admin@porter.com",
            ativo: true,
            dataAdmissao: "2024-01-01"
        }
    ],
    
    // Lista de condomínios organizada por categorias
    condominios: [
        // Condomínios em Londrina
        { 
            id: 1, 
            nome: "ALAMEDA PINHEIROS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 123",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 2, 
            nome: "ALGARVE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 456",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 3, 
            nome: "AMADEUS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 789",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 4, 
            nome: "AMARILIS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 101",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 5, 
            nome: "AMERICA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 102",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 6, 
            nome: "ANITA GARIBALDI", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 103",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 7, 
            nome: "AQUALUNA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 104",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 8, 
            nome: "ARIANE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 105",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 9, 
            nome: "ARQUITETO JULIO RIBEIRO", 
            cidade: "Londrina", 
            tipo: "Comercial",
            endereco: "Rua Exemplo, 106",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 10, 
            nome: "ATHENAS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 107",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 11, 
            nome: "BARAO CATUAI", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 108",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 12, 
            nome: "BASE - PORTER LONDRINA", 
            cidade: "Londrina", 
            tipo: "Comercial",
            endereco: "Sede Porter Londrina",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 13, 
            nome: "BELLEVILLE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 110",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 14, 
            nome: "BIARRITZ", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 111",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 15, 
            nome: "BOSQUE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 112",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 16, 
            nome: "CAMPOS ELISEOS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 113",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 17, 
            nome: "CASABLANCA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 114",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 18, 
            nome: "CASA CONDOMINIO (Londrina)", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 115",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 19, 
            nome: "CASARIO DO PORTO", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 116",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 20, 
            nome: "CENTRO EMPRESARIAL NEWTON CAMARA", 
            cidade: "Londrina", 
            tipo: "Comercial",
            endereco: "Rua Exemplo, 117",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 21, 
            nome: "COMERCIAL CAMBARA", 
            cidade: "Londrina", 
            tipo: "Comercial",
            endereco: "Rua Exemplo, 118",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 22, 
            nome: "DOLCE VIE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 119",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 23, 
            nome: "EBANO", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 120",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 24, 
            nome: "ENSEADAS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 121",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 25, 
            nome: "EUROCENTER", 
            cidade: "Londrina", 
            tipo: "Comercial",
            endereco: "Rua Exemplo, 122",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 26, 
            nome: "FERNANDA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 123",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 27, 
            nome: "FLOR DA MATA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 124",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 28, 
            nome: "FLOR DE LOTUS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 125",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 29, 
            nome: "FLORENZA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 126",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 30, 
            nome: "GOLDEN GATE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 127",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 31, 
            nome: "GOLDENVILLE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 128",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 32, 
            nome: "GRAO PARA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 129",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 33, 
            nome: "GREENFIELDS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 130",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 34, 
            nome: "HEIMTAL PARK", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 131",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 35, 
            nome: "HYDE PARK", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 132",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 36, 
            nome: "INDREL INDUSTRIA DE REFRIGERACAO LONDRINENSE LTDA", 
            cidade: "Londrina", 
            tipo: "Industrial",
            endereco: "Rua Exemplo, 133",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 37, 
            nome: "INEDITO", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 134",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 38, 
            nome: "JOAO DINARDI", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 135",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 39, 
            nome: "LAKE VAN GOGH", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 136",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 40, 
            nome: "LE REVE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 137",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 41, 
            nome: "MAR DEL PLATA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 138",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 42, 
            nome: "MAXIMUS RESIDENCE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 139",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 43, 
            nome: "MONT BLANC", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 140",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 44, 
            nome: "MORADA IMPERIAL", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 141",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 45, 
            nome: "MUNDO NOVO", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 142",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 46, 
            nome: "NICOLA PAGAN", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 143",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 47, 
            nome: "PALAIS LAC DOR", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 144",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 48, 
            nome: "PARQUE IMPERIAL", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 145",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 49, 
            nome: "PEROLA NEGRA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 146",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 50, 
            nome: "PETIT VILLE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 147",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 51, 
            nome: "POLARIS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 148",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 52, 
            nome: "PORTLAND RESIDENCE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 149",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 53, 
            nome: "PRIME HOUSE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 150",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 54, 
            nome: "PRIVILEGE JAMAICA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 151",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 55, 
            nome: "QUINTA DA BOA VISTA III A", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 152",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 56, 
            nome: "QUINTA DA BOA VISTA VI", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 153",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 57, 
            nome: "SANTOS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 154",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 58, 
            nome: "SERRA VERDE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 155",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 59, 
            nome: "SOLAR MONTREAUX", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 156",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 60, 
            nome: "SPAZIO LAS PALMAS", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 157",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 61, 
            nome: "SPEZIA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 158",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 62, 
            nome: "STRAUSS BOULEVARD", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 159",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 63, 
            nome: "TAPUIAS JARDIM", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 160",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 64, 
            nome: "TERRALIS JARDIN RESIDENCE", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 161",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 65, 
            nome: "TERRASSE JARDIN", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 162",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 66, 
            nome: "TORRES BRASIL", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 163",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 67, 
            nome: "UNIVERSITOP", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 164",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 68, 
            nome: "VENICE DOWNTOWN", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 165",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 69, 
            nome: "VILLAGE LA CORUNA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 166",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 70, 
            nome: "VILLA ROMANA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 167",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 71, 
            nome: "VISCONDE DE BARBACENA", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 168",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 72, 
            nome: "VITTACE BOULEVARD", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 169",
            telefone: "(43) 1234-5678"
        },
        { 
            id: 73, 
            nome: "VIVALDI BOULEVARD", 
            cidade: "Londrina", 
            tipo: "Residencial",
            endereco: "Rua Exemplo, 170",
            telefone: "(43) 1234-5678"
        },
        
        // Condomínios em Maringá
        { 
            id: 74, 
            nome: "BENTO MUNHOZ DA ROCHA NETTO II", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 100",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 75, 
            nome: "CASA CONDOMÍNIO (Maringá)", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 101",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 76, 
            nome: "CITZEN PARK", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 102",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 77, 
            nome: "NEW PLAZA RESIDENCE", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 103",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 78, 
            nome: "RIO TEJO", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 104",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 79, 
            nome: "RIO TEVERE", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 105",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 80, 
            nome: "SAO GABRIEL", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 106",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 81, 
            nome: "SIRMIONE", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 107",
            telefone: "(44) 1234-5678"
        },
        { 
            id: 82, 
            nome: "VIVENDA DOS PESCADORES", 
            cidade: "Maringá", 
            tipo: "Residencial",
            endereco: "Av. Exemplo, 108",
            telefone: "(44) 1234-5678"
        },
        
        // Condomínios em Cambé
        { 
            id: 83, 
            nome: "LA SENA", 
            cidade: "Cambé", 
            tipo: "Residencial",
            endereco: "Rua Cambé, 200",
            telefone: "(43) 2234-5678"
        },
        { 
            id: 84, 
            nome: "MGL - MECANICA EIRELI", 
            cidade: "Cambé", 
            tipo: "Industrial",
            endereco: "Rua Cambé, 201",
            telefone: "(43) 2234-5678"
        },
        { 
            id: 85, 
            nome: "ORTIZ (Cambé)", 
            cidade: "Cambé", 
            tipo: "Residencial",
            endereco: "Rua Cambé, 202",
            telefone: "(43) 2234-5678"
        },
        { 
            id: 86, 
            nome: "VILLA BELLA (Cambé)", 
            cidade: "Cambé", 
            tipo: "Residencial",
            endereco: "Rua Cambé, 203",
            telefone: "(43) 2234-5678"
        },
        { 
            id: 87, 
            nome: "VILLA DAS TORRES", 
            cidade: "Cambé", 
            tipo: "Residencial",
            endereco: "Rua Cambé, 204",
            telefone: "(43) 2234-5678"
        },
        { 
            id: 88, 
            nome: "VILLAGGIO DO ENGENHO", 
            cidade: "Cambé", 
            tipo: "Residencial",
            endereco: "Rua Cambé, 205",
            telefone: "(43) 2234-5678"
        },
        
        // Condomínios em Arapongas
        { 
            id: 89, 
            nome: "CIDADE DOS PASSAROS", 
            cidade: "Arapongas", 
            tipo: "Residencial",
            endereco: "Rua Arapongas, 300",
            telefone: "(43) 3234-5678"
        }
    ],
    
    // Configurações do sistema
    configs: {
        defaultPassword: "Porter@2026",
        passwordMinLength: 6,
        sessionTimeout: 3600, // 1 hora em segundos
        maxLoginAttempts: 5,
        backupInterval: 86400, // 24 horas em segundos
        chatMessageLimit: 100,
        notificationLimit: 50
    },
    
    // Tipos de ocorrências
    tiposOcorrencia: [
        { value: "Informação", label: "📝 Informação", icon: "fa-info-circle", color: "#3498db" },
        { value: "Ocorrência", label: "⚠️ Ocorrência", icon: "fa-exclamation-triangle", color: "#f39c12" },
        { value: "Incidente", label: "🚨 Incidente", icon: "fa-bell", color: "#e74c3c" },
        { value: "Informações Fixas", label: "📌 Informações Fixas", icon: "fa-thumbtack", color: "#9b59b6" }
    ],
    
    // Status de ocorrências
    statusOcorrencia: [
        { value: "Em andamento", label: "🔄 Em andamento", icon: "fa-sync-alt", color: "#f39c12" },
        { value: "Finalizado", label: "✅ Finalizado", icon: "fa-check-circle", color: "#27ae60" },
        { value: "Cancelado", label: "❌ Cancelado", icon: "fa-times-circle", color: "#95a5a6" }
    ],
    
    // Gravidade de OS
    gravidadeOS: [
        { 
            value: "Baixa", 
            label: "🟢 Baixa - Manutenção Preventiva/Rotina", 
            color: "#27ae60",
            prazo: "7 dias úteis",
            icon: "fa-thermometer-empty"
        },
        { 
            value: "Média", 
            label: "🟡 Média - Reparo Necessário", 
            color: "#f39c12",
            prazo: "3 dias úteis",
            icon: "fa-thermometer-quarter"
        },
        { 
            value: "Alta", 
            label: "🔴 Alta - Urgente/Problema Crítico", 
            color: "#e74c3c",
            prazo: "24 horas",
            icon: "fa-thermometer-half"
        },
        { 
            value: "Emergência", 
            label: "🚨 Emergência - Risco Imediato", 
            color: "#8b0000",
            prazo: "Imediato",
            icon: "fa-thermometer-full"
        }
    ],
    
    // Opções de humor para avaliação
    opcoesHumor: [
        { value: "excelente", label: "Excelente", emoji: "😊", color: "#27ae60", icon: "fa-grin-beam" },
        { value: "bom", label: "Bom", emoji: "🙂", color: "#2ecc71", icon: "fa-smile" },
        { value: "normal", label: "Normal", emoji: "😐", color: "#f39c12", icon: "fa-meh" },
        { value: "ruim", label: "Ruim", emoji: "😕", color: "#e74c3c", icon: "fa-frown" },
        { value: "pessimo", label: "Péssimo", emoji: "😞", color: "#c0392b", icon: "fa-sad-tear" }
    ],
    
    // Turnos de trabalho
    turnos: [
        { value: "Diurno", label: "🌞 Diurno", start: "06:00", end: "18:00" },
        { value: "Noturno", label: "🌙 Noturno", start: "18:00", end: "06:00" }
    ]
};

// ============================================
// Funções de utilidade para manipulação de dados
// ============================================

const DataUtils = {
    // Validação de dados
    validarFuncionario: function(funcionario) {
        if (!funcionario.user || !funcionario.passHash || !funcionario.nome) {
            return false;
        }
        
        // Validar formato do usuário (nome.sobrenome)
        const userRegex = /^[a-z]+\.[a-z]+$/;
        if (!userRegex.test(funcionario.user)) {
            return false;
        }
        
        // Validar senha (pelo menos 6 caracteres)
        if (funcionario.passHash.length < SYSTEM_DATA.configs.passwordMinLength) {
            return false;
        }
        
        return true;
    },
    
    validarCondominio: function(condominio) {
        return !!(condominio.nome && condominio.cidade);
    },
    
    // Busca de dados
    buscarFuncionarioPorUsuario: function(usuario) {
        return SYSTEM_DATA.funcionarios.find(func => func.user === usuario && func.ativo);
    },
    
    buscarFuncionarioPorNome: function(nome) {
        return SYSTEM_DATA.funcionarios.find(func => func.nome === nome && func.ativo);
    },
    
    buscarCondominioPorNome: function(nome) {
        return SYSTEM_DATA.condominios.find(cond => cond.nome === nome);
    },
    
    buscarCondominioPorId: function(id) {
        return SYSTEM_DATA.condominios.find(cond => cond.id === id);
    },
    
    // Filtros
    filtrarCondominiosPorCidade: function(cidade) {
        return SYSTEM_DATA.condominios.filter(cond => cond.cidade === cidade);
    },
    
    filtrarFuncionariosPorRole: function(role) {
        return SYSTEM_DATA.funcionarios.filter(func => func.role === role && func.ativo);
    },
    
    // Métricas
    getEstatisticas: function() {
        return {
            totalFuncionarios: SYSTEM_DATA.funcionarios.filter(f => f.ativo).length,
            totalCondominios: SYSTEM_DATA.condominios.length,
            funcionariosAtivos: SYSTEM_DATA.funcionarios.filter(f => f.ativo).length,
            condominiosPorCidade: this.getCondominiosPorCidade(),
            funcionariosPorRole: this.getFuncionariosPorRole()
        };
    },
    
    getCondominiosPorCidade: function() {
        const cidades = {};
        SYSTEM_DATA.condominios.forEach(cond => {
            if (!cidades[cond.cidade]) {
                cidades[cond.cidade] = 0;
            }
            cidades[cond.cidade]++;
        });
        return cidades;
    },
    
    getFuncionariosPorRole: function() {
        const roles = {};
        SYSTEM_DATA.funcionarios.forEach(func => {
            if (func.ativo) {
                if (!roles[func.role]) {
                    roles[func.role] = 0;
                }
                roles[func.role]++;
            }
        });
        return roles;
    },
    
    // Exportação de dados
    exportarDados: function(formato = 'json') {
        const dadosParaExportar = {
            sistema: {
                nome: SYSTEM_DATA.systemName,
                versao: SYSTEM_DATA.version,
                empresa: SYSTEM_DATA.company,
                dataExportacao: new Date().toISOString()
            },
            funcionarios: SYSTEM_DATA.funcionarios.filter(f => f.ativo),
            condominios: SYSTEM_DATA.condominios,
            configuracao: SYSTEM_DATA.configs
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
        csv += "ID,Nome,Usuário,Cargo,E-mail,Ativo,Data Admissão\n";
        dados.funcionarios.forEach(func => {
            csv += `${func.id},"${func.nome}","${func.user}","${func.role}","${func.email}",${func.ativo},"${func.dataAdmissao}"\n`;
        });
        
        csv += "\nCONDOMÍNIOS\n";
        csv += "ID,Nome,Cidade,Tipo,Endereço,Telefone\n";
        dados.condominios.forEach(cond => {
            csv += `${cond.id},"${cond.nome}","${cond.cidade}","${cond.tipo}","${cond.endereco}","${cond.telefone}"\n`;
        });
        
        return csv;
    },
    
    // Backup e restauração
    criarBackup: function() {
        const backup = {
            timestamp: new Date().getTime(),
            data: JSON.stringify(SYSTEM_DATA),
            hash: this.criarHash(JSON.stringify(SYSTEM_DATA))
        };
        
        // Salvar no localStorage (em produção, salvaria em servidor)
        localStorage.setItem('porter_backup_' + backup.timestamp, JSON.stringify(backup));
        
        // Manter apenas os últimos 5 backups
        this.limitarBackups(5);
        
        return backup;
    },
    
    criarHash: function(string) {
        // Hash simples para demonstração (em produção usar SHA256)
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
        
        // Ordenar por timestamp (mais antigo primeiro)
        backups.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remover backups antigos
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
                        size: backup.data.length,
                        hash: backup.hash
                    });
                } catch (e) {
                    console.error('Erro ao ler backup:', key, e);
                }
            }
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        backups.sort((a, b) => b.timestamp - a.timestamp);
        
        return backups;
    },
    
    restaurarBackup: function(timestamp) {
        const key = 'porter_backup_' + timestamp;
        const backup = JSON.parse(localStorage.getItem(key));
        
        if (!backup) {
            throw new Error('Backup não encontrado');
        }
        
        // Verificar integridade do hash
        const hashAtual = this.criarHash(backup.data);
        if (hashAtual !== backup.hash) {
            throw new Error('Backup corrompido: hash não corresponde');
        }
        
        // Em produção, aqui restauraríamos os dados do backup
        // Por segurança, não estamos sobrescrevendo SYSTEM_DATA diretamente
        console.log('Backup restaurado:', new Date(timestamp).toLocaleString('pt-BR'));
        
        return JSON.parse(backup.data);
    },
    
    // Criptografia básica (para demonstração)
    criptografarSenha: function(senha) {
        // Em produção, usar bcrypt ou similar
        return btoa(senha + '_porter_salt_2026');
    },
    
    descriptografarSenha: function(senhaCriptografada) {
        try {
            const senhaDescriptografada = atob(senhaCriptografada);
            return senhaDescriptografada.replace('_porter_salt_2026', '');
        } catch (e) {
            return null;
        }
    },
    
    // Validação de senha
    validarSenha: function(senha) {
        if (senha.length < SYSTEM_DATA.configs.passwordMinLength) {
            return {
                valido: false,
                erro: `A senha deve ter pelo menos ${SYSTEM_DATA.configs.passwordMinLength} caracteres`
            };
        }
        
        // Verificar se tem pelo menos uma letra maiúscula
        if (!/[A-Z]/.test(senha)) {
            return {
                valido: false,
                erro: "A senha deve conter pelo menos uma letra maiúscula"
            };
        }
        
        // Verificar se tem pelo menos um número
        if (!/\d/.test(senha)) {
            return {
                valido: false,
                erro: "A senha deve conter pelo menos um número"
            };
        }
        
        // Verificar se tem pelo menos um caractere especial
        if (!/[@$!%*?&]/.test(senha)) {
            return {
                valido: false,
                erro: "A senha deve conter pelo menos um caractere especial (@$!%*?&)"
            };
        }
        
        return {
            valido: true,
            erro: null
        };
    },
    
    // Geração de dados aleatórios para teste
    gerarDadosTeste: function(quantidade) {
        const dados = [];
        const nomes = ["João", "Maria", "Pedro", "Ana", "Carlos", "Juliana"];
        const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa"];
        
        for (let i = 1; i <= quantidade; i++) {
            const nome = `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`;
            const user = nome.toLowerCase().replace(' ', '.');
            
            dados.push({
                id: SYSTEM_DATA.funcionarios.length + i,
                nome: nome,
                user: user,
                passHash: this.criptografarSenha("Teste@123"),
                role: "OPERADOR",
                email: `${user}@porter.com`,
                ativo: true,
                dataAdmissao: new Date().toISOString().split('T')[0]
            });
        }
        
        return dados;
    },
    
    // Log de atividades
    logAtividade: function(usuario, acao, detalhes = null) {
        const log = {
            timestamp: new Date().getTime(),
            usuario: usuario,
            acao: acao,
            detalhes: detalhes,
            ip: "127.0.0.1" // Em produção, pegar IP real
        };
        
        // Salvar no localStorage (em produção, salvar em servidor)
        const logs = JSON.parse(localStorage.getItem('porter_logs') || '[]');
        logs.push(log);
        
        // Manter apenas os últimos 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }
        
        localStorage.setItem('porter_logs', JSON.stringify(logs));
        
        return log;
    },
    
    // Obter logs
    getLogs: function(limite = 100) {
        const logs = JSON.parse(localStorage.getItem('porter_logs') || '[]');
        return logs.slice(-limite).reverse();
    }
};

// ============================================
// Compatibilidade com código antigo
// ============================================

// Mantém o objeto DATA original para compatibilidade
const DATA = {
    funcionarios: SYSTEM_DATA.funcionarios.map(f => ({
        nome: f.nome,
        user: f.user,
        pass: DataUtils.descriptografarSenha(f.passHash) || f.passHash,
        role: f.role
    })),
    condominios: SYSTEM_DATA.condominios.map(c => ({
        n: c.nome,
        c: c.cidade
    }))
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SYSTEM_DATA = SYSTEM_DATA;
    window.DataUtils = DataUtils;
    window.DATA = DATA; // Compatibilidade
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SYSTEM_DATA,
        DataUtils,
        DATA
    };
}
