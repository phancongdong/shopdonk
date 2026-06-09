# DEPLOY GUIDE - SHOPDONK

## THÔNG TIN VPS
- IP: `103.178.235.184`
- Domain: `shopdonk.com`
- GitHub: `https://github.com/phancongdong/shopdonk`

## BƯỚC 1: SSH VÀO VPS

### Cách 1: Dùng PowerShell/CMD
```powershell
ssh ubuntu@103.178.235.184
# hoặc
ssh root@103.178.235.184
```

### Cách 2: Reset Password qua Dashboard VPS
1. Đăng nhập: https://order.vpsttt.com/dangnhap
2. Vào VPS → Reset Password
3. Thiết lập password mới (ví dụ: `ShopDonk@2024`)
4. SSH với username/password mới

## BƯỚC 2: TẢI SCRIPT DEPLOY

### Option A: Copy script từ local
1. Upload file `deploy.sh` từ máy local:
```powershell
scp C:\Users\Admin\Documents\webcaythe\deploy.sh ubuntu@103.178.235.184:/tmp/
```

### Option B: Tạo trực tiếp trên VPS
Sau khi SSH vào VPS, chạy từng lệnh dưới đây.

## BƯỚC 3: CÀI ĐẶT HỆ THỐNG (CHẠY TỪNG LỆNH)

### Update hệ thống
```bash
apt update && apt upgrade -y
```

### Cài đặt Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version
```

### Cài đặt PM2
```bash
npm install -g pm2
pm2 --version
```

### Cài đặt Nginx
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### Cài đặt SQL Server 2022
```bash
# Import Microsoft GPG key
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-archive-keyring.gpg

# Add SQL Server repository
wget -qO- https://packages.microsoft.com/config/ubuntu/24.04/mssql-server-2022.list | tee /etc/apt/sources.list.d/mssql-server-2022.list

# Update and install
apt update
apt install -y mssql-server

# Setup SQL Server (INTERACTIVE)
/opt/mssql/bin/mssql-server setup
# Chọn:
#   - Edition: 3 (Express - Free)
#   - License: Yes
#   - Language: English (1)
#   - SA Password: ShopDonk@2024 (ghi nhớ password này)
#   - Start service: Yes

# Verify SQL Server running
systemctl status mssql-server
```

### Cài đặt SQL Server Tools
```bash
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-archive-keyring.gpg
curl https://packages.microsoft.com/config/ubuntu/24.04/prod.list | tee /etc/apt/sources.list.d/msprod.list
apt update
apt install -y mssql-tools unixodbc-dev

# Add to PATH
echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
source ~/.bashrc
```

### Clone project từ GitHub
```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/phancongdong/shopdonk.git
cd shopdonk
npm install --production
```

### Tạo file .env
```bash
nano /var/www/shopdonk/.env
```

Copy nội dung:
```
PORT=3000
NODE_ENV=production

DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=ShopDonkDB
DB_USER=sa
DB_PASSWORD=ShopDonk@2024
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=shopdonk_jwt_secret_production_2024_secure_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_EMAIL=admin@shopdonk.com
ADMIN_PASSWORD=Admin@123456
```

Save: Ctrl+O → Enter → Ctrl+X

### Cấu hình Nginx
```bash
nano /etc/nginx/sites-available/shopdonk
```

Copy nội dung:
```nginx
server {
    listen 80;
    server_name shopdonk.com www.shopdonk.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
```

Enable site:
```bash
ln -sf /etc/nginx/sites-available/shopdonk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Tạo Database
```bash
sqlcmd -S localhost -U sa -P 'ShopDonk@2024' -i /var/www/shopdonk/database/deploy-setup.sql
```

### Chạy ứng dụng với PM2
```bash
cd /var/www/shopdonk
pm2 start server.js --name shopdonk
pm2 save
pm2 startup
```

### Cài đặt SSL (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d shopdonk.com -d www.shopdonk.com
# Nhập email
# Agree terms: Y
# Redirect HTTP to HTTPS: 2 (Recommended)
```

## BƯỚC 4: VERIFICATION

### Kiểm tra services
```bash
pm2 status
systemctl status nginx
systemctl status mssql-server
```

### Test website
```bash
curl http://localhost:3000
curl https://shopdonk.com
```

## BƯỚC 5: TẠO ADMIN USER

```bash
cd /var/www/shopdonk
node create-admin.js
# Email: admin@shopdonk.com
# Password: Admin@123456
```

## LỆNH QUẢN TRỌ

### Restart app
```bash
pm2 restart shopdonk
pm2 logs shopdonk
pm2 stop shopdonk
```

### Update code
```bash
cd /var/www/shopdonk
git pull
npm install --production
pm2 restart shopdonk
```

### Check logs
```bash
pm2 logs shopdonk
tail -f /var/log/nginx/error.log
journalctl -u mssql-server -f
```

## FIREWALL (OPTIONAL)

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

## THÔNG TIN QUAN TRỌNG

- **SQL Server SA Password:** `ShopDonk@2024`
- **Admin Email:** `admin@shopdonk.com`
- **Admin Password:** `Admin@123456`
- **Website:** `https://shopdonk.com`

## HỖ TRỢ

Nếu gặp lỗi:
1. Check logs: `pm2 logs shopdonk`
2. Check database: `systemctl status mssql-server`
3. Check nginx: `nginx -t`
4. Check port: `netstat -tulpn | grep :3000`

## LIÊN HỆ

- GitHub: https://github.com/phancongdong/shopdonk
- VPS Support: https://order.vpsttt.com