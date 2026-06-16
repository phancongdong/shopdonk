document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdmin = user && user.role === 'admin';
    
    let allDeposits = [];
    
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
    
    async function loadDeposits() {
        try {
            const res = await fetch(`${API_BASE}/deposits`);
            const data = await res.json();
            
            if (data.success) {
                allDeposits = data.data || [];
                renderDeposits(allDeposits);
                updateStats(allDeposits);
            }
        } catch (error) {
            console.error('Error loading deposits:', error);
        }
    }
    
    function updateStats(deposits) {
        const pending = deposits.filter(d => d.status === 'pending');
        const completed = deposits.filter(d => d.status === 'completed');
        const totalAmount = completed.reduce((sum, d) => sum + (d.amount || 0), 0);
        
        const pendingEl = document.getElementById('pendingCount');
        const completedEl = document.getElementById('completedCount');
        const totalEl = document.getElementById('totalAmount');
        
        if (pendingEl) pendingEl.textContent = pending.length;
        if (completedEl) completedEl.textContent = completed.length;
        if (totalEl) totalEl.textContent = formatCurrency(totalAmount);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    }
    
    function formatTime(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
    }
    
    function getStatusBadge(status) {
        const statusMap = {
            'pending': { text: 'Chá» xá»­ lÃ½', class: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
            'completed': { text: 'HoÃ n thÃ nh', class: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            'rejected': { text: 'ÄÃ£ há»§y', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' }
        };
        const s = statusMap[status] || statusMap['pending'];
        return `<span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${s.class}">${s.text}</span>`;
    }
    
    function filterDeposits() {
        const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
        const status = document.getElementById('statusFilter')?.value || '';
        
        let filtered = allDeposits;
        
        if (search) {
            filtered = filtered.filter(d => 
                d.id?.toString().includes(search) ||
                d.user_name?.toLowerCase().includes(search) ||
                d.transaction_code?.toLowerCase().includes(search)
            );
        }
        
        if (status) {
            filtered = filtered.filter(d => d.status === status);
        }
        
        renderDeposits(filtered);
    }
    
    function renderDeposits(deposits) {
        const container = document.getElementById('depositsContainer');
        if (!container) return;
        
        if (deposits.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-center py-10">ChÆ°a cÃ³ giao dá»‹ch náº¡p tiá»n nÃ o</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">ID</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">NgÆ°á»i dÃ¹ng</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Sá»‘ tiá»n</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">PhÆ°Æ¡ng thá»©c</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">MÃ£ GD</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Tráº¡ng thÃ¡i</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Thá»i gian</th>
                            <th class="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">HÃ nh Ä‘á»™ng</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                        ${deposits.map(d => `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">#${d.id}</td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white">${d.user_name || 'N/A'}<br><span class="text-xs text-gray-500">${d.user_email || ''}</span></td>
                                <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-semibold">${formatCurrency(d.amount)}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${d.method || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${d.transaction_code || 'N/A'}</td>
                                <td class="px-4 py-3 text-sm">${getStatusBadge(d.status)}</td>
                                <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${formatTime(d.created_at)}</td>
                                <td class="px-4 py-3 text-sm">
                                    ${d.status === 'pending' ? `
                                        <button onclick="approveDeposit(${d.id})" class="text-green-600 hover:text-green-800 mr-2" title="Duyá»‡t"><i class="fas fa-check"></i></button>
                                        <button onclick="rejectDeposit(${d.id})" class="text-red-600 hover:text-red-800" title="Tá»« chá»‘i"><i class="fas fa-times"></i></button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    window.approveDeposit = async function(id) {
        if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n duyá»‡t giao dá»‹ch nÃ y?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/deposits/${id}/approve`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (data.success) {
                alert('Duyá»‡t thÃ nh cÃ´ng!');
                loadDeposits();
            } else {
                alert('Lá»—i: ' + (data.message || 'KhÃ´ng thá»ƒ duyá»‡t'));
            }
        } catch (error) {
            console.error('Approve error:', error);
            alert('CÃ³ lá»—i xáº£y ra!');
        }
    };
    
    window.rejectDeposit = async function(id) {
        if (!confirm('Báº¡n cÃ³ cháº¯c muá»‘n tá»« chá»‘i giao dá»‹ch nÃ y?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/deposits/${id}/reject`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const data = await res.json();
            
            if (data.success) {
                alert('Tá»« chá»‘i thÃ nh cÃ´ng!');
                loadDeposits();
            } else {
                alert('Lá»—i: ' + (data.message || 'KhÃ´ng thá»ƒ tá»« chá»‘i'));
            }
        } catch (error) {
            console.error('Reject error:', error);
            alert('CÃ³ lá»—i xáº£y ra!');
        }
    };
    
    window.refreshDeposits = function() {
        loadDeposits();
    };
    
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.addEventListener('input', filterDeposits);
    if (statusFilter) statusFilter.addEventListener('change', filterDeposits);
    
    loadDeposits();
    setInterval(loadDeposits, 30000);
});