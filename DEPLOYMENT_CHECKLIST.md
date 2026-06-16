# DEPLOYMENT CHECKLIST - SHOPDONK

## PRE-DEPLOYMENT (CRITICAL)

### 1. Secrets Rotation
- [ ] Generate new JWT_SECRET (64+ hex chars): `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Generate new SESSION_SECRET (64+ hex chars)
- [ ] Generate new CSRF_SECRET
- [ ] Rotate database password
- [ ] Update Cloudinary API credentials
- [ ] Update Google OAuth Client ID/Secret
- [ ] Update admin password

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in ALL required environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Set `DB_ENCRYPT=true`
- [ ] Set `DB_TRUST_SERVER_CERTIFICATE=false`
- [ ] Remove any hardcoded credentials from code

### 3. Database Setup
- [ ] Run `node scripts/create-sessions-table.js` to create Sessions table
- [ ] Verify all indexes are created
- [ ] Test session creation

### 4. Security Headers
- [ ] Verify CSP headers are set
- [ ] Verify HSTS is enabled
- [ ] Verify X-Frame-Options: DENY
- [ ] Verify X-Content-Type-Options: nosniff

## DEPLOYMENT

### 1. Code Deployment
```bash
# On VPS
cd /var/www/shopdonk
git pull origin main
npm install --production
```

### 2. Database Migration
```bash
# Create Sessions table
node scripts/create-sessions-table.js
```

### 3. Restart Services
```bash
pm2 restart shopdonk
pm2 save
```

### 4. Verify Services
```bash
# Check application status
pm2 status

# Check logs
pm2 logs shopdonk --lines 50

# Test endpoint
curl -I https://shopdonk.com
```

## POST-DEPLOYMENT VERIFICATION

### 1. Security Tests
- [ ] Run `node scripts/verify-security.js`
- [ ] Test login functionality
- [ ] Test session persistence after restart
- [ ] Test rate limiting (try >10 logins in 15min)
- [ ] Test authorization (try accessing /api/admin without admin role)

### 2. Functionality Tests
- [ ] User registration works
- [ ] User login works
- [ ] Password change works with complexity requirements
- [ ] Order creation works
- [ ] Deposit flow works
- [ ] Admin panel accessible

### 3. Cleanup
- [ ] Remove `.git` directory from production (or block access via nginx)
- [ ] Remove debug scripts from production
- [ ] Set proper file permissions: `chmod 600 .env`
- [ ] Verify `.env` is not accessible via URL

### 4. Monitoring Setup
- [ ] Configure PM2 monitoring
- [ ] Set up log rotation
- [ ] Configure alerting for errors

## NGINX HARDENING (Optional but Recommended)

Add to nginx config:
```nginx
# Block access to sensitive files
location ~ /\.(git|env|htaccess) {
    deny all;
    return 404;
}

# Block access to sensitive paths
location ~* ^/(scripts|config|models|controllers|middleware|routes|utils)/ {
    deny all;
    return 404;
}

# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com https://unpkg.com https://accounts.google.com https://oauth2.googleapis.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https: blob:; connect-src 'self' https://oauth2.googleapis.com https://shopdonk.com https://api.cloudinary.com; frame-src https://accounts.google.com; object-src 'none'; base-uri 'self';" always;
```

## ROLLBACK PROCEDURE

If issues occur:
```bash
# Rollback code
git checkout HEAD~1

# Restart PM2
pm2 restart shopdonk

# Check logs
pm2 logs shopdonk
```

## EMERGENCY CONTACTS

- Database Admin: [CONTACT]
- System Admin: [CONTACT]
- Security Team: [CONTACT]