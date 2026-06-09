(function() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    // Check if user is logged in and has admin or ctv role
    if (!user || (user.role !== 'admin' && user.role !== 'ctv')) {
        window.location.href = '../login.html';
        return;
    }
    
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
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = 'index.html';
        return;
    }
})();