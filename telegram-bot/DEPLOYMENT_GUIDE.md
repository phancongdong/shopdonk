# 🚀 HƯỚNG DẪN DEPLOY TELEGRAM BOT CHI TIẾT

## 📋 MỤC LỤC

1. [Chuẩn bị Bot Token](#1-chuẩn-bị-bot-token)
2. [Phương án A: Deploy lên VPS (Khuyên dùng)](#phương-án-a-deploy-lên-vps)
3. [Phương án B: Chạy trên Local Machine](#phương-án-b-chạy-trên-local)
4. [Phương án C: Deploy miễn phí Cloud](#phương-án-c-deploy-miễn-phí)
5. [Xử lý lỗi thường gặp](#5-xử-lý-lỗi-thường-gặp)
6. [Backup & Khôi phục](#6-backup--khôi-phục)

---

## 1. CHUẨN BỊ BOT TOKEN

### Bước 1.1: Tạo Bot từ BotFather

```
1. Mở Telegram app (Mobile hoặc Desktop)

2. Tìm kiếm: @BotFather
   - Chọn bot có tích XANH VERIFIED
   - Có ~1M+ users

3. Gửi tin nhắn: /newbot

4. BotFather sẽ hỏi:
   Q: "Alright, a new bot. How are we going to call it?"
   A: Shop Acc Game  (hoặc tên bạn muốn)
   
   Q: "Good. Now let's choose a username for your bot."
   A: your_shop_acc_bot
   
   ⚠️ Username PHẢI kết thúc bằng "bot"
   ⚠️ Username PHẢI duy nhất (chưa ai dùng)

5. BotFather trả về:
   ✅ Done! Congratulations on your new bot...
   
   🔑 Token: 7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   ⚠️ COPY và GIỮ KỸ TOKEN NÀY!
```

### Bước 1.2: Lấy User ID (Admin ID)

```
1. Mở Telegram

2. Tìm kiếm: @userinfobot

3. Gửi tin nhắn bất kỳ (ví dụ: "hi")

4. Bot trả về:
   👤 Your user ID: 123456789
   🌐 Language code: vi
   📱 App: Telegram Desktop
   
5. Ghi lại số User ID: 123456789
```

### Bước 1.3: Kiểm tra Token

Mở browser, truy cập:
```
https://api.telegram.org/bot<TOKEN>/getMe

Ví dụ:
https://api.telegram.org/bot7123456789:AAHxxx.../getMe
```

Nếu trả về JSON với thông tin bot → Token hợp lệ ✅

---

## PHƯƠNG ÁN A: DEPLOY LÊN VPS

### A.1. Mua VPS

**Khuyến nghị:**
| Provider | Cấu hình | Giá | Link |
|----------|----------|-----|------|
| Contabo | 4GB RAM | ~$6/tháng | contabo.com |
| DigitalOcean | 1GB RAM | $6/tháng | digitalocean.com |
| Vultr | 1GB RAM | $5/tháng | vultr.com |
| Hostinger | 2GB RAM | ~$5/tháng | hostinger.com |

**Cấu hình tối thiểu:**
- CPU: 1 core
- RAM: 512MB+
- SSD: 10GB+
- OS: Ubuntu 20.04/22.04 (khuyên dùng)

### A.2. Kết nối VPS

**Windows:**
```powershell
# Mở PowerShell hoặc Putty
ssh root@<VPS_IP_ADDRESS>

# Ví dụ:
ssh root@192.168.1.100

# Nhập password khi được hỏi
```

**Mac/Linux:**
```bash
ssh root@<VPS_IP_ADDRESS>
```

### A.3. Cài đặt Node.js trên VPS

```bash
# Update hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Kiểm tra phiên bản
node --version   # v18.x.x
npm --version    # 9.x.x

# Cài đặt PM2 (quản lý process)
sudo npm install -g pm2
```

### A.4. Upload code lên VPS

**Cách 1: Sử dụng SCP (Khuyên dùng)**

Từ máy local (Windows PowerShell):
```powershell
# Nén thư mục bot
Compress-Archive -Path telegram-bot -DestinationPath telegram-bot.zip

# Upload lên VPS
scp telegram-bot.zip root@<VPS_IP>:/root/

# Ví dụ:
scp telegram-bot.zip root@192.168.1.100:/root/
```

**Cách 2: Sử dụng Git**

```bash
# Trên VPS
cd /root

# Clone từ repository (nếu có)
git clone https://github.com/your-username/telegram-bot.git

# HOẶC tạo mới
mkdir -p telegram-bot && cd telegram-bot
```

**Cách 3: Sử dụng SFTP Client**

- Cài FileZilla hoặc WinSCP
- Kết nối với VPS (SFTP protocol)
- Drag & drop thư mục telegram-bot

### A.5. Giải nén và cài đặt (nếu dùng SCP)

```bash
# Trên VPS
cd /root
unzip telegram-bot.zip
cd telegram-bot

# Cài đặt dependencies
npm install
```

### A.6. Cấu hình Bot

```bash
# Tạo file .env
nano .env

# Nhập nội dung sau:
```

```env
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Admin IDs
ADMIN_IDS=123456789

# Database path
DATABASE_PATH=./data/bot-database.json

# Payment config
BANK_NAME=Vietcombank
BANK_ACCOUNT=1234567890
ACCOUNT_NAME=YOUR NAME
MOMO_NUMBER=0912345678
MOMO_NAME=YOUR NAME
```

```bash
# Lưu file: Ctrl+O, Enter, Ctrl+X

# Tạo thư mục data
mkdir -p data
```

### A.7. Khởi động Bot với PM2

```bash
# Khởi động bot
pm2 start index.js --name "acc-bot"

# Kiểm tra status
pm2 status

# Xem logs
pm2 logs acc-bot

# Lưu cấu hình PM2
pm2 save

# Tự động khởi động cùng VPS
pm2 startup

# Copy lệnh pm2 startup trả về và chạy, ví dụ:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### A.8. Kiểm tra Bot

```bash
# Xem logs real-time
pm2 logs acc-bot --lines 100

# Restart bot
pm2 restart acc-bot

# Stop bot
pm2 stop acc-bot
```

### A.9. Mở Telegram và Test

```
1. Mở Telegram
2. Tìm username bot của bạn
3. Gửi: /start
4. Bot sẽ phản hồi với menu
```

---

## PHƯƠNG ÁN B: CHẠY TRÊN LOCAL

### B.1. Yêu cầu

- Máy tính chạy Windows 10/11
- Node.js v18+ đã cài đặt
- Internet ổn định

### B.2. Cài đặt Node.js (nếu chưa có)

```
1. Truy cập: https://nodejs.org
2. Download LTS version (v18.x hoặc v20.x)
3. Chạy installer, chọn Next -> Next -> Install
4. Mở PowerShell, kiểm tra:
   node --version
   npm --version
```

### B.3. Setup Bot

```powershell
# Mở PowerShell
cd C:\Users\Admin\Documents\webcaythe\telegram-bot

# Chạy script setup
.\setup.bat

# Hoặc cài thủ công:
npm install
```

### B.4. Tạo file .env

Tạo file `.env` trong thư mục `telegram-bot`:

```env
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ADMIN_IDS=123456789
DATABASE_PATH=./data/bot-database.json
BANK_NAME=Vietcombank
BANK_ACCOUNT=1234567890
ACCOUNT_NAME=YOUR NAME
MOMO_NUMBER=0912345678
MOMO_NAME=YOUR NAME
```

### B.5. Khởi động Bot

```powershell
# Cách 1: Chạy trực tiếp
npm start

# Cách 2: Cài PM2 để chạy nền
npm install -g pm2
pm2 start index.js --name "acc-bot"
pm2 save
```

### B.6. Tự động khởi động cùng Windows

```powershell
# Tạo scheduled task
pm2-startup

# Lưu cấu hình
pm2 save
```

---

## PHƯƠNG ÁN C: DEPLOY MIỄN PHÍ

### C.1. Railway.app (Khuyên dùng - Free)

```
1. Truy cập: https://railway.app
2. Sign up với GitHub
3. Click: New Project
4. Deploy from GitHub repo
5. Chọn repository của bạn
6. Thêm environment variables:
   - TELEGRAM_BOT_TOKEN
   - ADMIN_IDS
   - DATABASE_PATH=./data/bot-database.json
7. Deploy
```

### C.2. Render.com (Free)

```
1. Truy cập: https://render.com
2. Sign up với GitHub
3. New -> Web Service
4. Connect repository
5. Settings:
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
6. Add Environment Variables
7. Create Web Service
```

**⚠️ Lưu ý Render Free:**
- Service sẽ sleep sau 15 phút không hoạt động
- Cần "ping" định kỳ để giữ awake
- Không phù hợp cho bot cần 24/7

### C.3. Fly.io (Free tier)

```bash
# Cài đặt flyctl
# Windows:
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login
fly auth signup

# Deploy
cd telegram-bot
fly launch
fly deploy
```

---

## 5. XỬ LÝ LỖI THƯỜNG GẶP

### Lỗi: "Invalid token"

```bash
# Kiểm tra token
curl https://api.telegram.org/bot<TOKEN>/getMe

# Nguyên nhân:
- Token sai format
- Token đã bị revoke
- Thừa/không đủ ký tự

# Khắc phục:
1. Vào @BotFather
2. Gửi: /mybots
3. Chọn bot
4. API Token -> Revoke current token
5. Copy token mới
6. Update .env
7. Restart bot: pm2 restart acc-bot
```

### Lỗi: "ETELEGRAM: 409 Conflict"

```
Nguyên nhân: Bot đang chạy nhiều instance

Khắc phục:
pm2 delete acc-bot
pm2 start index.js --name "acc-bot"
```

### Lỗi: "Cannot find module"

```bash
# Cài lại dependencies
npm install

# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi: "Database not found"

```bash
# Tạo thư mục data
mkdir -p data

# Tạo file database rỗng
echo '{}' > data/bot-database.json
```

### Lỗi: "Admin commands not working"

```
Kiểm tra:
1. ADMIN_IDS trong .env đúng format
   ADMIN_IDS=123456789
   
2. Lấy đúng User ID từ @userinfobot
   
3. Restart bot sau khi đổi .env:
   pm2 restart acc-bot
```

### Lỗi: "Polling error"

```
Nguyên nhân:
- Network issue
- Token invalid
- Bot bị block bởi Telegram

Khắc phục:
1. Kiểm tra network
2. Kiểm tra token
3. Restart bot
```

---

## 6. BACKUP & KHÔI PHỤC

### Backup thủ công

```bash
# Trên VPS
cd /root/telegram-bot
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Download về local
scp root@<VPS_IP>:/root/telegram-bot/backup-*.tar.gz ./
```

### Backup tự động (Cron job)

```bash
# Trên VPS
crontab -e

# Thêm dòng (backup lúc 2h sáng mỗi ngày):
0 2 * * * cd /root/telegram-bot && tar -czf /root/backups/bot-$(date +\%Y\%m\%d).tar.gz data/

# Tạo thư mục backup
mkdir -p /root/backups
```

### Khôi phục

```bash
# Giải nén backup
tar -xzf backup-20240115.tar.gz

# Thay thế data hiện tại
cp -r data /root/telegram-bot/data/

# Restart bot
pm2 restart acc-bot
```

---

## 7. QUẢN LÝ BOT QUA TELEGRAM

### Lệnh Admin (chỉ Admin mới dùng được)

```
/add          - Thêm sản phẩm mới
/products     - Xem danh sách sản phẩm
/edit [id]    - Chỉnh sửa sản phẩm
/delete [id]  - Xóa sản phẩm
/orders       - Xem đơn hàng gần đây
/deposits     - Xem yêu cầu nạp tiền chờ duyệt
/approve [id] - Duyệt nạp tiền
/stats        - Xem thống kê
/broadcast [msg] - Gửi tin nhắn đến tất cả users
```

### Thêm sản phẩm

```
Gửi: /add

Bot sẽ yêu cầu gửi format:
```
```
NAME: Acc Genshin AR60
CATEGORY: genshin
PRICE: 100000
DESC: Acc AR60, full map, 5* characters
ACCOUNTS:
email1@gmail.com-password123-extra_info
email2@gmail.com-password456-
```

**Danh sách category:**
- genshin - Genshin Impact
- lol - League of Legends
- valorant - Valorant
- pubg - PUBG Mobile
- freefire - Free Fire
- other - Khác

---

## 8. GIỚI HẠN CẦN LƯU Ý

### Telegram Bot API Limits

| Item | Giới hạn |
|------|----------|
| Message length | 4096 chars |
| File size | 50MB (sendDocument) |
| Photo size | 10MB |
| Caption length | 1024 chars |
| Callback data | 64 bytes |
| Inline keyboard buttons | 100 buttons |
| Rate limit | 30 msg/sec to same chat |

### Xử lý giới hạn

Bot hiện tại đã được thiết kế để:
- ✅ Chia nhỏ message dài
- ✅ Không gửi quá nhanh
- ✅ Database JSON nhẹ (<100MB ổn định)

---

## 9. MONITORING & LOGS

### Xem logs real-time

```bash
# PM2 logs
pm2 logs acc-bot --lines 200

# Follow logs
pm2 logs acc-bot

# Logs file location
~/.pm2/logs/acc-bot-out.log
~/.pm2/logs/acc-bot-error.log
```

### Monitor resource

```bash
# PM2 monit
pm2 monit

# System resource
htop
```

---

## 10. TIPS & BEST PRACTICES

1. **Luôn backup data** trước khi update code
2. **Test bot** ở local trước khi deploy lên VPS
3. **Giữ token bí mật** - không commit .env lên Git
4. **Monitor logs** thường xuyên để phát hiện lỗi sớm
5. **Update dependencies** định kỳ: `npm update`
6. **Setup SSL** nếu có web dashboard
7. **Rate limiting** - bot không spam messages

---

## 11. CHECKLIST TRƯỚC KHI DEPLOY

```
☐ Bot Token hợp lệ (kiểm tra qua API)
☐ Admin ID đúng
☐ File .env đã tạo
☐ Dependencies đã install
☐ Thư mục data/ đã tạo
☐ Bot test OK ở local
☐ VPS đã setup Node.js + PM2
☐ Code đã upload lên VPS
☐ Bot start thành công qua PM2
☐ Bot phản hồi /start trên Telegram
☐ Admin commands hoạt động
☐ Test mua hàng thành công
☐ Backup data scheduled
```

---

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2 logs acc-bot`
2. Kiểm tra .env file
3. Restart bot: `pm2 restart acc-bot`
4. Kiểm tra network: `ping api.telegram.org`
5. Tạo bot mới từ @BotFather nếu token corrupted

---

**Tác giả:** Kilo Bot  
**Cập nhật:** 2026-06-18  
**Phiên bản:** 1.0.0