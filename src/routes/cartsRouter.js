import { Router } from "express";
import mongoose from "mongoose";
import { CartManager } from "../dao/CartManager.js";
import { ProductManager } from "../dao/ProductManager.js";
import { sendJsonSuccess, sendJsonError } from "../utils/validators.js";

const router = Router();

// GET / - Listar todos los carritos
router.get("/", async (req, res) => {
    try {
        const carritos = await CartManager.getAllCarts();
        sendJsonSuccess(res, 200, carritos);
    } catch (error) {
        console.error("Error al obtener carritos:", error.message);
        sendJsonError(res, 500, error.message);
    }
});

// POST / - Crear nuevo carrito
router.post("/", async (req, res) => {
    try {
        const { title } = req.body;
        const nuevoCarrito = await CartManager.createCart(title || null);
        sendJsonSuccess(res, 201, nuevoCarrito, "Carrito creado correctamente");
    } catch (error) {
        console.error("Error al crear carrito:", error.message);
        sendJsonError(res, 500, error.message);
    }
});

// GET /:cid - Obtener carrito por ID con populate
router.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return sendJsonError(res, 400, "ID inválido");
        }

        const carrito = await CartManager.getCartById(cid);
        sendJsonSuccess(res, 200, carrito);
    } catch (error) {
        console.error(`Error al obtener carrito ${req.params.cid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

// POST /:cid/product/:pid - Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return sendJsonError(res, 400, "ID del carrito inválido");
        }

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return sendJsonError(res, 400, "ID del producto inválido");
        }

        const producto = await ProductManager.getProductById(pid);
        if (!producto) {
            return sendJsonError(res, 404, "Producto no encontrado");
        }

        const carritoActualizado = await CartManager.addProductToCart(cid, pid);
        sendJsonSuccess(res, 200, carritoActualizado, "Producto agregado al carrito correctamente");
    } catch (error) {
        console.error(`Error al agregar producto ${req.params.pid} al carrito ${req.params.cid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

// DELETE /:cid/products/:pid - Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return sendJsonError(res, 400, "ID del carrito inválido");
        }

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return sendJsonError(res, 400, "ID del producto inválido");
        }

        const carritoActualizado = await CartManager.removeProductFromCart(cid, pid);
        sendJsonSuccess(res, 200, carritoActualizado, "Producto eliminado del carrito correctamente");
    } catch (error) {
        console.error(`Error al eliminar producto ${req.params.pid} del carrito ${req.params.cid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

// PUT /:cid - Actualizar todos los productos del carrito
router.put("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return sendJsonError(res, 400, "ID del carrito inválido");
        }

        const { products } = req.body;

        if (!Array.isArray(products)) {
            return sendJsonError(res, 400, "Debe enviar un array de productos");
        }

        const carritoActualizado = await CartManager.updateCartProducts(cid, products);
        sendJsonSuccess(res, 200, carritoActualizado, "Carrito actualizado correctamente");
    } catch (error) {
        console.error(`Error al actualizar carrito ${req.params.cid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

// PUT /:cid/products/:pid - Actualizar solo la cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return sendJsonError(res, 400, "ID del carrito inválido");
        }

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return sendJsonError(res, 400, "ID del producto inválido");
        }

        const { quantity } = req.body;

        if (quantity === undefined || quantity === null) {
            return sendJsonError(res, 400, "Debe enviar la cantidad (quantity)");
        }

        if (typeof quantity !== 'number' || quantity < 0) {
            return sendJsonError(res, 400, "La cantidad debe ser un número mayor o igual a 0");
        }

        const carritoActualizado = await CartManager.updateProductQuantity(cid, pid, quantity);
        sendJsonSuccess(res, 200, carritoActualizado, "Cantidad actualizada correctamente");
    } catch (error) {
        console.error(`Error al actualizar cantidad del producto ${req.params.pid} en el carrito ${req.params.cid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

// DELETE /:cid - Eliminar todos los productos del carrito (vaciar carrito)
router.delete("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return sendJsonError(res, 400, "ID del carrito inválido");
        }

        const carritoActualizado = await CartManager.clearCart(cid);
        sendJsonSuccess(res, 200, carritoActualizado, "Carrito vaciado correctamente");
    } catch (error) {
        console.error(`Error al vaciar carrito ${req.params.cid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

export default router;
