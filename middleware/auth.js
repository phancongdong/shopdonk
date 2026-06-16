const { validateToken } = require('../controllers/authController');
const { query } = require('../config/database');

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

async function adminMiddleware(req, res, next) {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    try {
        const result = await query('SELECT role FROM Users WHERE id = @param0', [req.user.id]);
        const user = result.recordset[0];
        
        if (!user || user.role !== 'admin') {
            console.warn(`[SECURITY] Unauthorized admin access attempt by user ${req.user.id}`);
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập'
            });
        }
        
        req.user.role = user.role;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function ctvMiddleware(req, res, next) {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    try {
        const result = await query('SELECT role FROM Users WHERE id = @param0', [req.user.id]);
        const user = result.recordset[0];
        
        if (!user || (user.role !== 'admin' && user.role !== 'ctv')) {
            console.warn(`[SECURITY] Unauthorized CTV access attempt by user ${req.user.id}`);
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền truy cập'
            });
        }
        
        req.user.role = user.role;
        next();
    } catch (error) {
        console.error('CTV middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
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