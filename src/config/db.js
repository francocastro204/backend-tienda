import mongoose from 'mongoose';

const connDB = async (url, dbName) => {
    try {
        await mongoose.connect(url, { dbName });

        console.log(`Conectando a la base de datos ${dbName} en la URL ${url}`);
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
}

export { connDB };