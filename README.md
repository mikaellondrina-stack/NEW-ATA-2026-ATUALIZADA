[README.md](https://github.com/user-attachments/files/24949093/README.md)
# MIGRAÇÃO FIREBASE → SUPABASE - ATA OPERACIONAL PORTER

## 📋 Instruções de Migração

### Pré-requisitos
1. Conta Supabase criada
2. Projeto criado no Supabase
3. Chaves de API do Supabase

### Passos de Configuração

#### 1. Configurar Banco de Dados
1. Acesse o dashboard do Supabase
2. Vá para "SQL Editor"
3. Execute o script SQL de criação das tabelas (ver supabase-setup.md)

#### 2. Configurar Storage
1. Vá para "Storage"
2. Crie um bucket chamado "porter_files"
3. Configure políticas de acesso:
   - Habilitar upload anônimo
   - Configurar tamanho máximo de arquivo

#### 3. Configurar Autenticação
1. Vá para "Authentication"
2. Configure método "Email"
3. Desative verificação de email para desenvolvimento

#### 4. Configurar Realtime
1. Vá para "Database"
2. Configure publicações Realtime para todas as tabelas

### Estrutura de Tabelas
- `ordens_servico` → Substitui Firestore collection
- `chat_geral` → Mensagens do chat
- `chat_privado` → Mensagens privadas
- `online_users` → Usuários online
- `atlas` → Registros de atas
- `moods` → Estados emocionais
- `notificacoes` → Sistema de notificações

### Chaves de API
Substitua no arquivo `supabase.js`:
 - `SUPABASE_URL`
 - `SUPABASE_ANON_KEY`

### Deploy
1. Hospede os arquivos estáticos (Vercel, Netlify, etc.)
2. Configure CORS no Supabase para seu domínio
3. Teste todas as funcionalidades

## 🔄 Comparação Firebase → Supabase

### Autenticação
| Firebase | Supabase |
|----------|----------|
| `auth.signInWithEmailAndPassword()` | `supabase.auth.signIn()` |
| `auth.signOut()` | `supabase.auth.signOut()` |
| `onAuthStateChanged()` | `supabase.auth.onAuthStateChange()` |

### Banco de Dados
| Firebase | Supabase |
|----------|----------|
| `collection().doc().set()` | `from().insert()` |
| `collection().doc().update()` | `from().update()` |
| `collection().doc().delete()` | `from().delete()` |
| `collection().where().get()` | `from().select().eq()` |
| Realtime `.onSnapshot()` | Realtime `.on()` |

### Storage
| Firebase | Supabase |
|----------|----------|
| `storage.ref().put()` | `storage.from().upload()` |
| `storage.ref().getDownloadURL()` | `storage.from().getPublicUrl()` |

## 🚨 Problemas Comuns

### 1. Erros de CORS
Solução: Configure CORS no Supabase para incluir seu domínio.

### 2. Permissões de Tabela
Solução: Execute as políticas SQL fornecidas no setup.

### 3. Conexão Realtime
Solução: Verifique se as publicações estão habilitadas.

### 4. Autenticação
Solução: Verifique se as configurações de email estão corretas.

## 📞 Suporte
Em caso de problemas:
1. Verifique o console do navegador
2. Consulte a documentação do Supabase
3. Verifique as permissões do banco de dados

## ✅ Validação
Após migração, teste:
- [ ] Login/Logout
- [ ] CRUD de atas
- [ ] Chat em tempo real
- [ ] Ordens de serviço
- [ ] Notificações
- [ ] Upload de arquivos
- [ ] Geração de PDF
