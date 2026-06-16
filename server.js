const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
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

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));

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
    if (slug.includes('.') || slug === 'api' || slug === 'admin') {
        return next();
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
            { loc: 'https://shopdonk.com/login.html', priority: '0.5', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/register.html', priority: '0.5', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/deposit.html', priority: '0.5', changefreq: 'monthly' },
            { loc: 'https://shopdonk.com/orders.html', priority: '0.5', changefreq: 'monthly' },
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
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
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
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
