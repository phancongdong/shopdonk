const Product = require('../models/Product');
const Category = require('../models/Category');
const { query } = require('../config/database');

async function getProducts(req, res) {
    try {
        const filters = {
            category_id: req.query.category_id,
            category_slug: req.query.category_slug,
            search: req.query.search,
            min_price: req.query.min_price,
            max_price: req.query.max_price,
            limit: req.query.limit || 50
        };
        
        const products = await Product.getAllProducts(filters);
        
        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getProductById(req, res) {
    try {
        const id = req.params.id;
        const product = await Product.getProductById(id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getProductBySlug(req, res) {
    try {
        const slug = req.params.slug;
        const product = await Product.getProductBySlug(slug);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function createProduct(req, res) {
    try {
        const data = req.body;
        
        if (!data.name || !data.category_id || !data.price) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }
        
        data.slug = await generateUniqueSlug(data.name);
        
        const product = await Product.createProduct(data);
        
        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updateProduct(req, res) {
    try {
        const id = req.params.id;
        const data = req.body;
        
        const existingProduct = await Product.getProductById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        if (data.name && data.name !== existingProduct.name) {
            data.slug = await generateUniqueSlug(data.name, id);
        }
        
        const product = await Product.updateProduct(id, data);
        
        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function deleteProduct(req, res) {
    try {
        const id = req.params.id;
        
        await Product.deleteProduct(id);
        
        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getFeaturedProducts(req, res) {
    try {
        const limit = req.query.limit || 10;
        const products = await Product.getFeaturedProducts(limit);
        
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getCategories(req, res) {
    try {
        const categories = await Category.getAllCategories();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getCategoryById(req, res) {
    try {
        const id = req.params.id;
        const category = await Category.getCategoryById(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function createCategory(req, res) {
    try {
        const data = req.body;
        
        if (!data.name) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục không được để trống'
            });
        }
        
        data.slug = await generateUniqueCategorySlug(data.name);
        
        const category = await Category.createCategory(data);
        
        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updateCategory(req, res) {
    try {
        const id = req.params.id;
        const data = req.body;
        
        const existingCategory = await Category.getCategoryById(id);
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }
        
        if (data.name && data.name !== existingCategory.name) {
            data.slug = await generateUniqueCategorySlug(data.name, id);
        }
        
        const category = await Category.updateCategory(id, data);
        
        res.json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function deleteCategory(req, res) {
    try {
        const id = req.params.id;
        
        await Category.deleteCategory(id);
        
        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/[đ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function generateUniqueSlug(name, excludeId = null) {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
        let checkQuery = `SELECT id FROM Products WHERE slug = @param0`;
        const params = [slug];
        
        if (excludeId) {
            checkQuery += ` AND id != @param1`;
            params.push(excludeId);
        }
        
        const result = await query(checkQuery, params);
        
        if (result.recordset.length === 0) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
}

async function generateUniqueCategorySlug(name, excludeId = null) {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
        let checkQuery = `SELECT id FROM Categories WHERE slug = @param0`;
        const params = [slug];
        
        if (excludeId) {
            checkQuery += ` AND id != @param1`;
            params.push(excludeId);
        }
        
        const result = await query(checkQuery, params);
        
        if (result.recordset.length === 0) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
}

module.exports = {
    getProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    getFeaturedProducts,
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};