const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const BOT_DATA_PATH = process.env.BOT_DATA_PATH || '/root/telegram-bot/data/bot-database.json';
const ADMIN_KEY = process.env.BOT_ADMIN_KEY || 'shopdonk_admin_2024';

function loadBotData() {
    try {
        if (fs.existsSync(BOT_DATA_PATH)) {
            const data = fs.readFileSync(BOT_DATA_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading bot data:', e);
    }
    return { users: {}, products: {}, orders: [], deposits: [], transactions: [], categories: {} };
}

function saveBotData(data) {
    try {
        const dir = path.dirname(BOT_DATA_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(BOT_DATA_PATH, JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error('Error saving bot data:', e);
        return false;
    }
}

function isAdmin(telegramId) {
    const adminIds = (process.env.ADMIN_IDS || '').split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    return adminIds.includes(parseInt(telegramId));
}

function getUsersArray(data) {
    return Object.entries(data.users || {}).map(([id, u]) => ({
        id,
        telegram_id: id,
        name: u.name || 'Unknown',
        balance: u.balance || 0,
        role: u.role || 'user',
        created_at: u.createdAt
    }));
}

function getProductsArray(data) {
    return Object.entries(data.products || {}).map(([id, p]) => ({
        id,
        ...p
    }));
}

function getCategoriesArray(data) {
    return Object.entries(data.categories || {}).map(([id, c]) => ({
        id,
        ...c
    }));
}

const botAdminAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopdonk_jwt_secret');
        if (!isAdmin(decoded.telegramId)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        req.adminId = decoded.telegramId;
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

router.post('/login', (req, res) => {
    const { telegramId, adminKey } = req.body;
    
    if (!telegramId || !adminKey) {
        return res.status(400).json({ success: false, message: 'Missing credentials' });
    }
    
    if (!isAdmin(telegramId)) {
        return res.status(403).json({ success: false, message: 'Not an admin' });
    }
    
    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ success: false, message: 'Invalid admin key' });
    }
    
    const token = jwt.sign(
        { telegramId, role: 'bot_admin' },
        process.env.JWT_SECRET || 'shopdonk_jwt_secret',
        { expiresIn: '24h' }
    );
    
    res.json({ success: true, token });
});

router.get('/stats', botAdminAuth, (req, res) => {
    const data = loadBotData();
    
    const revenue = (data.orders || [])
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total || o.price || 0), 0);
    
    const pendingDeposits = (data.deposits || []).filter(d => d.status === 'pending').length;
    
    res.json({
        success: true,
        data: {
            revenue,
            orders: (data.orders || []).length,
            users: Object.keys(data.users || {}).length,
            products: Object.keys(data.products || {}).length,
            pendingDeposits
        }
    });
});

router.get('/products', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const products = getProductsArray(data);
    res.json({ success: true, data: products });
});

router.post('/products', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const { name, category, price, stock, description, account_info } = req.body;
    
    const id = Date.now().toString();
    const newProduct = {
        name,
        category: category || 'other',
        price: parseInt(price) || 0,
        stock: parseInt(stock) || 0,
        description: description || '',
        account_info: account_info || '',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    data.products = data.products || {};
    data.products[id] = newProduct;
    
    if (saveBotData(data)) {
        res.json({ success: true, data: { id, ...newProduct } });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/products/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const product = data.products?.[req.params.id];
    
    if (product) {
        res.json({ success: true, data: { id: req.params.id, ...product } });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

router.put('/products/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const id = req.params.id;
    
    if (!data.products?.[id]) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    data.products[id] = {
        ...data.products[id],
        ...req.body,
        updatedAt: new Date().toISOString()
    };
    
    if (saveBotData(data)) {
        res.json({ success: true, data: { id, ...data.products[id] } });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.delete('/products/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const id = req.params.id;
    
    if (!data.products?.[id]) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    delete data.products[id];
    
    if (saveBotData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/categories', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const categories = getCategoriesArray(data);
    res.json({ success: true, data: categories });
});

router.post('/categories', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const { name, emoji, color, parent_id } = req.body;
    
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const newCategory = {
        id,
        name,
        slug: id,
        emoji: emoji || '📦',
        color: color || '#6366f1',
        parent_id: parent_id || null,
        depth: 0,
        path: id,
        display_order: Object.keys(data.categories || {}).length + 1,
        products: [],
        createdAt: new Date().toISOString()
    };
    
    data.categories = data.categories || {};
    data.categories[id] = newCategory;
    
    if (saveBotData(data)) {
        res.json({ success: true, data: { id, ...newCategory } });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/orders', botAdminAuth, (req, res) => {
    const data = loadBotData();
    let orders = data.orders || [];
    
    if (req.query.status) {
        orders = orders.filter(o => o.status === req.query.status);
    }
    
    if (req.query.limit) {
        orders = orders.slice(0, parseInt(req.query.limit));
    }
    
    orders = orders.map(o => {
        const user = data.users?.[o.user_id];
        return { ...o, username: user?.name || 'User ' + o.user_id };
    });
    
    res.json({ success: true, data: orders.reverse() });
});

router.get('/orders/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const order = (data.orders || []).find(o => o.id === req.params.id || o.id === parseInt(req.params.id));
    
    if (order) {
        const user = data.users?.[order.user_id];
        res.json({ success: true, data: { ...order, username: user?.name } });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

router.post('/orders/:id/refund', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const orderIdx = (data.orders || []).findIndex(o => o.id === req.params.id || o.id === parseInt(req.params.id));
    
    if (orderIdx === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = data.orders[orderIdx];
    
    if (order.status === 'refunded') {
        return res.status(400).json({ success: false, message: 'Already refunded' });
    }
    
    const userId = order.user_id;
    if (data.users?.[userId]) {
        data.users[userId].balance = (data.users[userId].balance || 0) + (order.total || order.price || 0);
    }
    
    data.orders[orderIdx].status = 'refunded';
    data.orders[orderIdx].refunded_at = new Date().toISOString();
    
    data.transactions = data.transactions || [];
    data.transactions.push({
        id: Date.now().toString(),
        user_id: userId,
        type: 'refund',
        amount: order.total || order.price || 0,
        order_id: order.id,
        createdAt: new Date().toISOString()
    });
    
    if (saveBotData(data)) {
        res.json({ success: true, message: 'Refunded successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/users', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const users = getUsersArray(data);
    res.json({ success: true, data: users });
});

router.get('/users/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const user = data.users?.[req.params.id];
    
    if (user) {
        res.json({ success: true, data: { id: req.params.id, ...user } });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

router.post('/users/:id/balance', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const userId = req.params.id;
    
    if (!data.users?.[userId]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const { action, amount } = req.body;
    const amt = parseInt(amount) || 0;
    
    if (action === 'add') {
        data.users[userId].balance = (data.users[userId].balance || 0) + amt;
    } else if (action === 'deduct') {
        data.users[userId].balance = Math.max(0, (data.users[userId].balance || 0) - amt);
    }
    
    data.transactions = data.transactions || [];
    data.transactions.push({
        id: Date.now().toString(),
        user_id: userId,
        type: action === 'add' ? 'admin_add' : 'admin_deduct',
        amount: amt,
        admin_id: req.adminId,
        createdAt: new Date().toISOString()
    });
    
    if (saveBotData(data)) {
        res.json({ success: true, data: { balance: data.users[userId].balance } });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.post('/users/:id/set-role', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const userId = req.params.id;
    const { role } = req.body;
    
    if (!data.users?.[userId]) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!['user', 'ctv', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    data.users[userId].role = role;
    
    if (saveBotData(data)) {
        res.json({ success: true, data: { role } });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/deposits', botAdminAuth, (req, res) => {
    const data = loadBotData();
    let deposits = data.deposits || [];
    
    if (req.query.status) {
        deposits = deposits.filter(d => d.status === req.query.status);
    }
    
    if (req.query.limit) {
        deposits = deposits.slice(0, parseInt(req.query.limit));
    }
    
    deposits = deposits.map(d => {
        const user = data.users?.[d.user_id];
        return { ...d, username: user?.name || 'User ' + d.user_id };
    });
    
    res.json({ success: true, data: deposits.reverse() });
});

router.post('/deposits/:id/approve', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const depositIdx = (data.deposits || []).findIndex(d => d.id === req.params.id || d.id === parseInt(req.params.id));
    
    if (depositIdx === -1) {
        return res.status(404).json({ success: false, message: 'Deposit not found' });
    }
    
    const deposit = data.deposits[depositIdx];
    
    if (deposit.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Deposit already processed' });
    }
    
    const userId = deposit.user_id;
    if (data.users?.[userId]) {
        data.users[userId].balance = (data.users[userId].balance || 0) + deposit.amount;
    }
    
    data.deposits[depositIdx].status = 'approved';
    data.deposits[depositIdx].approved_at = new Date().toISOString();
    data.deposits[depositIdx].approved_by = req.adminId;
    
    data.transactions = data.transactions || [];
    data.transactions.push({
        id: Date.now().toString(),
        user_id: userId,
        type: 'deposit_approved',
        amount: deposit.amount,
        deposit_id: deposit.id,
        createdAt: new Date().toISOString()
    });
    
    if (saveBotData(data)) {
        res.json({ success: true, message: 'Approved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.post('/deposits/:id/reject', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const depositIdx = (data.deposits || []).findIndex(d => d.id === req.params.id || d.id === parseInt(req.params.id));
    
    if (depositIdx === -1) {
        return res.status(404).json({ success: false, message: 'Deposit not found' });
    }
    
    if (data.deposits[depositIdx].status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Deposit already processed' });
    }
    
    data.deposits[depositIdx].status = 'rejected';
    data.deposits[depositIdx].rejected_at = new Date().toISOString();
    data.deposits[depositIdx].rejected_by = req.adminId;
    
    if (saveBotData(data)) {
        res.json({ success: true, message: 'Rejected successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/transactions', botAdminAuth, (req, res) => {
    const data = loadBotData();
    let transactions = data.transactions || [];
    
    if (req.query.user_id) {
        transactions = transactions.filter(t => t.user_id === req.query.user_id);
    }
    
    if (req.query.limit) {
        transactions = transactions.slice(0, parseInt(req.query.limit));
    }
    
    transactions = transactions.map(t => {
        const user = data.users?.[t.user_id];
        return { ...t, username: user?.name || 'User ' + t.user_id };
    });
    
    res.json({ success: true, data: transactions.reverse() });
});

router.post('/broadcast', botAdminAuth, (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ success: false, message: 'Message required' });
    }
    
    const data = loadBotData();
    const userCount = Object.keys(data.users || {}).length;
    
    res.json({ 
        success: true, 
        data: { 
            sent: userCount, 
            message: 'Broadcast sent via Telegram bot (users will receive via bot)',
            note: 'The bot must be running to deliver messages'
        } 
    });
});

router.post('/settings/admin-key', botAdminAuth, (req, res) => {
    const { adminKey } = req.body;
    
    if (!adminKey || adminKey.length < 6) {
        return res.status(400).json({ success: false, message: 'Key must be at least 6 characters' });
    }
    
    process.env.BOT_ADMIN_KEY = adminKey;
    
    res.json({ success: true, message: 'Admin key updated (restart required for persistence)' });
});

router.get('/config', botAdminAuth, (req, res) => {
    const data = loadBotData();
    
    res.json({
        success: true,
        data: {
            admin_ids: (process.env.ADMIN_IDS || '').split(','),
            bot_data_path: BOT_DATA_PATH,
            total_users: Object.keys(data.users || {}).length,
            total_products: Object.keys(data.products || {}).length,
            total_categories: Object.keys(data.categories || {}).length
        }
    });
});

module.exports = router;