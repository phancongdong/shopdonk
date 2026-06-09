const Deposit = require('../models/Deposit');
const User = require('../models/User');

async function getDeposits(req, res) {
    try {
        const userId = req.user?.id;
        const filters = {
            user_id: userId,
            status: req.query.status,
            limit: req.query.limit || 50
        };
        
        let deposits;
        if (userId) {
            deposits = await Deposit.getDepositsByUser(userId, filters.limit);
        } else {
            deposits = await Deposit.getAllDeposits(filters);
        }
        
        res.json({
            success: true,
            data: deposits,
            count: deposits.length
        });
    } catch (error) {
        console.error('Get deposits error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function createDeposit(req, res) {
    try {
        const userId = req.user?.id;
        const { amount, method, transaction_code } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }
        
        if (!amount || amount < 10000) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền nạp tối thiểu 10,000 VNĐ'
            });
        }
        
        if (!method) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn phương thức nạp'
            });
        }
        
        const deposit = await Deposit.createDeposit(
            userId,
            amount,
            method,
            transaction_code || generateTransactionCode()
        );
        
        res.status(201).json({
            success: true,
            message: 'Tạo yêu cầu nạp tiền thành công. Vui lòng chờ admin xác nhận.',
            data: deposit
        });
    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function approveDeposit(req, res) {
    try {
        const id = req.params.id;
        
        const deposit = await Deposit.approveDeposit(id);
        
        res.json({
            success: true,
            message: 'Duyệt nạp tiền thành công',
            data: deposit
        });
    } catch (error) {
        console.error('Approve deposit error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server'
        });
    }
}

async function rejectDeposit(req, res) {
    try {
        const id = req.params.id;
        
        const deposit = await Deposit.rejectDeposit(id);
        
        res.json({
            success: true,
            message: 'Từ chối nạp tiền thành công',
            data: deposit
        });
    } catch (error) {
        console.error('Reject deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function bankTransferDeposit(req, res) {
    try {
        const userId = req.user?.id;
        const { amount } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập'
            });
        }
        
        const bankInfo = {
            bank_name: 'Vietcombank',
            account_number: '1234567890',
            account_name: 'SHOP GAME',
            content: `NAP${userId}${Date.now()}`
        };
        
        res.json({
            success: true,
            message: 'Thông tin chuyển khoản',
            data: bankInfo
        });
    } catch (error) {
        console.error('Bank transfer deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

function generateTransactionCode() {
    return 'DEP' + Date.now() + Math.floor(Math.random() * 1000);
}

module.exports = {
    getDeposits,
    createDeposit,
    approveDeposit,
    rejectDeposit,
    bankTransferDeposit
};