// ============================================
// CONFIGURAÇÃO SUPABASE - ATA OPERACIONAL PORTER
// Substituição completa do Firebase
// ============================================

// 🔧 SUAS CREDENCIAIS SUPABASE
const SUPABASE_CONFIG = {
    url: 'https://rddtjmfqqpnkbaqposng.supabase.co',
    anonKey: 'sb_publishable_jZD5uuZm0UPRG9dDXSZl0A_X3CtQ2a4',
    storageBucket: 'porter_files'
};

console.log('🚀 Inicializando Supabase com URL:', SUPABASE_CONFIG.url);

// Inicializar Supabase
let supabaseClient;
try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    });
    console.log('✅ Cliente Supabase criado');
} catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error);
}

// Global helper similar ao firebaseHelper
window.supabaseHelper = {
    // 🔧 CONFIGURAÇÃO INICIAL
    inicializarSupabase() {
        if (!supabaseClient) {
            console.error('❌ Supabase não inicializado');
            return false;
        }
        
        console.log('✅ Supabase inicializado com URL:', SUPABASE_CONFIG.url);
        
        // Testar conexão
        this.testarConexao();
        
        // Configurar listeners Realtime
        this.configurarRealtimeOS();
        this.configurarRealtimeChat();
        this.configurarRealtimeOnline();
        this.configurarRealtimeAtas();
        
        // Iniciar sincronização periódica
        this.iniciarSincronizacaoPeriodica();
        
        // Adicionar botão de migração se for admin
        this.adicionarBotaoMigracao();
        
        return true;
    },
    
    // Testar conexão com Supabase
    async testarConexao() {
        try {
            const { data, error } = await supabaseClient
                .from('ordens_servico')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            console.log('✅ Conexão Supabase testada com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro na conexão Supabase:', error.message);
            return false;
        }
    },
    
    // ============================================
    // 🔄 SISTEMA DE SINCRONIZAÇÃO
    // ============================================
    
    iniciarSincronizacaoPeriodica() {
        // Sincronizar a cada 30 segundos
        setInterval(() => {
            if (supabaseClient && window.app && window.app.currentUser) {
                this.sincronizarStatusOnlineComSupabase();
                this.sincronizarDadosLocais();
            }
        }, 30000);
        
        // Sincronizar dados offline ao voltar online
        window.addEventListener('online', () => {
            console.log('🌐 Conexão restaurada, sincronizando dados...');
            this.sincronizarDadosLocais();
        });
    },
    
    // Sincronizar dados locais com Supabase
    async sincronizarDadosLocais() {
        if (!supabaseClient) return;
        
        try {
            console.log('🔄 Iniciando sincronização de dados locais...');
            
            // Sincronizar em paralelo
            await Promise.all([
                this.sincronizarAtasLocais(),
                this.sincronizarOSLocais(),
                this.sincronizarChatLocal(),
                this.sincronizarMoodsLocais(),
                this.sincronizarNotificacoesLocais(),
                this.sincronizarPresencasLocais()
            ]);
            
            console.log('✅ Todos os dados locais sincronizados');
        } catch (error) {
            console.error('❌ Erro ao sincronizar dados:', error);
        }
    },
    
    // ============================================
    // 📋 ORDENS DE SERVIÇO (OS)
    // ============================================
    
    // 🔧 ANTES (Firebase): salvarOSNoFirebase()
    // DEPOIS (Supabase): salvarOSNoSupabase()
    async salvarOSNoSupabase(osData) {
        if (!supabaseClient) {
            console.log('⚠️ Supabase não disponível, salvando apenas localmente');
            return false;
        }
        
        try {
            // Garantir que temos um firebase_id
            const firebaseId = osData.id ? osData.id.toString() : Date.now().toString();
            
            const osParaSupabase = {
                os_id: osData.osId || `OS-${Date.now()}`,
                condo: osData.condo,
                cidade: osData.cidade || '',
                gravidade: osData.gravidade,
                descricao: osData.desc,
                data_os: osData.dataOS || new Date().toISOString().split('T')[0],
                data: osData.data || new Date().toLocaleDateString('pt-BR'),
                data_iso: osData.dataISO || new Date().toISOString().split('T')[0],
                hora: osData.hora || new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}),
                funcionario: osData.funcionario,
                email: osData.email,
                setor: osData.setor,
                operador: osData.operador || (window.app?.currentUser?.nome || 'Operador'),
                usuario: osData.user || (window.app?.currentUser?.user || 'anonimo'),
                turno: osData.turno || (window.app?.currentUser?.turno || 'Diurno'),
                status: osData.status || 'Em branco',
                status_os: osData.statusOS || 'Em branco',
                timestamp: osData.timestamp || new Date().toISOString(),
                prazo_resposta: osData.prazoResposta || '3 dias úteis',
                cor_gravidade: osData.corGravidade || '#666',
                enviado_por_email: osData.enviadoPorEmail || true,
                data_envio_email: osData.dataEnvioEmail || new Date().toISOString(),
                tecnico_responsavel: osData.tecnicoResponsavel || '',
                firebase_id: firebaseId
            };
            
            console.log('💾 Salvando OS no Supabase:', osParaSupabase.os_id);
            
            const { data, error } = await supabaseClient
                .from('ordens_servico')
                .insert(osParaSupabase)
                .select()
                .single();
            
            if (error) {
                // Tentar update se já existir
                if (error.code === '23505') { // Violação de unicidade
                    const { data: updateData, error: updateError } = await supabaseClient
                        .from('ordens_servico')
                        .update(osParaSupabase)
                        .eq('firebase_id', firebaseId)
                        .select()
                        .single();
                    
                    if (updateError) throw updateError;
                    console.log('✅ OS atualizada no Supabase:', updateData.id);
                    return true;
                }
                throw error;
            }
            
            console.log('✅ OS salva no Supabase com ID:', data.id);
            
            // Sincronizar com localStorage
            setTimeout(() => this.sincronizarOSSupabaseParaLocal(), 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar OS no Supabase:', error);
            return false;
        }
    },
    
    // Atualizar status da OS no Supabase
    async atualizarStatusOSNoSupabase(osId, novoStatus, atualizadoPor) {
        if (!supabaseClient) return false;
        
        try {
            const { data, error } = await supabaseClient
                .from('ordens_servico')
                .update({
                    status_os: novoStatus,
                    status: novoStatus,
                    atualizado_por: atualizadoPor,
                    data_atualizacao: new Date().toISOString()
                })
                .eq('firebase_id', osId.toString())
                .select();
            
            if (error) throw error;
            
            console.log('✅ Status da OS atualizado no Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar status da OS:', error);
            return false;
        }
    },
    
    // Excluir OS do Supabase
    async excluirOSNoSupabase(osId) {
        if (!supabaseClient) return false;
        
        try {
            const { error } = await supabaseClient
                .from('ordens_servico')
                .delete()
                .eq('firebase_id', osId.toString());
            
            if (error) throw error;
            
            console.log('✅ OS excluída do Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao excluir OS:', error);
            return false;
        }
    },
    
    // 🔧 Configurar Realtime para OS
    configurarRealtimeOS() {
        if (!supabaseClient) return;
        
        const channel = supabaseClient.channel('ordens_servico_changes');
        
        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'ordens_servico'
            },
            (payload) => {
                console.log('📡 Mudança em OS recebida:', payload.eventType);
                
                // Atualizar localStorage
                setTimeout(() => this.sincronizarOSSupabaseParaLocal(), 500);
                
                // Atualizar interface se necessário
                if (typeof window.app !== 'undefined' && window.app.renderOS) {
                    setTimeout(() => window.app.renderOS(), 1000);
                }
            }
        ).subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Listener Realtime OS configurado');
            }
        });
    },
    
    // Sincronizar OS do Supabase para localStorage
    async sincronizarOSSupabaseParaLocal() {
        if (!supabaseClient) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('ordens_servico')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(100);
            
            if (error) throw error;
            
            // Converter para formato local
            const osLocal = data.map(item => ({
                id: parseInt(item.firebase_id) || Date.now(),
                osId: item.os_id,
                condo: item.condo,
                cidade: item.cidade,
                gravidade: item.gravidade,
                desc: item.descricao,
                dataOS: item.data_os,
                data: item.data,
                dataISO: item.data_iso,
                hora: item.hora,
                funcionario: item.funcionario,
                email: item.email,
                setor: item.setor,
                operador: item.operador,
                user: item.usuario,
                turno: item.turno,
                status: item.status,
                statusOS: item.status_os,
                timestamp: item.timestamp,
                prazoResposta: item.prazo_resposta,
                corGravidade: item.cor_gravidade,
                enviadoPorEmail: item.enviado_por_email,
                dataEnvioEmail: item.data_envio_email,
                tecnicoResponsavel: item.tecnico_responsavel,
                atualizadoPor: item.atualizado_por,
                dataAtualizacao: item.data_atualizacao,
                supabase_id: item.id
            }));
            
            // Salvar no localStorage
            localStorage.setItem('porter_os', JSON.stringify(osLocal));
            localStorage.setItem('porter_os_supabase_sync', new Date().toISOString());
            
            console.log('✅ OS sincronizadas do Supabase:', osLocal.length);
        } catch (error) {
            console.error('❌ Erro ao sincronizar OS:', error);
        }
    },
    
    // Sincronizar OS locais para Supabase
    async sincronizarOSLocais() {
        const osLocais = JSON.parse(localStorage.getItem('porter_os') || '[]');
        
        for (const os of osLocais) {
            try {
                // Verificar se já existe no Supabase
                const { data } = await supabaseClient
                    .from('ordens_servico')
                    .select('id')
                    .eq('firebase_id', os.id.toString())
                    .single();
                
                if (!data) {
                    await this.salvarOSNoSupabase(os);
                }
            } catch (error) {
                console.log('⚠️ OS não encontrada no Supabase, inserindo...');
                await this.salvarOSNoSupabase(os);
            }
        }
    },
    
    // ============================================
    // 💬 CHAT GERAL
    // ============================================
    
    // 🔧 Configurar Realtime para Chat
    configurarRealtimeChat() {
        if (!supabaseClient) return;
        
        const channel = supabaseClient.channel('chat_geral_changes');
        
        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_geral'
            },
            (payload) => {
                console.log('💬 Nova mensagem no chat:', payload.new.sender);
                
                // Adicionar ao localStorage
                this.adicionarMensagemChatLocal(payload.new);
                
                // Atualizar interface
                if (typeof window.chatSystem !== 'undefined' && window.chatSystem.loadChat) {
                    setTimeout(() => window.chatSystem.loadChat(), 500);
                }
                
                // Atualizar badge
                if (typeof window.app !== 'undefined' && window.app.atualizarBadgeChat) {
                    window.app.atualizarBadgeChat();
                }
            }
        ).subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Listener Realtime Chat configurado');
            }
        });
    },
    
    // Adicionar mensagem do Supabase ao localStorage
    adicionarMensagemChatLocal(mensagemSupabase) {
        const mensagemLocal = {
            id: parseInt(mensagemSupabase.firebase_id) || Date.now(),
            sender: mensagemSupabase.sender,
            senderRole: mensagemSupabase.sender_role,
            senderMood: mensagemSupabase.sender_mood,
            message: mensagemSupabase.message,
            time: mensagemSupabase.time,
            timestamp: mensagemSupabase.timestamp,
            date: mensagemSupabase.date,
            firebaseSync: true,
            supabase_id: mensagemSupabase.id
        };
        
        let chat = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        // Verificar se já existe
        const existe = chat.some(msg => 
            msg.supabase_id === mensagemSupabase.id || 
            msg.id === mensagemLocal.id
        );
        
        if (!existe) {
            chat.push(mensagemLocal);
            
            if (chat.length > 200) chat = chat.slice(-200);
            localStorage.setItem('porter_chat', JSON.stringify(chat));
            
            console.log('✅ Mensagem do chat sincronizada localmente');
        }
    },
    
    // 🔧 Enviar mensagem para Supabase
    async enviarMensagemChatSupabase(mensagem) {
        if (!supabaseClient) return;
        
        try {
            const mensagemParaSupabase = {
                sender: mensagem.sender,
                sender_role: mensagem.senderRole,
                sender_mood: mensagem.senderMood,
                message: mensagem.message,
                time: mensagem.time,
                timestamp: mensagem.timestamp,
                date: mensagem.date,
                firebase_id: mensagem.id.toString(),
                firebase_sync: false
            };
            
            const { data, error } = await supabaseClient
                .from('chat_geral')
                .insert(mensagemParaSupabase);
            
            if (error) throw error;
            
            console.log('✅ Mensagem enviada para Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            return false;
        }
    },
    
    // Sincronizar chat local com Supabase
    async sincronizarChatLocal() {
        const chatLocal = JSON.parse(localStorage.getItem('porter_chat') || '[]');
        
        for (const mensagem of chatLocal) {
            if (!mensagem.firebaseSync && !mensagem.supabase_id) {
                await this.enviarMensagemChatSupabase(mensagem);
                mensagem.firebaseSync = true;
            }
        }
        
        // Atualizar localStorage
        localStorage.setItem('porter_chat', JSON.stringify(chatLocal));
    },
    
    // ============================================
    // 👥 USUÁRIOS ONLINE
    // ============================================
    
    // 🔧 ANTES (Firebase): sincronizarStatusOnlineComFirebase()
    // DEPOIS (Supabase): sincronizarStatusOnlineComSupabase()
    async sincronizarStatusOnlineComSupabase() {
        if (!supabaseClient || !window.app || !window.app.currentUser) return;
        
        try {
            const statusOnline = {
                usuario: window.app.currentUser.user,
                nome: window.app.currentUser.nome,
                role: window.app.currentUser.role,
                mood: window.app.getMoodAtual ? window.app.getMoodAtual() : '😐',
                last_activity: new Date().toISOString(),
                online: true,
                turno: window.app.currentUser.turno || 'Diurno'
            };
            
            // Upsert (inserir ou atualizar)
            const { data, error } = await supabaseClient
                .from('online_users')
                .upsert(statusOnline, {
                    onConflict: 'usuario'
                });
            
            if (error) throw error;
            
            // Atualizar lista de online
            this.atualizarListaOnlineDoSupaBase();
            
        } catch (error) {
            console.error('❌ Erro ao atualizar status online:', error);
        }
    },
    
    // Remover usuário da lista de online
    async removerUsuarioOnline() {
        if (!supabaseClient || !window.app || !window.app.currentUser) return;
        
        try {
            const { error } = await supabaseClient
                .from('online_users')
                .update({ 
                    online: false,
                    last_activity: new Date().toISOString()
                })
                .eq('usuario', window.app.currentUser.user);
            
            if (error) throw error;
            
            console.log('✅ Usuário removido da lista online');
        } catch (error) {
            console.error('❌ Erro ao remover usuário online:', error);
        }
    },
    
    // 🔧 Configurar Realtime para Usuários Online
    configurarRealtimeOnline() {
        if (!supabaseClient) return;
        
        const channel = supabaseClient.channel('online_users_changes');
        
        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'online_users'
            },
            (payload) => {
                console.log('👥 Mudança em usuários online:', payload.eventType);
                
                // Atualizar lista de online
                this.atualizarListaOnlineDoSupaBase();
            }
        ).subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Listener Realtime Online configurado');
            }
        });
    },
    
    // Atualizar lista de online do Supabase
    async atualizarListaOnlineDoSupaBase() {
        if (!supabaseClient) return;
        
        try {
            const agora = new Date();
            const cincoMinutosAtras = new Date(agora.getTime() - 5 * 60000).toISOString();
            
            const { data, error } = await supabaseClient
                .from('online_users')
                .select('*')
                .eq('online', true)
                .gt('last_activity', cincoMinutosAtras);
            
            if (error) throw error;
            
            // Salvar no localStorage para uso do app
            localStorage.setItem('porter_online_supabase', JSON.stringify({
                timestamp: new Date().toISOString(),
                users: data
            }));
            
            // Atualizar interface se o app existir
            if (typeof window.app !== 'undefined' && window.app.updateOnlineUsers) {
                window.app.updateOnlineUsers();
            }
            
            console.log('👥 Usuários online do Supabase:', data.length);
        } catch (error) {
            console.error('❌ Erro ao buscar usuários online:', error);
        }
    },
    
    // ============================================
    // 📋 ATAS E REGISTROS
    // ============================================
    
    // Salvar ata no Supabase
    async salvarAtaNoSupabase(ataData) {
        if (!supabaseClient) return false;
        
        try {
            const ataParaSupabase = {
                condo: ataData.condo,
                cidade: ataData.cidade || '',
                tipo: ataData.tipo,
                status: ataData.status,
                descricao: ataData.desc,
                operador: ataData.operador,
                usuario: ataData.user,
                turno: ataData.turno,
                data: ataData.data,
                data_iso: ataData.dataISO,
                hora: ataData.hora,
                timestamp: ataData.timestamp,
                fixa: ataData.fixa || false,
                firebase_id: ataData.id.toString()
            };
            
            const { data, error } = await supabaseClient
                .from('atas')
                .insert(ataParaSupabase)
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ Ata salva no Supabase com ID:', data.id);
            
            // Sincronizar com localStorage
            setTimeout(() => this.sincronizarAtasSupabaseParaLocal(), 1000);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar ata no Supabase:', error);
            return false;
        }
    },
    
    // Configurar Realtime para Atas
    configurarRealtimeAtas() {
        if (!supabaseClient) return;
        
        const channel = supabaseClient.channel('atas_changes');
        
        channel.on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'atas'
            },
            (payload) => {
                console.log('📋 Mudança em atas:', payload.eventType);
                
                // Atualizar localStorage
                setTimeout(() => this.sincronizarAtasSupabaseParaLocal(), 500);
                
                // Atualizar interface
                if (typeof window.app !== 'undefined') {
                    setTimeout(() => {
                        if (window.app.renderAta) window.app.renderAta();
                        if (window.app.renderFixas) window.app.renderFixas();
                    }, 1000);
                }
            }
        ).subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('✅ Listener Realtime Atas configurado');
            }
        });
    },
    
    // Sincronizar atas do Supabase para local
    async sincronizarAtasSupabaseParaLocal() {
        if (!supabaseClient) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('atas')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(200);
            
            if (error) throw error;
            
            // Converter para formato local
            const atasLocal = data.map(item => ({
                id: parseInt(item.firebase_id) || Date.now(),
                condo: item.condo,
                cidade: item.cidade,
                tipo: item.tipo,
                status: item.status,
                desc: item.descricao,
                operador: item.operador,
                user: item.usuario,
                turno: item.turno,
                data: item.data,
                dataISO: item.data_iso,
                hora: item.hora,
                timestamp: item.timestamp,
                fixa: item.fixa || false,
                comentarios: [], // Será carregado separadamente
                supabase_id: item.id
            }));
            
            // Salvar no localStorage
            localStorage.setItem('porter_atas', JSON.stringify(atasLocal));
            localStorage.setItem('porter_atas_supabase_sync', new Date().toISOString());
            
            console.log('✅ Atas sincronizadas do Supabase:', atasLocal.length);
        } catch (error) {
            console.error('❌ Erro ao sincronizar atas:', error);
        }
    },
    
    // Sincronizar atas locais para Supabase
    async sincronizarAtasLocais() {
        const atasLocais = JSON.parse(localStorage.getItem('porter_atas') || '[]');
        
        for (const ata of atasLocais) {
            try {
                // Verificar se já existe no Supabase
                const { data } = await supabaseClient
                    .from('atas')
                    .select('id')
                    .eq('firebase_id', ata.id.toString())
                    .single();
                
                if (!data) {
                    await this.salvarAtaNoSupabase(ata);
                }
            } catch (error) {
                console.log('⚠️ Ata não encontrada no Supabase, inserindo...');
                await this.salvarAtaNoSupabase(ata);
            }
        }
    },
    
    // ============================================
    // 😊 MOODS (ESTADOS EMOCIONAIS)
    // ============================================
    
    // Salvar mood no Supabase
    async salvarMoodNoSupabase(moodData) {
        if (!supabaseClient) return false;
        
        try {
            const moodParaSupabase = {
                usuario: moodData.user,
                nome: moodData.nome,
                mood_status: moodData.moodStatus,
                data: moodData.data,
                data_iso: moodData.dataISO,
                hora: moodData.hora,
                turno: moodData.turno,
                timestamp: moodData.timestamp
            };
            
            const { data, error } = await supabaseClient
                .from('moods')
                .insert(moodParaSupabase);
            
            if (error) throw error;
            
            console.log('✅ Mood salvo no Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar mood:', error);
            return false;
        }
    },
    
    // Sincronizar moods locais
    async sincronizarMoodsLocais() {
        const moodsLocais = JSON.parse(localStorage.getItem('porter_moods') || '[]');
        
        for (const mood of moodsLocais) {
            try {
                // Verificar se já existe (mesmo usuário e data)
                const { data } = await supabaseClient
                    .from('moods')
                    .select('id')
                    .eq('usuario', mood.user)
                    .eq('data_iso', mood.dataISO)
                    .single();
                
                if (!data) {
                    await this.salvarMoodNoSupabase(mood);
                }
            } catch (error) {
                console.log('⚠️ Mood não encontrado no Supabase, inserindo...');
                await this.salvarMoodNoSupabase(mood);
            }
        }
    },
    
    // ============================================
    // 🔔 NOTIFICAÇÕES
    // ============================================
    
    // Criar notificação no Supabase
    async criarNotificacaoSupabase(notificacaoData) {
        if (!supabaseClient) return false;
        
        try {
            const notificacaoParaSupabase = {
                condo: notificacaoData.condo,
                tipo: notificacaoData.tipo,
                descricao: notificacaoData.desc,
                data: notificacaoData.data,
                hora: notificacaoData.hora,
                timestamp: notificacaoData.timestamp,
                lida: notificacaoData.lida || false,
                destaque: notificacaoData.destaque || false,
                acao: notificacaoData.acao,
                firebase_id: notificacaoData.id ? notificacaoData.id.toString() : Date.now().toString()
            };
            
            const { data, error } = await supabaseClient
                .from('notificacoes')
                .insert(notificacaoParaSupabase);
            
            if (error) throw error;
            
            console.log('✅ Notificação criada no Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao criar notificação:', error);
            return false;
        }
    },
    
    // Sincronizar notificações locais
    async sincronizarNotificacoesLocais() {
        const notificacoesLocais = JSON.parse(localStorage.getItem('porter_notificacoes') || '[]');
        
        for (const notificacao of notificacoesLocais) {
            try {
                // Verificar se já existe no Supabase
                const { data } = await supabaseClient
                    .from('notificacoes')
                    .select('id')
                    .eq('firebase_id', notificacao.id.toString())
                    .single();
                
                if (!data) {
                    await this.criarNotificacaoSupabase(notificacao);
                }
            } catch (error) {
                console.log('⚠️ Notificação não encontrada no Supabase, inserindo...');
                await this.criarNotificacaoSupabase(notificacao);
            }
        }
    },
    
    // ============================================
    // 📅 PRESENÇAS (LOGIN/LOGOFF)
    // ============================================
    
    // Registrar presença no Supabase
    async registrarPresencaSupabase(presencaData) {
        if (!supabaseClient) return false;
        
        try {
            const presencaParaSupabase = {
                nome: presencaData.nome,
                turno: presencaData.turno,
                data: presencaData.data,
                hora: presencaData.hora,
                timestamp: presencaData.timestamp,
                data_iso: presencaData.dataISO,
                tipo: presencaData.tipo,
                usuario: presencaData.user
            };
            
            const { data, error } = await supabaseClient
                .from('presencas')
                .insert(presencaParaSupabase);
            
            if (error) throw error;
            
            console.log('✅ Presença registrada no Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao registrar presença:', error);
            return false;
        }
    },
    
    // Registrar logoff no Supabase
    async registrarLogoffSupabase(logoffData) {
        if (!supabaseClient) return false;
        
        try {
            const logoffParaSupabase = {
                usuario: logoffData.user,
                nome: logoffData.nome,
                data: logoffData.data,
                hora: logoffData.hora,
                timestamp: logoffData.timestamp,
                turno: logoffData.turno,
                forçado: logoffData.forçado || false,
                por: logoffData.por,
                firebase_id: logoffData.id ? logoffData.id.toString() : null
            };
            
            const { data, error } = await supabaseClient
                .from('logoffs')
                .insert(logoffParaSupabase);
            
            if (error) throw error;
            
            console.log('✅ Logoff registrado no Supabase');
            return true;
        } catch (error) {
            console.error('❌ Erro ao registrar logoff:', error);
            return false;
        }
    },
    
    // Sincronizar presenças locais
    async sincronizarPresencasLocais() {
        const presencasLocais = JSON.parse(localStorage.getItem('porter_presencas') || '[]');
        const logoffsLocais = JSON.parse(localStorage.getItem('porter_logoffs') || '[]');
        
        // Sincronizar presenças
        for (const presenca of presencasLocais) {
            try {
                // Verificar se já existe
                const { data } = await supabaseClient
                    .from('presencas')
                    .select('id')
                    .eq('usuario', presenca.user)
                    .eq('timestamp', presenca.timestamp)
                    .single();
                
                if (!data) {
                    await this.registrarPresencaSupabase(presenca);
                }
            } catch (error) {
                console.log('⚠️ Presença não encontrada no Supabase, inserindo...');
                await this.registrarPresencaSupabase(presenca);
            }
        }
        
        // Sincronizar logoffs
        for (const logoff of logoffsLocais) {
            try {
                // Verificar se já existe
                const { data } = await supabaseClient
                    .from('logoffs')
                    .select('id')
                    .eq('usuario', logoff.user)
                    .eq('timestamp', logoff.timestamp)
                    .single();
                
                if (!data) {
                    await this.registrarLogoffSupabase(logoff);
                }
            } catch (error) {
                console.log('⚠️ Logoff não encontrado no Supabase, inserindo...');
                await this.registrarLogoffSupabase(logoff);
            }
        }
    },
    
    // ============================================
    // 🛠️ FUNÇÕES DE COMPATIBILIDADE (MIGRAÇÃO)
    // ============================================
    
    // Migrar dados do localStorage para Supabase
    async migrarDadosLocaisParaSupabase() {
        if (!supabaseClient) {
            alert('Supabase não inicializado. Verifique a conexão.');
            return false;
        }
        
        try {
            console.log('🚀 Iniciando migração de dados para Supabase...');
            
            // Confirmar com usuário
            if (!confirm('Deseja migrar todos os dados locais para o Supabase?\nEsta ação pode levar alguns minutos.')) {
                return false;
            }
            
            // Mostrar progresso
            const progresso = document.createElement('div');
            progresso.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 9999; text-align: center; min-width: 300px;
            `;
            progresso.innerHTML = `
                <h3>🚀 Migrando para Supabase</h3>
                <div id="migration-progress" style="margin: 1rem 0;">
                    <div style="background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden;">
                        <div id="progress-bar" style="background: #3498db; height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <div id="progress-text" style="margin-top: 0.5rem; font-size: 0.9rem;">Iniciando...</div>
                </div>
            `;
            document.body.appendChild(progresso);
            
            const atualizarProgresso = (etapa, percentual) => {
                const progressBar = document.getElementById('progress-bar');
                const progressText = document.getElementById('progress-text');
                if (progressBar) progressBar.style.width = percentual + '%';
                if (progressText) progressText.textContent = etapa;
            };
            
            // Migrar em etapas
            atualizarProgresso('Migrando Ordens de Serviço...', 10);
            await this.sincronizarOSLocais();
            
            atualizarProgresso('Migrando Atas...', 30);
            await this.sincronizarAtasLocais();
            
            atualizarProgresso('Migrando Chat...', 50);
            await this.sincronizarChatLocal();
            
            atualizarProgresso('Migrando Notificações...', 70);
            await this.sincronizarNotificacoesLocais();
            
            atualizarProgresso('Migrando Histórico...', 90);
            await this.sincronizarPresencasLocais();
            await this.sincronizarMoodsLocais();
            
            // Finalizar
            atualizarProgresso('Migração concluída!', 100);
            
            setTimeout(() => {
                progresso.remove();
                alert('✅ Migração para Supabase concluída com sucesso!\nTodos os dados foram sincronizados.');
            }, 1000);
            
            console.log('✅ Migração para Supabase concluída');
            return true;
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            alert('❌ Erro na migração: ' + error.message);
            return false;
        }
    },
    
    // Adicionar botão de migração para admin
    adicionarBotaoMigracao() {
        // Aguardar carregamento do app
        setTimeout(() => {
            if (window.app && window.app.currentUser && 
                (window.app.currentUser.role === 'ADMIN' || window.app.currentUser.role === 'TÉCNICO')) {
                
                setTimeout(() => {
                    const adminControls = document.getElementById('admin-controls');
                    if (adminControls) {
                        // Verificar se o botão já existe
                        if (!document.getElementById('migrar-supabase-btn')) {
                            const migrarBtn = document.createElement('button');
                            migrarBtn.id = 'migrar-supabase-btn';
                            migrarBtn.className = 'btn btn-warning';
                            migrarBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Migrar para Supabase';
                            migrarBtn.onclick = () => this.migrarDadosLocaisParaSupabase();
                            migrarBtn.style.marginLeft = '10px';
                            adminControls.appendChild(migrarBtn);
                            
                            console.log('✅ Botão de migração adicionado');
                        }
                    }
                }, 3000);
            }
        }, 2000);
    },
    
    // ============================================
    // 📊 ESTATÍSTICAS E RELATÓRIOS
    // ============================================
    
    // Obter estatísticas do sistema
    async obterEstatisticas() {
        if (!supabaseClient) return null;
        
        try {
            const hoje = new Date().toISOString().split('T')[0];
            
            // Contar OS por gravidade
            const { data: osData, error: osError } = await supabaseClient
                .from('ordens_servico')
                .select('gravidade')
                .gte('data_iso', hoje);
            
            if (osError) throw osError;
            
            // Contar atas hoje
            const { data: atasData, error: atasError } = await supabaseClient
                .from('atas')
                .select('id')
                .gte('data_iso', hoje);
            
            if (atasError) throw atasError;
            
            // Contar usuários online
            const { data: onlineData, error: onlineError } = await supabaseClient
                .from('online_users')
                .select('usuario')
                .eq('online', true);
            
            if (onlineError) throw onlineError;
            
            const estatisticas = {
                os_hoje: osData?.length || 0,
                os_alta: osData?.filter(o => o.gravidade === 'Alta').length || 0,
                os_media: osData?.filter(o => o.gravidade === 'Média').length || 0,
                os_baixa: osData?.filter(o => o.gravidade === 'Baixa').length || 0,
                atas_hoje: atasData?.length || 0,
                usuarios_online: onlineData?.length || 0,
                atualizado_em: new Date().toISOString()
            };
            
            console.log('📊 Estatísticas obtidas:', estatisticas);
            return estatisticas;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }
};

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se Supabase está disponível
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase SDK não carregado');
        return;
    }
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        if (window.supabaseHelper && typeof window.supabaseHelper.inicializarSupabase === 'function') {
            window.supabaseHelper.inicializarSupabase();
        }
    }, 2000);
});

// Exportar para uso global
window.supabaseClient = supabaseClient;
window.supaHelper = window.supabaseHelper; // Alias para compatibilidade

console.log('🚀 Supabase configurado e pronto para uso');
