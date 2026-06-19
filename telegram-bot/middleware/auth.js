const config = require('../config');
const db = require('../utils/database');

const ROLES = {
    ADMIN: 'admin',
    CTV: 'ctv',
    USER: 'user'
};

const PERMISSIONS = {
    admin: {
        commands: ['all'],
        actions: ['all']
    },
    ctv: {
        commands: [
            'stats', 'users', 'user', 'orders', 'order',
            'products', 'add', 'edit', 'delete',
            'categories', 'addcat', 'editcat',
            'deposits', 'approve', 'reject'
        ],
        actions: ['view', 'edit_products', 'approve_deposits']
    },
    user: {
        commands: [
            'start', 'help', 'profile', 'balance', 'setname',
            'catalog', 'category', 'search', 'product', 'buy',
            'history', 'account', 'mytransactions',
            'deposit', 'deposit_history'
        ],
        actions: ['buy', 'deposit']
    }
};

function isAdmin(userId) {
    return config.ADMIN_IDS.includes(userId);
}

function getUserRole(userId) {
    if (isAdmin(userId)) return ROLES.ADMIN;
    
    const user = db.getUser(userId);
    return user.role || ROLES.USER;
}

function hasPermission(userId, command) {
    const role = getUserRole(userId);
    const perms = PERMISSIONS[role];
    
    if (perms.commands.includes('all')) return true;
    
    return perms.commands.includes(command);
}

function requireAdmin(userId) {
    if (!isAdmin(userId)) {
        throw new Error('❌ Bạn không có quyền admin!');
    }
    return true;
}

function requireCTVOrAdmin(userId) {
    const role = getUserRole(userId);
    if (role !== ROLES.ADMIN && role !== ROLES.CTV) {
        throw new Error('❌ Bạn không có quyền thực hiện!');
    }
    return true;
}

function setUserRole(userId, role) {
    if (!Object.values(ROLES).includes(role)) {
        throw new Error('Invalid role!');
    }
    
    const user = db.getUser(userId);
    user.role = role;
    return db.save();
}

function getRoleStats() {
    const users = Object.values(db.data.users);
    return {
        admins: users.filter(u => isAdmin(u.id) || u.role === ROLES.ADMIN).length,
        ctvs: users.filter(u => u.role === ROLES.CTV).length,
        users: users.filter(u => !u.role || u.role === ROLES.USER).length
    };
}

module.exports = {
    ROLES,
    PERMISSIONS,
    isAdmin,
    getUserRole,
    hasPermission,
    requireAdmin,
    requireCTVOrAdmin,
    setUserRole,
    getRoleStats
};