const fs = require("fs");
const { parseValidId, isNonEmptyString, isNonNegativeNumber, isNonNegativeInteger, isStringArray, generateNewId, sanitizeString, normalizeCode } = require("../utils/validators");

class ProductManager {

    static path = "./src/data/products.json";


    // Método para agregar un nuevo producto.
    static async addProduct (product) {
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

        // Normalización básica
        const titleN = sanitizeString(title);
        const descriptionN = sanitizeString(description);
        const codeN = normalizeCode(code);
        const categoryN = sanitizeString(category);

        // Validaciones básicas
        if (!isNonEmptyString(titleN)) throw new Error("Título es requerido");
        if (!isNonEmptyString(descriptionN)) throw new Error("Descripción es requerida");
        if (!isNonEmptyString(codeN)) throw new Error("Código es requerido");
        if (!isNonNegativeNumber(price)) throw new Error("Precio debe ser un número mayor o igual a 0");
        if (typeof status !== "boolean") throw new Error("Status es requerido");
        if (!isNonNegativeInteger(stock)) throw new Error("Stock debe ser un número entero mayor o igual a 0");
        if (!isNonEmptyString(categoryN)) throw new Error("Categoría es requerida");
        if (!isStringArray(thumbnails)) throw new Error("Las imágenes deben ser un array");

        // Obtener listado de los productos.
        let productos = await this.getProducts();

        // 1 Validar que code no se repita.
        const existeCodeProducto = productos.find( p => normalizeCode(p.code) === codeN);
        if (existeCodeProducto) {
            throw new Error(`Ya existe un producto con el CODE=${code}.`);
        }

        // Si pasa todas las validaciones, se debe generar un nuevo ID y crear el producto.
        const id = generateNewId(productos);

        const nuevoProducto = {
            id,
            title: titleN,
            description: descriptionN,
            code: codeN,
            price,
            status,
            stock,
            category: categoryN,
            thumbnails,
        };

        productos.push(nuevoProducto);

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5))
        } catch (error) {
            throw new Error(`Error al guardar el producto: ${error.message}`);
        }

        return nuevoProducto;
    }

    // Método para listar todos los productos.
    static async getProducts () {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            if (data.trim() === "") {
                return [];
            }
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    static async getProductById (id) {
        const productId = parseValidId(id);
        if (productId === null) {
            throw new Error("ID debe ser un número entero positivo");
        }

        const productos = await this.getProducts();
        const producto = productos.find(p => p.id === productId);

        if (!producto) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        return producto;
    }

    static async updateProduct (id, changes) {
        const productId = parseValidId(id);
        if (productId === null) {
            throw new Error("ID debe ser un número entero positivo");
        }

        // Obtenemos el listado de productos y el indice del producto a actualizar.
        const productos = await this.getProducts();
        const index = productos.findIndex(p => p.id === productId);
        if (index === -1) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        // Obtenemos el producto actual.
        const current = productos[index];

        // 3) Validar solo campos presentes en "changes"
        const {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails,
        } = changes || {};

        // Normalización de parciales
        const titleN = title !== undefined ? sanitizeString(title) : undefined;
        const descriptionN = description !== undefined ? sanitizeString(description) : undefined;
        const codeN = code !== undefined ? normalizeCode(code) : undefined;
        const categoryN = category !== undefined ? sanitizeString(category) : undefined;

        // Validaciones parciales
        if (titleN !== undefined && !isNonEmptyString(titleN)) throw new Error("title debe ser un string no vacío");
        if (descriptionN !== undefined && !isNonEmptyString(descriptionN)) throw new Error("description debe ser un string no vacío");
        if (codeN !== undefined && !isNonEmptyString(codeN)) throw new Error("code debe ser un string no vacío");
        if (price !== undefined && !isNonNegativeNumber(price)) throw new Error("price debe ser un número mayor o igual a 0");
        if (status !== undefined && typeof status !== "boolean") throw new Error("status debe ser boolean");
        if (stock !== undefined && !isNonNegativeInteger(stock)) throw new Error("stock debe ser un entero mayor o igual a 0");
        if (categoryN !== undefined && !isNonEmptyString(categoryN)) throw new Error("category debe ser un string no vacío");
        if (thumbnails !== undefined && !isStringArray(thumbnails)) throw new Error("thumbnails debe ser un array de strings");

        // 4) Si cambia "code", validar unicidad
        if (codeN !== undefined && codeN !== normalizeCode(current.code)) {
            const existe = productos.some(p => normalizeCode(p.code) === codeN && p.id !== productId);
            if (existe) {
                throw new Error(`Ya existe un producto con el CODE=${code}.`);
            }
        }

        // Actualizamos el producto, validamos que si no se actualizo algun campo, se mantenga el valor anterior.
        const productoActualizado = {
            ...current,
            ...(titleN !== undefined ? { title: titleN } : {}),
            ...(descriptionN !== undefined ? { description: descriptionN } : {}),
            ...(codeN !== undefined ? { code: codeN } : {}),
            ...(price !== undefined ? { price } : {}),
            ...(status !== undefined ? { status } : {}),
            ...(stock !== undefined ? { stock } : {}),
            ...(categoryN !== undefined ? { category: categoryN } : {}),
            ...(thumbnails !== undefined ? { thumbnails } : {}),
            // id nunca cambia
        };

        // 6) Persistir el array completo
        productos[index] = productoActualizado;

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(productos, null, 5))
        } catch (error) {
            throw new Error(`Error al actualizar el producto: ${error.message}`);
        }

        return productoActualizado;
    }

    static async deleteProduct(id) {
        const productId = parseValidId(id);
        if (productId === null) {
            throw new Error("ID debe ser un número entero positivo");
        }

        // Obtenemos el listado de productos.
        const productos = await this.getProducts();

        // Validamos que el producto a eliminar exista, sino existe lanzamos un error.
        const productoEliminado = productos.find(p => p.id === productId);
        if (!productoEliminado) {
            throw new Error(`No se encontró el producto con el ID=${id}.`);
        }

        // Eliminamos el producto del listado.
        const nuevoListadoProductos = productos.filter(p => p.id !== productId);

        // Verificamos que se elimino de la lista el producto.
        if (nuevoListadoProductos.length === productos.length) {
            throw new Error(`No se pudo eliminar el producto con el ID=${id}.`);
        }

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(nuevoListadoProductos, null, 5))
        } catch (error) {
            throw new Error(`Error al eliminar el producto: ${error.message}`);
        }

        return productoEliminado;
    }
}

module.exports = { ProductManager };
