const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

async function runNestedCategoriesMigration(req, res) {
    try {
        console.log('Starting Nested Categories Migration...');
        
        const migrationPath = path.join(__dirname, '../database/vps-nested-categories-migration.sql');
        const sqlContent = fs.readFileSync(migrationPath, 'utf8');
        
        const statements = sqlContent
            .split(/GO/i)
            .filter(s => s.trim())
            .map(s => s.trim());
        
        const results = [];
        
        for (const statement of statements) {
            if (statement.startsWith('--') || statement.length < 10) {
                continue;
            }
            
            try {
                await query(statement);
                results.push({ success: true, statement: statement.substring(0, 100) });
            } catch (e) {
                if (!e.message.includes('already exists') && 
                    !e.message.includes('duplicate') &&
                    !e.message.includes('constraint')) {
                    console.log('Statement error:', e.message);
                }
            }
        }
        
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM Categories) as total_categories,
                (SELECT COUNT(*) FROM CategoryClosure) as closure_entries,
                (SELECT COUNT(*) FROM Categories WHERE parent_id IS NULL) as root_categories,
                (SELECT ISNULL(MAX(depth), 0) FROM Categories) as max_depth
        `);
        
        res.json({
            success: true,
            message: 'Nested Categories Migration completed',
            stats: stats.recordset[0]
        });
        
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

router.post('/migrate-nested-categories', authMiddleware, adminMiddleware, runNestedCategoriesMigration);

module.exports = router;