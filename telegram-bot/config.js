require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const ADMIN_IDS = (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
const DATABASE_PATH = process.env.DATABASE_PATH || './data/bot-database.json';
const PAYMENT_CONFIG = {
    bankName: process.env.BANK_NAME || 'Vietcombank',
    bankAccount: process.env.BANK_ACCOUNT || '',
    accountName: process.env.ACCOUNT_NAME || '',
    momoNumber: process.env.MOMO_NUMBER || '',
    momoName: process.env.MOMO_NAME || ''
};

const CATEGORIES = {
    'genshin': { name: '🎮 Genshin Impact', emoji: '🎮' },
    'lol': { name: '⚔️ League of Legends', emoji: '⚔️' },
    'valorant': { name: '🎯 Valorant', emoji: '🎯' },
    'pubg': { name: '🔫 PUBG Mobile', emoji: '🔫' },
    'freefire': { name: '🔥 Free Fire', emoji: '🔥' },
    'other': { name: '📦 Khác', emoji: '📦' }
};

const MESSAGES = {
    welcome: `🤖 **Chào mừng đến với Shop Acc Game!**

📋 **Danh sách lệnh:**
/catalog - Xem danh mục sản phẩm
/category [tên] - Xem sản phẩm theo loại
/product [id] - Xem chi tiết sản phẩm  
/buy [id] - Mua sản phẩm
/balance - Xem số dư
/history - Lịch sử mua hàng
/deposit - Nạp tiền
/help - Hướng dẫn

💳 **Thanh toán:** Chuyển khoản ngân hàng / Momo
⚡ **Tự động:** Giao acc ngay sau khi thanh toán!`,

    help: `📖 **Hướng dẫn sử dụng:**

1️⃣ **Xem sản phẩm:**
   /catalog - Xem tất cả
   /category genshin - Xem acc Genshin
   
2️⃣ **Mua hàng:**
   /buy 1 - Mua sản phẩm #1
   
3️⃣ **Nạp tiền:**
   /deposit 100000 - Nạp 100k
   Chuyển khoản theo hướng dẫn
   
4️⃣ **Admin commands:**
   /add, /edit, /delete - Quản lý sản phẩm
   /orders - Xem đơn hàng
   /stats - Thống kê`,

    deposit: `💳 **Nạp tiền vào tài khoản**

🏦 **Chuyển khoản ngân hàng:**
   Ngân hàng: {bankName}
   Số TK: {bankAccount}
   Tên TK: {accountName}
   
📱 **Momo:**
   Số ĐT: {momoNumber}
   Tên: {momoName}

📝 **Nội dung chuyển khoản:**
   TG [số tiền] [Telegram ID]
   Ví dụ: TG 100000 123456789

⏳ Sau khi chuyển khoản, gửi bill để admin duyệt!`
};

module.exports = {
    TELEGRAM_BOT_TOKEN,
    ADMIN_IDS,
    DATABASE_PATH,
    PAYMENT_CONFIG,
    CATEGORIES,
    MESSAGES,
    isAdmin: (userId) => ADMIN_IDS.includes(userId)
};
