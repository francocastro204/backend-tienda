import multer from 'multer';
import path from 'path';

/**
 * Configuración de almacenamiento para Multer
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

/**
 * Configuración completa de Multer con validaciones
 */
export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

/**
 * Middleware para manejar errores de Multer
 */
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
        }
    }
    if (error.message === 'Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)') {
        return res.status(400).json({ error: error.message });
    }
    next(error);
};

