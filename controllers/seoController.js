const { query } = require('../config/database');

async function getPublicSeoSettings(req, res) {
    try {
        const result = await query('SELECT TOP 1 * FROM SEOSettings ORDER BY updated_at DESC');
        
        if (result.recordset.length > 0) {
            const settings = result.recordset[0];
            res.json({
                success: true,
                data: {
                    site_title: settings.site_title,
                    site_description: settings.site_description,
                    site_keywords: settings.site_keywords,
                    google_verification: settings.google_verification,
                    google_analytics_id: settings.google_analytics_id,
                    og_title: settings.og_title,
                    og_description: settings.og_description,
                    og_image: settings.og_image,
                    robots_txt: settings.robots_txt,
                    allow_google: settings.allow_google
                }
            });
        } else {
            res.json({
                success: true,
                data: null
            });
        }
    } catch (error) {
        console.error('Get public SEO settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getSeoSettings(req, res) {
    try {
        const result = await query('SELECT TOP 1 * FROM SEOSettings ORDER BY updated_at DESC');
        
        if (result.recordset.length > 0) {
            res.json({
                success: true,
                data: result.recordset[0]
            });
        } else {
            res.json({
                success: true,
                data: null
            });
        }
    } catch (error) {
        console.error('Get SEO settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function saveSeoSettings(req, res) {
    try {
        const {
            google_verification,
            google_analytics_id,
            site_title,
            site_description,
            site_keywords,
            og_title,
            og_description,
            og_image,
            robots_txt,
            allow_google
        } = req.body;
        
        const existing = await query('SELECT TOP 1 id FROM SEOSettings');
        
        if (existing.recordset.length > 0) {
            await query(`
                UPDATE SEOSettings SET
                    google_verification = @param0,
                    google_analytics_id = @param1,
                    site_title = @param2,
                    site_description = @param3,
                    site_keywords = @param4,
                    og_title = @param5,
                    og_description = @param6,
                    og_image = @param7,
                    robots_txt = @param8,
                    allow_google = @param9,
                    updated_at = GETDATE()
            `, [
                google_verification || null,
                google_analytics_id || null,
                site_title || null,
                site_description || null,
                site_keywords || null,
                og_title || null,
                og_description || null,
                og_image || null,
                robots_txt || null,
                allow_google ? 1 : 0
            ]);
        } else {
            await query(`
                INSERT INTO SEOSettings (
                    google_verification, google_analytics_id, site_title, site_description,
                    site_keywords, og_title, og_description, og_image, robots_txt, allow_google,
                    created_at, updated_at
                ) VALUES (
                    @param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9,
                    GETDATE(), GETDATE()
                )
            `, [
                google_verification || null,
                google_analytics_id || null,
                site_title || null,
                site_description || null,
                site_keywords || null,
                og_title || null,
                og_description || null,
                og_image || null,
                robots_txt || null,
                allow_google ? 1 : 0
            ]);
        }
        
        res.json({
            success: true,
            message: 'Lưu cấu hình SEO thành công'
        });
    } catch (error) {
        console.error('Save SEO settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function generateSitemap(req, res) {
    try {
        const fs = require('fs');
        const path = require('path');
        
        const categories = await query('SELECT slug FROM Categories WHERE is_hidden = 0');
        const products = await query('SELECT id, name FROM Products WHERE is_hidden = 0');
        
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://shopdonk.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shopdonk.com/login.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shopdonk.com/register.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shopdonk.com/deposit.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://shopdonk.com/faq.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shopdonk.com/contact.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://shopdonk.com/terms.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;
        
        categories.recordset.forEach(cat => {
            sitemap += `
  <url>
    <loc>https://shopdonk.com/?slug=${encodeURIComponent(cat.slug)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
        });
        
        sitemap += `
</urlset>`;
        
        const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
        fs.writeFileSync(sitemapPath, sitemap, 'utf8');
        
        res.json({
            success: true,
            message: 'Đã tạo sitemap.xml thành công'
        });
    } catch (error) {
        console.error('Generate sitemap error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

module.exports = {
    getPublicSeoSettings,
    getSeoSettings,
    saveSeoSettings,
    generateSitemap
};