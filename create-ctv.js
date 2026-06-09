const bcrypt = require('bcryptjs');
const sql = require('mssql');
require('dotenv').config();

async function createCTV() {
    try {
        const config = {
            database: process.env.DB_DATABASE || 'CayTheDB',
            server: process.env.DB_SERVER || 'localhost',
            port: parseInt(process.env.DB_PORT) || 1433,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                enableArithAbort: true,
                authentication: { type: 'ntlm' }
            }
        };
        
        const pool = await sql.connect(config);
        console.log('Connected to database');
        
        const email = 'ctv@shopgame.vn';
        const name = process.argv[2] || 'CTV Test';
        const password = process.argv[3] || 'ctv123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const checkResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');
        
        if (checkResult.recordset.length > 0) {
            console.log('=================================');
            console.log('CTV account already exists!');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('=================================');
            await pool.close();
            return;
        }
        
        const insertQuery = `INSERT INTO Users (name, email, password, balance, role, status, created_at) 
                             VALUES (@name, @email, @password, @balance, 'ctv', 1, GETDATE())`;
        
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('balance', sql.Decimal(18,2), 0)
            .query(insertQuery);
        
        console.log('=================================');
        console.log('CTV account created successfully!');
        console.log('=================================');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Balance: 0 VND');
        console.log('Role: ctv');
        console.log('=================================');
        console.log('CTV can access admin panel but only see:');
        console.log('- Dashboard (own products & orders)');
        console.log('- Products (only their products)');
        console.log('- Orders (only orders for their products)');
        console.log('=================================');
        
        await pool.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createCTV();