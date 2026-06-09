const { connectDB, query } = require('./config/database');

async function createPaymentTable() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PaymentSettings' AND xtype='U')
            BEGIN
                CREATE TABLE PaymentSettings (
                    id INT PRIMARY KEY DEFAULT 1,
                    bank_name NVARCHAR(100),
                    bank_account NVARCHAR(50),
                    bank_owner NVARCHAR(100),
                    momo_phone VARCHAR(20),
                    momo_name NVARCHAR(100),
                    zalopay_phone VARCHAR(20),
                    zalopay_name NVARCHAR(100),
                    vnpay_phone VARCHAR(20),
                    vnpay_name NVARCHAR(100),
                    qr_code_url NVARCHAR(500),
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME
                );
                PRINT 'Table PaymentSettings created';
            END
        `, []);
        
        console.log('✅ PaymentSettings table ready!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createPaymentTable();