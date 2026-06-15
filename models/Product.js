const { query } = require('../config/database');

async function getAllProducts(filters = {}) {
    let queryStr = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.category_id) {
        queryStr += ` AND p.category_id = @param${params.length}`;
        params.push(filters.category_id);
    }
    
    if (filters.category_slug) {
        const catCheck = await query(`
            SELECT c.id, c.parent_id FROM Categories c WHERE c.slug = @param0
        `, [filters.category_slug]);
        
        if (catCheck.recordset.length > 0) {
            const cat = catCheck.recordset[0];
            const childrenCheck = await query(`
                SELECT COUNT(*) as count FROM Categories WHERE parent_id = @param0
            `, [cat.id]);
            
            if (childrenCheck.recordset[0].count > 0) {
                const descendantsResult = await query(`
                    SELECT descendant_id FROM CategoryClosure WHERE ancestor_id = @param0
                `, [cat.id]);
                const descendantIds = descendantsResult.recordset.map(d => d.descendant_id);
                
                if (descendantIds.length > 0) {
                    queryStr += ` AND p.category_id IN (${descendantIds.join(',')})`;
                } else {
                    queryStr += ` AND c.slug = @param${params.length}`;
                    params.push(filters.category_slug);
                }
            } else {
                queryStr += ` AND c.slug = @param${params.length}`;
                params.push(filters.category_slug);
            }
        } else {
            queryStr += ` AND c.slug = @param${params.length}`;
            params.push(filters.category_slug);
        }
    }
    
    if (filters.search) {
        queryStr += ` AND (p.name LIKE @param${params.length} OR p.description LIKE @param${params.length})`;
        params.push(`%${filters.search}%`);
    }
    
    if (filters.min_price) {
        queryStr += ` AND p.price >= @param${params.length}`;
        params.push(filters.min_price);
    }
    
    if (filters.max_price) {
        queryStr += ` AND p.price <= @param${params.length}`;
        params.push(filters.max_price);
    }
    
    queryStr += ` ORDER BY p.id DESC`;
    
    if (filters.limit) {
        queryStr += ` OFFSET 0 ROWS FETCH NEXT @param${params.length} ROWS ONLY`;
        params.push(filters.limit);
    }
    
    const result = await query(queryStr, params);
    return result.recordset;
}

async function getProductById(id) {
    const queryStr = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE p.id = @param0
    `;
    const result = await query(queryStr, [id]);
    return result.recordset[0];
}

async function getProductBySlug(slug) {
    const queryStr = `
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE p.slug = @param0
    `;
    const result = await query(queryStr, [slug]);
    return result.recordset[0];
}

async function createProduct(data) {
    if (data.account_type === 'multiple' && data.accounts_list) {
        const lines = data.accounts_list.split('\n').filter(line => line.trim().includes('-'));
        data.stock = lines.length;
    }
    
    const queryStr = `
        INSERT INTO Products (
            category_id, name, slug, description, price, cost_price,
            image, stock, featured, account_type, account_username, account_password, 
            accounts_list, is_hidden, created_by, created_at
        )
        VALUES (
            @param0, @param1, @param2, @param3, @param4, @param5,
            @param6, @param7, @param8, @param9, @param10, @param11,
            @param12, @param13, @param14, GETDATE()
        )
    `;
    
    await query(queryStr, [
        data.category_id,
        data.name,
        data.slug,
        data.description,
        data.price,
        data.cost_price || 0,
        data.image,
        data.stock || 0,
        data.featured || 0,
        data.account_type || 'single',
        data.account_username || null,
        data.account_password || null,
        data.accounts_list || null,
        data.is_hidden || 0,
        data.created_by || null
    ]);
    
    return { ...data };
}

async function updateProduct(id, data, transaction = null) {
    const fields = [];
    const params = [];
    
    if (data.account_type === 'multiple') {
        if (data.accounts_list !== undefined) {
            if (data.accounts_list && data.accounts_list.trim()) {
                const lines = data.accounts_list.split('\n').filter(line => line.trim().includes('-'));
                data.stock = lines.length;
            } else {
                data.stock = 0;
            }
        }
    }
    
    const allowedFields = ['category_id', 'name', 'slug', 'description', 'price', 'cost_price',
                          'original_price', 'image', 'stock', 'features', 'status',
                          'account_type', 'account_username', 'account_password', 'accounts_list', 'is_hidden', 'created_by'];
    
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            fields.push(`${field} = @param${params.length}`);
            params.push(data[field]);
        }
    });
    
    if (fields.length === 0) {
        return getProductById(id);
    }
    
    fields.push('updated_at = GETDATE()');
    params.push(id);
    
    const queryStr = `UPDATE Products SET ${fields.join(', ')} WHERE id = @param${params.length - 1}`;
    await query(queryStr, params, transaction);
    
    return getProductById(id);
}

async function deleteProduct(id) {
    const queryStr = `DELETE FROM Products WHERE id = @param0`;
    await query(queryStr, [id]);
}

async function updateStock(id, quantity, transaction = null) {
    const queryStr = `
        UPDATE Products 
        SET stock = stock - @param0,
            updated_at = GETDATE()
        WHERE id = @param1 AND stock >= @param0
    `;
    const result = await query(queryStr, [quantity, id], transaction);
    
    if (result.rowsAffected[0] === 0) {
        throw new Error('Insufficient stock or product not found');
    }
    
    return getProductById(id);
}

async function updateStockUnchecked(id, quantity, transaction = null) {
    const queryStr = `
        UPDATE Products 
        SET stock = stock - @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [quantity, id], transaction);
    
    return getProductById(id);
}

async function getProductsByCategory(categoryId, limit = 20) {
    const queryStr = `
        SELECT TOP (${limit}) p.*, c.name as category_name
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE p.category_id = @param0
        ORDER BY p.id DESC
    `;
    const result = await query(queryStr, [categoryId]);
    return result.recordset;
}

async function getFeaturedProducts(limit = 10) {
    const queryStr = `
        SELECT TOP (${limit}) p.*, c.name as category_name
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE p.stock > 0
        ORDER BY p.id DESC
    `;
    const result = await query(queryStr);
    return result.recordset;
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    updateStockUnchecked,
    getProductsByCategory,
    getFeaturedProducts
};