const express = require('express');
const router = express.Router();
const { query, connectDB } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/check-schema', authMiddleware, adminMiddleware, async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            success: false,
            message: 'Migration endpoints không khả dụng trong production'
        });
    }
    
    try {
        const columns = await query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Categories'
            ORDER BY ORDINAL_POSITION
        `);
        
        const tables = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        const categoryClosureExists = tables.recordset.some(t => t.TABLE_NAME === 'CategoryClosure');
        
        const missingColumns = ['parent_id', 'depth', 'path', 'slug', 'icon', 'color', 'display_order', 'status']
            .filter(col => !columns.recordset.some(c => c.COLUMN_NAME === col));
        
        res.json({
            success: true,
            needsMigration: missingColumns.length > 0 || !categoryClosureExists,
            missingColumns,
            categoryClosureExists
        });
    } catch (error) {
        console.error('Check schema error:', error);
        res.status(500).json({ success: false, message: 'Lỗi kiểm tra schema' });
    }
});

router.get('/debug', authMiddleware, adminMiddleware, async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            success: false,
            message: 'Debug endpoint không khả dụng trong production'
        });
    }
    
    try {
        const testQuery = await query(`SELECT TOP 1 * FROM Categories`);
        res.json({
            success: true,
            sample: testQuery.recordset[0] || null
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi debug'
        });
    }
});

router.post('/run-migration', authMiddleware, adminMiddleware, async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
            success: false,
            message: 'Migration endpoints không khả dụng trong production. Vui lòng chạy migration script trực tiếp trên server.'
        });
    }
    
    try {
        const steps = [];
        
        const columnsCheck = await query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories'
        `);
        const existingColumns = columnsCheck.recordset.map(c => c.COLUMN_NAME);
        
        if (!existingColumns.includes('parent_id')) {
            await query(`ALTER TABLE Categories ADD parent_id INT NULL`);
            steps.push('Added parent_id');
        }
        
        if (!existingColumns.includes('depth')) {
            await query(`ALTER TABLE Categories ADD depth INT DEFAULT 0`);
            steps.push('Added depth');
        }
        
        if (!existingColumns.includes('path')) {
            await query(`ALTER TABLE Categories ADD path NVARCHAR(1000) DEFAULT ''`);
            steps.push('Added path');
        }
        
        if (!existingColumns.includes('slug')) {
            await query(`ALTER TABLE Categories ADD slug VARCHAR(150) NULL`);
            steps.push('Added slug');
        }
        
        if (!existingColumns.includes('icon')) {
            await query(`ALTER TABLE Categories ADD icon VARCHAR(50) NULL`);
            steps.push('Added icon');
        }
        
        if (!existingColumns.includes('color')) {
            await query(`ALTER TABLE Categories ADD color VARCHAR(20) NULL`);
            steps.push('Added color');
        }
        
        if (!existingColumns.includes('display_order')) {
            await query(`ALTER TABLE Categories ADD display_order INT DEFAULT 0`);
            steps.push('Added display_order');
        }
        
        if (!existingColumns.includes('status')) {
            await query(`ALTER TABLE Categories ADD status BIT DEFAULT 1`);
            steps.push('Added status');
        }
        
        const tableCheck = await query(`
            SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CategoryClosure'
        `);
        
        if (tableCheck.recordset[0].count === 0) {
            await query(`
                CREATE TABLE CategoryClosure (
                    ancestor_id INT NOT NULL,
                    descendant_id INT NOT NULL,
                    depth INT NOT NULL DEFAULT 0,
                    PRIMARY KEY (ancestor_id, descendant_id)
                )
            `);
            await query(`CREATE INDEX IX_CategoryClosure_Descendant ON CategoryClosure(descendant_id)`);
            steps.push('Created CategoryClosure table');
        }
        
        await query(`
            UPDATE Categories SET 
                depth = ISNULL(depth, 0),
                path = ISNULL(path, CAST(id AS NVARCHAR(1000))),
                display_order = ISNULL(display_order, id)
        `);
        steps.push('Initialized existing categories');
        
        await query(`
            INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
            SELECT id, id, 0 FROM Categories
            WHERE NOT EXISTS (SELECT 1 FROM CategoryClosure WHERE ancestor_id = Categories.id AND descendant_id = Categories.id)
        `);
        steps.push('Populated CategoryClosure');
        
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM Categories) as total_categories,
                (SELECT COUNT(*) FROM CategoryClosure) as closure_entries,
                (SELECT COUNT(*) FROM Categories WHERE parent_id IS NULL) as root_categories
        `);
        
        res.json({
            success: true,
            message: 'Migration completed',
            steps,
            stats: stats.recordset[0]
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ success: false, message: 'Lỗi migration', steps: [] });
    }
});

router.get('/fix-status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await query(`UPDATE Categories SET status = 1 WHERE status IS NULL`);
        const result = await query(`SELECT COUNT(*) as count FROM Categories WHERE status = 1`);
        res.json({
            success: true,
            message: 'Status updated',
            activeCategories: result.recordset[0].count
        });
    } catch (error) {
        console.error('Fix status error:', error);
        res.status(500).json({ success: false, message: 'Lỗi cập nhật status' });
    }
});

module.exports = router;