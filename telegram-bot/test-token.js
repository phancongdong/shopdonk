const https = require('https');

require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.log('❌ Lỗi: TELEGRAM_BOT_TOKEN chưa được cấu hình trong .env');
    console.log('');
    console.log('📋 Cách lấy token:');
    console.log('   1. Mở Telegram');
    console.log('   2. Tìm @BotFather');
    console.log('   3. Gửi /newbot');
    console.log('   4. Copy token nhận được');
    console.log('   5. Thêm vào file .env:');
    console.log('      TELEGRAM_BOT_TOKEN=your_token_here');
    process.exit(1);
}

console.log('');
console.log('🔍 Kiểm tra Bot Token...');
console.log('');

const url = `https://api.telegram.org/bot${token}/getMe`;

https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            
            if (result.ok) {
                console.log('✅ Token hợp lệ!');
                console.log('');
                console.log('🤖 Thông tin Bot:');
                console.log(`   ID: ${result.result.id}`);
                console.log(`   Name: ${result.result.first_name}`);
                console.log(`   Username: @${result.result.username}`);
                console.log('');
                console.log('='.repeat(50));
                console.log('');
                console.log('🚀 Khởi động bot:');
                console.log('   npm start');
                console.log('');
                console.log('📱 Tìm bot trên Telegram:');
                console.log(`   @${result.result.username}`);
                console.log('');
            } else {
                console.log('❌ Token không hợp lệ!');
                console.log('');
                console.log('Lỗi:', result.description);
                console.log('');
                console.log('📋 Khắc phục:');
                console.log('   1. Vào Telegram -> @BotFather');
                console.log('   2. Gửi /mybots');
                console.log('   3. Chọn bot');
                console.log('   4. API Token -> Revoke');
                console.log('   5. Copy token mới');
                console.log('   6. Update .env');
            }
        } catch (e) {
            console.log('❌ Lỗi parse response');
            console.log('Response:', data);
        }
    });
}).on('error', (e) => {
    console.log('❌ Lỗi kết nối!');
    console.log('');
    console.log('Chi tiết:', e.message);
    console.log('');
    console.log('📋 Kiểm tra:');
    console.log('   1. Kết nối Internet');
    console.log('   2. Telegram API доступ (không bị chặn)');
    console.log('   3. Token format đúng: số:chữ_cái_khóa');
});
