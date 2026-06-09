const { connectDB, query } = require('./config/database');

async function fixPaymentTable() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        // Alter qr_code_url to NVARCHAR(MAX) to support base64 images
        await query(`
            ALTER TABLE PaymentSettings 
            ALTER COLUMN qr_code_url NVARCHAR(MAX)
        `, []);
        
        console.log('✅ Fixed qr_code_url column to NVARCHAR(MAX)');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

fixPaymentTable();