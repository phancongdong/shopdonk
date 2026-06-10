const { query } = require('../config/database');

async function getPageSeo(req, res) {
    try {
        const pageName = req.params.page || 'home';
        const result = await query('SELECT * FROM PageSEO WHERE page_name = @param0', [pageName]);
        
        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset[0]
            });
        } else {
            res.json({
                success: true,
                data: null
            });
        }
    } catch (error) {
        console.error('Get page SEO error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getAllPageSeo(req, res) {
    try {
        const result = await query('SELECT * FROM PageSEO ORDER BY page_name');
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Get all page SEO error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function savePageSeo(req, res) {
    try {
        const pageName = req.params.page;
        const {
            title, description, keywords,
            og_title, og_description, og_image,
            canonical_url, noindex, nofollow
        } = req.body;
        
        const existing = await query('SELECT id FROM PageSEO WHERE page_name = @param0', [pageName]);
        
        if (existing.recordset.length > 0) {
            await query(`
                UPDATE PageSEO SET
                    title = @param0,
                    description = @param1,
                    keywords = @param2,
                    og_title = @param3,
                    og_description = @param4,
                    og_image = @param5,
                    canonical_url = @param6,
                    noindex = @param7,
                    nofollow = @param8,
                    updated_at = GETDATE()
                WHERE page_name = @param9
            `, [title, description, keywords, og_title, og_description, og_image, canonical_url, noindex ? 1 : 0, nofollow ? 1 : 0, pageName]);
        } else {
            await query(`
                INSERT INTO PageSEO (page_name, page_url, title, description, keywords, og_title, og_description, og_image, canonical_url, noindex, nofollow, created_at, updated_at)
                VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, GETDATE(), GETDATE())
            `, [pageName, '/' + pageName + '.html', title, description, keywords, og_title, og_description, og_image, canonical_url, noindex ? 1 : 0, nofollow ? 1 : 0]);
        }
        
        res.json({
            success: true,
            message: 'Lưu SEO thành công'
        });
    } catch (error) {
        console.error('Save page SEO error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getCategorySeo(req, res) {
    try {
        const categoryId = req.params.id;
        const result = await query('SELECT * FROM CategorySEO WHERE category_id = @param0', [categoryId]);
        
        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset[0]
            });
        } else {
            res.json({
                success: true,
                data: null
            });
        }
    } catch (error) {
        console.error('Get category SEO error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getAllCategorySeo(req, res) {
    try {
        const result = await query(`
            SELECT cs.*, c.name as category_name, c.slug as category_slug
            FROM CategorySEO cs
            RIGHT JOIN Categories c ON cs.category_id = c.id
            ORDER BY c.name
        `);
        res.json({
            success: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Get all category SEO error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function saveCategorySeo(req, res) {
    try {
        const categoryId = req.params.id;
        const {
            title, description, keywords,
            og_title, og_description, og_image,
            canonical_url, noindex, nofollow
        } = req.body;
        
        const existing = await query('SELECT id FROM CategorySEO WHERE category_id = @param0', [categoryId]);
        
        if (existing.recordset.length > 0) {
            await query(`
                UPDATE CategorySEO SET
                    title = @param0,
                    description = @param1,
                    keywords = @param2,
                    og_title = @param3,
                    og_description = @param4,
                    og_image = @param5,
                    canonical_url = @param6,
                    noindex = @param7,
                    nofollow = @param8,
                    updated_at = GETDATE()
                WHERE category_id = @param9
            `, [title, description, keywords, og_title, og_description, og_image, canonical_url, noindex ? 1 : 0, nofollow ? 1 : 0, categoryId]);
        } else {
            await query(`
                INSERT INTO CategorySEO (category_id, title, description, keywords, og_title, og_description, og_image, canonical_url, noindex, nofollow, created_at, updated_at)
                VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, GETDATE(), GETDATE())
            `, [categoryId, title, description, keywords, og_title, og_description, og_image, canonical_url, noindex ? 1 : 0, nofollow ? 1 : 0]);
        }
        
        res.json({
            success: true,
            message: 'Lưu SEO danh mục thành công'
        });
    } catch (error) {
        console.error('Save category SEO error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

module.exports = {
    getPageSeo,
    getAllPageSeo,
    savePageSeo,
    getCategorySeo,
    getAllCategorySeo,
    saveCategorySeo
};