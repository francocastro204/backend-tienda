const { Router } = require("express");
const { ProductManager } = require("../dao/ProductManager");
const { isValidId } = require("../utils/validators");

const router = Router();

// GET / - Listar productos
router.get("/", async (req, res) => {
    try {
        const productos = await ProductManager.getProducts();
        console.log(`GET /api/products - ${productos.length} productos encontrados`);
        res.status(200).json({ success: true, data: productos });
    } catch (error) {
        console.log(`Error al obtener los productos.\nError: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST / - Agregar producto
router.post("/", async (req, res) => {
    try {
        const nuevoProducto = req.body;
        const producto = await ProductManager.addProduct(nuevoProducto);
        console.log(`POST /api/products - Producto creado: ${producto.title} (ID: ${producto.id})`);
        res.status(201).json({ success: true, data: producto, message: "Producto creado correctamente" });
    } catch (error) {
        console.error("Error al crear producto:", error.message);
        const statusCode = error.message.includes("Ya existe") ? 409 : 400;
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// GET /:pid - Obtener por ID
router.get("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        if (!isValidId(pid)) {
            return res.status(400).json({ success: false, error: "ID debe ser un número entero positivo" });
        }
        const producto = await ProductManager.getProductById(pid);
        console.log(`GET /api/products/${pid} - Producto encontrado: ${producto.title}`);
        res.status(200).json({ success: true, data: producto });
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.pid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// PUT /:pid - Actualizar
router.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        if (!isValidId(pid)) {
            return res.status(400).json({ success: false, error: "ID debe ser un número entero positivo" });
        }
        const actualizarProducto = req.body;
        const producto = await ProductManager.updateProduct(pid, actualizarProducto);
        console.log(`PUT /api/products/${pid} - Producto actualizado: ${producto.title}`);
        res.status(200).json({ success: true, data: producto, message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error(`Error al actualizar producto ${req.params.pid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// DELETE /:pid - Eliminar
router.delete("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        if (!isValidId(pid)) {
            return res.status(400).json({ success: false, error: "ID debe ser un número entero positivo" });
        }
        const producto = await ProductManager.deleteProduct(pid);
        console.log(`DELETE /api/products/${pid} - Producto eliminado: ${producto.title}`);
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente', data: producto });
    } catch (error) {
        console.error(`Error al eliminar producto ${req.params.pid}:`, error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


