const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { query } = require('../config/database');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), async (req, res) => {
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
        const originalName = req.file.originalname || '';
        
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
            message: 'Lỗi upload: ' + error.message
        });
    }
});

router.post('/upload-url', async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp URL hình ảnh!'
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
            imageUrl,
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
            message: 'Lỗi upload: ' + error.message
        });
    }
});

router.get('/images', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        
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

router.delete('/delete/:publicId', async (req, res) => {
    try {
        const publicId = req.params.publicId;

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
            message: 'Lỗi xóa: ' + error.message
        });
    }
});

module.exports = router;
