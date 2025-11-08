import express from "express";
import { Server } from 'socket.io';
import { connDB } from './config/db.js';
import { config } from './config/config.js';
import { configureHandlebars } from './config/handlebars.js';
import { upload, handleMulterError } from './config/multer.js';
import { configureProductSockets } from './sockets/productSockets.js';

// Importar routers
import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import vistasRouter from "./routes/viewsRouter.js";

const PORT = config.PORT;
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('./src/public'));
app.use(upload.single('image'));

// Configurar Handlebars
configureHandlebars(app);

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

// Manejar errores de Multer
app.use(handleMulterError);

// Configurar routers para el API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Configurar routers para las vistas html.
app.use("/", vistasRouter);

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Server escuchando el puerto ${PORT}`)
})

// Conectar a la base de datos
connDB(config.database.MONGO_URL, config.database.DB_NAME);

// Configurar Socket.io y sus handlers
const io = new Server(server);
configureProductSockets(io);
