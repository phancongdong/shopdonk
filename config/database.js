const sql = require('mssql');
require('dotenv').config();

const useWindowsAuth = process.env.USE_WINDOWS_AUTH === 'true';
const useNamedPipes = process.env.USE_NAMED_PIPES === 'true';
const dbEncrypt = process.env.DB_ENCRYPT === 'true';
const trustServerCert = process.env.DB_TRUST_SERVER_CERTIFICATE === 'true';

let config;

if (useNamedPipes) {
    config = {
        database: process.env.DB_DATABASE || 'CayTheDB',
        server: `np:\\\\.\\pipe\\MSSQLSERVER\\sql\\query`,
        options: {
            encrypt: dbEncrypt,
            trustServerCertificate: trustServerCert,
            enableArithAbort: true
        }
    };
} else if (useWindowsAuth) {
    config = {
        database: process.env.DB_DATABASE || 'CayTheDB',
        server: process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT) || 1433,
        options: {
            encrypt: dbEncrypt,
            trustServerCertificate: trustServerCert,
            enableArithAbort: true,
            authentication: {
                type: 'ntlm'
            }
        }
    };
} else {
    config = {
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE || 'CayTheDB',
        server: process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT) || 1433,
        options: {
            encrypt: dbEncrypt,
            trustServerCertificate: trustServerCert,
            enableArithAbort: true
        }
    };
}

if (dbEncrypt && !trustServerCert) {
    console.log('[DB] Database connection encryption enabled (verifying certificate)');
} else if (dbEncrypt) {
    console.log('[DB] Database connection encryption enabled (trusting server certificate)');
} else {
    console.warn('[SECURITY WARNING] Database connection encryption is DISABLED. Enable DB_ENCRYPT=true in production.');
}

let pool = null;

async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server');
        return pool;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database not connected. Call connectDB first.');
    }
    return pool;
}

async function query(queryString, params = [], transaction = null) {
    const pool = getPool();
    let request;
    
    if (transaction) {
        request = transaction.request();
    } else {
        request = pool.request();
    }
    
    params.forEach((param, index) => {
        request.input(`param${index}`, param);
    });
    
    const result = await request.query(queryString);
    return result;
}

async function beginTransaction() {
    const pool = getPool();
    const transaction = pool.transaction();
    await transaction.begin();
    return transaction;
}

async function commitTransaction(transaction) {
    await transaction.commit();
}

async function rollbackTransaction(transaction) {
    try {
        await transaction.rollback();
    } catch (e) {
        console.error('Rollback error:', e);
    }
}

async function executeProcedure(procedureName, params = {}) {
    const pool = getPool();
    const request = pool.request();
    
    Object.keys(params).forEach(key => {
        request.input(key, params[key]);
    });
    
    const result = await request.execute(procedureName);
    return result;
}

module.exports = {
    connectDB,
    getPool,
    query,
    executeProcedure,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    sql
};
