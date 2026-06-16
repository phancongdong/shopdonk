const Session = require('../models/Session');
const { query } = require('../config/database');

async function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    try {
        const sessionData = await Session.validateToken(token);
        
        if (!sessionData) {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'
            });
        }
        
        req.user = { 
            id: sessionData.userId, 
            role: sessionData.role || 'user',
            name: sessionData.name,
            email: sessionData.email
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xác thực'
        });
    }
}

async function adminMiddleware(req, res, next) {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    if (req.user.role !== 'admin') {
        console.warn(`[SECURITY] Unauthorized admin access attempt by user ${req.user.id}`);
        return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền truy cập'
        });
    }
    
    next();
}

async function ctvMiddleware(req, res, next) {
    if (!req.user?.id) {
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'ctv') {
        console.warn(`[SECURITY] Unauthorized CTV access attempt by user ${req.user.id}`);
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