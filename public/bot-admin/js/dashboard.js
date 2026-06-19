const API_BASE = window.location.origin + '/api';
let token = localStorage.getItem('botAdminToken');
let adminId = localStorage.getItem('botAdminId');

function checkAuth() {
    if (!token || !adminId) {
        window.location.href = '/bot-admin/login.html';
        return false;
    }
    document.getElementById('adminInfo').textContent = `Admin ID: ${adminId}`;
    return true;
}

function formatMoney(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

async function apiRequest(endpoint, options = {}) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    return res.json();
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    document.getElementById(`section-${section}`).classList.remove('hidden');
    
    document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    const titles = {
        dashboard: 'Dashboard',
        products: 'Quản Lý Sản Phẩm',
        orders: 'Quản Lý Đơn Hàng',
        users: 'Quản Lý Người Dùng',
        deposits: 'Yêu Cầu Nạp Tiền',
        broadcast: 'Gửi Thông Báo',
        settings: 'Cài Đặt Bot'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    loadSectionData(section);
}

async function loadSectionData(section) {
    switch(section) {
        case 'dashboard': await loadDashboard(); break;
        case 'products': await loadProducts(); break;
        case 'orders': await loadOrders(); break;
        case 'users': await loadUsers(); break;
        case 'deposits': await loadDeposits(); break;
    }
}

async function loadDashboard() {
    try {
        const [stats, orders, deposits] = await Promise.all([
            apiRequest('/bot-admin/stats'),
            apiRequest('/bot-admin/orders?limit=5'),
            apiRequest('/bot-admin/deposits?status=pending&limit=5')
        ]);
        
        if (stats.success) {
            document.getElementById('stat-revenue').textContent = formatMoney(stats.data.revenue || 0);
            document.getElementById('stat-orders').textContent = stats.data.orders || 0;
            document.getElementById('stat-users').textContent = stats.data.users || 0;
            document.getElementById('stat-pending').textContent = stats.data.pendingDeposits || 0;
        }
        
        if (orders.success) {
            const html = orders.data.length > 0 
                ? orders.data.map(o => `
                    <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                            <p class="text-white">${o.product_name || 'N/A'}</p>
                            <p class="text-gray-400 text-sm">${o.username || 'User #' + o.user_id}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-green-400">${formatMoney(o.total || o.price || 0)}</p>
                            <p class="text-gray-400 text-xs">${o.status || 'pending'}</p>
                        </div>
                    </div>
                `).join('')
                : '<p class="text-gray-400 text-center py-4">Không có đơn hàng</p>';
            document.getElementById('recentOrders').innerHTML = html;
        }
        
        if (deposits.success) {
            const html = deposits.data.length > 0
                ? deposits.data.map(d => `
                    <div class="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                            <p class="text-white">${d.username || 'User #' + d.user_id}</p>
                            <p class="text-gray-400 text-sm">${d.method || 'bank'}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-yellow-400">${formatMoney(d.amount)}</p>
                            <div class="flex gap-2 mt-1">
                                <button onclick="approveDeposit(${d.id})" class="text-green-400 hover:text-green-300"><i class="fas fa-check"></i></button>
                                <button onclick="rejectDeposit(${d.id})" class="text-red-400 hover:text-red-300"><i class="fas fa-times"></i></button>
                            </div>
                        </div>
                    </div>
                `).join('')
                : '<p class="text-gray-400 text-center py-4">Không có yêu cầu chờ duyệt</p>';
            document.getElementById('pendingDeposits').innerHTML = html;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadProducts() {
    try {
        const data = await apiRequest('/bot-admin/products');
        if (data.success) {
            const html = data.data.length > 0
                ? data.data.map(p => `
                    <tr class="border-b border-white/5">
                        <td class="py-3 px-2">${p.name}</td>
                        <td class="py-3 px-2">${p.category || 'N/A'}</td>
                        <td class="py-3 px-2">${formatMoney(p.price)}</td>
                        <td class="py-3 px-2"><span class="${p.stock > 0 ? 'text-green-400' : 'text-red-400'}">${p.stock || 0}</span></td>
                        <td class="py-3 px-2">
                            <button onclick="editProduct('${p.id}')" class="text-blue-400 hover:text-blue-300 mr-2"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteProduct('${p.id}')" class="text-red-400 hover:text-red-300"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')
                : '<tr><td colspan="5" class="py-4 text-center text-gray-400">Không có sản phẩm</td></tr>';
            document.getElementById('productsTable').innerHTML = html;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadOrders() {
    try {
        const data = await apiRequest('/bot-admin/orders');
        if (data.success) {
            const html = data.data.length > 0
                ? data.data.map(o => `
                    <tr class="border-b border-white/5">
                        <td class="py-3 px-2">#${o.id}</td>
                        <td class="py-3 px-2">${o.username || 'User #' + o.user_id}</td>
                        <td class="py-3 px-2">${o.product_name || 'N/A'}</td>
                        <td class="py-3 px-2">${formatMoney(o.total || o.price || 0)}</td>
                        <td class="py-3 px-2">
                            <span class="${o.status === 'completed' ? 'text-green-400' : o.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}">${o.status}</span>
                        </td>
                        <td class="py-3 px-2">
                            ${o.status !== 'completed' ? `<button onclick="refundOrder(${o.id})" class="text-red-400 hover:text-red-300"><i class="fas fa-undo"></i> Hoàn tiền</button>` : ''}
                        </td>
                    </tr>
                `).join('')
                : '<tr><td colspan="6" class="py-4 text-center text-gray-400">Không có đơn hàng</td></tr>';
            document.getElementById('ordersTable').innerHTML = html;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadUsers() {
    try {
        const data = await apiRequest('/bot-admin/users');
        if (data.success) {
            const html = data.data.length > 0
                ? data.data.map(u => `
                    <tr class="border-b border-white/5">
                        <td class="py-3 px-2">${u.telegram_id || u.id}</td>
                        <td class="py-3 px-2">${u.name || u.username || 'N/A'}</td>
                        <td class="py-3 px-2">${formatMoney(u.balance || 0)}</td>
                        <td class="py-3 px-2"><span class="${u.role === 'admin' ? 'text-yellow-400' : 'text-gray-400'}">${u.role || 'user'}</span></td>
                        <td class="py-3 px-2">
                            <button onclick="adjustBalance(${u.id})" class="text-blue-400 hover:text-blue-300 mr-2"><i class="fas fa-wallet"></i></button>
                        </td>
                    </tr>
                `).join('')
                : '<tr><td colspan="5" class="py-4 text-center text-gray-400">Không có người dùng</td></tr>';
            document.getElementById('usersTable').innerHTML = html;
        }
    } catch (e) {
        console.error(e);
    }
}

async function loadDeposits() {
    try {
        const data = await apiRequest('/bot-admin/deposits');
        if (data.success) {
            const html = data.data.length > 0
                ? data.data.map(d => `
                    <tr class="border-b border-white/5">
                        <td class="py-3 px-2">${d.username || 'User #' + d.user_id}</td>
                        <td class="py-3 px-2">${formatMoney(d.amount)}</td>
                        <td class="py-3 px-2">${d.method || 'bank'}</td>
                        <td class="py-3 px-2">
                            <span class="${d.status === 'approved' ? 'text-green-400' : d.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}">${d.status}</span>
                        </td>
                        <td class="py-3 px-2">
                            ${d.status === 'pending' ? `
                                <button onclick="approveDeposit(${d.id})" class="text-green-400 hover:text-green-300 mr-2"><i class="fas fa-check"></i></button>
                                <button onclick="rejectDeposit(${d.id})" class="text-red-400 hover:text-red-300"><i class="fas fa-times"></i></button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')
                : '<tr><td colspan="5" class="py-4 text-center text-gray-400">Không có yêu cầu</td></tr>';
            document.getElementById('depositsTable').innerHTML = html;
        }
    } catch (e) {
        console.error(e);
    }
}

function showAddProductModal() {
    document.getElementById('modalTitle').textContent = 'Thêm Sản Phẩm Mới';
    document.getElementById('modalContent').innerHTML = `
        <form onsubmit="addProduct(event)" class="space-y-4">
            <div>
                <label class="block text-gray-300 mb-2">Tên Sản Phẩm</label>
                <input type="text" id="productName" required class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
            </div>
            <div>
                <label class="block text-gray-300 mb-2">Danh Mục</label>
                <select id="productCategory" class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                    <option value="genshin">Genshin Impact</option>
                    <option value="lol">League of Legends</option>
                    <option value="valorant">Valorant</option>
                    <option value="pubg">PUBG Mobile</option>
                    <option value="freefire">Free Fire</option>
                    <option value="other">Khác</option>
                </select>
            </div>
            <div>
                <label class="block text-gray-300 mb-2">Giá</label>
                <input type="number" id="productPrice" required class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
            </div>
            <div>
                <label class="block text-gray-300 mb-2">Tồn Kho</label>
                <input type="number" id="productStock" value="1" class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
            </div>
            <div>
                <label class="block text-gray-300 mb-2">Thông Tin Tài Khoản (tài khoản/mật khẩu)</label>
                <textarea id="productAccountInfo" rows="3" class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white" placeholder="Username:Password hoặc thông tin đăng nhập"></textarea>
            </div>
            <button type="submit" class="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">Thêm Mới</button>
        </form>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

async function addProduct(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value) || 1,
        account_info: document.getElementById('productAccountInfo').value
    };
    
    const res = await apiRequest('/bot-admin/products', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    if (res.success) {
        closeModal();
        loadProducts();
        alert('Thêm sản phẩm thành công!');
    } else {
        alert(res.message || 'Lỗi thêm sản phẩm');
    }
}

async function editProduct(id) {
    const res = await apiRequest(`/bot-admin/products/${id}`);
    if (res.success) {
        const p = res.data;
        document.getElementById('modalTitle').textContent = 'Sửa Sản Phẩm';
        document.getElementById('modalContent').innerHTML = `
            <form onsubmit="updateProduct(event, '${id}')" class="space-y-4">
                <div>
                    <label class="block text-gray-300 mb-2">Tên Sản Phẩm</label>
                    <input type="text" id="productName" value="${p.name || ''}" required class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                </div>
                <div>
                    <label class="block text-gray-300 mb-2">Giá</label>
                    <input type="number" id="productPrice" value="${p.price || 0}" required class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                </div>
                <div>
                    <label class="block text-gray-300 mb-2">Tồn Kho</label>
                    <input type="number" id="productStock" value="${p.stock || 0}" class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                </div>
                <div>
                    <label class="block text-gray-300 mb-2">Thông Tin Tài Khoản</label>
                    <textarea id="productAccountInfo" rows="3" class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">${p.account_info || ''}</textarea>
                </div>
                <button type="submit" class="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">Cập Nhật</button>
            </form>
        `;
        document.getElementById('modal').classList.remove('hidden');
    }
}

async function updateProduct(e, id) {
    e.preventDefault();
    const data = {
        name: document.getElementById('productName').value,
        price: parseInt(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        account_info: document.getElementById('productAccountInfo').value
    };
    
    const res = await apiRequest(`/bot-admin/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    
    if (res.success) {
        closeModal();
        loadProducts();
        alert('Cập nhật thành công!');
    } else {
        alert(res.message || 'Lỗi cập nhật');
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    const res = await apiRequest(`/bot-admin/products/${id}`, { method: 'DELETE' });
    if (res.success) {
        loadProducts();
        alert('Xóa thành công!');
    } else {
        alert(res.message || 'Lỗi xóa sản phẩm');
    }
}

async function approveDeposit(id) {
    if (!confirm('Duyệt yêu cầu nạp tiền này?')) return;
    
    const res = await apiRequest(`/bot-admin/deposits/${id}/approve`, { method: 'POST' });
    if (res.success) {
        loadSectionData('deposits');
        loadDashboard();
        alert('Đã duyệt!');
    } else {
        alert(res.message || 'Lỗi duyệt');
    }
}

async function rejectDeposit(id) {
    if (!confirm('Từ chối yêu cầu nạp tiền này?')) return;
    
    const res = await apiRequest(`/bot-admin/deposits/${id}/reject`, { method: 'POST' });
    if (res.success) {
        loadSectionData('deposits');
        loadDashboard();
        alert('Đã từ chối!');
    } else {
        alert(res.message || 'Lỗi từ chối');
    }
}

async function refundOrder(id) {
    if (!confirm('Hoàn tiền cho đơn hàng này?')) return;
    
    const res = await apiRequest(`/bot-admin/orders/${id}/refund`, { method: 'POST' });
    if (res.success) {
        loadOrders();
        alert('Đã hoàn tiền!');
    } else {
        alert(res.message || 'Lỗi hoàn tiền');
    }
}

function adjustBalance(userId) {
    document.getElementById('modalTitle').textContent = 'Điều Chỉnh Số Dư';
    document.getElementById('modalContent').innerHTML = `
        <form onsubmit="submitBalance(event, ${userId})" class="space-y-4">
            <div>
                <label class="block text-gray-300 mb-2">Hành Động</label>
                <select id="balanceAction" class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
                    <option value="add">Cộng Tiền</option>
                    <option value="deduct">Trừ Tiền</option>
                </select>
            </div>
            <div>
                <label class="block text-gray-300 mb-2">Số Tiền</label>
                <input type="number" id="balanceAmount" required class="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
            </div>
            <button type="submit" class="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition">Xác Nhận</button>
        </form>
    `;
    document.getElementById('modal').classList.remove('hidden');
}

async function submitBalance(e, userId) {
    e.preventDefault();
    const action = document.getElementById('balanceAction').value;
    const amount = parseInt(document.getElementById('balanceAmount').value);
    
    const res = await apiRequest(`/bot-admin/users/${userId}/balance`, {
        method: 'POST',
        body: JSON.stringify({ action, amount })
    });
    
    if (res.success) {
        closeModal();
        loadUsers();
        alert('Cập nhật số dư thành công!');
    } else {
        alert(res.message || 'Lỗi cập nhật');
    }
}

async function sendBroadcast() {
    const msg = document.getElementById('broadcastMsg').value.trim();
    if (!msg) {
        alert('Vui lòng nhập nội dung thông báo');
        return;
    }
    
    if (!confirm('Gửi thông báo đến tất cả người dùng?')) return;
    
    const res = await apiRequest('/bot-admin/broadcast', {
        method: 'POST',
        body: JSON.stringify({ message: msg })
    });
    
    if (res.success) {
        document.getElementById('broadcastMsg').value = '';
        alert(`Đã gửi thông báo đến ${res.data.sent} người dùng!`);
    } else {
        alert(res.message || 'Lỗi gửi thông báo');
    }
}

async function updateAdminKey() {
    const newKey = document.getElementById('newAdminKey').value.trim();
    if (!newKey) {
        alert('Vui lòng nhập Admin Key mới');
        return;
    }
    
    const res = await apiRequest('/bot-admin/settings/admin-key', {
        method: 'POST',
        body: JSON.stringify({ adminKey: newKey })
    });
    
    if (res.success) {
        document.getElementById('newAdminKey').value = '';
        alert('Cập nhật Admin Key thành công!');
    } else {
        alert(res.message || 'Lỗi cập nhật');
    }
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
}

function logout() {
    localStorage.removeItem('botAdminToken');
    localStorage.removeItem('botAdminId');
    window.location.href = '/bot-admin/login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        showSection('dashboard');
    }
});