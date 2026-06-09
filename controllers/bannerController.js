const { query } = require('../config/database');

async function getBanners(req, res) {
    try {
        const result = await query('SELECT * FROM Banners WHERE active = 1 ORDER BY display_order, created_at DESC', []);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Get banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getAllBanners(req, res) {
    try {
        const result = await query('SELECT * FROM Banners ORDER BY display_order, created_at DESC', []);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Get all banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function createBanner(req, res) {
    try {
        const { title, description, image, link, active, display_order } = req.body;
        
        await query(`
            INSERT INTO Banners (title, description, image, link, active, display_order, created_at)
            VALUES (@param0, @param1, @param2, @param3, @param4, @param5, GETDATE())
        `, [title, description || null, image, link || null, active ? 1 : 0, display_order || 0]);
        
        res.json({
            success: true,
            message: 'Thêm banner thành công'
        });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updateBanner(req, res) {
    try {
        const id = req.params.id;
        const { title, description, image, link, active, display_order } = req.body;
        
        await query(`
            UPDATE Banners SET
                title = @param0,
                description = @param1,
                image = @param2,
                link = @param3,
                active = @param4,
                display_order = @param5,
                updated_at = GETDATE()
            WHERE id = @param6
        `, [title, description || null, image, link || null, active ? 1 : 0, display_order || 0, id]);
        
        res.json({
            success: true,
            message: 'Cập nhật banner thành công'
        });
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function deleteBanner(req, res) {
    try {
        const id = req.params.id;
        await query('DELETE FROM Banners WHERE id = @param0', [id]);
        res.json({
            success: true,
            message: 'Xóa banner thành công'
        });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

module.exports = {
    getBanners,
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner
};