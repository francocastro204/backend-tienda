import { ProductManager } from '../dao/ProductManager.js';

/**
 * Configura los event handlers de Socket.io para productos en tiempo real
 * @param {Object} io - Instancia de Socket.io
 */
export const configureProductSockets = (io) => {
    io.on('connection', (socket) => {
        console.log('Cliente conectado:', socket.id);

        socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
        });

        // Escuchar cuando se agrega un producto
        socket.on('addProduct', async (productData) => {
            try {
                const newProduct = await ProductManager.createProduct(productData);

                // Emitir a todos los clientes conectados
                io.emit('productAdded', newProduct);
                console.log('Producto agregado:', newProduct);
            } catch (error) {
                console.error('Error al agregar producto:', error);
                socket.emit('error', { message: error.message || 'Error al agregar producto' });
            }
        });

        // Escuchar cuando se elimina un producto
        socket.on('deleteProduct', async (productId) => {
            try {
                await ProductManager.delete(productId);

                // Emitir a todos los clientes conectados
                io.emit('productDeleted', productId);
                console.log('Producto eliminado:', productId);
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                socket.emit('error', { message: error.message || 'Error al eliminar producto' });
            }
        });
    });
};

