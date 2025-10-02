const { Router } = require("express");
const { ProductManager } = require("../dao/ProductManager");
const { isValidId, parseValidId, validateProductFields, normalizeProductData } = require("../utils/validators");

const router = Router();

// GET / - Listar productos
router.get("/", async (req, res) => {
    try {
        const productos = await ProductManager.getProducts();
        console.log(`GET /api/products - ${productos.length} productos encontrados`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, data: productos });
    } catch (error) {
        console.log(`Error al obtener los productos.\nError: ${error.message}`);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST / - Agregar producto
router.post("/", async (req, res) => {
    try {
        const nuevoProducto = req.body;

        // Validaciones usando la función centralizada
        const validationErrors = validateProductFields(nuevoProducto, false);
        if (validationErrors.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({
                success: false,
                error: validationErrors[0] // Retorna el primer error encontrado
            });
        }
        // Normalización de datos usando la función centralizada
        const productoNormalizado = normalizeProductData(nuevoProducto);

        const producto = await ProductManager.addProduct(productoNormalizado);
        console.log(`POST /api/products - Producto creado: ${producto.title} (ID: ${producto.id})`);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json({ success: true, data: producto, message: "Producto creado correctamente" });
    } catch (error) {
        console.error("Error al crear producto:", error.message);
        const statusCode = error.message.includes("Ya existe") ? 409 : 500;
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// GET /:pid - Obtener por ID
router.get("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        if (!isValidId(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ success: false, error: "ID debe ser un número entero positivo" });
        }

        const productId = parseValidId(pid);
        const producto = await ProductManager.getProductById(productId);
        console.log(`GET /api/products/${pid} - Producto encontrado: ${producto.title}`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, data: producto });
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.pid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// PUT /:pid - Actualizar
router.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        if (!isValidId(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ success: false, error: "ID debe ser un número entero positivo" });
        }

        const productId = parseValidId(pid);
        const actualizarProducto = req.body;

        // Validaciones usando la función centralizada para updates
        const validationErrors = validateProductFields(actualizarProducto, true);
        if (validationErrors.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({
                success: false,
                error: validationErrors[0] // Retorna el primer error encontrado
            });
        }

        // Normalización de datos usando la función centralizada
        const cambiosNormalizados = normalizeProductData(actualizarProducto);

        const producto = await ProductManager.updateProduct(productId, cambiosNormalizados);
        console.log(`PUT /api/products/${pid} - Producto actualizado: ${producto.title}`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, data: producto, message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error(`Error al actualizar producto ${req.params.pid}:`, error.message);
        const statusCode = error.message.includes("No se encontró") ? 404 : 500;
        res.setHeader('Content-Type', 'application/json');
        res.status(statusCode).json({ success: false, error: error.message });
    }
});

// DELETE /:pid - Eliminar
router.delete("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        if (!isValidId(pid)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ success: false, error: "ID debe ser un número entero positivo" });
        }

        const productId = parseValidId(pid);
        const producto = await ProductManager.deleteProduct(productId);
        console.log(`DELETE /api/products/${pid} - Producto eliminado: ${producto.title}`);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente', data: producto });
    } catch (error) {
        console.error(`Error al eliminar producto ${req.params.pid}:`, error.message);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


