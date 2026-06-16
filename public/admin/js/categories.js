document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    let allCategories = [];
    let expandedIds = new Set();
    
    async function loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/categories?select=true`);
            const data = await res.json();
            
            if (data.success) {
                allCategories = data.data;
                buildTreeView();
                populateParentSelect();
                updateStats();
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            document.getElementById('categoryTree').innerHTML = '<p class="text-red-500">Lỗi tải danh mục</p>';
        }
    }
    
    function buildTreeView() {
        const tree = buildTree(allCategories);
        const container = document.getElementById('categoryTree');
        
        if (tree.length === 0) {
            container.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Không có danh mục</p>';
            return;
        }
        
        container.innerHTML = tree.map(node => renderTreeNode(node, 0)).join('');
    }
    
    function buildTree(categories) {
        const map = {};
        const roots = [];
        
        categories.forEach(cat => {
            map[cat.id] = { ...cat, children: [] };
        });
        
        categories.forEach(cat => {
            if (cat.parent_id && map[cat.parent_id]) {
                map[cat.parent_id].children.push(map[cat.id]);
            } else {
                roots.push(map[cat.id]);
            }
        });
        
        return roots;
    }
    
    function renderTreeNode(node, level) {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedIds.has(node.id);
        const indent = level * 24;
        const productCount = node.product_count || 0;
        
        let html = `
            <div class="tree-item py-2 px-3 rounded-lg" style="margin-left: ${indent}px" data-id="${node.id}">
                <div class="flex items-center gap-2">
                    <span class="toggle-btn ${hasChildren ? '' : 'invisible'} ${isExpanded ? '' : 'collapsed'}" onclick="toggleNode(${node.id})">
                        <i class="fas fa-chevron-down text-gray-400"></i>
                    </span>
                    <img src="${node.image || 'https://placehold.co/32x32/1a1a2e/00f0ff?text=N/A'}" 
                         alt="${node.name}" 
                         class="w-6 h-6 rounded object-cover"
                         onerror="this.src='https://placehold.co/32x32/1a1a2e/00f0ff?text=N/A'">
                    <i class="fas ${node.icon || 'fa-folder'} text-sm" style="color: ${node.color || '#0ea5e9'}"></i>
                    <span class="text-sm text-gray-900 dark:text-white flex-1 cursor-pointer hover:text-brand-500" onclick="editCategory(${node.id})">${node.name}</span>
                    <span class="text-xs text-gray-400">${productCount} SP</span>
                    <button onclick="showAddChildModal(${node.id})" class="text-xs text-green-500 hover:text-green-700 px-1" title="Thêm danh mục con"><i class="fas fa-plus"></i></button>
                    <a href="/${node.slug}" target="_blank" class="text-xs text-blue-500 hover:text-blue-700 px-1" title="Xem trang"><i class="fas fa-external-link-alt"></i></a>
                    <button onclick="editCategory(${node.id})" class="text-xs text-yellow-500 hover:text-yellow-700 px-1" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteCategory(${node.id})" class="text-xs text-red-500 hover:text-red-700 px-1" title="Xóa"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        if (hasChildren && isExpanded) {
            html += `<div class="tree-children">${node.children.map(child => renderTreeNode(child, level + 1)).join('')}</div>`;
        }
        
        return html;
    }
    
    window.toggleNode = function(id) {
        if (expandedIds.has(id)) {
            expandedIds.delete(id);
        } else {
            expandedIds.add(id);
        }
        buildTreeView();
    };
    
    window.expandAll = function() {
        allCategories.forEach(cat => {
            const children = allCategories.filter(c => c.parent_id === cat.id);
            if (children.length > 0) {
                expandedIds.add(cat.id);
            }
        });
        buildTreeView();
    };
    
    window.collapseAll = function() {
        expandedIds.clear();
        buildTreeView();
    };
    
    function populateParentSelect(excludeId = null) {
        const select = document.getElementById('categoryParent');
        select.innerHTML = '<option value="">-- Không có (danh mục gốc) --</option>';
        
        allCategories.forEach(cat => {
            if (cat.id !== excludeId) {
                const prefix = '—'.repeat(cat.depth || 0);
                select.innerHTML += `<option value="${cat.id}">${prefix} ${cat.name}</option>`;
            }
        });
    }
    
    function updateStats() {
        const total = allCategories.length;
        const roots = allCategories.filter(c => !c.parent_id).length;
        const maxDepth = Math.max(...allCategories.map(c => c.depth || 0), 0);
        
        document.getElementById('totalCategories').textContent = total;
        document.getElementById('rootCategories').textContent = roots;
        document.getElementById('maxDepth').textContent = maxDepth;
    }
    
    window.showAddCategoryModal = function() {
        document.getElementById('modalTitle').textContent = 'Thêm danh mục mới';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryForm').reset();
        populateParentSelect();
        document.getElementById('categoryModal').classList.remove('hidden');
    };
    
    window.showAddChildModal = function(parentId) {
        document.getElementById('modalTitle').textContent = 'Thêm danh mục con';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryForm').reset();
        populateParentSelect();
        document.getElementById('categoryParent').value = parentId;
        document.getElementById('categoryModal').classList.remove('hidden');
    };
    
    window.closeCategoryModal = function() {
        document.getElementById('categoryModal').classList.add('hidden');
    };
    
    window.editCategory = async function(id) {
        try {
            const res = await fetch(`${API_BASE}/categories/${id}`);
            const data = await res.json();
            if (data.success) {
                document.getElementById('modalTitle').textContent = 'Sửa danh mục';
                document.getElementById('categoryId').value = data.data.id;
                document.getElementById('categoryName').value = data.data.name;
                document.getElementById('categoryDesc').value = data.data.description || '';
                document.getElementById('categoryIcon').value = data.data.icon || '';
                document.getElementById('categoryColor').value = data.data.color || '';
                document.getElementById('categoryOrder').value = data.data.display_order || 0;
                
                populateParentSelect(data.data.id);
                document.getElementById('categoryParent').value = data.data.parent_id || '';
                
                const image = data.data.image || '';
                if (image.startsWith('data:')) {
                    document.getElementById('categoryImageBase64').value = image;
                    document.getElementById('categoryImage').value = '';
                } else {
                    document.getElementById('categoryImage').value = image;
                    document.getElementById('categoryImageBase64').value = '';
                }
                
                document.getElementById('categoryModal').classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error loading category:', error);
        }
    };
    
    let deleteCategoryId = null;
    
    window.deleteCategory = function(id) {
        deleteCategoryId = id;
        
        const children = allCategories.filter(c => c.parent_id === id);
        if (children.length > 0) {
            document.getElementById('deleteMessage').textContent = 'Danh mục này có ' + children.length + ' danh mục con. Vui lòng xóa hoặc di chuyển danh mục con trước!';
            document.getElementById('deleteModal').querySelector('.bg-red-600').style.display = 'none';
        } else {
            const cat = allCategories.find(c => c.id === id);
            document.getElementById('deleteMessage').textContent = 'Bạn có chắc muốn xóa danh mục "' + (cat?.name || '') + '"?';
            document.getElementById('deleteModal').querySelector('.bg-red-600').style.display = 'inline-block';
        }
        
        document.getElementById('deleteCategoryId').value = id;
        document.getElementById('deleteModal').classList.remove('hidden');
    };
    
    window.closeDeleteModal = function() {
        document.getElementById('deleteModal').classList.add('hidden');
        deleteCategoryId = null;
    };
    
    window.confirmDelete = async function() {
        if (!deleteCategoryId) return;
        
        const children = allCategories.filter(c => c.parent_id === deleteCategoryId);
        if (children.length > 0) {
            closeDeleteModal();
            return;
        }
        
        try {
            const res = await fetch(`${API_BASE}/categories/${deleteCategoryId}`, { method: 'DELETE' });
            const result = await res.json();
            
            if (result.success) {
                loadCategories();
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể xóa'));
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Có lỗi xảy ra khi xóa!');
        }
        closeDeleteModal();
    };
    
    document.getElementById('categoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value;
        const parentId = document.getElementById('categoryParent').value || null;
        
        const slug = name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        
        const base64Image = document.getElementById('categoryImageBase64').value.trim();
        const urlImage = document.getElementById('categoryImage').value.trim();
        const image = base64Image || urlImage || null;
        
        const categoryData = {
            name: name,
            slug: slug,
            description: document.getElementById('categoryDesc').value,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value,
            image: image,
            parent_id: parentId ? parseInt(parentId) : null,
            display_order: parseInt(document.getElementById('categoryOrder').value) || 0
        };
        
        try {
            const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
            const method = id ? 'PUT' : 'POST';
            
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            
            const result = await res.json();
            
            if (result.success) {
                closeCategoryModal();
                loadCategories();
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể lưu'));
            }
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Có lỗi xảy ra khi lưu!');
        }
    });
    
    loadCategories();
});