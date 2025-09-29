const fs = require("fs");

class ProductManager {

    static path = "./src/data/products.json";

    // Método para agregar un nuevo producto.
    static async addProduct (product) {
        const {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
        } = product;


        // Validaciones de campos requeridos.
        if (!title || !description || !code || !price || !category || !thumbnails) {
            throw new Error("Todos los campos son requeridos");
        }

        // Obtener listado de los productos.
        let productos = await this.getProducts();

        // 1 Validar que code no se repita.
        const existeCodeProducto = productos.find( p => p.code === code);
        if (existeCodeProducto) {
            throw new Error(`Ya existe un producto con el CODE=${code}.`);
        }

        // 2. Validar que el stock sea un numero entero, positivo y mayor o igual a 0.
        if ( typeof stock !== "number" || stock < 0) {
            throw new Error("El stock debe ser un número entero, positivo y mayor o igual a 0");
        }

        // 3. Validar que el price sea un numero, positivo y mayor o igual a 0.
        if ( typeof price !== "number" || price < 0) {
            throw new Error("El precio debe ser un número, positivo y mayor o igual a 0");
        }

        // 4. Validar que el status sea un booleano.
        if ( typeof status !== "boolean") {
            throw new Error("El status debe ser un booleano");
        }

        // Si pasa todas las validaciones, se debe generar un nuevo ID y crear el producto.

        // Generar un nuevo ID
        let id=1;
        if (productos.length>0) {
            id = Math.max(...productos.map(d => d.id))+1;
        }

        const nuevoProducto = {
            id,
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
        };

        productos.push(nuevoProducto);

        // Aagregar el nuevo producto en el archivo this.path.
        await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5))

        return nuevoProducto;
    }

    // Médoto para listar todos los productos.
    static async getProducts () {
        // Validamos si existe el archivo path.
        if (fs.existsSync(this.path)) {
            let products = fs.readFileSync(this.path, "utf-8");
            if (products.trim() === "") {
                return [];
            }
            return JSON.parse(products);
        }

        return [];
    }

    static async getProductById (id) {
        const productId = parseInt(id);
        // Validamos si el id es un numero entero.
        if (isNaN(productId) || productId <= 0) {
            throw new Error("El ID debe ser un número entero positivo.");
        }

        const productos = await this.getProducts();
        const producto = productos.find(p => p.id === productId);

        if (!producto) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        return producto;
    }
}

module.exports = { ProductManager };
