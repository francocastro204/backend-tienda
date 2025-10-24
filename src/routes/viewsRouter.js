const { Router } = require("express");
const { ProductManager } = require("../dao/ProductManager");

const router = Router();

router.get('/', async(req, res) => {
    try {
        let productos = await ProductManager.getProducts()

        res.render("home", {
            productos
        });
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(500).json({error:`Internal server error`});
    }
});

router.get('/realtimeproducts', async(req, res) => {
    try {
        let productos = await ProductManager.getProducts()

        res.render("realtimeproducts", {
            productos
        });
    } catch (error) {
        res.setHeader('Content-Type','application/json');
        return res.status(500).json({error:`Internal server error`});
    }
});


module.exports = router;

