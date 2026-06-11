document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (user) {
        document.getElementById('adminName').textContent = user.name;
        const roleDisplay = document.querySelector('.text-xs.text-gray-500');
        if (roleDisplay) {
            roleDisplay.textContent = user.role === 'admin' ? 'Quản trị viên' : 'Cộng tác viên';
        }
    }
    
    const isAdmin = user && user.role === 'admin';
    
    document.querySelectorAll('.admin-only').forEach(el => {
        if (!isAdmin) {
            el.style.display = 'none';
        }
    });
    
    const API_BASE = window.location.origin + '/api';
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }
    
    function formatTime(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
    }
    
    function getStatusBadge(status) {
        const statusMap = {
            'pending': { text: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
            'completed': { text: 'Hoàn thành', class: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            'cancelled': { text: 'Đã hủy', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' }
        };
        const s = statusMap[status] || statusMap['pending'];
        return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${s.class}">${s.text}</span>`;
    }
    
    async function loadDashboard() {
        try {
            if (isAdmin) {
                const usersRes = await fetch(`${API_BASE}/auth/users`);
                const usersData = await usersRes.json();
                
                if (usersData.success) {
                    document.getElementById('totalUsers').textContent = usersData.users.length;
                    
                    const tbody = document.getElementById('usersTable');
                    tbody.innerHTML = usersData.users.slice(0, 10).map(u => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${u.id}</td>
                            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${u.name}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${u.email || '-'}</td>
                            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${formatCurrency(u.balance || 0)}</td>
                            <td class="px-6 py-4 text-sm">
                                <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : u.role === 'ctv' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}">
                                    ${u.role === 'admin' ? 'Admin' : u.role === 'ctv' ? 'CTV' : 'User'}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${formatDate(u.created_at)}</td>
                        </tr>
                    `).join('');
                }
            } else {
                document.getElementById('totalUsers').textContent = '-';
                document.getElementById('usersTable').parentElement.parentElement.style.display = 'none';
            }
            
            const productsRes = await fetch(`${API_BASE}/products`);
            const productsData = await productsRes.json();
            let products = productsData.success ? productsData.data : [];
            
            if (!isAdmin && user) {
                products = products.filter(p => p.created_by === user.id || p.seller_id === user.id);
            }
            
            document.getElementById('totalProducts').textContent = products.length;
            
            const ordersRes = await fetch(`${API_BASE}/orders`);
            const ordersData = await ordersRes.json();
            let orders = ordersData.success ? ordersData.data : [];
            
            if (!isAdmin && user) {
                const myProductIds = products.map(p => p.id);
                orders = orders.filter(o => myProductIds.includes(o.product_id));
            }
            
            document.getElementById('totalOrders').textContent = orders.length;
            
            const ordersTbody = document.getElementById('ordersTable');
            if (ordersTbody) {
                if (orders.length > 0) {
                    ordersTbody.innerHTML = orders.slice(0, 10).map(o => `
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">#${o.id}</td>
                            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${o.user_name || 'N/A'}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${o.product_name || 'N/A'}</td>
                            <td class="px-6 py-4 text-sm">
                                <div class="text-xs">
                                    <div class="text-gray-900 dark:text-white">TK: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">${o.account_username || 'N/A'}</code></div>
                                    <div class="text-gray-500 dark:text-gray-400">MK: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">${o.account_password || 'N/A'}</code></div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">${formatCurrency(o.total_price || 0)}</td>
                            <td class="px-6 py-4 text-sm">${getStatusBadge(o.status)}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${formatTime(o.created_at)}</td>
                        </tr>
                    `).join('');
                } else {
                    ordersTbody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Chưa có đơn hàng nào</td></tr>';
                }
            }
            
            const completedOrders = orders.filter(o => o.status === 'completed');
            const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
            document.getElementById('totalDeposits').textContent = formatCurrency(totalRevenue);
            
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }
    
    loadDashboard();
    
    setInterval(loadDashboard, 30000);
});