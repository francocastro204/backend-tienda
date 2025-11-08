import { Router } from "express";
import mongoose from "mongoose";
import { ProductManager } from "../dao/ProductManager.js";
import {
    validateProductFields,
    normalizeProductData,
    buildSortObject,
    sendJsonSuccess,
    sendJsonError,
} from "../utils/validators.js";

const router = Router();

// GET / - Listar productos
router.get("/", async (req, res) => {
    let { page, limit, sort, query } = req.query;
    if (!page) page = 1;
    if (!limit) limit = 10;

    let filterQuery = {};
    if (query) {
        const [key, value] = query.split(":");
        if (key === "category") {
            filterQuery.category = value;
        } else if (key === "status") {
            filterQuery.status = value === "true";
        }
    }

    const sortObj = buildSortObject(sort);

    try {
        const resProducts = await ProductManager.getProducts(
            page,
            limit,
            filterQuery,
            sortObj
        );

        const baseUrl = "/api/products";
        let prevLink = null;
        let nextLink = null;

        if (resProducts.hasPrevPage) {
            let prevParams = `page=${resProducts.prevPage}&limit=${limit}`;
            if (sort) prevParams += `&sort=${sort}`;
            if (query) prevParams += `&query=${query}`;
            prevLink = `${baseUrl}?${prevParams}`;
        }

        if (resProducts.hasNextPage) {
            let nextParams = `page=${resProducts.nextPage}&limit=${limit}`;
            if (sort) nextParams += `&sort=${sort}`;
            if (query) nextParams += `&query=${query}`;
            nextLink = `${baseUrl}?${nextParams}`;
        }

        res.setHeader("Content-Type", "application/json");
        res.status(200).json({
            status: "success",
            payload: resProducts.docs,
            totalPages: resProducts.totalPages,
            prevPage: resProducts.prevPage || null,
            nextPage: resProducts.nextPage || null,
            page: resProducts.page,
            hasPrevPage: resProducts.hasPrevPage,
            hasNextPage: resProducts.hasNextPage,
            prevLink: prevLink,
            nextLink: nextLink,
        });
    } catch (error) {
        console.error(`Error al obtener los productos.\nError: ${error.message}`);
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

// POST / - Agregar producto
router.post("/", async (req, res) => {
    try {
        const nuevoProducto = req.body;

        const validationErrors = validateProductFields(nuevoProducto, false);
        if (validationErrors.length > 0) {
            return sendJsonError(res, 400, validationErrors[0]);
        }

        const productoNormalizado = normalizeProductData(nuevoProducto);
        const producto = await ProductManager.createProduct(productoNormalizado);

        sendJsonSuccess(res, 201, producto, "Producto creado correctamente");
    } catch (error) {
        console.error("Error al crear producto:", error.message);
        const statusCode = error.message.includes("Ya existe") ? 409 : 500;
        sendJsonError(res, statusCode, error.message);
    }
});

// GET /:pid - Obtener por ID
router.get("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return sendJsonError(res, 400, "ID inválido");
        }

        const producto = await ProductManager.getProductById(pid);

        if (!producto) {
            return sendJsonError(res, 404, "Producto no encontrado");
        }

        sendJsonSuccess(res, 200, producto);
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.pid}:`, error.message);
        sendJsonError(res, 500, error.message);
    }
});

// PUT /:pid - Actualizar
router.put("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return sendJsonError(res, 400, "ID inválido");
        }

        const actualizarProducto = req.body;
        const validationErrors = validateProductFields(actualizarProducto, true);
        if (validationErrors.length > 0) {
            return sendJsonError(res, 400, validationErrors[0]);
        }

        const cambiosNormalizados = normalizeProductData(actualizarProducto);
        const producto = await ProductManager.update(pid, cambiosNormalizados);

        if (!producto) {
            return sendJsonError(res, 404, "Producto no encontrado");
        }

        sendJsonSuccess(res, 200, producto, "Producto actualizado correctamente");
    } catch (error) {
        console.error(`Error al actualizar producto ${req.params.pid}:`, error.message);
        sendJsonError(res, 500, error.message);
    }
});

// DELETE /:pid - Eliminar
router.delete("/:pid", async (req, res) => {
    try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return sendJsonError(res, 400, "ID inválido");
        }

        const producto = await ProductManager.delete(pid);

        if (!producto) {
            return sendJsonError(res, 404, "Producto no encontrado");
        }

        sendJsonSuccess(res, 200, producto, "Producto eliminado correctamente");
    } catch (error) {
        console.error(`Error al eliminar producto ${req.params.pid}:`, error.message);
        sendJsonError(res, 500, error.message);
    }
});

export default router;
