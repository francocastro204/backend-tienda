function parseValidId(value) {
    const n = parseInt(value);
    return Number.isInteger(n) && n > 0 ? n : null;
}

function isValidId(value) {
    return parseValidId(value) !== null;
}

// Type/shape validators
function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeNumber(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

function isStringArray(value) {
    return Array.isArray(value) && value.every(v => typeof v === "string");
}

// Sanitizers / Normalizers (básicos)
function sanitizeString(value) {
    return typeof value === "string" ? value.trim() : value;
}

function normalizeCode(value) {
    // Para este proyecto inicial, solo aseguramos string y trim; sin lowercasing
    return String(value).trim();
}

function generateNewId(list) {
    if (!Array.isArray(list) || list.length === 0) return 1;
    return Math.max(...list.map(p => Number(p.id) || 0)) + 1;
};

// Validaciones específicas para productos
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

module.exports = {
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
};
