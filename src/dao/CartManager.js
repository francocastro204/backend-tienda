import { cartModelo } from "./models/cartModels.js";

export class CartManager {

    static async getAllCarts() {
        const carritos = await cartModelo.find().lean();
        return carritos;
    }

    static async getCartCount() {
        const count = await cartModelo.countDocuments();
        return count;
    }

    static async createCart(title = null) {
        let cartTitle = title;
        if (!cartTitle) {
            const count = await this.getCartCount();
            cartTitle = `Carrito ${count + 1}`;
        }

        const nuevoCarrito = await cartModelo.create({
            title: cartTitle,
            products: [],
        });
        return nuevoCarrito.toJSON();
    }

    static async getCartById(cartId) {
        const carrito = await cartModelo
            .findById(cartId)
            .populate("products.product")
            .lean();

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        return carrito;
    }

    static async addProductToCart(cartId, productId) {
        const carrito = await cartModelo.findById(cartId);

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        const existingProduct = carrito.products.find(
            (p) => p.product.toString() === productId.toString()
        );

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            carrito.products.push({
                product: productId,
                quantity: 1,
            });
        }

        await carrito.save();
        return await this.getCartById(cartId);
    }

    static async removeProductFromCart(cartId, productId) {
        const carrito = await cartModelo.findById(cartId);

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        const updatedProducts = carrito.products.filter(
            (p) => p.product.toString() !== productId.toString()
        );

        carrito.products = updatedProducts;
        await carrito.save();
        return await this.getCartById(cartId);
    }

    static async updateCartProducts(cartId, productsArray) {
        const carrito = await cartModelo.findById(cartId);

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        carrito.products = productsArray;
        await carrito.save();
        return await this.getCartById(cartId);
    }

    static async updateProductQuantity(cartId, productId, quantity) {
        const carrito = await cartModelo.findById(cartId);

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        const product = carrito.products.find(
            (p) => p.product.toString() === productId.toString()
        );

        if (!product) {
            throw new Error(`No se encontró el producto en el carrito.`);
        }

        product.quantity = quantity;
        await carrito.save();
        return await this.getCartById(cartId);
    }

    static async clearCart(cartId) {
        const carrito = await cartModelo.findById(cartId);

        if (!carrito) {
            throw new Error(`No se encontró el carrito con el ID=${cartId}.`);
        }

        carrito.products = [];
        await carrito.save();
        return await this.getCartById(cartId);
    }
}
