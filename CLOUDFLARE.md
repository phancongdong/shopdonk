# Hướng dẫn Deploy với Cloudflare

## Giới thiệu Cloudflare

Cloudflare cung cấp:
- ✅ DNS miễn phí
- ✅ SSL/HTTPS miễn phí
- ✅ CDN toàn cầu
- ✅ DDoS Protection
- ✅ Cloudflare Pages (Hosting tĩnh)
- ✅ Cloudflare Workers (Serverless)
- ✅ Cloudflare Tunnel (Kết nối local server)

## Option 1: Cloudflare Pages + External Backend (Recommended)

### Kiến trúc:
```
[User] → [Cloudflare Pages] → Frontend (HTML/CSS/JS)
                           ↓
[Cloudflare Workers/API] → Backend (Node.js)
                           ↓
[Your SQL Server / Azure SQL] → Database
```

### Bước 1: Chuẩn bị Database

**Option A: SQL Server công khai (VPS/Azure)**
- Azure SQL: https://portal.azure.com → SQL Database ($5/mo)
- Hoặc VPS với public IP

**Option B: Giữ SQL Server local + Cloudflare Tunnel**
- Không cần public IP
- Secure tunnel to Cloudflare

### Bước 2: Setup Cloudflare Account

1. **Đăng ký:**
   - Truy cập: https://dash.cloudflare.com/sign-up
   - Đăng ký miễn phí

2. **Add Site (Thêm tên miền):**
   - Dashboard → Add Site
   - Nhập tên miền của bạn
   - Chọn **Free Plan**

3. **Change Nameservers:**
   - Copy nameservers Cloudflare cung cấp (ví dụ: `dan.ns.cloudflare.com`, `tina.ns.cloudflare.com`)
   - Đăng nhập trang quản lý tên miền (where you bought the domain)
   - DNS Settings → Nameservers → Replace với Cloudflare nameservers
   - Đợi 24-48h để propagate

### Bước 3: Deploy Frontend với Cloudflare Pages

**Method A: Direct Upload**

```bash
# Build project (nếu cần)
# npm run build

# Deploy via Dashboard
```

1. Cloudflare Dashboard → **Pages**
2. **Create Project** → **Direct Upload**
3. Project name: `webcaythe`
4. Upload folder: Chọn thư mục `C:\Users\Admin\Documents\webcaythe`
5. Click **Deploy site**

**Method B: GitHub Integration (Recommended)**

1. Push code lên GitHub:
```bash
cd C:\Users\Admin\Documents\webcaythe
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/webcaythe.git
git push -u origin main
```

2. Cloudflare Dashboard → **Pages** → **Connect to Git**
3. Authorize GitHub
4. Select repository: `webcaythe`
5. Configure build:
   - Build command: `npm install` (hoặc để trống)
   - Build output: `/` (root)
6. Add environment variables:
   - `DB_SERVER`, `DB_PASSWORD`, etc.
7. **Deploy**

### Bước 4: Deploy Backend với Cloudflare Workers

**Limitations:** Cloudflare Workers không hỗ trợ SQL Server trực tiếp tốt.

**Solutions:**

**Option A: Use Cloudflare Workers + HTTP API**

Chuyển backend thành REST API độc lập:

1. **Tạo file `worker.js`:**

```javascript
// worker.js
import { connect } from '@cloudflare/workers-types';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Routes
    if (url.pathname === '/api/auth/login') {
      return handleLogin(request, env);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

async function handleLogin(request, env) {
  const { email, password } = await request.json();
  // Connect to your database API
  const response = await fetch('YOUR_BACKEND_URL/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  return new Response(await response.text(), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
```

**Option B: Use External Backend (Recommended)**

Giữ backend trên VPS/Railway, chỉ dùng Cloudflare cho:
- DNS
- CDN cho frontend
- SSL

### Bước 5: Setup Cloudflare Tunnel (Kết nối Local SQL Server)

**Nếu muốn giữ SQL Server local:**

1. **Install cloudflared:**
```powershell
# Windows
winget install cloudflare.cloudflared
```

2. **Authenticate:**
```powershell
cloudflared tunnel login
```

3. **Create Tunnel:**
```powershell
cloudflared tunnel create caythe-tunnel
```

4. **Configure Tunnel:**

Tạo file `C:\Users\Admin\.cloudflared\config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: C:\Users\Admin\.cloudflared\YOUR_TUNNEL_ID.json

ingress:
  - hostname: yourdomain.com
    service: http://localhost:3000
  - hostname: db.yourdomain.com
    service: tcp://localhost:1433
  - service: http_status:404
```

5. **Route Tunnel:**
```powershell
cloudflared tunnel route dns caythe-tunnel yourdomain.com
cloudflared tunnel route dns caythe-tunnel db.yourdomain.com
```

6. **Run Tunnel:**
```powershell
cloudflared tunnel run caythe-tunnel
```

7. **Install as Windows Service:**
```powershell
cloudflared service install
sc start cloudflared
```

### Bước 6: Configure DNS

1. Cloudflare Dashboard → **DNS** → **Records**
2. Add records:

**For Cloudflare Pages:**
```
Type: CNAME
Name: @
Target: webcaythe.pages.dev
Proxy: ✅ (Orange cloud)
```

```
Type: CNAME
Name: www
Target: webcaythe.pages.dev
Proxy: ✅
```

**For Backend (if using external):**
```
Type: A
Name: api
Target: YOUR_VPS_IP
Proxy: ✅
```

**For Tunnel:**
```
Type: CNAME
Name: db
Target: YOUR_TUNNEL_ID.cfargotunnel.com
Proxy: ✅
```

### Bước 7: SSL/TLS Configuration

1. Cloudflare Dashboard → **SSL/TLS**
2. **Overview** → Encryption mode: **Full** hoặc **Full (Strict)**
3. **Edge Certificates**:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - Minimum TLS Version: 1.2

### Bước 8: Performance Optimization

**Speed → Optimization:**
- ✅ Auto Minify (HTML, CSS, JS)
- ✅ Brotli
- ✅ Early Hints
- ✅ Rocket Loader (optional)

**Caching:**
```javascript
// In Page Rules or Configuration
Cache Level: Standard
Browser Cache TTL: 4 hours
```

### Bước 9: Security Settings

**Security → Settings:**
- Security Level: Medium
- Challenge Passage: 30 minutes
- Browser Integrity Check: ✅

**WAF (Web Application Firewall):**
- Enable Managed Rulesets

**Rate Limiting:**
```
Security → WAF → Rate Limiting Rules
Path: /api/*
Rate: 100 requests / 1 minute
Action: Block
```

## Option 2: Full Cloudflare Setup

### Architecture:

```
Frontend: Cloudflare Pages (Free)
Backend: Cloudflare Workers (Free tier: 100k requests/day)
Database: Cloudflare D1 (SQLite) hoặc External SQL Server
```

### Setup D1 Database:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Create D1 database
wrangler d1 create caythe-db

# Configure in wrangler.toml
```

`wrangler.toml`:
```toml
name = "webcaythe-api"
main = "worker.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "caythe-db"
database_id = "YOUR_DATABASE_ID"
```

**Note:** D1 là SQLite, không phải SQL Server. Cần migrate schema.

## Option 3: Hybrid Approach (Best for SQL Server)

### Architecture:
```
[User]
  ↓
[Cloudflare DNS + CDN] → yourdomain.com
  ↓
[Cloudflare Pages] → Frontend (HTML/CSS/JS)
  ↓
[Backend API] → External VPS/Railway/Azure
  ↓
[Azure SQL / VPS SQL Server] → Database
```

### Steps:

1. **Frontend:** Cloudflare Pages
2. **Backend:** Deploy lên Railway.app hoặc Azure App Service
3. **Database:** Azure SQL Database
4. **DNS:** Cloudflare quản lý domain

### Update Frontend API Calls:

Edit `script.js`:
```javascript
// Thay đổi API endpoint
const API_BASE = 'https://api.yourdomain.com';

// Hoặc dùng relative path nếu backend cùng domain
const API_BASE = window.location.origin;

// Ví dụ:
const response = await fetch(`${API_BASE}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

## Deployment Checklist

### Pre-deployment:
- [ ] Remove sensitive data từ code
- [ ] Update .env với production values
- [ ] Test tất cả APIs
- [ ] Optimize images
- [ ] Minify CSS/JS

### Cloudflare Setup:
- [ ] Create Cloudflare account
- [ ] Add site to Cloudflare
- [ ] Update nameservers
- [ ] Configure DNS records
- [ ] Enable SSL/TLS
- [ ] Configure caching
- [ ] Setup WAF rules

### Backend Deployment:
- [ ] Deploy backend lên VPS/Railway/Azure
- [ ] Configure environment variables
- [ ] Test API endpoints
- [ ] Setup database connection
- [ ] Enable CORS

### Post-deployment:
- [ ] Test website on https://yourdomain.com
- [ ] Check SSL certificate
- [ ] Monitor analytics
- [ ] Setup error tracking
- [ ] Configure backups

## Quick Start Commands

### Deploy Frontend to Cloudflare Pages:

```bash
# Method 1: Via Dashboard
# Upload directly hoặc connect GitHub

# Method 2: Via Wrangler CLI
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name=webcaythe
```

### Setup Cloudflare Tunnel:

```bash
# Install
winget install cloudflare.cloudflared

# Login
cloudflared tunnel login

# Create
cloudflared tunnel create caythe

# Run
cloudflared tunnel run caythe
```

### Configure DNS via CLI:

```bash
# Add A Record
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/dns_records" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"@","content":"YOUR_IP","ttl":3600,"proxied":true}'
```

## Troubleshooting

### SSL Issues:
- Set SSL mode to "Full" in Cloudflare
- Check certificate status

### CORS Errors:
```javascript
// Add to backend server.js
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true
}));
```

### Database Connection:
- Use `trustServerCertificate: true` in connection config
- Whitelist Cloudflare IPs in firewall

### Performance:
- Enable "Rocket Loader" carefully (may break scripts)
- Use "Early Hints" for faster loading
- Configure "Cache Rules" for static assets

## Cost Summary

| Service | Free Tier | Paid |
|---------|-----------|------|
| Cloudflare DNS | ✅ Free forever | - |
| Cloudflare Pages | ✅ Free (500 builds/mo) | $20/mo Pro |
| Cloudflare Workers | ✅ Free (100k req/day) | $5/mo |
| Azure SQL Database | - | $5/mo Basic |
| Railway.app | ✅ Free tier | $5/mo |

**Total with free tier:** $0/month  
**Total for production:** ~$10/month

## Support & Resources

- Cloudflare Docs: https://developers.cloudflare.com
- Cloudflare Community: https://community.cloudflare.com
- YouTube: Cloudflare Tutorials
- Discord: Cloudflare Community

## Next Steps

1. **Sign up Cloudflare:** https://dash.cloudflare.com/sign-up
2. **Add your domain**
3. **Update nameservers**
4. **Deploy frontend to Pages**
5. **Deploy backend to Railway/VPS**
6. **Configure DNS**
7. **Enable SSL**
8. **Test everything**

Bạn muốn help với bước nào?