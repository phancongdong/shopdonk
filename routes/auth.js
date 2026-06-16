const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const passwordValidation = [
    body('password')
        .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
        .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ hoa')
        .matches(/[a-z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ thường')
        .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất 1 số')
        .matches(/[^A-Za-z0-9]/).withMessage('Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
];

router.post('/register', [
    body('name').notEmpty().withMessage('Tên người dùng không được để trống')
        .isLength({ min: 2, max: 50 }).withMessage('Tên phải có 2-50 ký tự')
        .matches(/^[a-zA-Z0-9_\-\s\u00C0-\u024F]+$/).withMessage('Tên không được chứa ký tự đặc biệt'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ'),
    ...passwordValidation
], authController.register);

router.post('/login', [
    body('username').notEmpty().withMessage('Tên đăng nhập không được để trống'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống')
], authController.login);

router.post('/validate', authMiddleware, authController.validateSession);
router.post('/logout', authMiddleware, authController.logout);
router.get('/transactions', authMiddleware, authController.getMyTransactions);

router.get('/profile/:id', authMiddleware, authController.getProfile);
router.get('/balance/:id', authMiddleware, authController.getBalance);

router.put('/name/:id', authMiddleware, authController.updateName);
router.post('/email/request/:id', authMiddleware, authController.requestEmailVerification);
router.post('/email/confirm/:id', authMiddleware, authController.confirmEmailChange);
router.post('/password/request/:id', authMiddleware, [
    body('newPassword')
        .isLength({ min: 8 }).withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
        .matches(/[A-Z]/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ hoa')
        .matches(/[a-z]/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ thường')
        .matches(/[0-9]/).withMessage('Mật khẩu mới phải có ít nhất 1 số')
        .matches(/[^A-Za-z0-9]/).withMessage('Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt')
], authController.requestPasswordVerification);
router.post('/password/confirm/:id', authMiddleware, authController.confirmPasswordChange);
router.post('/change-password', authMiddleware, [
    body('new_password')
        .isLength({ min: 8 }).withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
        .matches(/[A-Z]/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ hoa')
        .matches(/[a-z]/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ thường')
        .matches(/[0-9]/).withMessage('Mật khẩu mới phải có ít nhất 1 số')
        .matches(/[^A-Za-z0-9]/).withMessage('Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt')
], authController.changePasswordDirect);
router.post('/google', authController.googleSignIn);
router.put('/profile/:id', authMiddleware, authController.updateProfile);
router.get('/users', authMiddleware, adminMiddleware, authController.getAllUsers);

module.exports = router;
