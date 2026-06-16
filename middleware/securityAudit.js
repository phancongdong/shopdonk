const { containsSensitiveFields } = require('../utils/security');

function securityAuditMiddleware(req, res, next) {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
        if (data && data.success !== false) {
            if (containsSensitiveFields(data)) {
                console.warn('\n[SECURITY WARNING] Potential sensitive data exposure detected!');
                console.warn(`Endpoint: ${req.method} ${req.originalUrl}`);
                console.warn('User:', req.user?.id || 'Unauthenticated');
                console.warn('Response contains sensitive fields that should not be exposed');
                console.warn('Stack trace:', new Error().stack);
            }
        }
        
        return originalJson(data);
    };
    
    next();
}

module.exports = { securityAuditMiddleware };
