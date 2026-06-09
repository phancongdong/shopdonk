const sql = require('mssql');
require('dotenv').config();

const useWindowsAuth = process.env.USE_WINDOWS_AUTH === 'true';
const useNamedPipes = process.env.USE_NAMED_PIPES === 'true';

let config;

if (useNamedPipes) {
    config = {
        database: process.env.DB_DATABASE || 'CayTheDB',
        server: `np:\\\\.\\pipe\\MSSQLSERVER\\sql\\query`,
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
    };
} else if (useWindowsAuth) {
    config = {
        database: process.env.DB_DATABASE || 'CayTheDB',
        server: process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT) || 1433,
        options: {
            encrypt: false,
            trustServerCertificate: true,
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
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
    };
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

async function query(queryString, params = []) {
    const pool = getPool();
    const request = pool.request();
    
    params.forEach((param, index) => {
        request.input(`param${index}`, param);
    });
    
    const result = await request.query(queryString);
    return result;
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
    sql
};
