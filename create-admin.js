const bcrypt = require('bcryptjs');
const sql = require('mssql');
require('dotenv').config();

async function createAdmin() {
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
        
        const email = 'admin@shopgame.vn';
        const password = 'admin123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const checkResult = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM Users WHERE email = @email');
        
        if (checkResult.recordset.length > 0) {
            console.log('=================================');
            console.log('Admin account already exists!');
            console.log('Email:', email);
            console.log('Password:', password);
            console.log('=================================');
            await pool.close();
            return;
        }
        
        const insertQuery = `INSERT INTO Users (name, email, password, balance, role, status, created_at) 
                             VALUES (@name, @email, @password, @balance, 'admin', 1, GETDATE())`;
        
        await pool.request()
            .input('name', sql.NVarChar, 'Admin ShopGame')
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('balance', sql.Decimal(18,2), 10000000)
            .query(insertQuery);
        
        console.log('=================================');
        console.log('Admin account created successfully!');
        console.log('=================================');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Balance: 10,000,000 VND');
        console.log('Role: admin');
        console.log('=================================');
        console.log('Please change password after first login!');
        console.log('=================================');
        
        await pool.close();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createAdmin();