document.addEventListener('DOMContentLoaded', function() {
    const API_BASE = window.location.origin + '/api';
    
    async function loadCategories() {
        try {
            const res = await fetch(`${API_BASE}/categories`);
            const data = await res.json();
            
            if (data.success) {
                const tbody = document.getElementById('categoriesTable');
                tbody.innerHTML = data.data.map(c => `
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">${c.id}</td>
                        <td class="px-6 py-4 text-sm">
                            <img src="${c.image || 'https://placehold.co/80x40/1a1a2e/00f0ff?text=No+Image'}" 
                                 alt="${c.name}" 
                                 class="w-20 h-10 object-cover rounded"
                                 onerror="this.src='https://placehold.co/80x40/1a1a2e/00f0ff?text=No+Image'">
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            <i class="fas ${c.icon || 'fa-folder'} mr-2" style="color: ${c.color || '#0ea5e9'}"></i>
                            ${c.name}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${c.slug}</td>
                        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${c.description || '-'}</td>
                        <td class="px-6 py-4 text-sm">
                            <a href="../category.html?slug=${c.slug}" target="_blank" class="text-green-600 hover:text-green-800 mr-2" title="Xem trang"><i class="fas fa-eye"></i></a>
                            <button onclick="editCategory(${c.id})" class="text-brand-600 hover:text-brand-800 mr-2" title="Sửa"><i class="fas fa-edit"></i></button>
                            <button onclick="deleteCategory(${c.id})" class="text-red-600 hover:text-red-800" title="Xóa"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    window.showAddCategoryModal = function() {
        document.getElementById('modalTitle').textContent = 'Thêm danh mục mới';
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryForm').reset();
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
                
                // Handle image - check if it's base64 or URL
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
        document.getElementById('deleteModal').classList.remove('hidden');
    };
    
    window.closeDeleteModal = function() {
        document.getElementById('deleteModal').classList.add('hidden');
        deleteCategoryId = null;
    };
    
    window.confirmDelete = async function() {
        if (!deleteCategoryId) return;
        try {
            await fetch(`${API_BASE}/categories/${deleteCategoryId}`, { method: 'DELETE' });
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
        closeDeleteModal();
    };
    
    document.getElementById('categoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const id = document.getElementById('categoryId').value;
        const name = document.getElementById('categoryName').value;
        const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Use base64 if provided, otherwise use URL
        const base64Image = document.getElementById('categoryImageBase64').value.trim();
        const urlImage = document.getElementById('categoryImage').value.trim();
        const image = base64Image || urlImage || null;
        
        const categoryData = {
            name: name,
            slug: slug,
            description: document.getElementById('categoryDesc').value,
            icon: document.getElementById('categoryIcon').value,
            color: document.getElementById('categoryColor').value,
            image: image
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
                alert('Lưu thành công!');
            } else {
                alert('Lỗi: ' + (result.message || 'Không thể lưu'));
            }
            
            closeCategoryModal();
            loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Có lỗi xảy ra khi lưu!');
        }
    });
    
    loadCategories();
});
