// SEO Loader - Load SEO data from API and update meta tags
(async function() {
    const API_BASE = window.location.origin + '/api';
    const path = window.location.pathname;
    
    const hardcodedCategorySEO = {
        'acc-random-lien-quan-mobile': {
            title: 'Acc Random Liên Quân Mobile Giá Rẻ',
            description: 'Danh mục Acc Random Liên Quân Mobile với nhiều phân khúc giá khác nhau. Người chơi có thể nhận tài khoản ngẫu nhiên với tỷ lệ ra skin vip cực cao.',
            keywords: 'acc random liên quân, acc ngẫu nhiên liên quân, random acc lien quan mobile, acc lien quan gia re, skin ss liên quân, acc random giá rẻ, acc random sss',
            og_title: 'Acc Random Liên Quân Mobile Giá Rẻ',
            og_description: 'Kho acc random Liên Quân Mobile đa dạng mức giá. Tỷ lệ ra skin sss ss+ ss cực cao giá rẻ',
            og_image: 'https://res.cloudinary.com/do1lnw3ik/image/upload/v1781263991/shopgame/zflbgox05xjndk6ecoka.jpg',
            canonical_url: 'https://shopdonk.com/acc-random-lien-quan-mobile',
            noindex: false,
            nofollow: false
        },
        'random-acc-lien-quan-mobile': {
            title: 'Acc Random Liên Quân Mobile Giá Rẻ',
            description: 'Danh mục Acc Random Liên Quân Mobile với nhiều phân khúc giá khác nhau. Người chơi có thể nhận tài khoản ngẫu nhiên với tỷ lệ ra skin vip cực cao.',
            keywords: 'acc random liên quân, acc ngẫu nhiên liên quân, random acc lien quan mobile, acc lien quan gia re, skin ss liên quân, acc random giá rẻ, acc random sss',
            og_title: 'Acc Random Liên Quân Mobile Giá Rẻ',
            og_description: 'Kho acc random Liên Quân Mobile đa dạng mức giá. Tỷ lệ ra skin sss ss+ ss cực cao giá rẻ',
            og_image: 'https://res.cloudinary.com/do1lnw3ik/image/upload/v1781263991/shopgame/zflbgox05xjndk6ecoka.jpg',
            canonical_url: 'https://shopdonk.com/random-acc-lien-quan-mobile',
            noindex: false,
            nofollow: false
        }
    };
    
    let pageName = 'home';
    if (path.includes('/login')) pageName = 'login';
    else if (path.includes('/register')) pageName = 'register';
    else if (path.includes('/deposit')) pageName = 'deposit';
    else if (path.includes('/orders')) pageName = 'orders';
    else if (path.includes('/faq')) pageName = 'faq';
    else if (path.includes('/contact')) pageName = 'contact';
    else if (path.includes('/terms')) pageName = 'terms';
    else if (path.includes('/profile')) pageName = 'profile';
    else if (path.includes('/transactions')) pageName = 'transactions';
    
    const urlParams = new URLSearchParams(window.location.search);
    const pathParts = path.split('/').filter(p => p);
    const categorySlug = pathParts[0] || urlParams.get('slug');
    
    try {
        let seoData = null;
        
        if (categorySlug && hardcodedCategorySEO[categorySlug]) {
            seoData = hardcodedCategorySEO[categorySlug];
        }
        
        if (!seoData && categorySlug) {
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
        
        if (!seoData && pageName) {
            const res = await fetch(`${API_BASE}/seo/page/${pageName}`);
            const data = await res.json();
            if (data.success && data.data) {
                seoData = data.data;
            }
        }
        
        if (seoData) {
            if (seoData.title) {
                document.title = seoData.title;
            }
            
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc && seoData.description) {
                metaDesc.setAttribute('content', seoData.description);
            }
            
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords && seoData.keywords) {
                metaKeywords.setAttribute('content', seoData.keywords);
            }
            
            if (seoData.canonical_url) {
                let canonical = document.querySelector('link[rel="canonical"]');
                if (!canonical) {
                    canonical = document.createElement('link');
                    canonical.setAttribute('rel', 'canonical');
                    document.head.appendChild(canonical);
                }
                canonical.setAttribute('href', seoData.canonical_url);
            }
            
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