// app.js - Lógica Principal da Aplicação
// Variáveis globais
let unsubscribeAtas = null;
let unsubscribeChat = null;
let unsubscribeUsers = null;

// Navegação
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('d-none');
    loadDashboardStats();
}

function showAtas() {
    hideAllSections();
    document.getElementById('atas').classList.remove('d-none');
    loadAtas();
}

function showChat() {
    hideAllSections();
    document.getElementById('chat').classList.remove('d-none');
    loadChat();
}

function hideAllSections() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('d-none');
    });
}

// Dashboard
async function loadDashboardStats() {
    try {
        // Contar usuários online
        const onlineUsersSnapshot = await db.collection('users')
            .where('online', '==', true)
            .get();
        document.getElementById('onlineUsers').textContent = onlineUsersSnapshot.size;
        
        // Contar ATAs de hoje
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        const atasHojeSnapshot = await db.collection('atas')
            .where('data', '>=', hoje)
            .get();
        document.getElementById('atasHoje').textContent = atasHojeSnapshot.size;
        
        // Contar mensagens do chat
        const chatSnapshot = await db.collection('chat')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        document.getElementById('chatMessages').textContent = chatSnapshot.size;
        
        // Contar total de usuários
        const totalUsersSnapshot = await db.collection('users').get();
        document.getElementById('totalUsers').textContent = totalUsersSnapshot.size;
        
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// ATAs
function showAtaModal(ata = null) {
    const modal = new bootstrap.Modal(document.getElementById('ataModal'));
    const form = document.getElementById('ataForm');
    
    if (ata) {
        document.getElementById('modalTitle').textContent = 'Editar ATA';
        document.getElementById('ataId').value = ata.id;
        document.getElementById('titulo').value = ata.titulo;
        document.getElementById('descricao').value = ata.descricao;
        document.getElementById('data').value = ata.data;
        document.getElementById('responsavel').value = ata.responsavel;
        document.getElementById('condominio').value = ata.condominio;
        document.getElementById('status').value = ata.status;
        document.getElementById('participantes').value = ata.participantes;
    } else {
        document.getElementById('modalTitle').textContent = 'Nova ATA';
        form.reset();
        document.getElementById('data').value = new Date().toISOString().split('T')[0];
        document.getElementById('status').value = 'pendente';
        document.getElementById('ataId').value = '';
    }
    
    modal.show();
}

async function saveAta() {
    if (!currentUser) {
        alert('Você precisa estar logado!');
        return;
    }
    
    const form = document.getElementById('ataForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const ataData = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        data: document.getElementById('data').value,
        responsavel: document.getElementById('responsavel').value,
        condominio: document.getElementById('condominio').value,
        status: document.getElementById('status').value,
        participantes: document.getElementById('participantes').value.split(',').map(p => p.trim()),
        criadoPor: currentUser.uid,
        criadoPorNome: currentUser.displayName || currentUser.email,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    const ataId = document.getElementById('ataId').value;
    
    try {
        if (ataId) {
            // Atualizar ATA existente
            await db.collection('atas').doc(ataId).update(ataData);
            showAlert('success', 'ATA atualizada com sucesso!');
        } else {
            // Criar nova ATA
            const docRef = await db.collection('atas').add(ataData);
            showAlert('success', 'ATA criada com sucesso!');
            
            // Enviar email de notificação
            enviarEmailAta(ataData, docRef.id, 'criacao');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('ataModal'));
        modal.hide();
        
    } catch (error) {
        console.error('Erro ao salvar ATA:', error);
        showAlert('danger', 'Erro ao salvar ATA: ' + error.message);
    }
}

function loadAtas() {
    if (unsubscribeAtas) unsubscribeAtas();
    
    unsubscribeAtas = db.collection('atas')
        .orderBy('criadoEm', 'desc')
        .onSnapshot((snapshot) => {
            const atasList = document.getElementById('atasList');
            atasList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const ata = { id: doc.id, ...doc.data() };
                renderAtaItem(ata);
            });
            
            loadDashboardStats();
        }, (error) => {
            console.error('Erro ao carregar ATAs:', error);
        });
}

function renderAtaItem(ata) {
    const atasList = document.getElementById('atasList');
    const ataDate = new Date(ata.data);
    const formattedDate = ataDate.toLocaleDateString('pt-BR');
    
    const statusClass = {
        'pendente': 'text-warning',
        'concluido': 'text-success',
        'cancelado': 'text-danger'
    }[ata.status] || '';
    
    const ataItem = document.createElement('div');
    ataItem.className = `ata-item ${ata.status}`;
    ataItem.innerHTML = `
        <div class="ata-header">
            <div>
                <h6 class="ata-title">${ata.titulo}</h6>
                <div class="ata-meta">
                    <span class="badge ${statusClass}">${ata.status.toUpperCase()}</span>
                    <span class="ms-2">${formattedDate}</span>
                    <span class="ms-2">•</span>
                    <span class="ms-2">${ata.condominio}</span>
                    <span class="ms-2">•</span>
                    <span class="ms-2">Responsável: ${ata.responsavel}</span>
                </div>
            </div>
            <div class="ata-actions">
                ${currentUser && (currentUser.uid === ata.criadoPor || currentUser.uid === 'admin') ? `
                    <button class="btn btn-sm btn-outline-primary" onclick="showAtaModal(${JSON.stringify(ata).replace(/"/g, '&quot;')})">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAta('${ata.id}')">
                        Excluir
                    </button>
                ` : ''}
            </div>
        </div>
        <p class="mb-2">${ata.descricao}</p>
        ${ata.participantes && ata.participantes.length > 0 ? `
            <div class="mt-2">
                <small class="text-muted">Participantes: ${ata.participantes.join(', ')}</small>
            </div>
        ` : ''}
        <div class="mt-2 text-end">
            <small class="text-muted">
                Criado por ${ata.criadoPorNome} em ${new Date(ata.criadoEm?.toDate()).toLocaleString('pt-BR')}
            </small>
        </div>
    `;
    
    atasList.appendChild(ataItem);
}

async function deleteAta(ataId) {
    if (!confirm('Tem certeza que deseja excluir esta ATA?')) {
        return;
    }
    
    try {
        await db.collection('atas').doc(ataId).delete();
        showAlert('success', 'ATA excluída com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir ATA:', error);
        showAlert('danger', 'Erro ao excluir ATA: ' + error.message);
    }
}

function filterAtas() {
    const dataFilter = document.getElementById('dataFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    if (unsubscribeAtas) unsubscribeAtas();
    
    let query = db.collection('atas').orderBy('criadoEm', 'desc');
    
    if (dataFilter) {
        const selectedDate = new Date(dataFilter);
        const startDate = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endDate = new Date(selectedDate.setHours(23, 59, 59, 999));
        
        query = query.where('data', '>=', startDate.toISOString().split('T')[0])
                    .where('data', '<=', endDate.toISOString().split('T')[0]);
    }
    
    if (statusFilter !== 'all') {
        query = query.where('status', '==', statusFilter);
    }
    
    unsubscribeAtas = query.onSnapshot((snapshot) => {
        const atasList = document.getElementById('atasList');
        atasList.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const ata = { id: doc.id, ...doc.data() };
            renderAtaItem(ata);
        });
    }, (error) => {
        console.error('Erro ao filtrar ATAs:', error);
    });
}

// Chat
function loadChat() {
    if (unsubscribeChat) unsubscribeChat();
    if (unsubscribeUsers) unsubscribeUsers();
    
    // Carregar mensagens do chat
    unsubscribeChat = db.collection('chat')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            const chatMessagesList = document.getElementById('chatMessagesList');
            const messages = [];
            
            snapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            
            messages.sort((a, b) => a.timestamp?.toDate() - b.timestamp?.toDate());
            
            chatMessagesList.innerHTML = '';
            messages.forEach((message) => {
                renderMessage(message);
            });
            
            scrollChatToBottom();
            loadDashboardStats();
        }, (error) => {
            console.error('Erro ao carregar chat:', error);
        });
    
    // Carregar usuários online
    unsubscribeUsers = db.collection('users')
        .where('online', '==', true)
        .onSnapshot((snapshot) => {
            const onlineUsersList = document.getElementById('onlineUsersList');
            onlineUsersList.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const user = { id: doc.id, ...doc.data() };
                renderOnlineUser(user);
            });
            
            loadDashboardStats();
        }, (error) => {
            console.error('Erro ao carregar usuários online:', error);
        });
}

function renderMessage(message) {
    const chatMessagesList = document.getElementById('chatMessagesList');
    const isOwnMessage = message.userId === currentUser?.uid;
    
    const messageTime = message.timestamp?.toDate().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isOwnMessage ? 'own' : 'other'}`;
    messageDiv.innerHTML = `
        <div class="message-sender">${message.userName}</div>
        <div class="message-content">${message.text}</div>
        <div class="message-time">${messageTime}</div>
    `;
    
    chatMessagesList.appendChild(messageDiv);
}

function renderOnlineUser(user) {
    const onlineUsersList = document.getElementById('onlineUsersList');
    
    const userDiv = document.createElement('div');
    userDiv.className = 'online-user';
    userDiv.innerHTML = `
        <div class="online-status online"></div>
        <div class="user-info">
            <div class="user-name">${user.name}</div>
            <small class="text-muted">${user.email}</small>
        </div>
    `;
    
    onlineUsersList.appendChild(userDiv);
}

async function sendMessage() {
    if (!currentUser) {
        alert('Você precisa estar logado para enviar mensagens!');
        return;
    }
    
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) {
        return;
    }
    
    try {
        await db.collection('chat').add({
            text: messageText,
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        messageInput.value = '';
        messageInput.focus();
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        showAlert('danger', 'Erro ao enviar mensagem: ' + error.message);
    }
}

function scrollChatToBottom() {
    const chatMessages = document.getElementById('chatMessagesList');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Utilitários
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = `
        top: 80px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
    `;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!currentUser) {
        showLoginModal();
    }
    
    // Configurar envio de mensagem com Enter
    document.getElementById('messageInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Configurar envio de formulário ATA com Enter
    document.getElementById('ataForm')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.type !== 'textarea') {
            e.preventDefault();
        }
    });
});

// Limpar listeners quando a página for fechada
window.addEventListener('beforeunload', function() {
    if (unsubscribeAtas) unsubscribeAtas();
    if (unsubscribeChat) unsubscribeChat();
    if (unsubscribeUsers) unsubscribeUsers();
    
    // Atualizar status para offline
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({
            online: false,
            status: 'offline',
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
});
