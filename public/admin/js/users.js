document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    let allUsers = [];
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }
    
    function renderUsers(users) {
        const tbody = document.getElementById('usersTable');
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">Không tìm thấy người dùng</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">${u.id}</td>
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">${u.name}</td>
                <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${u.email || '-'}</td>
                <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${u.phone || '-'}</td>
                <td class="px-4 py-2 text-sm text-gray-900 dark:text-white font-semibold">${formatCurrency(u.balance || 0)}</td>
                <td class="px-4 py-2 text-sm">
                    <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : u.role === 'ctv' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}">${u.role === 'admin' ? 'Admin' : u.role === 'ctv' ? 'CTV' : 'User'}</span>
                </td>
                <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${formatDate(u.created_at)}</td>
                <td class="px-4 py-2 text-sm">
                    <button onclick="viewOrders(${u.id}, '${u.name}')" class="text-green-600 hover:text-green-800 dark:text-green-400 mr-2" title="Lịch sử mua"><i class="fas fa-history"></i></button>
                    <button onclick="editUser(${u.id})" class="text-brand-600 hover:text-brand-800 dark:text-brand-400 mr-2" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
                    <button onclick="addBalance(${u.id}, '${u.name}')" class="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400" title="Cộng tiền"><i class="fas fa-plus-circle"></i></button>
                </td>
            </tr>
        `).join('');
    }
    
    function filterUsers() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const role = document.getElementById('roleFilter').value;
        
        const filtered = allUsers.filter(u => {
            const matchSearch = !search || 
                u.id.toString().includes(search) ||
                (u.name && u.name.toLowerCase().includes(search)) ||
                (u.email && u.email.toLowerCase().includes(search));
            const matchRole = !role || u.role === role;
            return matchSearch && matchRole;
        });
        
        renderUsers(filtered);
    }
    
    document.getElementById('searchInput').addEventListener('input', filterUsers);
    document.getElementById('roleFilter').addEventListener('change', filterUsers);
    
    async function loadUsers() {
        try {
            const res = await fetch(`${API_BASE}/auth/users`);
            const data = await res.json();
            
            if (data.success) {
                allUsers = data.users;
                renderUsers(allUsers);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }
    
    window.editUser = function(id) {
        const user = allUsers.find(u => u.id === id);
        if (user) {
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editName').value = user.name || '';
            document.getElementById('editEmail').value = user.email || '';
            document.getElementById('editPhone').value = user.phone || '';
            document.getElementById('editBalance').value = user.balance || 0;
            document.getElementById('editRole').value = user.role || 'user';
            document.getElementById('editModal').classList.remove('hidden');
        }
    };
    
    window.closeEditModal = function() {
        document.getElementById('editModal').classList.add('hidden');
    };
    
    document.getElementById('editForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('editUserId').value;
        const data = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            balance: parseFloat(document.getElementById('editBalance').value),
            role: document.getElementById('editRole').value
        };
        
        try {
            const res = await fetch(`${API_BASE}/admin/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            
            if (result.success) {
                alert('Cập nhật thành công!');
                closeEditModal();
                loadUsers();
            } else {
                alert(result.message || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Có lỗi xảy ra!');
        }
    });
    
    window.addBalance = function(id, name) {
        const user = allUsers.find(u => u.id === id);
        if (user) {
            document.getElementById('balanceUserId').value = id;
            document.getElementById('balanceAmount').value = '';
            document.getElementById('balanceDescription').value = '';
            document.getElementById('balanceModalTitle').textContent = `Cộng/trừ tiền - ${name} (Số dư: ${formatCurrency(user.balance || 0)})`;
            document.getElementById('balanceModal').classList.remove('hidden');
        }
    };
    
    window.closeBalanceModal = function() {
        document.getElementById('balanceModal').classList.add('hidden');
    };
    
    document.getElementById('balanceForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('balanceUserId').value;
        const amount = parseFloat(document.getElementById('balanceAmount').value);
        const description = document.getElementById('balanceDescription').value;
        
        if (!amount || isNaN(amount) || amount === 0) {
            alert('Vui lòng nhập số tiền hợp lệ (khác 0)!');
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE}/admin/balance/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amount, description: description || `Admin ${amount > 0 ? 'cộng' : 'trừ'} ${Math.abs(amount)} VNĐ` })
            });
            
            const result = await res.json();
            
            if (result.success) {
                alert(`${amount > 0 ? 'Cộng' : 'Trừ'} tiền thành công!`);
                closeBalanceModal();
                loadUsers();
            } else {
                alert(result.message || 'Có lỗi xảy ra!');
            }
        } catch (error) {
            console.error('Error updating balance:', error);
            alert('Có lỗi xảy ra!');
        }
    });
    
    window.viewOrders = async function(userId, userName) {
        try {
            const res = await fetch(`${API_BASE}/orders?user_id=${userId}`);
            const data = await res.json();
            
            document.getElementById('orderModalTitle').textContent = `Lịch sử mua hàng - ${userName}`;
            const tbody = document.getElementById('orderTableBody');
            
            if (data.success && data.data.length > 0) {
                tbody.innerHTML = data.data.map(order => `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">#${order.id}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${order.product_name || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${order.quantity}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${formatCurrency(order.total_price)}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">${order.account_username || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">${order.account_password || 'N/A'}</td>
                        <td class="px-4 py-3 text-sm">
                            <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${formatDate(order.created_at)}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="px-4 py-8 text-center text-gray-500">Không có đơn hàng nào</td></tr>';
            }
            
            document.getElementById('orderModal').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };
    
    window.closeOrderModal = function() {
        document.getElementById('orderModal').classList.add('hidden');
    };
    
    function getStatusClass(status) {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'cancelled': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
        }
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'completed': return 'Hoàn thành';
            case 'pending': return 'Đang xử lý';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    }
    
    loadUsers();
    
    setInterval(loadUsers, 30000);
});