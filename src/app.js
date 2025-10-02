const express = require("express");
const productsRouter = require("./routes/productsRouter");
const cartsRouter = require("./routes/cartsRouter");

const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

const server = app.listen(PORT, () => {
    console.log(`Server escuchando el puerto ${PORT}`)
})
