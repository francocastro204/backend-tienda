const express = require("express");
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const ChatLogger = require('./utils/ChatLogger');

// Importar routers
const productsRouter = require("./routes/productsRouter.js");
const cartsRouter = require("./routes/cartsRouter.js");
const vistasRouter = require("./routes/viewsRouter.js");

const PORT = 3000;
const app = express();

// Inicializar logger
const chatLogger = new ChatLogger();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('./src/public'));

// Configurar Multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Middleware global para Multer
app.use(upload.single('image'));

// Configurar handlebars
app.engine("hbs", engine({
    extname: 'hbs',
    layoutsDir: './src/views/layouts',
    defaultLayout: 'main'
}));
app.set('view engine', 'hbs');
app.set('views', './src/views');

// Ruta para subir imágenes
app.post('/api/upload', (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ imageUrl });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

// Ruta para obtener logs del chat
app.get('/api/logs', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = chatLogger.getRecentLogs(limit);
        res.json({ logs, total: logs.length });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener logs' });
    }
});

// Manejar errores de Multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
        }
    }
    if (error.message === 'Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)') {
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

// Configurar routers para el API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Configurar routers para las vistas html.
app.use("/", vistasRouter);

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Server escuchando el puerto ${PORT}`)
})

// Configurar Socket.io
const io = new Server(server);

// Contador de usuarios conectados
let connectedUsers = 0;
let chatUsers = new Set();

// Manejar conexiones WebSocket
io.on('connection', (socket) => {
    chatLogger.addLog('connection', `Cliente conectado: ${socket.id}`, { socketId: socket.id });
    connectedUsers++;
    
    // Enviar contador actualizado a todos los clientes
    io.emit('usersCount', connectedUsers);
    
    socket.on('disconnect', () => {
        chatLogger.addLog('disconnection', `Cliente desconectado: ${socket.id}`, { socketId: socket.id });
        connectedUsers--;
        
        // Si el usuario estaba en el chat, removerlo
        if (socket.userName && chatUsers.has(socket.userName)) {
            chatUsers.delete(socket.userName);
            
            // Enviar mensaje del sistema
            const systemMessage = {
                type: 'system',
                message: `${socket.userName} abandonó el chat`,
                time: new Date().toLocaleTimeString()
            };
            
            io.emit('systemMessage', systemMessage);
            io.emit('chatUsersCount', chatUsers.size);
            
            chatLogger.addLog('user_left', `${socket.userName} abandonó el chat`, { userName: socket.userName });
        }
        
        // Enviar contador actualizado a todos los clientes
        io.emit('usersCount', connectedUsers);
    });
    
    // Escuchar cuando un usuario se une
    socket.on('userJoined', (userName) => {
        chatLogger.addLog('user_joined', `Usuario ${userName} se unió`, { userName: userName });
        socket.userName = userName;
    });
    
    // Escuchar cuando un usuario se une al chat
    socket.on('userJoinedChat', (userName) => {
        chatLogger.addLog('user_joined_chat', `Usuario ${userName} se unió al chat`, { userName: userName });
        socket.userName = userName;
        chatUsers.add(userName);
        
        // Enviar mensaje del sistema
        const systemMessage = {
            type: 'system',
            message: `${userName} se unió al chat`,
            time: new Date().toLocaleTimeString()
        };
        
        io.emit('systemMessage', systemMessage);
        io.emit('chatUsersCount', chatUsers.size);
    });
    
    // Escuchar mensajes del chat
    socket.on('chatMessage', (messageData) => {
        chatLogger.addLog('chat_message', `Mensaje de ${messageData.userName}: ${messageData.message}`, messageData);
        
        // Reenviar el mensaje a todos los clientes
        io.emit('chatMessage', messageData);
    });

    // Escuchar cuando se agrega un producto
    socket.on('addProduct', async (productData) => {
        try {
            const { ProductManager } = require('./dao/ProductManager');
            const newProduct = await ProductManager.addProduct(productData);

            // Emitir a todos los clientes conectados
            io.emit('productAdded', newProduct);
            chatLogger.addLog('product_added', `Producto agregado: ${newProduct.title}`, newProduct);
        } catch (error) {
            socket.emit('error', { message: 'Error al agregar producto' });
            chatLogger.addLog('error', `Error al agregar producto: ${error.message}`, { error: error.message });
        }
    });

    // Escuchar cuando se elimina un producto
    socket.on('deleteProduct', async (productId) => {
        try {
            const { ProductManager } = require('./dao/ProductManager');
            await ProductManager.deleteProduct(productId);

            // Emitir a todos los clientes conectados
            io.emit('productDeleted', productId);
            chatLogger.addLog('product_deleted', `Producto eliminado: ID ${productId}`, { productId: productId });
        } catch (error) {
            socket.emit('error', { message: 'Error al eliminar producto' });
            chatLogger.addLog('error', `Error al eliminar producto: ${error.message}`, { error: error.message });
        }
    });
});
