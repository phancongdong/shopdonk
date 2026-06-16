const { query } = require('../config/database');

async function createDeposit(userId, amount, method, transactionCode) {
    const queryStr = `
        INSERT INTO Deposits (user_id, amount, method, transaction_code, status, created_at)
        VALUES (@param0, @param1, @param2, @param3, 'pending', GETDATE())
    `;
    
    await query(queryStr, [userId, amount, method, transactionCode]);
    
    return { userId, amount, method, transactionCode };
}

async function getDepositById(id) {
    const queryStr = `
        SELECT d.*, u.name as user_name, u.email as user_email
        FROM Deposits d
        LEFT JOIN Users u ON d.user_id = u.id
        WHERE d.id = @param0
    `;
    const result = await query(queryStr, [id]);
    return result.recordset[0];
}

async function getDepositsByUser(userId, limit = 20) {
    const queryStr = `
        SELECT TOP (${limit}) *
        FROM Deposits
        WHERE user_id = @param0
        ORDER BY created_at DESC
    `;
    const result = await query(queryStr, [userId]);
    return result.recordset;
}

async function getAllDeposits(filters = {}) {
    let queryStr = `
        SELECT d.*, u.name as user_name, u.email as user_email
        FROM Deposits d
        LEFT JOIN Users u ON d.user_id = u.id
        WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.status) {
        queryStr += ` AND d.status = @param${params.length}`;
        params.push(filters.status);
    }
    
    if (filters.user_id) {
        queryStr += ` AND d.user_id = @param${params.length}`;
        params.push(filters.user_id);
    }
    
    queryStr += ` ORDER BY d.created_at DESC`;
    
    if (filters.limit) {
        queryStr += ` OFFSET 0 ROWS FETCH NEXT @param${params.length} ROWS ONLY`;
        params.push(filters.limit);
    }
    
    const result = await query(queryStr, params);
    return result.recordset;
}

async function updateDepositStatus(id, status) {
    const queryStr = `
        UPDATE Deposits 
        SET status = @param0,
            updated_at = GETDATE()
        WHERE id = @param1
    `;
    await query(queryStr, [status, id]);
    
    return getDepositById(id);
}

async function approveDeposit(id) {
    const { beginTransaction, commitTransaction, rollbackTransaction } = require('../config/database');
    let transaction = null;
    
    try {
        transaction = await beginTransaction();
        
        const depositResult = await query(`
            SELECT d.*, u.balance as current_balance
            FROM Deposits d WITH (UPDLOCK, HOLDLOCK)
            JOIN Users u WITH (UPDLOCK, HOLDLOCK) ON d.user_id = u.id
            WHERE d.id = @param0
        `, [id], transaction);
        
        const deposit = depositResult.recordset[0];
        
        if (!deposit) {
            await rollbackTransaction(transaction);
            throw new Error('Deposit not found');
        }
        
        if (deposit.status !== 'pending') {
            await rollbackTransaction(transaction);
            throw new Error('Deposit already processed');
        }
        
        await query(`
            UPDATE Deposits 
            SET status = 'completed',
                updated_at = GETDATE()
            WHERE id = @param0
        `, [id], transaction);
        
        await query(`
            UPDATE Users 
            SET balance = balance + @param0,
                updated_at = GETDATE()
            WHERE id = @param1
        `, [deposit.amount, deposit.user_id], transaction);
        
        await query(`
            INSERT INTO Transactions (user_id, type, amount, description, created_at)
            VALUES (@param0, @param1, @param2, @param3, GETDATE())
        `, [deposit.user_id, 'deposit', deposit.amount, `Nạp tiền qua ${deposit.method} - Mã GD: ${deposit.transaction_code}`], transaction);
        
        await commitTransaction(transaction);
        
        return getDepositById(id);
    } catch (error) {
        if (transaction) {
            await rollbackTransaction(transaction);
        }
        throw error;
    }
}

async function rejectDeposit(id) {
    const queryStr = `
        UPDATE Deposits 
        SET status = 'rejected',
            updated_at = GETDATE()
        WHERE id = @param0
    `;
    await query(queryStr, [id]);
    
    return getDepositById(id);
}

async function getLatestDepositByUser(userId) {
    const queryStr = `
        SELECT TOP 1 *
        FROM Deposits
        WHERE user_id = @param0
        ORDER BY created_at DESC
    `;
    const result = await query(queryStr, [userId]);
    return result.recordset[0];
}

async function approveDepositById(id) {
    const deposit = await getDepositById(id);
    
    if (!deposit) {
        throw new Error('Deposit not found');
    }
    
    await query(`
        UPDATE Deposits 
        SET status = 'completed',
            updated_at = GETDATE()
        WHERE id = @param0
    `, [id]);
    
    const User = require('./User');
    await User.updateBalance(deposit.user_id, deposit.amount);
    
    await User.createTransaction(
        deposit.user_id,
        'deposit',
        deposit.amount,
        `Nạp tiền qua ${deposit.method} - Mã GD: ${deposit.transaction_code}`
    );
    
    return getDepositById(id);
}

module.exports = {
    createDeposit,
    getDepositById,
    getDepositsByUser,
    getAllDeposits,
    updateDepositStatus,
    approveDeposit,
    rejectDeposit,
    getLatestDepositByUser,
    approveDepositById
};