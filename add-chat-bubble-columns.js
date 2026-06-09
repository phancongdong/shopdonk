const { connectDB, query } = require('./config/database');

async function addChatBubbleColumns() {
    try {
        await connectDB();
        console.log('Connected to database');
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PaymentSettings') AND name = 'chat_bubble_url')
            BEGIN
                ALTER TABLE PaymentSettings ADD chat_bubble_url NVARCHAR(500) DEFAULT 'contact.html';
                PRINT 'Added chat_bubble_url column';
            END
        `, []);
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PaymentSettings') AND name = 'chat_bubble_active')
            BEGIN
                ALTER TABLE PaymentSettings ADD chat_bubble_active BIT DEFAULT 1;
                PRINT 'Added chat_bubble_active column';
            END
        `, []);
        
        console.log('✅ Chat bubble columns added!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

addChatBubbleColumns();