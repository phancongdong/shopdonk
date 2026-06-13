const { validateToken } = require('../controllers/authController');

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    const userId = validateToken(token);
    
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'
        });
    }
    
    req.user = { id: userId };
    next();
}

function adminMiddleware(req, res, next) {
    const userRole = req.headers['x-user-role'];
    
    if (userRole !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập'
        });
    }
    
    next();
}

function ctvMiddleware(req, res, next) {
    const userRole = req.headers['x-user-role'];
    
    if (userRole !== 'admin' && userRole !== 'ctv') {
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập'
        });
    }
    
    next();
}

function optionalAuth(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (token) {
        const userId = validateToken(token);
        if (userId) {
            req.user = { id: userId };
        }
    }
    
    next();
}

module.exports = {
    authMiddleware,
    adminMiddleware,
    ctvMiddleware,
    optionalAuth
};