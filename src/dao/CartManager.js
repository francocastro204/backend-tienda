const fs = require("fs");
const { parseValidId, generateNewId } = require("../utils/validators");

class CartManager {

    static path = "./src/data/carts.json";

    // Método para crear un nuevo carrito.
    static async createCart() {
        // Obtener listado de los carritos.
        let carritos = await this.getCarts();

        // Si pasa todas las validaciones, se debe generar un nuevo ID y crear el carrito.
        const id = generateNewId(carritos);

        const nuevoCarrito = {
            id,
            products: []
        };

        carritos.push(nuevoCarrito);

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(carritos, null, 5));
        } catch (error) {
            throw new Error(`Error al guardar el carrito: ${error.message}`);
        }

        return nuevoCarrito;
    }

    // Método para listar todos los carritos.
    static async getCarts() {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            if (data.trim() === "") {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    static async getCartById(id) {
        const cartId = parseValidId(id);
        if (cartId === null) {
            throw new Error("El ID debe ser un número entero positivo.");
        }

        const carritos = await this.getCarts();
        const carrito = carritos.find(c => c.id === cartId);

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${id}.`);
        }

        return carrito;
    }

    static async addProductToCart(cartId, productId) {
        const parsedCartId = parseValidId(cartId);
        const parsedProductId = parseValidId(productId);

        if (parsedCartId === null) {
            throw new Error("El ID del carrito debe ser un número entero positivo.");
        }
        if (parsedProductId === null) {
            throw new Error("El ID del producto debe ser un número entero positivo.");
        }

        // Obtenemos el listado de carritos.
        const carritos = await this.getCarts();
        const cartIndex = carritos.findIndex(c => c.id === parsedCartId);

        if (cartIndex === -1) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        const carrito = carritos[cartIndex];

        // Buscar si el producto ya existe en el carrito
        const existingProductIndex = carrito.products.findIndex(p => p.product === parsedProductId);

        if (existingProductIndex !== -1) {
            // Si existe, incrementar quantity
            carrito.products[existingProductIndex].quantity += 1;
        } else {
            // Si no existe, agregar nuevo producto con quantity = 1
            carrito.products.push({
                product: parsedProductId,
                quantity: 1
            });
        }

        // Guardar cambios
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(carritos, null, 5));
        } catch (error) {
            throw new Error(`Error al actualizar el carrito: ${error.message}`);
        }

        return carrito;
    }
}

module.exports = { CartManager };
