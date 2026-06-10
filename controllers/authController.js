const { validationResult } = require('express-validator');
const User = require('../models/User');

const verificationCodes = new Map();

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function register(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { name, email, password } = req.body;
        
        const user = await User.createUser(name, email || null, password);
        
        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            user: user
        });
    } catch (error) {
        console.error('Register error:', error);
        
        if (error.message === 'Username already exists') {
            return res.status(409).json({
                success: false,
                message: 'Tên đăng nhập đã tồn tại!'
            });
        }
        
        if (error.message === 'Email already exists') {
            return res.status(409).json({
                success: false,
                message: 'Email đã tồn tại!'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Lỗi server. Vui lòng thử lại!'
        });
    }
}

async function login(req, res) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                message: errors.array()[0].msg,
                errors: errors.array() 
            });
        }

        const { username, password } = req.body;
        
        const user = await User.findUserByNameOrEmail(username);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng!'
            });
        }
        
        const isMatch = await User.validatePassword(user, password);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không đúng!'
            });
        }
        
        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance || 0,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server. Vui lòng thử lại!'
        });
    }
}

async function getProfile(req, res) {
    try {
        const userId = req.params.id;
        const user = await User.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance || 0,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function getBalance(req, res) {
    try {
        const userId = req.params.id;
        const balance = await User.getBalance(userId);
        
        res.json({
            success: true,
            balance: balance
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updateName(req, res) {
    try {
        const userId = req.params.id;
        const { name } = req.body;
        
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Tên phải có ít nhất 2 ký tự!'
            });
        }
        
        const user = await User.updateName(userId, name.trim());
        
        res.json({
            success: true,
            message: 'Cập nhật tên thành công!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance || 0,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Update name error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server. Vui lòng thử lại!'
        });
    }
}

async function requestEmailVerification(req, res) {
    try {
        const userId = req.params.id;
        const { newEmail } = req.body;
        
        if (!newEmail || !validateEmail(newEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Email không hợp lệ!'
            });
        }
        
        const currentUser = await User.getUserById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: 'User không tồn tại!'
            });
        }
        
        const existingUser = await User.findUserByEmail(newEmail);
        if (existingUser && existingUser.id !== userId) {
            return res.status(409).json({
                success: false,
                message: 'Email đã được sử dụng!'
            });
        }
        
        const code = generateCode();
        verificationCodes.set(`${userId}_email`, {
            code: code,
            newEmail: newEmail,
            expires: Date.now() + 600000
        });
        
        console.log(`Verification code for user ${userId} (email change): ${code}`);
        
        res.json({
            success: true,
            message: 'Mã xác nhận đã được tạo! (Check console for code)',
            code: code
        });
    } catch (error) {
        console.error('Request email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function confirmEmailChange(req, res) {
    try {
        const userId = req.params.id;
        const { code } = req.body;
        
        const stored = verificationCodes.get(`${userId}_email`);
        
        if (!stored) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy mã xác nhận!'
            });
        }
        
        if (Date.now() > stored.expires) {
            verificationCodes.delete(`${userId}_email`);
            return res.status(400).json({
                success: false,
                message: 'Mã xác nhận đã hết hạn!'
            });
        }
        
        if (code !== stored.code) {
            return res.status(400).json({
                success: false,
                message: 'Mã xác nhận không đúng!'
            });
        }
        
        const user = await User.updateEmail(userId, stored.newEmail);
        verificationCodes.delete(`${userId}_email`);
        
        res.json({
            success: true,
            message: 'Cập nhật email thành công!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance || 0,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Confirm email change error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function requestPasswordVerification(req, res) {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin!'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới phải có ít nhất 6 ký tự!'
            });
        }
        
        const isValid = await User.validateCurrentPassword(userId, currentPassword);
        
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng!'
            });
        }
        
        const code = generateCode();
        verificationCodes.set(`${userId}_password`, {
            code: code,
            newPassword: newPassword,
            expires: Date.now() + 600000
        });
        
        console.log(`Verification code for user ${userId} (password change): ${code}`);
        
        res.json({
            success: true,
            message: 'Mã xác nhận đã được tạo! (Check console for code)',
            code: code
        });
    } catch (error) {
        console.error('Request password verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function confirmPasswordChange(req, res) {
    try {
        const userId = req.params.id;
        const { code } = req.body;
        
        const stored = verificationCodes.get(`${userId}_password`);
        
        if (!stored) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy mã xác nhận!'
            });
        }
        
        if (Date.now() > stored.expires) {
            verificationCodes.delete(`${userId}_password`);
            return res.status(400).json({
                success: false,
                message: 'Mã xác nhận đã hết hạn!'
            });
        }
        
        if (code !== stored.code) {
            return res.status(400).json({
                success: false,
                message: 'Mã xác nhận không đúng!'
            });
        }
        
        const user = await User.updatePassword(userId, stored.newPassword);
        verificationCodes.delete(`${userId}_password`);
        
        res.json({
            success: true,
            message: 'Cập nhật mật khẩu thành công!'
        });
    } catch (error) {
        console.error('Confirm password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

async function updateProfile(req, res) {
    try {
        const userId = req.params.id;
        const { email, phone, password } = req.body;
        
        const isValid = await User.validateCurrentPassword(userId, password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu không đúng!'
            });
        }
        
        if (email !== undefined) {
            const existingUser = await User.findUserByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(409).json({
                    success: false,
                    message: 'Email đã được sử dụng!'
                });
            }
            await User.updateEmail(userId, email);
        }
        
        if (phone !== undefined) {
            await User.updatePhone(userId, phone);
        }
        
        const user = await User.getUserById(userId);
        
        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                balance: user.balance || 0,
                role: user.role || 'user',
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}

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

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

module.exports = {
    register,
    login,
    getProfile,
    getBalance,
    updateName,
    requestEmailVerification,
    confirmEmailChange,
    requestPasswordVerification,
    confirmPasswordChange,
    updateProfile,
    getAllUsers
};
