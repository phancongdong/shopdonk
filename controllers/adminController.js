const User = require('../models/User');
const Order = require('../models/Order');

async function getAllUsers(req, res) {
    try {
        const users = await User.getAllUsers();
        
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.params.id;
        const { name, email, phone, balance, role } = req.body;
        
        // Update user info
        if (name) await User.updateName(userId, name);
        if (email) {
            try {
                await User.updateEmail(userId, email);
            } catch (e) {
                console.log('Email update skipped:', e.message);
            }
        }
        if (phone) {
            try {
                await User.updatePhone(userId, phone);
            } catch (e) {
                console.log('Phone update skipped:', e.message);
            }
        }
        if (balance !== undefined) await User.setBalance(userId, parseFloat(balance));
        if (role) {
            try {
                await User.updateRole(userId, role);
            } catch (e) {
                console.log('Role update skipped:', e.message);
            }
        }
        
        const user = await User.getUserById(userId);
        
        res.json({
            success: true,
            message: 'Cập nhật người dùng thành công!',
            user: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
}

async function setUserBalance(req, res) {
    try {
        const userId = req.params.id;
        const { amount, description } = req.body;
        
        if (amount === undefined || amount === null) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập số tiền!'
            });
        }
        
        const adjustAmount = parseFloat(amount);
        
        if (isNaN(adjustAmount)) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền không hợp lệ!'
            });
        }
        
        const currentUser = await User.getUserById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng!'
            });
        }
        
        const currentBalance = currentUser.balance || 0;
        const newBalance = currentBalance + adjustAmount;
        
        if (newBalance < 0) {
            return res.status(400).json({
                success: false,
                message: 'Số dư không thể âm!'
            });
        }
        
        const user = await User.setBalance(userId, newBalance);
        
        const transactionType = adjustAmount >= 0 ? 'deposit' : 'withdraw';
        await User.createTransaction(
            userId, 
            transactionType, 
            Math.abs(adjustAmount), 
            description || `Admin ${adjustAmount >= 0 ? 'cộng' : 'trừ'} ${Math.abs(adjustAmount)} VNĐ`
        );
        
        res.json({
            success: true,
            message: `${adjustAmount >= 0 ? 'Cộng' : 'Trừ'} tiền thành công!`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance || 0,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Set balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function adjustBalance(req, res) {
    try {
        const userId = req.params.id;
        const { amount, description } = req.body;
        
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập số tiền!'
            });
        }
        
        const adjustAmount = parseFloat(amount);
        
        if (isNaN(adjustAmount) || adjustAmount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền không hợp lệ!'
            });
        }
        
        const currentUser = await User.getUserById(userId);
        const currentBalance = currentUser.balance || 0;
        const newBalance = currentBalance + adjustAmount;
        
        if (newBalance < 0) {
            return res.status(400).json({
                success: false,
                message: 'Số dư không thể âm!'
            });
        }
        
        const user = await User.setBalance(userId, newBalance);
        
        const transactionType = adjustAmount > 0 ? 'DEPOSIT' : 'WITHDRAW';
        await User.createTransaction(
            userId, 
            transactionType, 
            Math.abs(adjustAmount), 
            description || `${adjustAmount > 0 ? 'Nạp' : 'Rút'} ${Math.abs(adjustAmount)}`
        );
        
        res.json({
            success: true,
            message: `${adjustAmount > 0 ? 'Nạp' : 'Rút'} tiền thành công!`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance || 0,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Adjust balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getTransactions(req, res) {
    try {
        const userId = req.params.id;
        const limit = parseInt(req.query.limit) || 20;
        
        const transactions = await User.getTransactions(userId, limit);
        
        res.json({
            success: true,
            transactions: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getUserOrders(req, res) {
    try {
        const userId = req.params.userId;
        const orders = await Order.getOrdersByUser(userId, 50);
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

module.exports = {
    getAllUsers,
    updateUser,
    setUserBalance,
    adjustBalance,
    getTransactions,
    getUserOrders
};
