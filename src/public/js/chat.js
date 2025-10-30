// Conectar con Socket.io
const socket = io();

// Variables globales
let userName = '';
let chatUsersCount = 0;

// Elementos del DOM
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const chatUsersCountElement = document.getElementById('chatUsersCount');

// Verificar que los elementos existan
console.log('Elementos del DOM:', {
    chatForm: !!chatForm,
    messageInput: !!messageInput,
    chatMessages: !!chatMessages,
    chatUsersCountElement: !!chatUsersCountElement
});

// Función para pedir nombre del usuario
function askUserName() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">¡Bienvenido al Chat!</h5>
                    </div>
                    <div class="modal-body">
                        <p>Por favor, ingresa tu nombre para chatear:</p>
                        <input type="text" class="form-control" id="userNameInput" placeholder="Tu nombre" maxlength="20">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="confirmName">Entrar al Chat</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        const userNameInput = document.getElementById('userNameInput');
        const confirmBtn = document.getElementById('confirmName');
        
        confirmBtn.addEventListener('click', () => {
            const name = userNameInput.value.trim();
            if (name) {
                userName = name;
                bootstrapModal.hide();
                modal.remove();
                resolve(name);
            } else {
                showMessage('Por favor ingresa un nombre válido', 'error');
            }
        });
        
        userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });
        
        userNameInput.focus();
    });
}

// Función para mostrar mensajes
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`;
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '9999';
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Función para agregar mensaje al chat
function addMessageToChat(messageData) {
    const messageDiv = document.createElement('div');
    const isOwnMessage = messageData.userName === userName;
    const isSystemMessage = messageData.type === 'system';
    
    if (isSystemMessage) {
        messageDiv.className = 'message system';
        messageDiv.innerHTML = `
            <div class="message-content">${messageData.message}</div>
            <div class="message-time">${messageData.time}</div>
        `;
    } else {
        messageDiv.className = `message ${isOwnMessage ? 'own' : 'other'}`;
        messageDiv.innerHTML = `
            <div class="message-header">${messageData.userName}</div>
            <div class="message-content">${messageData.message}</div>
            <div class="message-time">${messageData.time}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll hacia abajo
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    console.log('Mensaje agregado:', messageData);
}

// Función para limpiar mensajes de bienvenida
function clearWelcomeMessage() {
    const welcomeMessage = chatMessages.querySelector('.text-center.text-muted');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
}

// Manejar envío del formulario de chat
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const message = messageInput ? messageInput.value.trim() : '';
        console.log('Enviando mensaje:', message, 'Usuario:', userName);
        
        if (message && userName) {
            const messageData = {
                userName: userName,
                message: message,
                time: new Date().toLocaleTimeString()
            };
            
            console.log('Datos del mensaje:', messageData);
            
            // Enviar mensaje al servidor
            socket.emit('chatMessage', messageData);
            
            // Limpiar input
            if (messageInput) {
                messageInput.value = '';
            }
        } else {
            console.log('No se puede enviar mensaje - mensaje vacío o sin usuario');
        }
    });
}

// Eventos de Socket.io
socket.on('connect', async () => {
    console.log('Conectado al servidor WebSocket');
    
    // Solo pedir nombre si estamos en la página de chat
    if (window.location.pathname === '/chat') {
        try {
            await askUserName();
            socket.emit('userJoinedChat', userName);
            clearWelcomeMessage();
            showMessage('🟢 Conectado al chat!', 'success');
        } catch (error) {
            console.error('Error al obtener nombre:', error);
        }
    }
});

socket.on('disconnect', () => {
    console.log('Desconectado del servidor WebSocket');
    showMessage('🔴 Desconectado del chat', 'warning');
});

// Escuchar mensajes del chat
socket.on('chatMessage', (messageData) => {
    console.log('Mensaje recibido:', messageData);
    addMessageToChat(messageData);
});

// Escuchar mensajes del sistema
socket.on('systemMessage', (messageData) => {
    console.log('Mensaje del sistema recibido:', messageData);
    addMessageToChat(messageData);
});

// Escuchar actualización de usuarios en chat
socket.on('chatUsersCount', (count) => {
    console.log('Usuarios en chat:', count);
    chatUsersCount = count;
    if (chatUsersCountElement) {
        chatUsersCountElement.textContent = `Usuarios en chat: ${count}`;
    }
});

// Manejar tecla Enter en el input
if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Auto-focus en el input de mensaje
if (messageInput) {
    messageInput.focus();
}
