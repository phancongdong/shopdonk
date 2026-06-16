const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { securityAuditMiddleware } = require('./middleware/securityAudit');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const depositRoutes = require('./routes/deposits');
const paymentRoutes = require('./routes/payment');
const bannerRoutes = require('./routes/banner');
const uploadRoutes = require('./routes/upload');
const seoRoutes = require('./routes/seo');
const pageSeoRoutes = require('./routes/pageSeo');
const migrationRoutes = require('./routes/migration');

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
    'https://shopdonk.com',
    'https://www.shopdonk.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5500', 'http://127.0.0.1:5500');
}

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    const cspDirectives = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://cdn.tailwindcss.com https://unpkg.com https://accounts.google.com https://oauth2.googleapis.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.tailwindcss.com",
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://oauth2.googleapis.com https://shopdonk.com https://api.cloudinary.com",
        "frame-src https://accounts.google.com",
        "object-src 'none'",
        "base-uri 'self'"
    ];
    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
    
    res.setHeader('X-Content-Security-Policy', cspDirectives.join('; '));
    
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const origin = req.headers.origin || req.headers.referer;
        const allowedOriginsList = [
            'https://shopdonk.com',
            'https://www.shopdonk.com',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
        
        if (process.env.NODE_ENV !== 'production') {
            allowedOriginsList.push('http://localhost:5500', 'http://127.0.0.1:5500');
        }
        
        if (origin && !allowedOriginsList.some(allowed => origin.startsWith(allowed))) {
            console.warn(`[CSRF] Blocked request from invalid origin: ${origin}`);
            return res.status(403).json({
                success: false,
                message: 'Invalid origin'
            });
        }
    }
    
    next();
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
    standardHeaders: true,
    legacyHeaders: false
});

const orderLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Quá nhiều đơn hàng, vui lòng thử lại sau 1 phút' },
    standardHeaders: true,
    legacyHeaders: false
});

const depositLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Quá nhiều yêu cầu nạp tiền, vui lòng thử lại sau 5 phút' },
    standardHeaders: true,
    legacyHeaders: false
});

const passwordChangeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: { success: false, message: 'Quá nhiều yêu cầu đổi mật khẩu, vui lòng thử lại sau 1 giờ' },
    standardHeaders: true,
    legacyHeaders: false
});

const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Quá nhiều upload, vui lòng thử lại sau 5 phút' },
    standardHeaders: true,
    legacyHeaders: false
});

const adminActionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: { success: false, message: 'Quá nhiều thao tác admin, vui lòng thử lại sau' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(securityAuditMiddleware);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/change-password', passwordChangeLimiter);
app.use('/api/orders', orderLimiter);
app.use('/api/deposits', depositLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/upload-url', uploadLimiter);
app.use('/api/admin', adminActionLimiter);
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);
app.use('/api', depositRoutes);
app.use('/api', paymentRoutes);
app.use('/api', bannerRoutes);
app.use('/api', uploadRoutes);
app.use('/api', seoRoutes);
app.use('/api', pageSeoRoutes);
app.use('/api/admin', migrationRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

app.get('/deposit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'deposit.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'orders.html'));
});

app.get('/transactions', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'transactions.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/category', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'category.html'));
});

app.get('/product/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:slug', (req, res, next) => {
    const slug = req.params.slug;
    if (slug.includes('.') || slug.includes('..') || slug === 'api' || slug === 'admin') {
        return next();
    }
    if (!/^[a-zA-Z0-9\-_]+$/.test(slug)) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/config', (req, res) => {
    res.json({
        success: true,
        data: {
            googleClientId: process.env.GOOGLE_CLIENT_ID || null
        }
    });
});

app.get('/sitemap.xml', async (req, res) => {
    try {
        const { query } = require('./config/database');
        
        const products = await query('SELECT slug, updated_at FROM Products WHERE is_hidden = 0');
        const categories = await query('SELECT slug, updated_at FROM Categories');
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        const staticPages = [
            { loc: 'https://shopdonk.com/', priority: '1.0', changefreq: 'daily' },
            { loc: 'https://shopdonk.com/login.html', priority: '0.8', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/register.html', priority: '0.8', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/deposit.html', priority: '0.7', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/orders.html', priority: '0.7', changefreq: 'daily' },
            { loc: 'https://shopdonk.com/profile.html', priority: '0.5', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/change-password.html', priority: '0.5', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/transactions.html', priority: '0.5', changefreq: 'daily' },
            { loc: 'https://shopdonk.com/faq.html', priority: '0.6', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/contact.html', priority: '0.6', changefreq: 'monthly' }
        ];
        
        staticPages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${page.loc}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });
        
        categories.recordset.forEach(cat => {
            xml += '  <url>\n';
            xml += `    <loc>https://shopdonk.com/${cat.slug}</loc>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += '    <priority>0.9</priority>\n';
            if (cat.updated_at) {
                xml += `    <lastmod>${cat.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
            }
            xml += '  </url>\n';
        });
        
        products.recordset.forEach(prod => {
            xml += '  <url>\n';
            xml += `    <loc>https://shopdonk.com/product/${prod.slug}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += '    <priority>0.8</priority>\n';
            if (prod.updated_at) {
                xml += `    <lastmod>${prod.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
            }
            xml += '  </url>\n';
        });
        
        xml += '</urlset>';
        
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.use((err, req, res, next) => {
    console.error('Server error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau'
    });
});

const PORT = process.env.PORT || 3000;

async function migrateDatabase() {
    const { query } = require('./config/database');
    
    try {
        console.log('🔄 Running database migrations...');
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'google_id')
            BEGIN
                ALTER TABLE Users ADD google_id NVARCHAR(100) NULL
                PRINT 'Added google_id column'
            END
        `);
        
        await query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'avatar')
            BEGIN
                ALTER TABLE Users ADD avatar NVARCHAR(500) NULL
                PRINT 'Added avatar column'
            END
        `);
        
        console.log('✅ Database migrations completed');
    } catch (error) {
        console.error('❌ Migration error:', error.message);
    }
}

async function startServer() {
    try {
        await connectDB();
        await migrateDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Database: ${process.env.DB_DATABASE}`);
            console.log(`🔒 Security: CORS, Rate Limiting, Security Headers enabled`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();