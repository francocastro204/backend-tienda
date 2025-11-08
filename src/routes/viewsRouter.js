import { Router } from "express";
import mongoose from "mongoose";
import { ProductManager } from "../dao/ProductManager.js";
import { CartManager } from "../dao/CartManager.js";
import { buildSortObject } from "../utils/validators.js";

const router = Router();

router.get('/', async (req, res) => {
    let { page, limit, sort, searchType, searchValue } = req.query;
    if (!page) page = 1;
    if (!limit) limit = 10;

    let filterQuery = {};
    if (searchType && searchValue) {
        if (searchType === 'category') {
            filterQuery.category = { $regex: searchValue, $options: 'i' };
        } else if (searchType === 'status') {
            const statusValue = searchValue.toLowerCase();
            if (statusValue === 'true' || statusValue === 'disponible' || statusValue === '1') {
                filterQuery.status = true;
            } else if (statusValue === 'false' || statusValue === 'no disponible' || statusValue === '0') {
                filterQuery.status = false;
            }
        }
    }

    const sortObj = buildSortObject(sort);

    try {
        const responseGetProducts = await ProductManager.getProducts(page, limit, filterQuery, sortObj);
        const productos = responseGetProducts.docs;
        const {
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            totalDocs,
        } = responseGetProducts;

        res.render("home", {
            productos,
            totalPages,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            page,
            totalDocs,
            limit: Number.parseInt(limit, 10),
            sort: sort || '',
            sortAsc: sort === 'asc',
            sortDesc: sort === 'desc',
            limit10: Number.parseInt(limit, 10) === 10,
            limit20: Number.parseInt(limit, 10) === 20,
            limit50: Number.parseInt(limit, 10) === 50,
            searchType: searchType || '',
            searchValue: searchValue || '',
            searchCategory: searchType === 'category',
            searchStatus: searchType === 'status'
        });
    } catch (error) {
        console.error('Error en GET /:', error);
        res.status(500).render("error", { error: "Error interno del servidor" });
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(pid)) {
            return res.status(400).render("error", { error: "ID inválido" });
        }

        const producto = await ProductManager.getProductById(pid);

        if (!producto) {
            return res.status(404).render("error", { error: "Producto no encontrado" });
        }

        res.render("productDetail", {
            producto
        });
    } catch (error) {
        console.error('Error en GET /products/:pid:', error);
        res.status(500).render("error", { error: "Error interno del servidor" });
    }
});

router.get('/carts', async (req, res) => {
    try {
        const carritos = await CartManager.getAllCarts();

        res.render("carts", {
            carritos: carritos
        });
    } catch (error) {
        console.error('Error en GET /carts:', error);
        res.status(500).render("error", { error: "Error interno del servidor" });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Validar que sea un ObjectId válido
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).render("error", { error: "ID de carrito inválido" });
        }

        const carrito = await CartManager.getCartById(cid);

        if (!carrito) {
            return res.status(404).render("error", { error: "Carrito no encontrado" });
        }

        // Calcular total del carrito
        let total = 0;
        const productsWithSubtotal = carrito.products.map(item => {
            const subtotal = item.product.price * item.quantity;
            total += subtotal;
            return {
                ...item,
                subtotal: subtotal
            };
        });

        res.render("cart", {
            carrito: {
                ...carrito,
                products: productsWithSubtotal
            },
            total: total
        });
    } catch (error) {
        console.error('Error en GET /carts/:cid:', error);
        res.status(500).render("error", { error: "Error interno del servidor" });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    let { page, limit } = req.query
    if (!page) page = 1
    if (!limit) limit = 10
    try {
        const resProducts = await ProductManager.getProducts(page, limit);

        res.render("realtimeproducts", {
            productos: resProducts.docs,
            totalPages: resProducts.totalPages,
            hasPrevPage: resProducts.hasPrevPage,
            hasNextPage: resProducts.hasNextPage,
            prevPage: resProducts.prevPage,
            nextPage: resProducts.nextPage,
            page: resProducts.page,
            totalDocs: resProducts.totalDocs,
            limit: Number.parseInt(limit, 10)
        });
    } catch (error) {
        console.error('Error en GET /realtimeproducts:', error);
        res.status(500).render("error", { error: "Error interno del servidor" });
    }
});

export default router;

