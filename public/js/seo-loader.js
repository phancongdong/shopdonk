// SEO Loader - Automatically loads SEO settings for each page
(function() {
    const API_BASE = window.location.origin + '/api';
    
    // Get page name from URL
    function getPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '') || 'index';
        
        // Map filenames to page names
        const pageMap = {
            'index': 'home',
            '': 'home',
            'login': 'login',
            'register': 'register',
            'deposit': 'deposit',
            'orders': 'orders',
            'transactions': 'transactions',
            'profile': 'profile',
            'change-password': 'terms',
            'faq': 'faq',
            'contact': 'contact',
            'terms': 'terms'
        };
        
        return pageMap[filename] || filename;
    }
    
    // Load SEO settings
    async function loadSeo() {
        try {
            const pageName = getPageName();
            
            // Check if viewing a category (index.html with slug param)
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('slug');
            
            let seoData = null;
            
            // Try to load category SEO first if on index with slug
            if (slug && pageName === 'home') {
                try {
                    const catRes = await fetch(`${API_BASE}/categories`);
                    const catData = await catRes.json();
                    if (catData.success) {
                        const cat = catData.data.find(c => c.slug === slug);
                        if (cat) {
                            const seoRes = await fetch(`${API_BASE}/seo/category/${cat.id}`);
                            const seoResult = await seoRes.json();
                            if (seoResult.success && seoResult.data) {
                                seoData = seoResult.data;
                            }
                        }
                    }
                } catch (e) {
                    console.log('Category SEO not found, using page SEO');
                }
            }
            
            // Load page-specific SEO
            if (!seoData && pageName !== 'home') {
                try {
                    const seoRes = await fetch(`${API_BASE}/seo/page/${pageName}`);
                    const seoResult = await seoRes.json();
                    if (seoResult.success && seoResult.data) {
                        seoData = seoResult.data;
                    }
                } catch (e) {
                    console.log('Page SEO not found');
                }
            }
            
            // Load global SEO as fallback
            if (!seoData) {
                try {
                    const res = await fetch(`${API_BASE}/seo/public`);
                    const data = await res.json();
                    if (data.success && data.data) {
                        seoData = {
                            title: data.data.site_title,
                            description: data.data.site_description,
                            keywords: data.data.site_keywords,
                            og_title: data.data.og_title,
                            og_description: data.data.og_description,
                            og_image: data.data.og_image
                        };
                        
                        // Add Google verification
                        if (data.data.google_verification) {
                            addMetaTag('google-site-verification', data.data.google_verification);
                        }
                        
                        // Add Google Analytics
                        if (data.data.google_analytics_id) {
                            addGoogleAnalytics(data.data.google_analytics_id);
                        }
                    }
                } catch (e) {
                    console.log('Global SEO not found');
                }
            }
            
            // Apply SEO settings
            if (seoData) {
                applySeo(seoData);
            }
            
        } catch (error) {
            console.error('SEO Loader error:', error);
        }
    }
    
    function applySeo(seo) {
        // Update title
        if (seo.title) {
            document.title = seo.title;
        }
        
        // Update or create meta description
        updateMetaTag('description', seo.description);
        
        // Update or create meta keywords
        updateMetaTag('keywords', seo.keywords);
        
        // Update Open Graph tags
        updateOgTag('og:title', seo.og_title || seo.title);
        updateOgTag('og:description', seo.og_description || seo.description);
        updateOgTag('og:image', seo.og_image);
        updateOgTag('og:type', 'website');
        updateOgTag('og:url', window.location.href);
        
        // Add canonical URL
        if (seo.canonical_url) {
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = seo.canonical_url;
        }
        
        // Add robots meta tag if noindex or nofollow
        if (seo.noindex || seo.nofollow) {
            const robots = [];
            if (seo.noindex) robots.push('noindex');
            if (seo.nofollow) robots.push('nofollow');
            updateMetaTag('robots', robots.join(', '));
        }
    }
    
    function updateMetaTag(name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    function addMetaTag(name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.name = name;
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    function updateOgTag(property, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }
    
    function addGoogleAnalytics(id) {
        if (!id) return;
        
        // Check if already added
        if (document.querySelector(`script[src*="${id}"]`)) return;
        
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
        document.head.appendChild(script1);
        
        const script2 = document.createElement('script');
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${id}');
        `;
        document.head.appendChild(script2);
    }
    
    // Load SEO when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSeo);
    } else {
        loadSeo();
    }
})();