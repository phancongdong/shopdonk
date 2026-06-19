const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const BOT_DATA_PATH = path.join(__dirname, '..', 'telegram-bot', 'data', 'bot-database.json');
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
    return { users: [], products: [], orders: [], deposits: [], transactions: [], categories: [] };
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
            users: (data.users || []).length,
            products: (data.products || []).length,
            pendingDeposits
        }
    });
});

router.get('/products', botAdminAuth, (req, res) => {
    const data = loadBotData();
    res.json({ success: true, data: data.products || [] });
});

router.post('/products', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const { name, category, price, stock, description } = req.body;
    
    const newProduct = {
        id: Date.now(),
        name,
        category: category || 'other',
        price: parseInt(price) || 0,
        stock: parseInt(stock) || 0,
        description: description || '',
        created_at: new Date().toISOString()
    };
    
    data.products = data.products || [];
    data.products.push(newProduct);
    
    if (saveBotData(data)) {
        res.json({ success: true, data: newProduct });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/products/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const product = (data.products || []).find(p => p.id === parseInt(req.params.id));
    
    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

router.put('/products/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const idx = (data.products || []).findIndex(p => p.id === parseInt(req.params.id));
    
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    data.products[idx] = {
        ...data.products[idx],
        ...req.body,
        updated_at: new Date().toISOString()
    };
    
    if (saveBotData(data)) {
        res.json({ success: true, data: data.products[idx] });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.delete('/products/:id', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const idx = (data.products || []).findIndex(p => p.id === parseInt(req.params.id));
    
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    data.products.splice(idx, 1);
    
    if (saveBotData(data)) {
        res.json({ success: true });
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
        const user = (data.users || []).find(u => u.id === o.user_id);
        return { ...o, username: user?.name || user?.username };
    });
    
    res.json({ success: true, data: orders });
});

router.post('/orders/:id/refund', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const orderIdx = (data.orders || []).findIndex(o => o.id === parseInt(req.params.id));
    
    if (orderIdx === -1) {
        return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = data.orders[orderIdx];
    
    if (order.status === 'refunded') {
        return res.status(400).json({ success: false, message: 'Already refunded' });
    }
    
    const userIdx = (data.users || []).findIndex(u => u.id === order.user_id);
    if (userIdx !== -1) {
        data.users[userIdx].balance = (data.users[userIdx].balance || 0) + (order.total || order.price || 0);
    }
    
    data.orders[orderIdx].status = 'refunded';
    data.orders[orderIdx].refunded_at = new Date().toISOString();
    
    data.transactions = data.transactions || [];
    data.transactions.push({
        id: Date.now(),
        user_id: order.user_id,
        type: 'refund',
        amount: order.total || order.price || 0,
        order_id: order.id,
        created_at: new Date().toISOString()
    });
    
    if (saveBotData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.get('/users', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const users = (data.users || []).map(u => ({
        id: u.id,
        telegram_id: u.telegram_id,
        name: u.name || u.username,
        username: u.username,
        balance: u.balance || 0,
        role: u.role || 'user',
        created_at: u.created_at
    }));
    
    res.json({ success: true, data: users });
});

router.post('/users/:id/balance', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const userIdx = (data.users || []).findIndex(u => u.id === parseInt(req.params.id));
    
    if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const { action, amount } = req.body;
    const amt = parseInt(amount) || 0;
    
    if (action === 'add') {
        data.users[userIdx].balance = (data.users[userIdx].balance || 0) + amt;
    } else if (action === 'deduct') {
        data.users[userIdx].balance = Math.max(0, (data.users[userIdx].balance || 0) - amt);
    }
    
    data.transactions = data.transactions || [];
    data.transactions.push({
        id: Date.now(),
        user_id: data.users[userIdx].id,
        type: action === 'add' ? 'admin_add' : 'admin_deduct',
        amount: amt,
        admin_id: req.adminId,
        created_at: new Date().toISOString()
    });
    
    if (saveBotData(data)) {
        res.json({ success: true, data: { balance: data.users[userIdx].balance } });
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
        const user = (data.users || []).find(u => u.id === d.user_id);
        return { ...d, username: user?.name || user?.username };
    });
    
    res.json({ success: true, data: deposits });
});

router.post('/deposits/:id/approve', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const depositIdx = (data.deposits || []).findIndex(d => d.id === parseInt(req.params.id));
    
    if (depositIdx === -1) {
        return res.status(404).json({ success: false, message: 'Deposit not found' });
    }
    
    const deposit = data.deposits[depositIdx];
    
    if (deposit.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Deposit already processed' });
    }
    
    const userIdx = (data.users || []).findIndex(u => u.id === deposit.user_id);
    if (userIdx !== -1) {
        data.users[userIdx].balance = (data.users[userIdx].balance || 0) + deposit.amount;
    }
    
    data.deposits[depositIdx].status = 'approved';
    data.deposits[depositIdx].approved_at = new Date().toISOString();
    data.deposits[depositIdx].approved_by = req.adminId;
    
    data.transactions = data.transactions || [];
    data.transactions.push({
        id: Date.now(),
        user_id: deposit.user_id,
        type: 'deposit',
        amount: deposit.amount,
        deposit_id: deposit.id,
        created_at: new Date().toISOString()
    });
    
    if (saveBotData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.post('/deposits/:id/reject', botAdminAuth, (req, res) => {
    const data = loadBotData();
    const depositIdx = (data.deposits || []).findIndex(d => d.id === parseInt(req.params.id));
    
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
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save' });
    }
});

router.post('/broadcast', botAdminAuth, (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ success: false, message: 'Message required' });
    }
    
    const data = loadBotData();
    const users = data.users || [];
    
    res.json({ success: true, data: { sent: users.length, message: 'Broadcast queued (requires bot integration)' } });
});

router.post('/settings/admin-key', botAdminAuth, (req, res) => {
    const { adminKey } = req.body;
    
    if (!adminKey || adminKey.length < 6) {
        return res.status(400).json({ success: false, message: 'Key must be at least 6 characters' });
    }
    
    process.env.BOT_ADMIN_KEY = adminKey;
    
    res.json({ success: true, message: 'Admin key updated (restart required for persistence)' });
});

module.exports = router;