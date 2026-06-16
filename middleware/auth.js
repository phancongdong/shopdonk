const Session = require('../models/Session');
const { query } = require('../config/database');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('[AUTH] Path:', req.path, 'Method:', req.method);
    console.log('[AUTH] Authorization header present:', !!authHeader);
    console.log('[AUTH] Token present:', !!token);
    
    if (!token) {
        console.log('[AUTH] No token provided, returning 401');
        return res.status(401).json({
            success: false,
            message: 'Vui lòng đăng nhập để tiếp tục'
        });
    }
    
    try {
        const sessionData = await Session.validateToken(token);
        console.log('[AUTH] Session data:', sessionData ? `userId=${sessionData.userId}, role=${sessionData.role}` : null);
        
        if (!sessionData) {
            console.log('[AUTH] Invalid or expired token, returning 401');
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
        console.log('[AUTH] Authentication successful for user:', req.user.id);
        next();
    } catch (error) {
        console.error('[AUTH ERROR] Auth middleware error:', error);
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