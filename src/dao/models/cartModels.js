import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Carrito'
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }]
}, { timestamps: true });

export const cartModelo = mongoose.model('carts', cartSchema);

