const { query } = require('../config/database');
const crypto = require('crypto');

async function createSession(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await query(`
        INSERT INTO Sessions (token, user_id, expires_at, created_at)
        VALUES (@param0, @param1, @param2, GETDATE())
    `, [token, userId, expiresAt]);
    
    return token;
}

async function validateToken(token) {
    if (!token) return null;
    
    const result = await query(`
        SELECT s.user_id, u.role, u.name, u.email
        FROM Sessions s
        JOIN Users u ON s.user_id = u.id
        WHERE s.token = @param0 AND s.expires_at > GETDATE() AND s.is_active = 1
    `, [token]);
    
    if (result.recordset.length === 0) return null;
    
    const session = result.recordset[0];
    return {
        userId: session.user_id,
        role: session.role,
        name: session.name,
        email: session.email
    };
}

async function destroySession(token) {
    await query(`
        UPDATE Sessions SET is_active = 0, invalidated_at = GETDATE()
        WHERE token = @param0
    `, [token]);
}

async function destroyAllUserSessions(userId) {
    await query(`
        UPDATE Sessions SET is_active = 0, invalidated_at = GETDATE()
        WHERE user_id = @param0 AND is_active = 1
    `, [userId]);
}

async function cleanupExpiredSessions() {
    const result = await query(`
        DELETE FROM Sessions 
        WHERE expires_at < GETDATE() OR (is_active = 0 AND invalidated_at < DATEADD(day, -7, GETDATE()))
    `);
    return result.rowsAffected[0];
}

async function getActiveSessions(userId) {
    const result = await query(`
        SELECT token, created_at, expires_at
        FROM Sessions
        WHERE user_id = @param0 AND is_active = 1 AND expires_at > GETDATE()
        ORDER BY created_at DESC
    `, [userId]);
    return result.recordset;
}

module.exports = {
    createSession,
    validateToken,
    destroySession,
    destroyAllUserSessions,
    cleanupExpiredSessions,
    getActiveSessions
};