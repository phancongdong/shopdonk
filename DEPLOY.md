# Hướng dẫn Deploy Website lên Internet

## Các cách deploy:

### 1. VPS/Cloud Server (Recommended cho SQL Server)

#### A. Azure Virtual Machine (Microsoft Azure)
- phù hợp với SQL Server
- Có SQL Server template sẵn

**Steps:**
1. Tạo Azure account: https://portal.azure.com
2. Create Virtual Machine:
   - Image: Windows Server + SQL Server
   - Size: Standard_B2ms (2 vCPU, 8GB RAM)
3. Configure firewall:
   - Open port 80 (HTTP)
   - Open port 443 (HTTPS)
   - Open port 1433 (SQL Server - optional)
4. Connect via RDP
5. Install Node.js, copy project
6. Configure domain

#### B. DigitalOcean Droplet
- Price: $12/month (2GB RAM)
- Good for Node.js apps

**Steps:**
1. Create Droplet at: https://digitalocean.com
2. Choose Ubuntu 20.04
3. Connect via SSH
4. Install Node.js, SQL Server (or use remote DB)
5. Setup nginx reverse proxy
6. Point domain to droplet IP

#### C. AWS EC2
- Free tier 12 months
- Flexible configuration

### 2. Platform Services (Easier)

#### A. Railway.app
- Free tier available
- Auto deploy from GitHub
- Can use PostgreSQL (instead of SQL Server)

**Steps:**
1. Push code to GitHub
2. Connect Railway to GitHub
3. Deploy automatically
4. Add custom domain

#### B. Vercel + External Database
- Free hosting for frontend
- Backend on separate service
- Database: Use Azure SQL or managed SQL

#### C. Render.com
- Free web service
- Managed PostgreSQL
- Auto SSL certificates

### 3. Traditional Hosting (FTP)

#### A. Shared Hosting
- Upload via FTP
- May not support Node.js well
- Use PHP/MySQL instead

#### B. Windows Plesk Hosting
- Supports Node.js
- Supports SQL Server
- Upload via FTP or Plesk panel

## Chi tiết từng bước:

### Option 1: VPS với DigitalOcean (Chi tiết)

#### Step 1: Setup Server
```bash
# SSH vào server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install nginx
sudo apt update
sudo apt install nginx

# Install SQL Server or use remote Azure SQL
# (See Microsoft docs for Linux SQL Server)
```

#### Step 2: Deploy Project
```bash
# Clone project
git clone your-repo-url
cd webcaythe

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit DB connection for remote DB

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

#### Step 3: Configure Nginx
```nginx
# /etc/nginx/sites-available/webcaythe
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/webcaythe /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 4: Point Domain to Server
- Go to domain registrar (where you bought domain)
- DNS Settings:
  - A Record: @ → server IP
  - A Record: www → server IP
  - Wait 24-48 hours for DNS propagation

#### Step 5: SSL Certificate (HTTPS)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto renew
sudo certbot renew --dry-run
```

### Option 2: Railway.app (Simple)

#### Step 1: Prepare for Railway
```bash
# Add start script to package.json
"scripts": {
  "start": "node server.js"
}

# Create railway.json or railway.toml
```

#### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/webcaythe.git
git push -u origin main
```

#### Step 3: Deploy on Railway
1. Go to: https://railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub repo
4. Select `webcaythe` repo
5. Add environment variables (DB connection)
6. Railway auto-deploys

#### Step 4: Add Custom Domain
1. Settings → Domains
2. Add your domain
3. Update DNS at registrar:
   - CNAME: @ → railway.app URL
   - Or A Record with Railway IP

### Option 3: Azure SQL + Vercel (Hybrid)

#### Step 1: Create Azure SQL Database
1. Azure Portal → SQL Database
2. Create server + database
3. Get connection string
4. Configure firewall (allow all IPs or specific)

#### Step 2: Deploy Backend
- Use Azure App Service or Railway

#### Step 3: Deploy Frontend on Vercel
```bash
# Separate frontend/backend
# Frontend (Vercel):
vercel --prod

# Backend stays on Railway/Azure
```

### Database Options for Cloud:

#### 1. Azure SQL Database (Managed SQL Server)
- Price: ~$5/month (Basic tier)
- Automatic backups
- Managed by Microsoft

#### 2. Switch to PostgreSQL (Better for cloud)
- Free on Railway/Render
- More cloud-friendly
- Modify code:
```javascript
// Install pg instead of mssql
npm install pg
// Update database.js for PostgreSQL
```

#### 3. MongoDB Atlas
- Free tier (512MB)
- Easy cloud deployment
- Good for modern apps

### Security Checklist:

1. ✅ Update .env with production values
2. ✅ Use strong passwords for DB
3. ✅ Enable SSL/HTTPS
4. ✅ Configure firewall rules
5. ✅ Setup rate limiting
6. ✅ Enable CORS properly
7. ✅ Regular backups
8. ✅ Remove sensitive files from git

### Cost Estimates:

| Option | Cost | Notes |
|--------|------|-------|
| DigitalOcean Droplet | $12-24/mo | Full VPS |
| Azure VM | $15-30/mo | Windows+SQL Server |
| Railway.app | $0-5/mo | Free tier available |
| Vercel | $0-20/mo | Free for frontend |
| Render | $0-7/mo | Free tier + paid |
| Azure SQL Basic | $5/mo | Managed SQL |

### Recommended Setup:

**For production:**
- Frontend: Vercel (Free, SSL included)
- Backend: Railway.app or DigitalOcean ($5-12/mo)
- Database: Azure SQL Basic ($5/mo) or Railway PostgreSQL (Free)
- Domain: Point to services

**Total cost: ~$0-15/month**

### Next Steps:

1. Choose deployment method
2. Prepare database (Azure SQL recommended)
3. Push code to GitHub
4. Deploy backend
5. Configure domain DNS
6. Enable SSL
7. Test everything

### Quick Commands:

```bash
# Check if site is running
curl http://yourdomain.com

# Check SSL
curl https://yourdomain.com

# Check DNS
nslookup yourdomain.com

# Monitor logs
pm2 logs
# or
journalctl -u nginx
```

## Support:

- DigitalOcean tutorials: https://www.digitalocean.com/community/tutorials
- Railway docs: https://docs.railway.app
- Azure docs: https://docs.microsoft.com/azure
- Vercel docs: https://vercel.com/docs