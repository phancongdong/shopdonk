const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

async function setup() {
    console.log('\n🤖 TELEGRAM BOT SETUP\n');
    console.log('='.repeat(50));

    console.log('\n📋 Hướng dẫn lấy Bot Token:');
    console.log('1. Mở Telegram, tìm @BotFather');
    console.log('2. Gửi /newbot');
    console.log('3. Đặt tên và username cho bot');
    console.log('4. Copy token nhận được\n');

    const botToken = await question('🔑 Nhập Bot Token: ');
    
    console.log('\n📋 Hướng dẫn lấy User ID:');
    console.log('1. Mở Telegram, tìm @userinfobot');
    console.log('2. Gửi tin nhắn bất kỳ');
    console.log('3. Copy số ID (ví dụ: 123456789)\n');
    
    const adminIds = await question('👨‍💼 Nhập Admin IDs (phân cách bằng dấu phẩy): ');
    
    console.log('\n💳 Thông tin thanh toán:\n');
    const bankName = await question('🏦 Tên ngân hàng: ');
    const bankAccount = await question('💳 Số tài khoản: ');
    const accountName = await question('👤 Tên tài khoản: ');
    const momoNumber = await question('📱 Số Momo (Enter để bỏ qua): ');
    const momoName = await question('👤 Tên Momo (Enter để bỏ qua): ');

    const envContent = `# Telegram Bot Token
TELEGRAM_BOT_TOKEN=${botToken.trim()}

# Admin IDs
ADMIN_IDS=${adminIds.trim()}

# Database path
DATABASE_PATH=./data/bot-database.json

# Payment config
BANK_NAME=${bankName.trim()}
BANK_ACCOUNT=${bankAccount.trim()}
ACCOUNT_NAME=${accountName.trim()}
MOMO_NUMBER=${momoNumber.trim()}
MOMO_NAME=${momoName.trim()}`;

    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Đã tạo file .env thành công!');
    
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Đã tạo thư mục data/');
    }

    console.log('\n📦 Cài đặt dependencies...');
    
    const { execSync } = require('child_process');
    try {
        execSync('npm install', { stdio: 'inherit', cwd: __dirname });
        console.log('\n✅ Cài đặt hoàn tất!');
    } catch (error) {
        console.log('\n❌ Lỗi cài đặt. Chạy thủ công: npm install');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SETUP HOÀN TẤT!\n');
    console.log('Khởi động bot:');
    console.log('  cd telegram-bot');
    console.log('  npm start\n');
    console.log('Commands:');
    console.log('  /start - Bắt đầu');
    console.log('  /catalog - Xem sản phẩm');
    console.log('  /add - Thêm sản phẩm (Admin)\n');

    rl.close();
}

setup().catch(console.error);
