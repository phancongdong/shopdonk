const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { beginTransaction, commitTransaction, rollbackTransaction, query } = require('../config/database');
const { sanitizeOrder, sanitizeOrders } = require('../utils/security');

async function getOrders(req, res) {
    try {
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để xem đơn hàng'
            });
        }
        
        const limit = parseInt(req.query.limit) || 50;
        const orders = await Order.getOrdersByUser(userId, limit);
        const sanitizedOrders = sanitizeOrders(orders, false);
        
        res.json({
            success: true,
            data: sanitizedOrders,
            count: sanitizedOrders.length
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getOrderById(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        
        const order = await Order.getOrderById(id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        if (userId && order.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem đơn hàng này'
            });
        }
        
        const sanitizedOrder = sanitizeOrder(order, false);
        
        res.json({
            success: true,
            data: sanitizedOrder
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getOrderAccount(req, res) {
    try {
        const orderId = req.params.id;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }
        
        const order = await Order.getOrderById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        if (order.user_id !== userId) {
            console.warn(`[SECURITY] User ${userId} attempted to access order ${orderId} belonging to user ${order.user_id}`);
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem tài khoản này'
            });
        }
        
        if (order.status !== 'completed') {
            return res.status(403).json({
                success: false,
                message: 'Đơn hàng chưa hoàn thành, không thể xem tài khoản'
            });
        }
        
        const accountInfo = order.account_info || {};
        const accounts = accountInfo.accounts || [];
        
        if (accounts.length === 0 && order.account_username) {
            accounts.push({
                username: order.account_username,
                password: order.account_password
            });
        }
        
        res.json({
            success: true,
            data: {
                order_id: order.id,
                product_name: order.product_name,
                accounts: accounts,
                account_username: accounts[0]?.username || order.account_username,
                account_password: accounts[0]?.password || order.account_password
            }
        });
    } catch (error) {
        console.error('Get order account error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function createOrder(req, res) {
    let transaction = null;
    
    try {
        const userId = req.user?.id;
        const { product_id, quantity = 1 } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn'
            });
        }
        
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm'
            });
        }
        
        if (quantity < 1 || quantity > 10) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không hợp lệ (1-10)'
            });
        }
        
        if (process.env.NODE_ENV !== 'production') {
            console.log('[DEBUG] createOrder called:', { userId, product_id, quantity });
        }
        
        transaction = await beginTransaction();
        
        const productResult = await query(
            `SELECT p.*, c.name as category_name, c.slug as category_slug
             FROM Products p WITH (UPDLOCK, HOLDLOCK)
             LEFT JOIN Categories c ON p.category_id = c.id
             WHERE p.id = @param0`,
            [product_id],
            transaction
        );
        const product = productResult.recordset[0];
        
        if (!product) {
            await rollbackTransaction(transaction);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        if (product.stock < quantity) {
            await rollbackTransaction(transaction);
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không đủ số lượng'
            });
        }
        
        const userResult = await query(
            `SELECT * FROM Users WITH (UPDLOCK, HOLDLOCK) WHERE id = @param0`,
            [userId],
            transaction
        );
        const user = userResult.recordset[0];
        
        if (!user) {
            await rollbackTransaction(transaction);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }
        
        const totalPrice = product.price * quantity;
        
        if (user.balance < totalPrice) {
            await rollbackTransaction(transaction);
            return res.status(400).json({
                success: false,
                message: 'Số dư không đủ'
            });
        }
        
        await query(
            `UPDATE Users SET balance = balance - @param0, updated_at = GETDATE() WHERE id = @param1`,
            [totalPrice, userId],
            transaction
        );
        
        let accounts = [];
        let accountUsername, accountPassword;
        
        if (product.account_type === 'multiple' && product.accounts_list) {
            const allAccounts = product.accounts_list.split('\n').filter(line => line.trim().includes('-'));
            
            if (allAccounts.length < quantity) {
                await rollbackTransaction(transaction);
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm chỉ còn ${allAccounts.length} tài khoản, không đủ ${quantity}`
                });
            }
            
            for (let i = 0; i < quantity; i++) {
                const accountLine = allAccounts[i].trim();
                const [username, password] = accountLine.split('-');
                accounts.push({
                    username: username?.trim() || '',
                    password: password?.trim() || ''
                });
            }
            
            const remainingAccounts = allAccounts.slice(quantity).join('\n');
            const newStock = allAccounts.length - quantity;
            
            await query(
                `UPDATE Products SET accounts_list = @param0, stock = @param1, is_hidden = @param2, updated_at = GETDATE() WHERE id = @param3`,
                [remainingAccounts, newStock, newStock === 0 ? 1 : 0, product_id],
                transaction
            );
            
            accountUsername = accounts[0].username;
            accountPassword = accounts[0].password;
        } else {
            for (let i = 0; i < quantity; i++) {
                accounts.push({
                    username: product.account_username || generateRandomUsername(),
                    password: product.account_password || generateRandomPassword()
                });
            }
            
            accountUsername = accounts[0].username;
            accountPassword = accounts[0].password;
            
            await query(
                `UPDATE Products SET stock = stock - @param0, is_hidden = CASE WHEN stock - @param0 <= 0 THEN 1 ELSE is_hidden END, updated_at = GETDATE() WHERE id = @param1`,
                [quantity, product_id],
                transaction
            );
        }
        
        const accountInfo = {
            accounts: accounts,
            count: accounts.length,
            notes: `Đơn hàng #${Date.now()} - ${product.name}`
        };
        
        await query(
            `INSERT INTO Orders (user_id, product_id, quantity, total_price, account_info, account_username, account_password, status, created_at)
             VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, 'completed', GETDATE())`,
            [userId, product_id, quantity, totalPrice, JSON.stringify(accountInfo), accountUsername, accountPassword],
            transaction
        );
        
        await query(
            `INSERT INTO Transactions (user_id, type, amount, description, created_at)
             VALUES (@param0, @param1, @param2, @param3, GETDATE())`,
            [userId, 'purchase', -totalPrice, `Mua ${product.name} (${quantity} nick)`],
            transaction
        );
        
        await commitTransaction(transaction);
        
        if (process.env.NODE_ENV !== 'production') {
            console.log('[DEBUG] Order created successfully:', { userId, product_id, quantity, totalPrice });
        }
        
        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            data: {
                id: Date.now(),
                product: product.name,
                quantity,
                total_price: totalPrice,
                accounts: accounts,
                account_username: accounts[0].username,
                account_password: accounts[0].password
            }
        });
    } catch (error) {
        console.error('[ERROR] Create order failed:', error);
        
        if (transaction) {
            await rollbackTransaction(transaction);
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server, vui lòng thử lại sau'
        });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const id = req.params.id;
        const { status } = req.body;
        
        const order = await Order.getOrderById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        const updatedOrder = await Order.updateOrderStatus(id, status);
        
        res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công',
            data: updatedOrder
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function cancelOrder(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        
        const order = await Order.getOrderById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        
        if (userId && order.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy đơn hàng này'
            });
        }
        
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đã xử lý'
            });
        }
        
        await Order.cancelOrder(id);
        
        await User.updateBalance(userId, order.total_price);
        
        await User.createTransaction(
            userId,
            'refund',
            order.total_price,
            `Hoàn tiền từ đơn hàng #${id}`
        );
        
        await Product.updateStock(order.product_id, order.quantity);
        
        res.json({
            success: true,
            message: 'Hủy đơn hàng thành công. Tiền đã được hoàn lại'
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getOrderStats(req, res) {
    try {
        const stats = await Order.getOrderStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getAllOrdersAdmin(req, res) {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
            start_date: req.query.start_date,
            end_date: req.query.end_date,
            limit: parseInt(req.query.limit) || 100
        };
        
        const orders = await Order.getAllOrdersAdmin(filters);
        
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getRecentOrders(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const orders = await Order.getRecentOrders(limit);
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get recent orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getOrdersCountToday(req, res) {
    try {
        const result = await Order.getOrdersCountToday();
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get orders count today error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

function generateRandomUsername() {
    return 'user_' + Math.random().toString(36).substring(2, 10);
}

function generateRandomPassword() {
    return Math.random().toString(36).substring(2, 10) + Math.floor(Math.random() * 1000);
}

module.exports = {
    getOrders,
    getOrderById,
    getOrderAccount,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    getAllOrdersAdmin,
    getRecentOrders,
    getOrdersCountToday
};