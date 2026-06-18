document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    let allProducts = [];
    let isLoading = false;
    let loadingProductIds = new Set();
    
    window.uploadProductImage = async function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const uploadStatus = document.getElementById('uploadStatus');
        const imageInput = document.getElementById('productImage');
        
        preview.classList.remove('hidden');
        previewImg.src = URL.createObjectURL(file);
        uploadStatus.textContent = 'Đang tải lên...';
        uploadStatus.className = 'text-xs text-yellow-500 mt-1';
        
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const res = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const data = await res.json();
            
            if (data.success && data.data && data.data.url) {
                imageInput.value = data.data.url;
                previewImg.src = data.data.url;
                uploadStatus.textContent = 'Tải lên thành công!';
                uploadStatus.className = 'text-xs text-green-500 mt-1';
            } else {
                uploadStatus.textContent = 'Lỗi: ' + (data.message || 'Không thể tải lên');
                uploadStatus.className = 'text-xs text-red-500 mt-1';
            }
        } catch (error) {
            console.error('Upload error:', error);
            uploadStatus.textContent = 'Lỗi kết nối!';
            uploadStatus.className = 'text-xs text-red-500 mt-1';
        }
        
        input.value = '';
    };
    
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
    
    function checkAdmin() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user && user.role === 'admin';
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
    }
    
    function renderProducts(products) {
        const tbody = document.getElementById('productsTable');
        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="px-4 py-8 text-center text-gray-500">KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m</td></tr>';
            return;
        }
        const timestamp = Date.now();
        tbody.innerHTML = products.map(p => {
            const costPrice = p.cost_price || 0;
            const sellPrice = p.price || 0;
            const profit = sellPrice - costPrice;
            const profitColor = profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
            const imageUrl = p.image ? `${p.image}${p.image.includes('?') ? '&' : '?'}t=${timestamp}` : 'https://placehold.co/32x32/1a1a2e/00f0ff?text=N/A';
            const isHidden = p.is_hidden === 1 || p.is_hidden === true;
            const stockNum = p.stock || 0;
            
            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-900 ${isHidden ? 'opacity-50' : ''}">
                    <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">${p.id}</td>
                    <td class="px-4 py-2 text-sm">
                        <div class="flex items-center gap-2">
                            <img src="${imageUrl}" 
                                 alt="${p.name}" 
                                 class="w-8 h-8 rounded object-cover"
                                 onerror="this.src='https://placehold.co/32x32/1a1a2e/00f0ff?text=N/A'">
                            <span class="text-gray-900 dark:text-white">${p.name}</span>
                            ${isHidden ? '<span class="text-xs bg-gray-400 text-white px-1.5 py-0.5 rounded">áº¨n</span>' : ''}
                        </div>
                    </td>
                    <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">${p.category_name || p.category_slug || '-'}</td>
                    <td class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">${formatCurrency(costPrice)}</td>
                    <td class="px-4 py-2 text-sm text-gray-900 dark:text-white font-semibold">${formatCurrency(sellPrice)}</td>
                    <td class="px-4 py-2 text-sm font-semibold ${profitColor}">${formatCurrency(profit)}</td>
                    <td class="px-4 py-2 text-sm">
                        <span class="inline-flex rounded-full px-2 py-1 text-xs font-medium ${stockNum > 10 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : stockNum > 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}">${stockNum}</span>
                        <span class="text-xs text-gray-400 ml-1">(${p.account_type === 'multiple' ? 'Nhiá»u TK' : '1 TK'})</span>
                    </td>
                    <td class="px-4 py-2 text-sm">
                        <button onclick="toggleProductVisibility(${p.id}, ${isHidden ? 0 : 1})" 
                                class="${isHidden ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'} mr-2" 
                                title="${isHidden ? 'Hiá»‡n sáº£n pháº©m' : 'áº¨n sáº£n pháº©m'}">
                            <i class="fas fa-${isHidden ? 'eye' : 'eye-slash'}"></i>
                        </button>
                    </td>
                    <td class="px-4 py-2 text-sm">
                        <button onclick="editProduct(${p.id})" class="text-brand-600 hover:text-brand-800 dark:text-brand-400 mr-2" title="Sá»­a"><i class="fas fa-edit"></i></button>
                        <button onclick="showDeleteModal(${p.id}, '${p.name.replace(/'/g, "\\'")}')" class="text-red-600 hover:text-red-800 dark:text-red-400" title="XÃ³a"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    function filterProducts() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const filtered = allProducts.filter(p => {
            return !search || 
                p.id.toString().includes(search) ||
                (p.name && p.name.toLowerCase().includes(search)) ||
                (p.category_name && p.category_name.toLowerCase().includes(search)) ||
                (p.category_slug && p.category_slug.toLowerCase().includes(search));
        });
        renderProducts(filtered);
    }
    
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    
    async function loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/categories?select=true`);
            const data = await res.json();
            if (data.success) {
                const select = document.getElementById('productCategory');
                select.innerHTML = data.data.map(c => {
                    const prefix = 'â€”'.repeat(c.depth || 0);
                    return `<option value="${c.id}" data-slug="${c.slug}">${prefix} ${c.name}</option>`;
                }).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async function loadProducts() {
        if (isLoading) return;
        isLoading = true;
        
        try {
            const res = await fetch(`${API_BASE}/products`);
            const data = await res.json();
            
            if (data.success) {
                allProducts = data.data;
                const user = JSON.parse(localStorage.getItem('user') || 'null');
                const userIsAdmin = user && user.role === 'admin';
                if (!userIsAdmin && user) {
                    allProducts = allProducts.filter(p => p.created_by === user.id || p.seller_id === user.id);
                }
                renderProducts(allProducts);
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            isLoading = false;
        }
    }
    
    window.toggleAccountFields = function() {
        const accountType = document.getElementById('accountType').value;
        const singleFields = document.getElementById('singleAccountFields');
        const multipleFields = document.getElementById('multipleAccountFields');
        const stockInput = document.getElementById('productStock');
        
        if (accountType === 'single') {
            singleFields.classList.remove('hidden');
            multipleFields.classList.add('hidden');
            stockInput.disabled = false;
        } else {
            singleFields.classList.add('hidden');
            multipleFields.classList.remove('hidden');
            stockInput.disabled = true;
        }
        
        updateStockFromAccountsList();
    };
    
    window.updateStockFromAccountsList = function() {
        const accountType = document.getElementById('accountType').value;
        if (accountType === 'multiple') {
            const accountsList = document.getElementById('accountsList').value.trim();
            const lines = accountsList.split('\n').filter(line => line.trim().includes('-'));
            document.getElementById('productStock').value = lines.length;
        }
    };
    
    document.getElementById('accountsList')?.addEventListener('input', updateStockFromAccountsList);
    
    window.showAddProductModal = function() {
        document.getElementById('modalTitle').textContent = 'Thêm sản phẩm mới';
        document.getElementById('productId').value = '';
        document.getElementById('accountType').value = 'single';
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        toggleAccountFields();
        document.getElementById('productModal').classList.remove('hidden');
    };
    
    window.closeProductModal = function() {
        document.getElementById('productModal').classList.add('hidden');
    };
    
    window.editProduct = async function(id) {
        try {
            const res = await fetch(`${API_BASE}/products/${id}`);
            const data = await res.json();
            
            if (!data.success || !data.data) {
                alert('KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m');
                return;
            }
            
            const product = data.data;
            
            document.getElementById('modalTitle').textContent = 'Sá»­a sáº£n pháº©m';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productCategory').value = product.category_id || '';
            document.getElementById('productCostPrice').value = product.cost_price || 0;
            document.getElementById('productPrice').value = product.price || 0;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productImage').value = product.image || '';
            
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            const uploadStatus = document.getElementById('uploadStatus');
            if (product.image) {
                imagePreview.classList.remove('hidden');
                previewImg.src = product.image;
                uploadStatus.textContent = '';
            } else {
                imagePreview.classList.add('hidden');
            }
            
            document.getElementById('productDescription').value = product.description || '';
            
            const accountType = product.account_type || 'single';
            document.getElementById('accountType').value = accountType;
            toggleAccountFields();
            
            if (accountType === 'multiple') {
                document.getElementById('accountsList').value = product.accounts_list || '';
            } else {
                document.getElementById('productAccount').value = product.account_username || '';
                document.getElementById('productPassword').value = product.account_password || '';
            }
            
            document.getElementById('productModal').classList.remove('hidden');
        } catch (error) {
            console.error('Error loading product:', error);
            alert('CÃ³ lá»—i xáº£y ra khi táº£i thÃ´ng tin sáº£n pháº©m');
        }
    };
    
    window.toggleProductVisibility = async function(id, isHidden) {
        if (loadingProductIds.has(id)) return;
        loadingProductIds.add(id);
        
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ is_hidden: isHidden })
            });
            
            if (res.ok) {
                const product = allProducts.find(p => p.id === id);
                if (product) {
                    product.is_hidden = isHidden;
                    renderProducts(allProducts);
                }
            } else if (res.status === 401) {
                alert('PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i.');
                window.location.href = '../login.html';
            }
        } catch (error) {
            console.error('Error toggling visibility:', error);
        } finally {
            loadingProductIds.delete(id);
        }
    };
    
    window.showDeleteModal = function(id, name) {
        document.getElementById('deleteProductId').value = id;
        document.getElementById('deleteProductName').textContent = name;
        document.getElementById('deleteModal').classList.remove('hidden');
    };
    
    window.closeDeleteModal = function() {
        document.getElementById('deleteModal').classList.add('hidden');
    };
    
    window.confirmDelete = async function() {
        const id = document.getElementById('deleteProductId').value;
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.status === 401) {
                alert('PhiÃªn Ä‘Äƒng nháº­p Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i.');
                window.location.href = '../login.html';
                return;
            }
            closeDeleteModal();
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('CÃ³ lá»—i xáº£y ra khi xÃ³a sáº£n pháº©m!');
        }
    };
    
    window.deleteProduct = window.showDeleteModal;
    
    document.getElementById('productForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('productId').value;
        const categorySelect = document.getElementById('productCategory');
        const categoryId = categorySelect.value;
        const categorySlug = categorySelect.options[categorySelect.selectedIndex].dataset.slug;
        const accountType = document.getElementById('accountType').value;
        
        let accountUsername = '';
        let accountPassword = '';
        let accountsList = '';
        
        if (accountType === 'single') {
            accountUsername = document.getElementById('productAccount').value;
            accountPassword = document.getElementById('productPassword').value;
            if (!accountUsername || !accountPassword) {
                alert('Vui lÃ²ng nháº­p tÃ i khoáº£n vÃ  máº­t kháº©u!');
                return;
            }
        } else {
            accountsList = document.getElementById('accountsList').value.trim();
            if (!accountsList) {
                alert('Vui lÃ²ng nháº­p danh sÃ¡ch tÃ i khoáº£n!');
                return;
            }
            const lines = accountsList.split('\n').filter(line => line.trim().includes('-'));
            if (lines.length === 0) {
                alert('Danh sÃ¡ch tÃ i khoáº£n khÃ´ng há»£p lá»‡! Má»—i dÃ²ng pháº£i cÃ³ Ä‘á»‹nh dáº¡ng: taikhoan-matkhau');
                return;
            }
        }
        
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        let stockValue = parseInt(document.getElementById('productStock').value);
        
        if (accountType === 'multiple') {
            const lines = accountsList.split('\n').filter(line => line.trim().includes('-'));
            stockValue = lines.length;
        }
        
        const productData = {
            name: document.getElementById('productName').value,
            category_id: parseInt(categoryId),
            category_slug: categorySlug,
            cost_price: parseInt(document.getElementById('productCostPrice').value) || 0,
            price: parseInt(document.getElementById('productPrice').value),
            stock: stockValue,
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value,
            account_type: accountType,
            account_username: accountUsername || null,
            account_password: accountPassword || null,
            accounts_list: accountsList || null,
            created_by: user ? user.id : null
        };
        
        try {
            const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                closeProductModal();
                const updatedId = parseInt(id) || (result.data && result.data.id);
                if (updatedId) {
                    const freshRes = await fetch(`${API_BASE}/products/${updatedId}`);
                    const freshData = await freshRes.json();
                    if (freshData.success && freshData.data) {
                        const idx = allProducts.findIndex(p => p.id === updatedId);
                        if (idx !== -1) {
                            allProducts[idx] = freshData.data;
                        } else {
                            allProducts.unshift(freshData.data);
                        }
                        renderProducts(allProducts);
                    }
                }
            } else {
                alert('Lá»—i: ' + (result.message || 'KhÃ´ng thá»ƒ lÆ°u sáº£n pháº©m'));
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('CÃ³ lá»—i xáº£y ra khi lÆ°u sáº£n pháº©m!');
        }
    });
    
    loadCategories();
    loadProducts();
});
