const { query } = require('../config/database');

async function createOrder(userId, productId, quantity, totalPrice, accountInfo, accountUsername, accountPassword) {
    const queryStr = `
        INSERT INTO Orders (
            user_id, product_id, quantity, total_price, 
            account_info, account_username, account_password, status, created_at
        )
        VALUES (
            @param0, @param1, @param2, @param3,
            @param4, @param5, @param6, 'completed', GETDATE()
        )
    `;
    
    await query(queryStr, [userId, productId, quantity, totalPrice, JSON.stringify(accountInfo), accountUsername, accountPassword]);
    
    return { userId, productId, quantity, totalPrice, accountInfo, accountUsername, accountPassword };
}

async function getOrderById(id) {
    const queryStr = `
        SELECT o.*, p.name as product_name, p.image as product_image, p.slug as product_slug,
               u.name as user_name, u.email as user_email
        FROM Orders o
        LEFT JOIN Products p ON o.product_id = p.id
        LEFT JOIN Users u ON o.user_id = u.id
        WHERE o.id = @param0
    `;
    const result = await query(queryStr, [id]);
    const order = result.recordset[0];
    
    if (order && order.account_info) {
        order.account_info = JSON.parse(order.account_info);
    }
    
    return order;
}

async function getOrdersByUser(userId, limit = 20) {
    const queryStr = `
        SELECT TOP (${limit}) o.*, p.name as product_name, p.image as product_image, p.slug as product_slug
        FROM Orders o
        LEFT JOIN Products p ON o.product_id = p.id
        WHERE o.user_id = @param0
        ORDER BY o.created_at DESC
    `;
    const result = await query(queryStr, [userId]);
    
    return result.recordset.map(order => {
        if (order.account_info) {
            try {
                const accountInfo = typeof order.account_info === 'string' ? JSON.parse(order.account_info) : order.account_info;
                order.account_username = order.account_username || accountInfo.username || 'N/A';
                order.account_password = order.account_password || accountInfo.password || 'N/A';
            } catch (e) {
                order.account_username = order.account_username || 'N/A';
                order.account_password = order.account_password || 'N/A';
            }
        }
        return order;
    });
}

async function getAllOrders(filters = {}) {
    let queryStr = `
        SELECT o.*, p.name as product_name, u.name as user_name, u.email as user_email
        FROM Orders o
        LEFT JOIN Products p ON o.product_id = p.id
        LEFT JOIN Users u ON o.user_id = u.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.status) {
        queryStr += ` AND o.status = @param${params.length}`;
        params.push(filters.status);
    }
    
    if (filters.user_id) {
        queryStr += ` AND o.user_id = @param${params.length}`;
        params.push(filters.user_id);
    }
    
    if (filters.start_date) {
        queryStr += ` AND o.created_at >= @param${params.length}`;
        params.push(filters.start_date);
    }
    
    if (filters.end_date) {
        queryStr += ` AND o.created_at <= @param${params.length}`;
        params.push(filters.end_date);
    }
    
    queryStr += ` ORDER BY o.created_at DESC`;
    
    if (filters.limit) {
        queryStr += ` OFFSET 0 ROWS FETCH NEXT @param${params.length} ROWS ONLY`;
        params.push(filters.limit);
    }
    
    const result = await query(queryStr, params);
    
    return result.recordset.map(order => {
        if (order.account_info) {
            order.account_info = JSON.parse(order.account_info);
        }
        return order;
    });
}

async function updateOrderStatus(id, status) {
    const queryStr = `
        UPDATE Orders 
        SET status = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [status, id]);
    
    return getOrderById(id);
}

async function completeOrder(id, accountInfo) {
    const queryStr = `
        UPDATE Orders 
        SET status = 'completed',
            account_info = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [JSON.stringify(accountInfo), id]);
    
    return getOrderById(id);
}

async function cancelOrder(id) {
    const queryStr = `
        UPDATE Orders 
        SET status = 'cancelled',
            updated_at = GETDATE()
        WHERE id = @param0
    `;
    await query(queryStr, [id]);
    
    return getOrderById(id);
}

async function getOrderStats() {
    const queryStr = `
        SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
            SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END) as total_revenue
        FROM Orders
    `;
    const result = await query(queryStr);
    return result.recordset[0];
}

module.exports = {
    createOrder,
    getOrderById,
    getOrdersByUser,
    getAllOrders,
    updateOrderStatus,
    completeOrder,
    cancelOrder,
    getOrderStats
};