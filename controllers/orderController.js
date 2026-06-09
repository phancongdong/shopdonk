const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

async function getOrders(req, res) {
    try {
        const userId = req.user?.id;
        const filters = {
            user_id: userId,
            status: req.query.status,
            limit: req.query.limit || 50
        };
        
        let orders;
        if (userId) {
            orders = await Order.getOrdersByUser(userId, filters.limit);
        } else {
            orders = await Order.getAllOrders(filters);
        }
        
        res.json({
            success: true,
            data: orders,
            count: orders.length
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
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function createOrder(req, res) {
    try {
        const userId = req.user?.id || req.body.user_id;
        const { product_id, quantity = 1 } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để mua hàng'
            });
        }
        
        if (!product_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm'
            });
        }
        
        const product = await Product.getProductById(product_id);
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
        
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm không đủ số lượng'
            });
        }
        
        const user = await User.getUserById(userId);
        const totalPrice = product.price * quantity;
        
        if (user.balance < totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Số dư không đủ'
            });
        }
        
        await User.updateBalance(userId, -totalPrice);
        
        let accountUsername, accountPassword;
        
        if (product.account_type === 'multiple' && product.accounts_list) {
            const accounts = product.accounts_list.split('\n').filter(line => line.trim().includes('-'));
            
            if (accounts.length === 0) {
                await User.updateBalance(userId, totalPrice);
                return res.status(400).json({
                    success: false,
                    message: 'Sản phẩm đã hết tài khoản'
                });
            }
            
            const firstAccount = accounts[0].trim();
            const [username, password] = firstAccount.split('-');
            accountUsername = username?.trim() || '';
            accountPassword = password?.trim() || '';
            
            const remainingAccounts = accounts.slice(1).join('\n');
            await Product.updateProduct(product_id, {
                accounts_list: remainingAccounts,
                stock: accounts.length - 1,
                is_hidden: accounts.length - 1 === 0 ? 1 : 0
            });
        } else {
            accountUsername = product.account_username || generateRandomUsername();
            accountPassword = product.account_password || generateRandomPassword();
            await Product.updateStock(product_id, quantity);
            
            if (product.stock - quantity <= 0) {
                await Product.updateProduct(product_id, { is_hidden: 1 });
            }
        }
        
        const accountInfo = {
            username: accountUsername,
            password: accountPassword,
            notes: `Đơn hàng #${Date.now()} - ${product.name}`
        };
        
        await Order.createOrder(userId, product_id, quantity, totalPrice, accountInfo, accountUsername, accountPassword);
        
        await User.createTransaction(
            userId,
            'purchase',
            -totalPrice,
            `Mua ${product.name} (${quantity} nick)`
        );
        
        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            data: {
                id: Date.now(),
                product: product.name,
                quantity,
                total_price: totalPrice,
                account_username: accountInfo.username,
                account_password: accountInfo.password
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
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

function generateRandomUsername() {
    return 'user_' + Math.random().toString(36).substring(2, 10);
}

function generateRandomPassword() {
    return Math.random().toString(36).substring(2, 10) + Math.floor(Math.random() * 1000);
}

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
};