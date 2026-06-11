// SEO Loader - Load SEO data from API and update meta tags
(async function() {
    const API_BASE = window.location.origin + '/api';
    const path = window.location.pathname;
    
    // Determine page name from URL
    let pageName = 'home';
    if (path.includes('login.html')) pageName = 'login';
    else if (path.includes('register.html')) pageName = 'register';
    else if (path.includes('deposit.html')) pageName = 'deposit';
    else if (path.includes('orders.html')) pageName = 'orders';
    else if (path.includes('faq.html')) pageName = 'faq';
    else if (path.includes('contact.html')) pageName = 'contact';
    else if (path.includes('terms.html')) pageName = 'terms';
    else if (path.includes('profile.html')) pageName = 'profile';
    else if (path.includes('transactions.html')) pageName = 'transactions';
    
    // Check for category page
    const urlParams = new URLSearchParams(window.location.search);
    const categorySlug = urlParams.get('slug');
    
    try {
        let seoData = null;
        
        // Load category SEO if slug exists
        if (categorySlug) {
            const catRes = await fetch(`${API_BASE}/categories`);
            const catData = await catRes.json();
            if (catData.success && catData.data) {
                const category = catData.data.find(c => c.slug === categorySlug);
                if (category) {
                    const seoRes = await fetch(`${API_BASE}/seo/category/${category.id}`);
                    const seoResult = await seoRes.json();
                    if (seoResult.success && seoResult.data) {
                        seoData = seoResult.data;
                    }
                }
            }
        }
        
        // Load page SEO if no category SEO
        if (!seoData && pageName) {
            const res = await fetch(`${API_BASE}/seo/page/${pageName}`);
            const data = await res.json();
            if (data.success && data.data) {
                seoData = data.data;
            }
        }
        
        // Apply SEO data
        if (seoData) {
            // Update title
            if (seoData.title) {
                document.title = seoData.title;
            }
            
            // Update meta description
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && seoData.description) {
                metaDesc.setAttribute('content', seoData.description);
            }
            
            // Update meta keywords
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords && seoData.keywords) {
                metaKeywords.setAttribute('content', seoData.keywords);
            }
            
            // Update canonical URL
            if (seoData.canonical_url) {
                let canonical = document.querySelector('link[rel="canonical"]');
                if (!canonical) {
                    canonical = document.createElement('link');
                    canonical.setAttribute('rel', 'canonical');
                    document.head.appendChild(canonical);
                }
                canonical.setAttribute('href', seoData.canonical_url);
            }
            
            // Update robots
            if (seoData.noindex || seoData.nofollow) {
                const robots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
                robots.setAttribute('name', 'robots');
                const content = [];
                if (seoData.noindex) content.push('noindex');
                else content.push('index');
                if (seoData.nofollow) content.push('nofollow');
                else content.push('follow');
                robots.setAttribute('content', content.join(', '));
            }
            
            // Update Open Graph
            if (seoData.og_title) {
                const ogTitle = document.querySelector('meta[property="og:title"]');
                if (ogTitle) ogTitle.setAttribute('content', seoData.og_title);
            }
            if (seoData.og_description) {
                const ogDesc = document.querySelector('meta[property="og:description"]');
                if (ogDesc) ogDesc.setAttribute('content', seoData.og_description);
            }
            if (seoData.og_image) {
                const ogImage = document.querySelector('meta[property="og:image"]');
                if (ogImage) ogImage.setAttribute('content', seoData.og_image);
            }
            
            // Update Twitter Card
            if (seoData.og_title) {
                const twTitle = document.querySelector('meta[name="twitter:title"]');
                if (twTitle) twTitle.setAttribute('content', seoData.og_title);
            }
            if (seoData.og_description) {
                const twDesc = document.querySelector('meta[name="twitter:description"]');
                if (twDesc) twDesc.setAttribute('content', seoData.og_description);
            }
            if (seoData.og_image) {
                const twImage = document.querySelector('meta[name="twitter:image"]');
                if (twImage) twImage.setAttribute('content', seoData.og_image);
            }
        }
    } catch (error) {
        console.log('SEO load error:', error);
    }
})();
