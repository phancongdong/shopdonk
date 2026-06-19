# 🤖 Telegram Bot Bán Acc Game

Bot bán acc game tự động qua Telegram - hoạt động độc lập, không cần web.

## ⚡ Tính năng

### User commands:
- `/start` - Bắt đầu sử dụng bot
- `/catalog` - Xem danh mục sản phẩm
- `/category [tên]` - Xem sản phẩm theo loại
- `/product [id]` - Xem chi tiết sản phẩm
- `/buy [id]` - Mua sản phẩm (tự động giao acc)
- `/balance` - Xem số dư
- `/history` - Lịch sử mua hàng
- `/deposit [số tiền]` - Nạp tiền

### Admin commands:
- `/add` - Thêm sản phẩm mới
- `/products` - Xem danh sách sản phẩm
- `/edit [id]` - Chỉnh sửa sản phẩm
- `/delete [id]` - Xóa sản phẩm
- `/orders` - Xem đơn hàng
- `/deposits` - Xem yêu cầu nạp tiền chờ duyệt
- `/approve [id]` - Duyệt nạp tiền
- `/stats` - Thống kê shop
- `/broadcast [tin nhắn]` - Gửi tin nhắn đến tất cả user

## 🚀 Cài đặt

### 1. Tạo bot từ BotFather
```
1. Chat với @BotFather trên Telegram
2. Gửi /newbot
3. Lấy token
```

### 2. Clone & Setup
```bash
cd telegram-bot
npm install
```

### 3. Cấu hình
```bash
cp .env.example .env
# Edit .env với thông tin của bạn
```

### 4. Lấy Telegram User ID
```
1. Chat với @userinfobot trên Telegram
2. Gửi tin nhắn bất kỳ
3. Bot sẽ trả về ID của bạn
```

### 5. Chạy bot
```bash
npm start
```

## 📦 Thêm sản phẩm

Gửi `/add` và nhập format:
```
NAME: Acc Genshin AR60
CATEGORY: genshin
PRICE: 100000
DESC: Acc AR60, 5* characters
ACCOUNTS:
email1@gmail.com-password123-extra
email2@gmail.com-password456-extra
```

## 📁 Cấu trúc

```
telegram-bot/
├── index.js           # Bot core
├── config.js          # Config & messages
├── package.json
├── .env               # Environment vars
├── commands/
│   ├── user.js        # User commands
│   └── admin.js       # Admin commands
├── utils/
│   └── database.js    # JSON database
├── data/
│   └── bot-database.json  # Data storage
```

## 💳 Thanh toán

- Chuyển khoản ngân hàng
- Momo
- Gửi bill -> Admin duyệt -> Bot tự cộng tiền

## 🔐 Giao acc tự động

- User mua -> Trừ balance -> Giao acc ngay
- Acc được lưu trong database JSON
- Admin có thể xem lịch sử giao dịch

## 📊 Stats

- Tổng doanh thu
- Tổng đơn hàng
- Tổng user
- Sản phẩm đang bán

## 💡 Tips

1. **Backup data**: Copy file `data/bot-database.json` định kỳ
2. **Multi-admin**: Thêm nhiều ID vào ADMIN_IDS
3. **24/7**: Deploy lên VPS/server để bot luôn chạy
4. **Scaling**: Database JSON phù hợp cho shop nhỏ (<1000 orders)

## 🌐 Deploy lên VPS

```bash
# VPS Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm
git clone your-repo
cd telegram-bot
npm install
npm install pm2 -g
pm2 start index.js --name "acc-bot"
pm2 save
pm2 startup
```

## ⚠️ Notes

- Bot hoạt động hoàn toàn độc lập với web
- Database JSON không cần MySQL
- Khởi động lại bot vẫn giữ data
- Admin duyệt nạp tiền bằng callback button