const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const User = require('../models/User');

router.post('/register', [
    body('name').notEmpty().withMessage('Tên người dùng không được để trống'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
], authController.register);

router.post('/login', [
    body('username').notEmpty().withMessage('Tên đăng nhập không được để trống'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống')
], authController.login);

router.post('/validate', authController.validateSession);
router.post('/logout', authController.logout);
router.get('/transactions', authController.getMyTransactions);

router.get('/profile/:id', authController.getProfile);
router.get('/balance/:id', authController.getBalance);

router.put('/name/:id', authController.updateName);
router.post('/email/request/:id', authController.requestEmailVerification);
router.post('/email/confirm/:id', authController.confirmEmailChange);
router.post('/password/request/:id', authController.requestPasswordVerification);
router.post('/password/confirm/:id', authController.confirmPasswordChange);
router.post('/change-password', authController.changePasswordDirect);
router.post('/google', authController.googleSignIn);
router.put('/profile/:id', authController.updateProfile);
router.get('/users', authController.getAllUsers);

module.exports = router;
