/**
 * Convierte un valor a un ID válido (entero positivo)
 * @param {*} value - Valor a convertir
 * @returns {number|null} - ID válido o null si no es válido
 */
function parseValidId(value) {
    const n = parseInt(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

/**
 * Valida si un valor es un ID válido (entero positivo)
 * @param {*} value - Valor a validar
 * @returns {boolean} - true si es un ID válido, false en caso contrario
 */
function isValidId(value) {
    return parseValidId(value) !== null;
}

/**
 * Valida si un valor es un string no vacío (después de eliminar espacios)
 * @param {*} value - Valor a validar
 * @returns {boolean} - true si es un string no vacío, false en caso contrario
 */
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Valida si un valor es un número finito mayor o igual a cero
 * @param {*} value - Valor a validar
 * @returns {boolean} - true si es un número no negativo, false en caso contrario
 */
function isNonNegativeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * Valida si un valor es un entero mayor o igual a cero
 * @param {*} value - Valor a validar
 * @returns {boolean} - true si es un entero no negativo, false en caso contrario
 */
function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

/**
 * Valida si un valor es un array de strings
 * @param {*} value - Valor a validar
 * @returns {boolean} - true si es un array de strings, false en caso contrario
 */
function isStringArray(value) {
    return Array.isArray(value) && value.every(v => typeof v === "string");
}

/**
 * Limpia espacios en blanco al inicio y final de un string
 * @param {*} value - Valor a sanitizar
 * @returns {string|*} - String limpio o el valor original si no es string
 */
function sanitizeString(value) {
    return typeof value === "string" ? value.trim() : value;
}

/**
 * Normaliza un código de producto a formato estándar (string sin espacios)
 * @param {*} value - Código a normalizar
 * @returns {string} - Código normalizado
 */
function normalizeCode(value) {
    return String(value).trim();
}

/**
 * Genera un nuevo ID secuencial basado en una lista de elementos
 * @param {Array} list - Lista de elementos con propiedad 'id'
 * @returns {number} - Nuevo ID (máximo ID + 1, o 1 si la lista está vacía)
 */
function generateNewId(list) {
    if (!Array.isArray(list) || list.length === 0) return 1;
    return Math.max(...list.map(p => Number(p.id) || 0)) + 1;
};

/**
 * Valida los campos de un producto
 * @param {Object} product - Objeto con los datos del producto
 * @param {string} product.title - Título del producto
 * @param {string} product.description - Descripción del producto
 * @param {string} product.code - Código único del producto
 * @param {number} product.price - Precio del producto
 * @param {boolean} product.status - Estado de disponibilidad
 * @param {number} product.stock - Cantidad en stock
 * @param {string} product.category - Categoría del producto
 * @param {Array<string>} product.thumbnails - Array de URLs de imágenes
 * @param {boolean} isUpdate - true si es una actualización (campos opcionales), false si es creación
 * @returns {Array<string>} - Array de mensajes de error (vacío si no hay errores)
 */
function validateProductFields(product, isUpdate = false) {
    const errors = [];
    const { title, description, code, price, status, stock, category, thumbnails } = product;

    if (!isUpdate || title !== undefined) {
        if (!isNonEmptyString(title)) {
            errors.push("Título es requerido");
        }
    }

    if (!isUpdate || description !== undefined) {
        if (!isNonEmptyString(description)) {
            errors.push("Descripción es requerida");
        }
    }

    if (!isUpdate || code !== undefined) {
        if (!isNonEmptyString(code)) {
            errors.push("Código es requerido");
        }
    }

    if (!isUpdate || price !== undefined) {
        if (!isNonNegativeNumber(price)) {
            errors.push("Precio debe ser un número mayor o igual a 0");
        }
    }

    if (!isUpdate || status !== undefined) {
        if (typeof status !== "boolean") {
            errors.push("Status es requerido");
        }
    }

    if (!isUpdate || stock !== undefined) {
        if (!isNonNegativeInteger(stock)) {
            errors.push("Stock debe ser un número entero mayor o igual a 0");
        }
    }

    if (!isUpdate || category !== undefined) {
        if (!isNonEmptyString(category)) {
            errors.push("Categoría es requerida");
        }
    }

    if (!isUpdate || thumbnails !== undefined) {
        if (!isStringArray(thumbnails)) {
            errors.push("Las imágenes deben ser un array");
        }
    }

    return errors;
}

/**
 * Normaliza y sanitiza los datos de un producto
 * @param {Object} product - Objeto con los datos del producto a normalizar
 * @returns {Object} - Objeto con solo los campos definidos, normalizados y sanitizados
 */
function normalizeProductData(product) {
    const { title, description, code, price, status, stock, category, thumbnails } = product;

    const normalized = {};

    if (title !== undefined) normalized.title = sanitizeString(title);
    if (description !== undefined) normalized.description = sanitizeString(description);
    if (code !== undefined) normalized.code = normalizeCode(code);
    if (price !== undefined) normalized.price = price;
    if (status !== undefined) normalized.status = status;
    if (stock !== undefined) normalized.stock = stock;
    if (category !== undefined) normalized.category = sanitizeString(category);
    if (thumbnails !== undefined) normalized.thumbnails = thumbnails;

    return normalized;
}

// ============================================
// HELPERS PARA CONSULTAS
// ============================================

/**
 * Construye un objeto de ordenamiento para consultas de MongoDB
 * @param {string} sort - Dirección de ordenamiento: 'asc' o 'desc'
 * @param {string} field - Campo por el cual ordenar (default: 'price')
 * @returns {Object} - Objeto de ordenamiento para Mongoose (ej: { price: 1 } o { price: -1 })
 */
function buildSortObject(sort, field = 'price') {
    if (sort === 'asc') {
        return { [field]: 1 };
    } else if (sort === 'desc') {
        return { [field]: -1 };
    }
    return {};
}

// ============================================
// HELPERS PARA RESPUESTAS HTTP
// ============================================

/**
 * Envía una respuesta JSON de éxito
 * @param {Object} res - Objeto response de Express
 * @param {number} statusCode - Código de estado HTTP (200, 201, etc.)
 * @param {*} data - Datos a enviar en la respuesta
 * @param {string|null} message - Mensaje opcional de éxito
 * @returns {void}
 */
function sendJsonSuccess(res, statusCode, data, message = null) {
    res.setHeader('Content-Type', 'application/json');
    const response = { success: true, data };
    if (message) response.message = message;
    res.status(statusCode).json(response);
}

/**
 * Envía una respuesta JSON de error
 * @param {Object} res - Objeto response de Express
 * @param {number} statusCode - Código de estado HTTP (400, 404, 500, etc.)
 * @param {string} errorMessage - Mensaje de error a enviar
 * @returns {void}
 */
function sendJsonError(res, statusCode, errorMessage) {
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json({
        success: false,
        error: errorMessage
    });
}

// ============================================
// HELPERS PARA MONGOOSE
// ============================================

/**
 * Valida si un ID es un ObjectId válido de MongoDB
 * @param {*} id - ID a validar
 * @returns {boolean} - true si es un ObjectId válido, false en caso contrario
 */
function isValidObjectId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Valida un ObjectId y lanza un error si no es válido
 * @param {*} id - ID a validar
 * @param {string} fieldName - Nombre del campo para el mensaje de error (default: "ID")
 * @throws {Error} - Lanza un error si el ID no es válido
 * @returns {void}
 */
function validateObjectId(id, fieldName = "ID") {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`${fieldName} inválido`);
    }
}

export {
    parseValidId,
    isValidId,
    isNonEmptyString,
    isNonNegativeNumber,
    isNonNegativeInteger,
    isStringArray,
    generateNewId,
    sanitizeString,
    normalizeCode,
    validateProductFields,
    normalizeProductData,
    buildSortObject,
    sendJsonSuccess,
    sendJsonError,
    isValidObjectId,
    validateObjectId,
};
