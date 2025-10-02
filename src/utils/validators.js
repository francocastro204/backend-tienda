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
};
