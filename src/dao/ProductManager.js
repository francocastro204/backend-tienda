const fs = require("fs");
const { generateNewId } = require("../utils/validators");

class ProductManager {

    static path = "./src/data/products.json";

    // Método para agregar un nuevo producto.
    static async addProduct(product) {
        // Hacemos destructuración del producto.
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

        // Obtener listado de los productos.
        let productos = await this.getProducts();

        // Validar que code no se repita.
        const existeCodeProducto = productos.find(p => p.code === code);
        if (existeCodeProducto) {
            throw new Error(`Ya existe un producto con el CODE=${code}.`);
        }

        // Generar un nuevo ID y crear el producto.
        const id = generateNewId(productos);

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

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5));
        } catch (error) {
            throw new Error(`Error al guardar el producto: ${error.message}`);
        }

        return nuevoProducto;
    }

    // Método para listar todos los productos.
    static async getProducts() {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            if (data.trim() === "") {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            console.error("Error al obtener los productos:", error.message);
            return [];
        }
    }

    static async getProductById(id) {
        const productos = await this.getProducts();
        const producto = productos.find(p => p.id === id);

        if (!producto) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        return producto;
    }

    static async updateProduct(id, changes) {
        // Obtenemos el listado de productos y el indice del producto a actualizar.
        const productos = await this.getProducts();
        const index = productos.findIndex(p => p.id === id);
        if (index === -1) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        // Obtenemos el producto actual.
        const current = productos[index];

        // Si cambia "code", validar unicidad
        if (changes.code !== undefined && changes.code !== current.code) {
            const existe = productos.some(p => p.code === changes.code && p.id !== id);
            if (existe) {
                throw new Error(`Ya existe un producto con el CODE=${changes.code}.`);
            }
        }

        // Actualizamos el producto con los cambios recibidos
        const productoActualizado = {
            ...current,
            ...changes,
        };

        // Persistir el array completo
        productos[index] = productoActualizado;

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5));
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }

        return productoActualizado;
    }

    static async deleteProduct(id) {
        // Obtenemos el listado de productos.
        const productos = await this.getProducts();

        // Validamos que el producto a eliminar exista, sino existe lanzamos un error.
        const productoEliminado = productos.find(p => p.id === id);
        if (!productoEliminado) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        // Eliminamos el producto del listado.
        const nuevoListadoProductos = productos.filter(p => p.id !== id);

        // Verificamos que se elimino de la lista el producto.
        if (nuevoListadoProductos.length === productos.length) {
            throw new Error(`No se pudo eliminar el producto con el ID=${id}.`);
        }

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(nuevoListadoProductos, null, 5));
        } catch (error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }

        return productoEliminado;
    }
}

module.exports = { ProductManager };
