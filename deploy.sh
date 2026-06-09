#!/bin/bash

# ============================================
# DEPLOY SCRIPT FOR SHOPDONK
# VPS IP: 103.178.235.184
# Domain: shopdonk.com
# ============================================

set -e

echo "=========================================="
echo "  SHOPDONK DEPLOYMENT SCRIPT"
echo "=========================================="

# Update system
echo "[1/8] Updating system..."
apt update && apt upgrade -y

# Install Node.js 20
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2
echo "[3/8] Installing PM2..."
npm install -g pm2

# Install Nginx
echo "[4/8] Installing Nginx..."
apt install -y nginx

# Install SQL Server 2022
echo "[5/8] Installing SQL Server 2022..."
# Download Microsoft keys
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-archive-keyring.gpg
wget -qO- https://packages.microsoft.com/config/ubuntu/24.04/mssql-server-2022.list | tee /etc/apt/sources.list.d/mssql-server-2022.list

apt update
apt install -y mssql-server

# Setup SQL Server (requires interactive input)
echo ""
echo "=========================================="
echo "SQL Server Installation"
echo "=========================================="
echo "Please run: sudo /opt/mssql/bin/mssql-server setup"
echo "Choose:"
echo "  - Edition: 3 (Express - Free)"
echo "  - Language: English"
echo "  - SA Password: [Set strong password]"
echo "=========================================="

# Install SQL Server tools
echo "[6/8] Installing SQL Server tools..."
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > /usr/share/keyrings/microsoft-archive-keyring.gpg
curl https://packages.microsoft.com/config/ubuntu/24.04/prod.list | tee /etc/apt/sources.list.d/msprod.list
apt update
apt install -y mssql-tools unixodbc-dev

# Clone project from GitHub
echo "[7/8] Cloning project from GitHub..."
cd /var/www
git clone https://github.com/phancongdong/shopdonk.git
cd shopdonk
npm install --production

# Create .env file
echo "[8/8] Creating environment file..."
cat > .env << 'ENVEOF'
PORT=3000
NODE_ENV=production

# Database Configuration
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=ShopDonkDB
DB_USER=sa
DB_PASSWORD=YOUR_SA_PASSWORD_HERE
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Secret
JWT_SECRET=shopdonk_jwt_secret_key_2024_change_this

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Credentials
ADMIN_EMAIL=admin@shopdonk.com
ADMIN_PASSWORD=Admin@123456
ENVEOF

# Configure Nginx
echo "[9/10] Configuring Nginx..."
cat > /etc/nginx/sites-available/shopdonk << 'NGINXEOF'
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
NGINXEOF

ln -sf /etc/nginx/sites-available/shopdonk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Setup PM2
echo "[10/10] Setting up PM2..."
pm2 start server.js --name shopdonk
pm2 save
pm2 startup

echo ""
echo "=========================================="
echo "  DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Setup SQL Server: sudo /opt/mssql/bin/mssql-server setup"
echo "2. Edit .env file: nano /var/www/shopdonk/.env"
echo "3. Create database: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YOUR_PASSWORD"
echo "4. Run database scripts in /var/www/shopdonk/database/"
echo "5. Install SSL: certbot --nginx -d shopdonk.com -d www.shopdonk.com"
echo "6. Restart app: pm2 restart shopdonk"
echo ""
echo "Website will be available at: http://shopdonk.com"
echo "=========================================="
