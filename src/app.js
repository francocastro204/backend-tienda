const express = require("express");
const { ProductManager } = require("./dao/ProductManager");

const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Rutas - /api/products - Consultar Productos
app.get("/api/products", async (req, res) => {
    try {
        const productos = await ProductManager.getProducts();

        console.log(productos);
        res.send(productos);
        res.status(200);

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Rutas - /api/products - Agregar Producto
app.post("/api/products", async (req, res) => {
    try {
        const nuevoProducto = req.body;
        const producto = await ProductManager.addProduct(nuevoProducto);
        console.log(producto);
        res.send(producto);
        res.status(200);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Rutas - /api/products/:pid - Obtener Producto por ID
app.get("/api/products/:pid", async (req, res) => {
    try {
        const { pid } = req.params;
        const producto = await ProductManager.getProductById(pid);
        console.log(producto);
        res.send(producto);
        res.status(200);

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});



const server = app.listen(PORT, () => {
    console.log(`Server escuchando el puerto ${PORT}`)
})

