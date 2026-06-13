const { query } = require('../config/database');

async function fixEncoding() {
    try {
        await query(
            `UPDATE Categories SET name = @param0, slug = @param1, description = @param2 WHERE id = @param3`,
            ['ACC TFT ĐẤU TRƯỜNG CHÂN LÝ', 'acc-tft-dau-truong-chan-ly', 'Acc TFT với đầy đủ linh thú, arena đẹp', 1]
        );
        
        await query(
            `UPDATE Categories SET description = @param0 WHERE id = @param1`,
            ['Acc Liên Quân Mobile giá rẻ, đầy đủ skin', 2]
        );
        
        await query(
            `UPDATE Categories SET description = @param0 WHERE id = @param1`,
            ['Acc Free Fire VIP, nhiều skin', 3]
        );
        
        console.log('✅ Encoding fixed successfully!');
        
        const result = await query('SELECT id, name, description FROM Categories');
        console.log('Categories after fix:');
        result.recordset.forEach(c => console.log(`  ${c.id}: ${c.name} - ${c.description}`));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixEncoding();