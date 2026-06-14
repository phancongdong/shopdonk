const { query } = require('./config/database');

async function migrateNestedCategories() {
    console.log('🚀 Starting Nested Categories Migration...\n');
    
    try {
        console.log('Step 1: Checking if columns exist...');
        const columnsCheck = await query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Categories'
        `);
        const existingColumns = columnsCheck.recordset.map(c => c.COLUMN_NAME);
        console.log('Existing columns:', existingColumns.join(', '));
        
        if (!existingColumns.includes('parent_id')) {
            console.log('Adding parent_id column...');
            await query(`ALTER TABLE Categories ADD parent_id INT NULL`);
            console.log('✓ parent_id column added');
        }
        
        if (!existingColumns.includes('depth')) {
            console.log('Adding depth column...');
            await query(`ALTER TABLE Categories ADD depth INT DEFAULT 0`);
            console.log('✓ depth column added');
        }
        
        if (!existingColumns.includes('path')) {
            console.log('Adding path column...');
            await query(`ALTER TABLE Categories ADD path NVARCHAR(1000) DEFAULT ''`);
            console.log('✓ path column added');
        }
        
        console.log('\nStep 2: Checking CategoryClosure table...');
        const closureCheck = await query(`
            SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'CategoryClosure'
        `);
        
        if (closureCheck.recordset[0].count === 0) {
            console.log('Creating CategoryClosure table...');
            await query(`
                CREATE TABLE CategoryClosure (
                    ancestor_id INT NOT NULL,
                    descendant_id INT NOT NULL,
                    depth INT NOT NULL DEFAULT 0,
                    PRIMARY KEY (ancestor_id, descendant_id),
                    FOREIGN KEY (ancestor_id) REFERENCES Categories(id) ON DELETE CASCADE,
                    FOREIGN KEY (descendant_id) REFERENCES Categories(id) ON DELETE CASCADE
                )
            `);
            await query(`CREATE INDEX IX_CategoryClosure_Descendant ON CategoryClosure(descendant_id)`);
            await query(`CREATE INDEX IX_CategoryClosure_Depth ON CategoryClosure(depth)`);
            console.log('✓ CategoryClosure table created');
        }
        
        console.log('\nStep 3: Updating depth and path for all categories...');
        await query(`UPDATE Categories SET depth = 0, path = CAST(id AS NVARCHAR(1000)) WHERE parent_id IS NULL`);
        
        const categories = await query(`SELECT id, parent_id FROM Categories ORDER BY id`);
        console.log(`Found ${categories.recordset.length} categories`);
        
        for (const cat of categories.recordset) {
            const path = cat.id.toString();
            await query(`UPDATE Categories SET depth = 0, path = @param0 WHERE id = @param1`, [path, cat.id]);
        }
        console.log('✓ Depth and path updated');
        
        console.log('\nStep 4: Populating CategoryClosure table...');
        await query(`DELETE FROM CategoryClosure`);
        
        await query(`
            INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
            SELECT id, id, 0 FROM Categories
        `);
        console.log('✓ Self-references added');
        
        console.log('\nStep 5: Adding foreign key constraint...');
        try {
            await query(`
                ALTER TABLE Categories 
                ADD CONSTRAINT FK_Categories_Parent 
                FOREIGN KEY (parent_id) REFERENCES Categories(id)
            `);
            console.log('✓ Foreign key constraint added');
        } catch (fkError) {
            if (fkError.message.includes('already exists') || fkError.message.includes('FK_Categories_Parent')) {
                console.log('✓ Foreign key constraint already exists');
            } else {
                console.log('⚠ Could not add foreign key:', fkError.message);
            }
        }
        
        console.log('\nStep 6: Verifying migration...');
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM Categories) as total_categories,
                (SELECT COUNT(*) FROM CategoryClosure) as closure_entries,
                (SELECT COUNT(*) FROM Categories WHERE parent_id IS NULL) as root_categories,
                (SELECT MAX(depth) FROM Categories) as max_depth
        `);
        
        const s = stats.recordset[0];
        console.log('\n📊 Migration Results:');
        console.log(`   Total categories: ${s.total_categories}`);
        console.log(`   Closure entries: ${s.closure_entries}`);
        console.log(`   Root categories: ${s.root_categories}`);
        console.log(`   Max depth: ${s.max_depth}`);
        
        console.log('\n✅ Migration completed successfully!');
        console.log('\n📌 Next steps:');
        console.log('   1. Open admin/categories.html to manage nested categories');
        console.log('   2. Create parent-child relationships by editing categories');
        console.log('   3. Products can be assigned to any category at any level');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
    
    process.exit(0);
}

migrateNestedCategories();
