const SENSITIVE_FIELDS = ['account_username', 'account_password', 'accounts_list', 'account_info'];

function sanitizeProduct(product) {
    if (!product) return null;
    
    const sanitized = { ...product };
    
    SENSITIVE_FIELDS.forEach(field => {
        delete sanitized[field];
    });
    
    return sanitized;
}

function sanitizeProducts(products) {
    if (!products || !Array.isArray(products)) return [];
    return products.map(sanitizeProduct);
}

function sanitizeOrder(order, includeCredentials = false) {
    if (!order) return null;
    
    const sanitized = { ...order };
    
    if (!includeCredentials) {
        delete sanitized.account_username;
        delete sanitized.account_password;
        delete sanitized.account_info;
    }
    
    return sanitized;
}

function sanitizeOrders(orders, includeCredentials = false) {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.map(order => sanitizeOrder(order, includeCredentials));
}

function containsSensitiveFields(obj) {
    if (!obj || typeof obj !== 'object') return false;
    
    const stringified = JSON.stringify(obj);
    
    return SENSITIVE_FIELDS.some(field => {
        const patterns = [
            `"${field}"`,
            `'${field}'`,
            `:${field}`,
            field
        ];
        return patterns.some(p => stringified.includes(p) && 
            (stringified.includes('"account_password"') || 
             stringified.includes('"account_username"') ||
             stringified.includes('"accounts_list"')));
    });
}

module.exports = {
    SENSITIVE_FIELDS,
    sanitizeProduct,
    sanitizeProducts,
    sanitizeOrder,
    sanitizeOrders,
    containsSensitiveFields
};