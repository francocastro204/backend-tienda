// Conectar con Socket.io
const socket = io();

// Variables globales
let userName = '';
let connectedUsersCount = 0;

// Elementos del DOM
const formAddProduct = document.getElementById("form-add-product");
const formDeleteProduct = document.getElementById("form-delete-product");
const productsTable = document.querySelector("tbody");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const userInfo = document.getElementById("userInfo");
const userNameElement = document.getElementById("userName");
const connectedUsersElement = document.getElementById("connectedUsers");

// Función para pedir nombre del usuario
function askUserName() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">¡Bienvenido!</h5>
                    </div>
                    <div class="modal-body">
                        <p>Por favor, ingresa tu nombre para continuar:</p>
                        <input type="text" class="form-control" id="userNameInput" placeholder="Tu nombre" maxlength="20">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" id="confirmName">Continuar</button>
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

// Preview de imagen
imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = "none";
    }
});

// Manejar envío del formulario de agregar producto
formAddProduct.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formAddProduct);

    // Validar datos básicos
    if (
        !formData.get("title") ||
        !formData.get("description") ||
        !formData.get("price") ||
        !formData.get("stock") ||
        !formData.get("code") ||
        !formData.get("category")
    ) {
        showMessage("Por favor completa todos los campos obligatorios", "error");
        return;
    }

    try {
        // Si hay imagen, subirla primero
        let imageUrl = "";
        if (formData.get("image") && formData.get("image").size > 0) {
            const uploadFormData = new FormData();
            uploadFormData.append("image", formData.get("image"));

            const response = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            });

            if (response.ok) {
                const result = await response.json();
                imageUrl = result.imageUrl;
            } else {
                showMessage("Error al subir la imagen", "error");
                return;
            }
        }

        const productData = {
            title: formData.get("title"),
            description: formData.get("description"),
            price: parseFloat(formData.get("price")),
            stock: parseInt(formData.get("stock")),
            code: formData.get("code"),
            category: formData.get("category"),
            thumbnails: imageUrl ? [imageUrl] : [],
        };

        // Enviar datos al servidor por WebSocket
        socket.emit("addProduct", productData);

        // Limpiar formulario
        formAddProduct.reset();
        imagePreview.style.display = "none";
    } catch (error) {
        console.error("Error:", error);
        showMessage("Error al procesar el formulario", "error");
    }
});

// Manejar envío del formulario de eliminar producto
formDeleteProduct.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(formDeleteProduct);
    const productId = parseInt(formData.get("productId"));

    if (productId && productId > 0) {
        // Enviar ID al servidor por WebSocket
        socket.emit("deleteProduct", productId);

        // Limpiar formulario
        formDeleteProduct.reset();
    } else {
        showMessage("Por favor ingresa un ID válido", "error");
    }
});

// Escuchar cuando se agrega un producto
socket.on("productAdded", (product) => {
    console.log("Producto agregado:", product);

    // Crear nueva fila en la tabla
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <th scope="row">${product.id}</th>
        <td><img src="${product.thumbnails && product.thumbnails[0]
            ? product.thumbnails[0]
            : "https://via.placeholder.com/100x100?text=Sin+Imagen"
        }" alt="${product.title
        }" width="100" class="img-thumbnail rounded"></td>
        <td>${product.title}</td>
        <td>${product.description}</td>
        <td>$${product.price}</td>
        <td>${product.stock}</td>
        <td>${product.code}</td>
        <td>${product.category}</td>
    `;

    // Agregar la fila al final de la tabla
    productsTable.appendChild(newRow);

    // Mostrar mensaje de éxito
    showMessage("Producto agregado exitosamente!", "success");
});

// Escuchar cuando se elimina un producto
socket.on("productDeleted", (productId) => {
    console.log("Producto eliminado:", productId);

    // Buscar y eliminar la fila de la tabla
    const rows = productsTable.querySelectorAll("tr");
    rows.forEach((row) => {
        const idCell = row.querySelector("th");
        if (idCell && parseInt(idCell.textContent) === productId) {
            row.remove();
        }
    });

    // Mostrar mensaje de éxito
    showMessage("Producto eliminado exitosamente!", "success");
});

// Escuchar errores
socket.on("error", (error) => {
    console.error("Error:", error);
    showMessage(error.message, "error");
});

// Función para mostrar mensajes
function showMessage(message, type) {
    // Crear elemento de mensaje
    const messageDiv = document.createElement("div");
    messageDiv.className = `alert alert-${type === "success" ? "success" : "danger"
        } alert-dismissible fade show position-fixed`;
    messageDiv.style.top = "20px";
    messageDiv.style.right = "20px";
    messageDiv.style.zIndex = "9999";
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Agregar al body
    document.body.appendChild(messageDiv);

    // Remover después de 3 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}

// Mostrar mensaje de conexión
socket.on("connect", async () => {
    console.log("Conectado al servidor WebSocket");
    
    // Solo pedir nombre si estamos en la página de realTimeProducts
    if (window.location.pathname === '/realtimeproducts') {
        try {
            await askUserName();
            showUserInfo();
            socket.emit('userJoined', userName);
        } catch (error) {
            console.error('Error al obtener nombre:', error);
        }
    }
    
    showMessage("🟢 Conectado en tiempo real!", "success");
});

socket.on("disconnect", () => {
    console.log("Desconectado del servidor WebSocket");
    showMessage("🔴 Desconectado del servidor", "warning");
});

// Escuchar actualización de usuarios conectados
socket.on('usersCount', (count) => {
    connectedUsersCount = count;
    if (connectedUsersElement) {
        connectedUsersElement.textContent = `Usuarios conectados: ${count}`;
    }
});

// Función para mostrar información del usuario
function showUserInfo() {
    if (userInfo && userNameElement) {
        userNameElement.textContent = `Usuario conectado: ${userName}`;
        userInfo.style.display = 'block';
    }
}

// Función para ocultar información del usuario
function hideUserInfo() {
    if (userInfo) {
        userInfo.style.display = 'none';
    }
}

// Verificar la página actual al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/') {
        hideUserInfo();
    }
});
