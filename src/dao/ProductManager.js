import { productsModelo } from "./models/productModels.js";
export class ProductManager {

    static async getProducts(page = 1, limit = 10, query = {}, sort = {}) {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true,
            sort: sort
        };
        return await productsModelo.paginate(query, options);
    }

    static async getProductById(id){
        return await productsModelo.findById(id).lean();
    }

    static async createProduct(product){
        const newProduct = await productsModelo.create(product);
        return newProduct.toJSON();
    }

    static async update(id, productUpdate={}){
        return await productsModelo.findByIdAndUpdate(id, productUpdate, { new: true }).lean()
    }

    static async delete(id){
        return await productsModelo.findByIdAndDelete(id, {new: true}).lean()
    }
}
