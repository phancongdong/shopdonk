(function() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');
    
    // Check if user is logged in and has admin or ctv role
    if (!user || (user.role !== 'admin' && user.role !== 'ctv')) {
        console.log('[ADMIN-CHECK] No valid user, redirecting to login');
        window.location.href = '../login.html';
        return;
    }
    
    // Check if token exists
    if (!token) {
        console.log('[ADMIN-CHECK] No token found, redirecting to login');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
        return;
    }
    
    // Validate token with server
    fetch(window.location.origin + '/api/auth/validate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (res.status === 401) {
            console.log('[ADMIN-CHECK] Token invalid or expired, redirecting to login');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '../login.html';
            return null;
        }
        return res.json();
    })
    .then(data => {
        if (data && data.success) {
            console.log('[ADMIN-CHECK] Token valid, user:', data.user?.name);
            // Update user info in localStorage
            if (data.user) {
                localStorage.setItem('user', JSON.stringify({
                    ...user,
                    ...data.user
                }));
            }
        }
    })
    .catch(err => {
        console.error('[ADMIN-CHECK] Token validation error:', err);
    });
    
    // Admin-only pages - redirect CTV
    const adminOnlyPages = [
        'users.html',
        'deposits.html', 
        'categories.html',
        'payment-settings.html',
        'banners.html',
        'social-links.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (adminOnlyPages.includes(currentPage) && user.role !== 'admin') {
        alert('Báº¡n khÃ´ng cÃ³ quyá»n truy cáº­p trang nÃ y!');
        window.location.href = 'index.html';
        return;
    }
})();