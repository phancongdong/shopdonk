const { query } = require('../config/database');

async function getAllCategories() {
    const queryStr = `SELECT * FROM Categories ORDER BY id`;
    const result = await query(queryStr);
    return result.recordset;
}

async function getCategoryById(id) {
    const queryStr = `SELECT * FROM Categories WHERE id = @param0`;
    const result = await query(queryStr, [id]);
    return result.recordset[0];
}

async function createCategory(data) {
    const queryStr = `
        INSERT INTO Categories (name, slug, icon, color, image, description, created_at)
        VALUES (@param0, @param1, @param2, @param3, @param4, @param5, GETDATE())
    `;
    await query(queryStr, [data.name, data.slug, data.icon || null, data.color || null, data.image || null, data.description || null]);
    return { name: data.name, slug: data.slug };
}

async function updateCategory(id, data) {
    const queryStr = `
        UPDATE Categories 
        SET name = @param0, 
            slug = @param1, 
            icon = @param2,
            color = @param3,
            image = @param4,
            description = @param5,
            updated_at = GETDATE()
        WHERE id = @param6
    `;
    await query(queryStr, [data.name, data.slug, data.icon || null, data.color || null, data.image || null, data.description || null, id]);
    return getCategoryById(id);
}

async function deleteCategory(id) {
    const queryStr = `DELETE FROM Categories WHERE id = @param0`;
    await query(queryStr, [id]);
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};