const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { query } = require('../config/database');
const { authMiddleware, adminMiddleware, ctvMiddleware } = require('../middleware/auth');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(new Error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, GIF, WebP, SVG)'), false);
        }
        cb(null, true);
    }
});

function sanitizeFilename(filename) {
    if (!filename) return '';
    return filename
        .replace(/[^a-zA-Z0-9.\-_]/g, '_')
        .substring(0, 255);
}

const dns = require('dns').promises;

async function isSafeUrl(urlString) {
    try {
        const url = new URL(urlString);
        
        if (!['http:', 'https:'].includes(url.protocol)) {
            return false;
        }
        
        const hostname = url.hostname.toLowerCase();
        
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
            return false;
        }
        
        if (hostname.startsWith('10.') || 
            hostname.startsWith('192.168.') ||
            hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
            return false;
        }
        
        if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
            return false;
        }
        
        try {
            const resolved = await dns.lookup(hostname);
            const ip = resolved.address;
            
            if (ip === '127.0.0.1' || ip === '0.0.0.0' || ip.startsWith('10.') || 
                ip.startsWith('192.168.') || ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
                return false;
            }
        } catch (dnsError) {
        }
        
        return true;
    } catch (e) {
        return false;
    }
}

router.post('/upload', authMiddleware, ctvMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Không có file để upload!'
            });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'shopgame'
        });

        const userId = req.user?.id || null;
        const originalName = sanitizeFilename(req.file.originalname);
        
        await query(`
            INSERT INTO Images (public_id, url, original_name, size, width, height, format, resource_type, user_id, created_at)
            VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, GETDATE())
        `, [
            result.public_id,
            result.secure_url,
            originalName,
            result.bytes || 0,
            result.width || 0,
            result.height || 0,
            result.format || '',
            result.resource_type || 'image',
            userId
        ]);

        res.json({
            success: true,
            message: 'Upload thành công!',
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                size: result.bytes,
                format: result.format
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi upload. Vui lòng thử lại.'
        });
    }
});

router.post('/upload-url', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp URL hình ảnh!'
            });
        }

        if (!await isSafeUrl(imageUrl)) {
            console.warn(`[SECURITY] SSRF attempt blocked: ${imageUrl} by user ${req.user?.id}`);
            return res.status(400).json({
                success: false,
                message: 'URL không hợp lệ hoặc không được phép!'
            });
        }

        const result = await cloudinary.uploader.upload(imageUrl, {
            resource_type: 'auto',
            folder: 'shopgame'
        });

        const userId = req.user?.id || null;

        await query(`
            INSERT INTO Images (public_id, url, original_name, size, width, height, format, resource_type, user_id, created_at)
            VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, GETDATE())
        `, [
            result.public_id,
            result.secure_url,
            sanitizeFilename(imageUrl.split('/').pop() || 'url-upload'),
            result.bytes || 0,
            result.width || 0,
            result.height || 0,
            result.format || '',
            result.resource_type || 'image',
            userId
        ]);

        res.json({
            success: true,
            message: 'Upload thành công!',
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                size: result.bytes,
                format: result.format
            }
        });
    } catch (error) {
        console.error('Upload URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi upload. Vui lòng thử lại.'
        });
    }
});

router.get('/images', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        
        const result = await query(`
            SELECT TOP (@param0) * FROM Images 
            ORDER BY created_at DESC
        `, [limit]);

        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi lấy danh sách hình ảnh'
        });
    }
});

router.delete('/delete/:publicId', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const publicId = req.params.publicId;

        if (!publicId || publicId.length > 255) {
            return res.status(400).json({
                success: false,
                message: 'Public ID không hợp lệ'
            });
        }

        const result = await cloudinary.uploader.destroy(publicId);

        await query(`
            DELETE FROM Images WHERE public_id = @param0
        `, [publicId]);

        res.json({
            success: true,
            message: 'Xóa thành công!',
            data: result
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi xóa hình ảnh'
        });
    }
});

module.exports = router;