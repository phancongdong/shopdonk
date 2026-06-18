document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    
    const categories = [
        {
            id: 'tft',
            slug: 'tft',
            name: 'ACC TFT ĐẤU TRƯỜNG CHÂN LÝ',
            icon: 'fa-chess',
            color: '#E74C3C',
            image: 'https://placehold.co/300x150/E74C3C/FFFFFF?text=TFT+Arenas',
            description: 'Mua tài khoản TFT với đầy đủ linh thú, arena đẹp. Đăng nhập ngay để nhận ưu đãi!'
        },
        {
            id: 'lienquan',
            slug: 'lien-quan',
            name: 'ACC LIÊN QUÂN MOBILE',
            icon: 'fa-mobile-alt',
            color: '#E67E22',
            image: 'https://placehold.co/300x150/E67E22/FFFFFF?text=Lien+Quan',
            description: 'Acc Liên Quân Mobile giá rẻ, đầy đủ skin, rank cao. Bảo hành trọn đời!'
        },
        {
            id: 'freefire',
            slug: 'free-fire',
            name: 'ACC FREE FIRE',
            icon: 'fa-fire',
            color: '#3498DB',
            image: 'https://placehold.co/300x150/3498DB/FFFFFF?text=Free+Fire',
            description: 'Acc Free Fire VIP, nhiều skin, gun đẹp. Giá cực rẻ cho game thủ!'
        },
        {
            id: 'roblox',
            slug: 'roblox',
            name: 'ACC ROBLOX',
            icon: 'fa-cube',
            color: '#9B59B6',
            image: 'https://placehold.co/300x150/9B59B6/FFFFFF?text=Roblox',
            description: 'Acc Roblox có Robux, nhiều item hiếm. Mua ngay để trải nghiệm!'
        }
    ];

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.querySelector('.main-content');
    const footer = document.querySelector('.footer');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            sidebarToggle.classList.toggle('collapsed');
            if (mainContent) mainContent.classList.toggle('expanded');
            if (footer) footer.classList.toggle('collapsed');
            
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
        
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            sidebar.classList.add('collapsed');
            sidebarToggle.classList.add('collapsed');
            if (mainContent) mainContent.classList.add('expanded');
            if (footer) footer.classList.add('collapsed');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }

    const userBtn = document.getElementById('userBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (userBtn && dropdownMenu) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('active');
        });
    }

    async function loadProducts() {
        try {
            const response = await fetch(`${API_BASE}/products`);
            const data = await response.json();
            
            if (data.success && data.data) {
                renderCategories(data.data);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            loadSampleProducts();
        }
    }

    function renderCategories(products) {
        const container = document.getElementById('productsSection');
        if (!container) return;

        container.innerHTML = categories.map(cat => {
            const categoryProducts = products.filter(p => p.category_slug === cat.slug);
            
            return `
                <div class="product-category" id="${cat.id}">
                    <div class="category-header">
                        <i class="fas ${cat.icon}" style="color: ${cat.color};"></i>
                        <h2>${cat.name}</h2>
                    </div>
                    <div class="products-grid" id="${cat.id}Products">
                        ${categoryProducts.map(product => `
                            <div class="product-card">
                                <div class="product-image">
                                    <img src="${product.image || 'https://placehold.co/300x200'}" 
                                         alt="${product.name}" 
                                         loading="lazy"
                                         onerror="this.src='https://placehold.co/300x200'">
                                </div>
                                <div class="product-info">
                                    <h3 class="product-title">
                                        <a href="product-detail.html?id=${product.id}">${product.name}</a>
                                    </h3>
                                    ${product.price > 0 ? `
                                        <div class="product-price">
                                            <i class="fas fa-tag"></i>
                                            <span>Chỉ từ: ${formatCurrency(product.price)}</span>
                                        </div>
                                    ` : ''}
                                    <p class="product-stock">
                                        ${product.stock > 0 
                                            ? `Còn <span class="count">${product.stock}</span> nick` 
                                            : '<span style="color: #999;">Hết hàng</span>'
                                        }
                                    </p>
                                    <a href="product-detail.html?id=${product.id}" class="product-btn">
                                        <img src="https://placehold.co/100x30/FF5D05/FFFFFF?text=Xem+All" 
                                             alt="Xem tất cả" style="height: 30px;">
                                    </a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="category-description">
                        <img src="${cat.image}" alt="${cat.name}">
                        <p>${cat.description}</p>
                    </div>
                    <div class="category-footer">
                        <a href="/${cat.slug}" class="view-more-btn">
                            <i class="fas fa-eye"></i> Xem thêm
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderProducts(products) {
        renderCategories(products);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function loadSampleProducts() {
        const sampleProducts = {
            tft: [
                { id: 1, name: 'Linh Thú Aatrox Huyết Nguyệt', price: 110500, stock: 1, image: 'https://placehold.co/300x200/FF6B35/FFFFFF?text=Aatrox', category_slug: 'tft' },
                { id: 2, name: 'Linh Thú Jhin Hắc Tinh Đột Phá', price: 90000, stock: 15, image: 'https://placehold.co/300x200/9B59B6/FFFFFF?text=Jhin', category_slug: 'tft' },
                { id: 3, name: 'Linh Thú Jin Hắc Tinh', price: 112500, stock: 14, image: 'https://placehold.co/300x200/3498DB/FFFFFF?text=Jin', category_slug: 'tft' },
                { id: 4, name: 'Linh Xà Thần Vực', price: 97500, stock: 11, image: 'https://placehold.co/300x200/2ECC71/FFFFFF?text=Linh+Xa', category_slug: 'tft' },
            ],
            'lien-quan': [
                { id: 5, name: 'Nick Liên Quân Trắng Thông Tin', price: 100000, stock: 8, image: 'https://placehold.co/300x200/E74C3C/FFFFFF?text=Lien+Quan', category_slug: 'lien-quan' },
                { id: 6, name: 'Nick Reg Trắng Thông Tin', price: 30000, stock: 111, image: 'https://placehold.co/300x200/F39C12/FFFFFF?text=Nick+Reg', category_slug: 'lien-quan' },
            ],
            'free-fire': [
                { id: 7, name: 'Acc Free Fire VIP', price: 150000, stock: 10, image: 'https://placehold.co/300x200/FF5722/FFFFFF?text=FF+VIP', category_slug: 'free-fire' },
            ],
            'roblox': [
                { id: 8, name: 'Acc Roblox Có Robux', price: 200000, stock: 5, image: 'https://placehold.co/300x200/E91E63/FFFFFF?text=Robux', category_slug: 'roblox' },
            ]
        };

        const allProducts = Object.values(sampleProducts).flat();
        renderCategories(allProducts);
    }

    loadProducts();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = cart.length;
        }
    }

    updateCartBadge();

    async function loadUserInfo() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userBtn = document.getElementById('userBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (user) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found, skipping user sync');
                } else {
                    const res = await fetch(`${API_BASE}/auth/users`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await res.json();
                    if (data.success) {
                        const latestUser = data.users.find(u => u.id === user.id);
                        if (latestUser) {
                            user.balance = latestUser.balance || 0;
                            user.role = latestUser.role || 'user';
                            localStorage.setItem('user', JSON.stringify(user));
                        }
                    }
                }
            } catch (error) {
                console.log('Could not fetch latest user info:', error.message);
            }
            
            if (userBtn) {
                userBtn.innerHTML = `
                    <i class="fas fa-user-circle" style="font-size: 24px;"></i>
                    <span class="user-name">${user.name}</span>
                    <span class="user-balance">${formatCurrency(user.balance || 0)}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
            }
            
            if (dropdownMenu) {
                dropdownMenu.innerHTML = `
                    <div class="dropdown-user-info">
                        <div class="dropdown-user-name"><i class="fas fa-user"></i> ${user.name}</div>
                        <div class="dropdown-user-email">${user.email || 'Chưa có email'}</div>
                        <div class="dropdown-user-balance"><i class="fas fa-wallet"></i> ${formatCurrency(user.balance || 0)}</div>
                    </div>
                    <div class="dropdown-divider"></div>
                    ${user.role === 'admin' ? '<a href="admin/index.html"><i class="fas fa-cog"></i> Trang quản trị</a>' : ''}
                    <a href="profile.html"><i class="fas fa-user-cog"></i> Thông tin tài khoản</a>
                    <a href="deposit.html"><i class="fas fa-wallet"></i> Nạp tiền</a>
                    <a href="orders.html"><i class="fas fa-history"></i> Lịch sử mua</a>
                    <div class="dropdown-divider"></div>
                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                `;
            }
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    window.location.reload();
                });
            }
        }
    }

    loadUserInfo();

    console.log('ShopGame website loaded successfully!');
});