const { query } = require('../config/database');

let schemaCache = null;

async function getSchema() {
    if (schemaCache) return schemaCache;
    
    try {
        const columns = await query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories'
        `);
        schemaCache = columns.recordset.map(c => c.COLUMN_NAME);
        return schemaCache;
    } catch (e) {
        return ['id', 'name', 'description', 'image', 'created_at', 'updated_at'];
    }
}

async function getAllCategories() {
    const cols = await getSchema();
    const hasParent = cols.includes('parent_id');
    const hasDepth = cols.includes('depth');
    const hasOrder = cols.includes('display_order');
    
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ${hasParent ? 'ISNULL(c.parent_id, NULL) as parent_id' : 'NULL as parent_id'},
               ${hasDepth ? 'ISNULL(c.depth, 0) as depth' : '0 as depth'},
               ISNULL(c.path, CAST(c.id AS NVARCHAR(1000))) as path,
               ${hasOrder ? 'ISNULL(c.display_order, c.id) as display_order' : 'c.id as display_order'},
               c.created_at, c.updated_at,
               ${hasParent ? 'p.name as parent_name' : 'NULL as parent_name'}
        FROM Categories c
        ${hasParent ? 'LEFT JOIN Categories p ON c.parent_id = p.id' : ''}
        ORDER BY ${hasDepth ? 'ISNULL(c.depth, 0)' : '0'}, ${hasOrder ? 'ISNULL(c.display_order, c.id)' : 'c.id'}, c.name
    `;
    const result = await query(queryStr);
    return result.recordset;
}

async function getCategoryById(id) {
    const cols = await getSchema();
    const hasParent = cols.includes('parent_id');
    
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ${hasParent ? 'ISNULL(c.parent_id, NULL) as parent_id' : 'NULL as parent_id'},
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.path, CAST(c.id AS NVARCHAR(1000))) as path,
               ISNULL(c.display_order, c.id) as display_order,
               c.created_at, c.updated_at,
               ${hasParent ? 'p.name as parent_name' : 'NULL as parent_name'}
        FROM Categories c
        ${hasParent ? 'LEFT JOIN Categories p ON c.parent_id = p.id' : ''}
        WHERE c.id = @param0
    `;
    const result = await query(queryStr, [id]);
    return result.recordset[0];
}

async function getCategoryTree() {
    const cols = await getSchema();
    const hasParent = cols.includes('parent_id');
    
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ${hasParent ? 'ISNULL(c.parent_id, NULL) as parent_id' : 'NULL as parent_id'},
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.path, CAST(c.id AS NVARCHAR(1000))) as path,
               ISNULL(c.display_order, c.id) as display_order,
               c.created_at, c.updated_at,
               ${hasParent ? 'p.name as parent_name' : 'NULL as parent_name'},
               (SELECT COUNT(*) FROM Products WHERE category_id = c.id) as product_count
        FROM Categories c
        ${hasParent ? 'LEFT JOIN Categories p ON c.parent_id = p.id' : ''}
        ORDER BY ISNULL(c.depth, 0), ISNULL(c.display_order, c.id), c.name
    `;
    const result = await query(queryStr);
    return buildTree(result.recordset);
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

async function getCategoryWithDescendants(id) {
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ISNULL(c.parent_id, NULL) as parent_id,
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.display_order, c.id) as display_order,
               c.status, c.created_at, c.updated_at
        FROM Categories c
        INNER JOIN CategoryClosure cc ON c.id = cc.descendant_id
        WHERE cc.ancestor_id = @param0
        ORDER BY ISNULL(c.depth, 0), c.name
    `;
    const result = await query(queryStr, [id]);
    return result.recordset;
}

async function getCategoryWithAncestors(id) {
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ISNULL(c.parent_id, NULL) as parent_id,
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.display_order, c.id) as display_order,
               c.status, c.created_at, c.updated_at
        FROM Categories c
        INNER JOIN CategoryClosure cc ON c.id = cc.ancestor_id
        WHERE cc.descendant_id = @param0 AND cc.depth > 0
        ORDER BY c.depth
    `;
    const result = await query(queryStr, [id]);
    return result.recordset;
}

async function createCategory(data) {
    const cols = await getSchema();
    const parentId = data.parent_id || null;
    let depth = 0;
    let path = '';
    
    const hasParent = cols.includes('parent_id');
    const hasDepth = cols.includes('depth');
    const hasPath = cols.includes('path');
    const hasSlug = cols.includes('slug');
    const hasIcon = cols.includes('icon');
    const hasColor = cols.includes('color');
    const hasOrder = cols.includes('display_order');
    
    if (parentId && hasParent) {
        const parent = await getCategoryById(parentId);
        if (parent) {
            depth = (parent.depth || 0) + 1;
            path = (parent.path || '') + '/';
        }
    }
    
    let insertStr;
    let params;
    
    const columns = ['name'];
    const values = ['@param0'];
    params = [data.name];
    let paramIndex = 1;
    
    if (hasSlug) {
        columns.push('slug');
        values.push(`@param${paramIndex}`);
        params.push(data.slug);
        paramIndex++;
    }
    
    if (hasIcon) {
        columns.push('icon');
        values.push(`@param${paramIndex}`);
        params.push(data.icon || null);
        paramIndex++;
    }
    
    if (hasColor) {
        columns.push('color');
        values.push(`@param${paramIndex}`);
        params.push(data.color || null);
        paramIndex++;
    }
    
    columns.push('image');
    values.push(`@param${paramIndex}`);
    params.push(data.image || null);
    paramIndex++;
    
    columns.push('description');
    values.push(`@param${paramIndex}`);
    params.push(data.description || null);
    paramIndex++;
    
    if (hasParent && hasDepth && hasOrder) {
        columns.push('parent_id', 'depth', 'display_order');
        values.push(`@param${paramIndex}`, `@param${paramIndex + 1}`, `@param${paramIndex + 2}`);
        params.push(parentId, depth, data.display_order || 0);
        paramIndex += 3;
    }
    
    columns.push('created_at');
    values.push('GETDATE()');
    
    insertStr = `
        INSERT INTO Categories (${columns.join(', ')})
        OUTPUT INSERTED.id
        VALUES (${values.join(', ')})
    `;
    
    const result = await query(insertStr, params);
    const newId = result.recordset[0].id;
    
    if (hasPath) {
        const newPath = path + newId;
        await query(`UPDATE Categories SET path = @param0 WHERE id = @param1`, [newPath, newId]);
    }
    
    const hasClosure = await checkClosureTable();
    if (hasClosure) {
        try {
            await query(`INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth) VALUES (@param0, @param0, 0)`, [newId]);
            
            if (parentId) {
                await query(`
                    INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
                    SELECT ancestor_id, @param0, depth + 1
                    FROM CategoryClosure
                    WHERE descendant_id = @param1
                `, [newId, parentId]);
            }
        } catch (e) {
            console.log('Warning: CategoryClosure update failed:', e.message);
        }
    }
    
    schemaCache = null;
    
    return getCategoryById(newId);
}

async function checkClosureTable() {
    try {
        const result = await query(`
            SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CategoryClosure'
        `);
        return result.recordset[0].count > 0;
    } catch (e) {
        return false;
    }
}

async function updateCategory(id, data) {
    const oldCategory = await getCategoryById(id);
    const oldParentId = oldCategory.parent_id;
    const newParentId = data.parent_id || null;
    
    let depth = 0;
    let path = '';
    
    if (newParentId) {
        if (parseInt(newParentId) === parseInt(id)) {
            throw new Error('Cannot set category as its own parent');
        }
        
        const descendants = await getCategoryWithDescendants(id);
        const descendantIds = descendants.map(d => d.id);
        if (descendantIds.includes(parseInt(newParentId))) {
            throw new Error('Cannot set descendant as parent');
        }
        
        const parent = await getCategoryById(newParentId);
        if (parent) {
            depth = parent.depth + 1;
            path = parent.path + '/';
        }
    }
    
    const updateStr = `
        UPDATE Categories 
        SET name = @param0, 
            slug = @param1, 
            icon = @param2,
            color = @param3,
            image = @param4,
            description = @param5,
            parent_id = @param6,
            depth = @param7,
            path = @param8,
            display_order = @param9,
            updated_at = GETDATE()
        WHERE id = @param10
    `;
    await query(updateStr, [
        data.name, 
        data.slug, 
        data.icon || null, 
        data.color || null, 
        data.image || null, 
        data.description || null, 
        newParentId,
        depth,
        path + id,
        data.display_order || 0,
        id
    ]);
    
    if (oldParentId !== newParentId && (oldParentId || newParentId)) {
        await updateClosureTableForMove(id, newParentId);
        await updateDescendantPaths(id);
    }
    
    return getCategoryById(id);
}

async function updateClosureTableForMove(categoryId, newParentId) {
    await query(`
        DELETE FROM CategoryClosure
        WHERE descendant_id = @param0
        AND ancestor_id IN (
            SELECT ancestor_id FROM CategoryClosure 
            WHERE descendant_id = @param0 AND depth > 0
        )
    `, [categoryId]);
    
    if (newParentId) {
        await query(`
            INSERT INTO CategoryClosure (ancestor_id, descendant_id, depth)
            SELECT supertree.ancestor_id, subtree.descendant_id, supertree.depth + subtree.depth + 1
            FROM CategoryClosure supertree
            CROSS JOIN CategoryClosure subtree
            WHERE supertree.descendant_id = @param0
            AND subtree.ancestor_id = @param1
        `, [newParentId, categoryId]);
    }
}

async function updateDescendantPaths(categoryId) {
    const category = await getCategoryById(categoryId);
    const descendants = await getCategoryWithDescendants(categoryId);
    
    for (const desc of descendants) {
        if (desc.id !== categoryId) {
            const ancestors = await getCategoryWithAncestors(desc.id);
            const ancestorIds = ancestors.map(a => a.id).reverse();
            ancestorIds.push(desc.id);
            const newPath = ancestorIds.join('/');
            
            await query(`
                UPDATE Categories SET path = @param0, depth = @param1 WHERE id = @param2
            `, [newPath, ancestorIds.length - 1, desc.id]);
        }
    }
}

async function deleteCategory(id) {
    const children = await query(`
        SELECT COUNT(*) as count FROM Categories WHERE parent_id = @param0
    `, [id]);
    
    if (children.recordset[0].count > 0) {
        throw new Error('Cannot delete category with children. Move or delete children first.');
    }
    
    await query(`DELETE FROM CategoryClosure WHERE descendant_id = @param0`, [id]);
    await query(`DELETE FROM CategoryClosure WHERE ancestor_id = @param0 AND descendant_id != @param0`, [id]);
    await query(`DELETE FROM Categories WHERE id = @param0`, [id]);
}

async function getCategoryProducts(categoryId, includeDescendants = false) {
    let queryStr;
    let params = [categoryId];
    
    if (includeDescendants) {
        queryStr = `
            SELECT p.*, c.name as category_name
            FROM Products p
            INNER JOIN Categories c ON p.category_id = c.id
            WHERE p.category_id IN (
                SELECT descendant_id FROM CategoryClosure WHERE ancestor_id = @param0
            )
            ORDER BY p.created_at DESC
        `;
    } else {
        queryStr = `
            SELECT p.*, c.name as category_name
            FROM Products p
            INNER JOIN Categories c ON p.category_id = c.id
            WHERE p.category_id = @param0
            ORDER BY p.created_at DESC
        `;
    }
    
    const result = await query(queryStr, params);
    return result.recordset;
}

async function getRootCategories() {
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ISNULL(c.parent_id, NULL) as parent_id,
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.display_order, c.id) as display_order,
               c.status, c.created_at, c.updated_at,
               (SELECT COUNT(*) FROM Categories cc WHERE cc.parent_id = c.id) as children_count,
               (SELECT COUNT(*) FROM Products WHERE category_id = c.id) as product_count
        FROM Categories c
        WHERE c.parent_id IS NULL
        ORDER BY ISNULL(c.display_order, c.id), c.name
    `;
    const result = await query(queryStr);
    return result.recordset;
}

async function getChildCategories(parentId) {
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ISNULL(c.parent_id, NULL) as parent_id,
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.display_order, c.id) as display_order,
               c.status, c.created_at, c.updated_at,
               (SELECT COUNT(*) FROM Categories cc WHERE cc.parent_id = c.id) as children_count,
               (SELECT COUNT(*) FROM Products WHERE category_id = c.id) as product_count
        FROM Categories c
        WHERE c.parent_id = @param0
        ORDER BY ISNULL(c.display_order, c.id), c.name
    `;
    const result = await query(queryStr, [parentId]);
    return result.recordset;
}

async function getCategoryPath(id) {
    const queryStr = `
        SELECT c.id, c.name, c.slug, c.icon, c.color, c.image, c.description, 
               ISNULL(c.parent_id, NULL) as parent_id,
               ISNULL(c.depth, 0) as depth,
               ISNULL(c.display_order, c.id) as display_order,
               c.status, c.created_at, c.updated_at
        FROM Categories c
        INNER JOIN CategoryClosure cc ON c.id = cc.ancestor_id
        WHERE cc.descendant_id = @param0
        ORDER BY cc.depth
    `;
    const result = await query(queryStr, [id]);
    return result.recordset;
}

async function getCategoriesForSelect() {
    const queryStr = `
        SELECT c.id, c.name, 
               ISNULL(c.parent_id, NULL) as parent_id,
               ISNULL(c.depth, 0) as depth,
               (SELECT COUNT(*) FROM Products WHERE category_id = c.id) as product_count
        FROM Categories c
        WHERE c.status = 1
        ORDER BY ISNULL(c.path, CAST(c.id AS NVARCHAR(1000))), ISNULL(c.display_order, c.id), c.name
    `;
    const result = await query(queryStr);
    return result.recordset;
}

module.exports = {
    getAllCategories,
    getCategoryById,
    getCategoryTree,
    getCategoryWithDescendants,
    getCategoryWithAncestors,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryProducts,
    getRootCategories,
    getChildCategories,
    getCategoryPath,
    getCategoriesForSelect,
    buildTree
};
