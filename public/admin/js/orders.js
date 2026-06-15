document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = user && user.role === 'admin';
    
    let allOrders = [];
    let autoRefreshInterval = null;
    
    async function loadOrders() {
        try {
            let orders;
            
            if (isAdmin) {
                const res = await fetch(`${API_BASE}/admin/orders?limit=100`);
                const data = await res.json();
                orders = data.success ? data.data : [];
            } else {
                const ordersRes = await fetch(`${API_BASE}/orders`);
                const ordersData = await ordersRes.json();
                orders = ordersData.success ? ordersData.data : [];
                
                if (user) {
                    const productsRes = await fetch(`${API_BASE}/products`);
                    const productsData = await productsRes.json();
                    const products = productsData.success ? productsData.data : [];
                    const myProductIds = products.filter(p => p.created_by === user.id || p.seller_id === user.id).map(p => p.id);
                    orders = orders.filter(o => myProductIds.includes(o.product_id));
                }
            }
            
            allOrders = orders;
            renderOrders(orders);
            updateStats(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
    
    function updateStats(orders) {
        const today = new Date().toDateString();
        const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        
        const pendingEl = document.getElementById('pendingCount');
        const todayEl = document.getElementById('todayCount');
        const revenueEl = document.getElementById('todayRevenue');
        
        if (pendingEl) pendingEl.textContent = orders.filter(o => o.status === 'pending').length;
        if (todayEl) todayEl.textContent = todayOrders.length;
        if (revenueEl) revenueEl.textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(todayRevenue);
    }
    
    function filterOrders() {
        const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
        const status = document.getElementById('statusFilter')?.value || '';
        
        let filtered = allOrders;
        
        if (search) {
            filtered = filtered.filter(o => 
                o.id?.toString().includes(search) ||
                o.user_name?.toLowerCase().includes(search) ||
                o.product_name?.toLowerCase().includes(search)
            );
        }
        
        if (status) {
            filtered = filtered.filter(o => o.status === status);
        }
        
        renderOrders(filtered);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
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
    
    function renderOrders(orders) {
        const container = document.querySelector('.rounded-xl.bg-white');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-10">Chưa có đơn hàng nào</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Người mua</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Sản phẩm</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tài khoản</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Thành tiền</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Trạng thái</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                        ${orders.map(o => `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">#${o.id}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${o.user_name || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${o.product_name || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm">
                                    <div class="text-xs">
                                        <div class="text-gray-900 dark:text-white">TK: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">${o.account_username || 'N/A'}</code></div>
                                        <div class="text-gray-500 dark:text-gray-400">MK: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">${o.account_password || 'N/A'}</code></div>
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold">${formatCurrency(o.total_price || 0)}</td>
                                <td class="px-4 py-3 text-sm">${getStatusBadge(o.status)}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${formatTime(o.created_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    window.refreshOrders = function() {
        loadOrders();
    };
    
    window.toggleAutoRefresh = function(enabled) {
        if (enabled) {
            autoRefreshInterval = setInterval(loadOrders, 10000);
        } else {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
    };
    
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterOrders);
    if (statusFilter) statusFilter.addEventListener('change', filterOrders);
    
    loadOrders();
    setInterval(loadOrders, 30000);
});