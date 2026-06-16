const bcrypt = require('bcryptjs');
const { query, sql } = require('../config/database');

async function createUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const checkNameQuery = `SELECT * FROM Users WHERE name = @param0`;
    const existingName = await query(checkNameQuery, [name]);
    
    if (existingName.recordset.length > 0) {
        throw new Error('Username already exists');
    }
    
    if (email) {
        const checkQuery = `SELECT * FROM Users WHERE email = @param0`;
        const existingUser = await query(checkQuery, [email]);
        
        if (existingUser.recordset.length > 0) {
            throw new Error('Email already exists');
        }
    }
    
    const insertQuery = `
        INSERT INTO Users (name, email, password, created_at)
        VALUES (@param0, @param1, @param2, GETDATE())
    `;
    
    await query(insertQuery, [name, email, hashedPassword]);
    
    return { name, email };
}

async function findUserByEmail(email) {
    const queryStr = `SELECT * FROM Users WHERE email = @param0`;
    const result = await query(queryStr, [email]);
    return result.recordset[0];
}

async function findUserByNameOrEmail(username) {
    const queryStr = `SELECT * FROM Users WHERE name = @param0 OR email = @param0`;
    const result = await query(queryStr, [username]);
    return result.recordset[0];
}

async function validatePassword(user, password) {
    return await bcrypt.compare(password, user.password);
}

async function getUserById(id) {
    const queryStr = `SELECT * FROM Users WHERE id = @param0`;
    const result = await query(queryStr, [id]);
    return result.recordset[0];
}

async function updateBalance(userId, amount, transaction = null) {
    const queryStr = `
        UPDATE Users 
        SET balance = balance + @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [amount, userId], transaction);
    
    return getUserById(userId);
}

async function updateBalanceWithCheck(userId, amount, transaction = null) {
    const queryStr = `
        UPDATE Users 
        SET balance = balance + @param0,
            updated_at = GETDATE()
        WHERE id = @param1 AND balance + @param0 >= 0
    `;
    const result = await query(queryStr, [amount, userId], transaction);
    
    if (result.rowsAffected[0] === 0) {
        throw new Error('Insufficient balance or user not found');
    }
    
    return getUserById(userId);
}

async function getBalance(userId) {
    const queryStr = `SELECT balance FROM Users WHERE id = @param0`;
    const result = await query(queryStr, [userId]);
    return result.recordset[0]?.balance || 0;
}

async function setBalance(userId, newBalance) {
    const queryStr = `
        UPDATE Users 
        SET balance = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [newBalance, userId]);
    
    return getUserById(userId);
}

async function getAllUsers() {
    const queryStr = `
        SELECT id, name, email, phone, balance, role, created_at 
        FROM Users 
        ORDER BY id
    `;
    const result = await query(queryStr);
    return result.recordset;
}

async function updateRole(userId, newRole) {
    const queryStr = `
        UPDATE Users 
        SET role = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [newRole, userId]);
    
    return getUserById(userId);
}

async function createTransaction(userId, type, amount, description) {
    const queryStr = `
        INSERT INTO Transactions (user_id, type, amount, description, created_at)
        VALUES (@param0, @param1, @param2, @param3, GETDATE())
    `;
    await query(queryStr, [userId, type, amount, description]);
}

async function getTransactions(userId, limit = 20) {
    const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 20));
    const queryStr = `
        SELECT TOP (@param0) *
        FROM Transactions 
        WHERE user_id = @param1
        ORDER BY created_at DESC
    `;
    const result = await query(queryStr, [safeLimit, userId]);
    return result.recordset;
}

async function updateName(userId, newName) {
    const queryStr = `
        UPDATE Users 
        SET name = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [newName, userId]);
    
    return getUserById(userId);
}

async function updateEmail(userId, newEmail) {
    const checkQuery = `SELECT * FROM Users WHERE email = @param0 AND id != @param1`;
    const existingUser = await query(checkQuery, [newEmail, userId]);
    
    if (existingUser.recordset.length > 0) {
        throw new Error('Email already exists');
    }
    
    const queryStr = `
        UPDATE Users 
        SET email = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [newEmail, userId]);
    
    return getUserById(userId);
}

async function updatePhone(userId, newPhone) {
    const queryStr = `
        UPDATE Users 
        SET phone = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [newPhone, userId]);
    
    return getUserById(userId);
}

async function updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const queryStr = `
        UPDATE Users 
        SET password = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [hashedPassword, userId]);
    
    return getUserById(userId);
}

async function validateCurrentPassword(userId, currentPassword) {
    const queryStr = `SELECT password FROM Users WHERE id = @param0`;
    const result = await query(queryStr, [userId]);
    const user = result.recordset[0];
    
    if (!user) {
        return false;
    }
    
    return await bcrypt.compare(currentPassword, user.password);
}

async function findUserByGoogleId(googleId) {
    const queryStr = `SELECT * FROM Users WHERE google_id = @param0`;
    const result = await query(queryStr, [googleId]);
    return result.recordset[0];
}

async function updateGoogleId(userId, googleId) {
    const queryStr = `
        UPDATE Users 
        SET google_id = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [googleId, userId]);
    return getUserById(userId);
}

async function createUserWithGoogle(googleId, email, name, picture) {
    try {
        const queryStr = `
            INSERT INTO Users (google_id, email, name, avatar, balance, role, created_at)
            VALUES (@param0, @param1, @param2, @param3, 0, 'user', GETDATE())
        `;
        await query(queryStr, [googleId, email, name, picture || null]);
        
        const result = await query(`SELECT * FROM Users WHERE google_id = @param0`, [googleId]);
        return result.recordset[0];
    } catch (error) {
        console.error('createUserWithGoogle error:', error);
        throw error;
    }
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserByNameOrEmail,
    validatePassword,
    getUserById,
    updateBalance,
    updateBalanceWithCheck,
    getBalance,
    setBalance,
    getAllUsers,
    updateRole,
    createTransaction,
    getTransactions,
    updateName,
    updateEmail,
    updatePhone,
    updatePassword,
    validateCurrentPassword,
    findUserByGoogleId,
    updateGoogleId,
    createUserWithGoogle
};
