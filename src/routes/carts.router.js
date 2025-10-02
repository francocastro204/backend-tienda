const { Router } = require("express");
const { CartManager } = require("../dao/CartManager");
const { ProductManager } = require("../dao/ProductManager");
const { isValidId, parseValidId } = require("../utils/validators");

const router = Router();

// POST / - Crear nuevo carrito
router.post("/", async (req, res) => {
    try {
        const nuevoCarrito = await CartManager.createCart();
        console.log(`POST /api/carts - Carrito creado con ID: ${nuevoCarrito.id}`);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({
            success: true,
            data: nuevoCarrito,
            message: "Carrito creado correctamente"
        });
    } catch (error) {
        console.error("Error al crear carrito:", error.message);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /:cid - Obtener carrito por ID
router.get("/:cid", async (req, res) => {
    try {
        const { cid } = req.params;

        if (!isValidId(cid)) {
            return res.status(400).json({
                success: false,
                error: "ID debe ser un número entero positivo"
            });
        }

        const cartId = parseValidId(cid);
        const carrito = await CartManager.getCartById(cartId);
        console.log(`GET /api/carts/${cid} - Carrito encontrado con ${carrito.products.length} productos`);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            data: carrito
        });
    } catch (error) {
        console.error(`Error al obtener carrito ${req.params.cid}:`, error.message);

        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
});

// POST /:cid/product/:pid - Agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        const { cid, pid } = req.params;

        if (!isValidId(cid)) {
            return res.status(400).json({
                success: false,
                error: "ID del carrito debe ser un número entero positivo"
            });
        }

        if (!isValidId(pid)) {
            return res.status(400).json({
                success: false,
                error: "ID del producto debe ser un número entero positivo"
            });
        }

        const cartId = parseValidId(cid);
        const productId = parseValidId(pid);

        // Verificar que el producto existe
        await ProductManager.getProductById(productId);

        const carritoActualizado = await CartManager.addProductToCart(cartId, productId);
        console.log(`POST /api/carts/${cid}/product/${pid} - Producto agregado al carrito`);

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({
            success: true,
            data: carritoActualizado,
            message: "Producto agregado al carrito correctamente"
        });
    } catch (error) {
        console.error(`Error al agregar producto ${req.params.pid} al carrito ${req.params.cid}:`, error.message);

        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
