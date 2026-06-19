const sqlDb = require('./sqlDatabase');

class Database {
    async init() {
        await sqlDb.connect();
        console.log('✅ SQL Database connected');
    }

    async save() {}

    async getUser(userId) {
        const result = await sqlDb.query(
            'SELECT * FROM Users WHERE telegram_id = @param0',
            [userId.toString()]
        );
        if (result.recordset.length > 0) return result.recordset[0];
        return this.createUserFromTelegram(userId, 'User');
    }

    async createUserFromTelegram(telegramId, name) {
        const password = 'TG_' + telegramId.toString();
        const email = telegramId.toString() + '@telegram.bot';
        const result = await sqlDb.query(
            'INSERT INTO Users (name, email, password, telegram_id, balance, role, created_at) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, 0, @param4, GETDATE())',
            [name || 'User', email, password, telegramId.toString(), 'user']
        );
        return result.recordset[0];
    }

    async updateUser(userId, updates) {
        const user = await this.getUser(userId);
        if (!user) return null;
        const fields = [];
        const params = [user.id];
        Object.keys(updates).forEach((f) => {
            fields.push(f + ' = @param' + params.length);
            params.push(updates[f]);
        });
        await sqlDb.query('UPDATE Users SET ' + fields.join(', ') + ' WHERE id = @param0', params);
        return this.getUser(userId);
    }

    async updateBalance(userId, amount) {
        const user = await this.getUser(userId);
        if (!user) return null;
        await sqlDb.query('UPDATE Users SET balance = balance + @param0 WHERE telegram_id = @param1', [amount, userId.toString()]);
        return this.getUser(userId);
    }

    async getProduct(productId) {
        const result = await sqlDb.query(
            'SELECT p.*, c.name as category_name FROM Products p LEFT JOIN Categories c ON p.category_id = c.id WHERE p.id = @param0',
            [parseInt(productId)]
        );
        const product = result.recordset[0];
        if (product) {
            if (product.accounts_list) {
                product.accounts = product.accounts_list.split('\n').filter(l => l.includes('-')).map(l => {
                    const parts = l.split('-');
                    return { username: parts[0]?.trim(), password: parts[1]?.trim(), extra: parts[2]?.trim() };
                });
            } else if (product.account_username && product.account_password) {
                product.accounts = [{ username: product.account_username, password: product.account_password }];
            } else {
                product.accounts = [];
            }
        }
        return product;
    }

    async getAllProducts(includeHidden = false) {
        let q = 'SELECT p.*, c.name as category_name FROM Products p LEFT JOIN Categories c ON p.category_id = c.id WHERE 1=1';
        if (!includeHidden) q += ' AND (p.is_hidden = 0 OR p.is_hidden IS NULL)';
        q += ' ORDER BY p.id DESC';
        const result = await sqlDb.query(q);
        return result.recordset;
    }

    async getProductsByCategory(catId) {
        const result = await sqlDb.query(
            'SELECT p.*, c.name as category_name FROM Products p LEFT JOIN Categories c ON p.category_id = c.id WHERE p.category_id = @param0 ORDER BY p.id DESC',
            [parseInt(catId)]
        );
        return result.recordset;
    }

    async searchProducts(kw) {
        const result = await sqlDb.query(
            'SELECT p.*, c.name as category_name FROM Products p LEFT JOIN Categories c ON p.category_id = c.id WHERE (p.is_hidden = 0 OR p.is_hidden IS NULL) AND (p.name LIKE @param0 OR p.description LIKE @param0)',
            ['%' + kw + '%']
        );
        return result.recordset;
    }

    async getAllCategories() {
        const result = await sqlDb.query('SELECT * FROM Categories ORDER BY depth, display_order');
        return result.recordset || [];
    }

    async getCategoryById(id) {
        const result = await sqlDb.query('SELECT * FROM Categories WHERE id = @param0', [parseInt(id)]);
        return result.recordset[0];
    }

    async getCategoryTree() {
        const cats = await this.getAllCategories();
        if (!cats || cats.length === 0) return [];
        return cats.filter(c => !c.parent_id).map(c => ({...c, children: cats.filter(x => x.parent_id === c.id)}));
    }

    async getStats() {
        const users = await sqlDb.query('SELECT COUNT(*) as count FROM Users');
        const products = await sqlDb.query('SELECT COUNT(*) as count FROM Products');
        const stock = await sqlDb.query('SELECT COUNT(*) as count FROM Products WHERE stock > 0');
        const cats = await sqlDb.query('SELECT COUNT(*) as count FROM Categories');
        const orders = await sqlDb.query('SELECT COUNT(*) as count, SUM(total_price) as total FROM Orders');
        const deposits = await sqlDb.query('SELECT SUM(amount) as total FROM Deposits WHERE status = @param0', ['approved']);
        const pending = await sqlDb.query('SELECT COUNT(*) as count FROM Deposits WHERE status = @param0', ['pending']);
        return {
            totalUsers: users.recordset[0]?.count || 0,
            totalProducts: products.recordset[0]?.count || 0,
            inStockProducts: stock.recordset[0]?.count || 0,
            totalCategories: cats.recordset[0]?.count || 0,
            totalOrders: orders.recordset[0]?.count || 0,
            totalRevenue: orders.recordset[0]?.total || 0,
            totalDeposits: deposits.recordset[0]?.total || 0,
            pendingDeposits: pending.recordset[0]?.count || 0,
            todayOrders: 0,
            todayRevenue: 0,
            totalRefunds: 0
        };
    }

    async getOrdersByUser(userId, limit = 20) {
        const user = await this.getUser(userId);
        if (!user) return [];
        const result = await sqlDb.query('SELECT o.*, p.name as product_name FROM Orders o LEFT JOIN Products p ON o.product_id = p.id WHERE o.user_id = @param0 ORDER BY o.id DESC', [user.id]);
        const orders = result.recordset || [];
        orders.forEach(o => {
            o.productName = o.product_name;
            if (o.account_info) {
                try { o.accounts = JSON.parse(o.account_info).accounts || []; } catch (e) { o.accounts = []; }
            }
        });
        return orders;
    }

    async getOrderById(id) {
        const result = await sqlDb.query('SELECT o.*, p.name as product_name FROM Orders o LEFT JOIN Products p ON o.product_id = p.id WHERE o.id = @param0', [parseInt(id)]);
        const order = result.recordset[0];
        if (order) {
            order.productName = order.product_name;
            if (order.account_info) {
                try { order.accounts = JSON.parse(order.account_info).accounts || []; } catch (e) { order.accounts = []; }
            }
        }
        return order;
    }

    async createOrder(userId, productId, qty = 1) {
        const product = await this.getProduct(productId);
        const user = await this.getUser(userId);
        if (!product) throw new Error('San pham khong ton tai!');
        const accounts = product.accounts || [];
        if (accounts.length < qty) throw new Error('Khong du hang!');
        if ((user.balance || 0) < product.price * qty) throw new Error('So du khong du!');
        const total = product.price * qty;
        const purchased = accounts.slice(0, qty);
        const remaining = accounts.slice(qty);
        await this.updateBalance(userId, -total);
        
        if (product.account_type === 'single' || !product.accounts_list) {
            await sqlDb.query('UPDATE Products SET stock = 0, account_username = NULL, account_password = NULL WHERE id = @param0', [parseInt(productId)]);
        } else {
            await sqlDb.query('UPDATE Products SET stock = @param0, accounts_list = @param1 WHERE id = @param2', [remaining.length, remaining.map(a => a.username + '-' + a.password).join('\n'), parseInt(productId)]);
        }
        
        const accInfo = JSON.stringify({ accounts: purchased });
        const result = await sqlDb.query('INSERT INTO Orders (user_id, product_id, quantity, total_price, account_info, account_username, account_password, status, created_at) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, GETDATE())', [user.id, parseInt(productId), qty, total, accInfo, purchased[0]?.username || '', purchased[0]?.password || '', 'completed']);
        const order = result.recordset[0];
        order.accounts = purchased;
        await this.createTransaction(userId, 'purchase', -total, 'Mua ' + product.name);
        return order;
    }

    async createTransaction(userId, type, amount, desc) {
        const user = await this.getUser(userId);
        await sqlDb.query('INSERT INTO Transactions (user_id, type, amount, description, created_at) VALUES (@param0, @param1, @param2, @param3, GETDATE())', [user.id, type, amount, desc]);
    }

    async getTransactions(userId, limit = 30) {
        const user = await this.getUser(userId);
        if (!user) return [];
        const result = await sqlDb.query('SELECT * FROM Transactions WHERE user_id = @param0 ORDER BY id DESC', [user.id]);
        return result.recordset || [];
    }

    async getAllTransactions(limit = 50) {
        const result = await sqlDb.query('SELECT t.*, u.telegram_id FROM Transactions t LEFT JOIN Users u ON t.user_id = u.id ORDER BY t.id DESC');
        return result.recordset || [];
    }

    async addDeposit(userId, amount, method, photoId) {
        const user = await this.getUser(userId);
        const result = await sqlDb.query('INSERT INTO Deposits (user_id, amount, method, photo_id, status, created_at) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4, GETDATE())', [user.id, amount, method, photoId || '', 'pending']);
        return result.recordset[0];
    }

    async getPendingDeposits() {
        const result = await sqlDb.query('SELECT d.*, u.telegram_id FROM Deposits d LEFT JOIN Users u ON d.user_id = u.id WHERE d.status = @param0 ORDER BY d.id DESC', ['pending']);
        return result.recordset || [];
    }

    async approveDeposit(id) {
        const result = await sqlDb.query('SELECT d.*, u.telegram_id, u.balance FROM Deposits d LEFT JOIN Users u ON d.user_id = u.id WHERE d.id = @param0', [parseInt(id)]);
        const deposit = result.recordset[0];
        if (!deposit || deposit.status !== 'pending') return null;
        await sqlDb.query('UPDATE Deposits SET status = @param0 WHERE id = @param1', ['approved', parseInt(id)]);
        await sqlDb.query('UPDATE Users SET balance = balance + @param0 WHERE id = @param1', [deposit.amount, deposit.user_id]);
        await this.createTransaction(deposit.telegram_id, 'deposit', deposit.amount, 'Nap tien');
        return deposit;
    }

    async rejectDeposit(id) {
        const result = await sqlDb.query('SELECT d.*, u.telegram_id FROM Deposits d LEFT JOIN Users u ON d.user_id = u.id WHERE d.id = @param0', [parseInt(id)]);
        const deposit = result.recordset[0];
        if (!deposit || deposit.status !== 'pending') return null;
        await sqlDb.query('UPDATE Deposits SET status = @param0 WHERE id = @param1', ['rejected', parseInt(id)]);
        return deposit;
    }

    async getDepositsByUser(userId, limit = 20) {
        const user = await this.getUser(userId);
        if (!user) return [];
        const result = await sqlDb.query('SELECT * FROM Deposits WHERE user_id = @param0 ORDER BY id DESC', [user.id]);
        return result.recordset || [];
    }

    async addProduct(data) {
        const accountsList = (data.accounts || []).map(a => a.username + '-' + a.password + (a.extra ? '-' + a.extra : '')).join('\n');
        const result = await sqlDb.query('INSERT INTO Products (name, category_id, price, cost_price, description, stock, accounts_list, account_type, is_hidden, featured, created_at) OUTPUT INSERTED.* VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, GETDATE())', [data.name, parseInt(data.category) || 1, data.price, data.cost_price || 0, data.description || '', data.accounts?.length || 0, accountsList, 'multiple', false, data.featured || false]);
        return result.recordset[0];
    }

    async updateProduct(id, updates) {
        const fields = [];
        const params = [parseInt(id)];
        Object.keys(updates).forEach((f) => {
            if (f === 'accounts') {
                fields.push('accounts_list = @param' + params.length);
                params.push(updates[f].map(a => a.username + '-' + a.password).join('\n'));
                fields.push('stock = @param' + params.length);
                params.push(updates[f].length);
            } else {
                fields.push(f + ' = @param' + params.length);
                params.push(updates[f]);
            }
        });
        await sqlDb.query('UPDATE Products SET ' + fields.join(', ') + ' WHERE id = @param0', params);
    }

    async deleteProduct(id) {
        await sqlDb.query('DELETE FROM Products WHERE id = @param0', [parseInt(id)]);
        return true;
    }

    async getAllOrders(filters = {}) {
        const result = await sqlDb.query('SELECT o.*, p.name as product_name, u.telegram_id FROM Orders o LEFT JOIN Products p ON o.product_id = p.id LEFT JOIN Users u ON o.user_id = u.id ORDER BY o.id DESC');
        return result.recordset || [];
    }

    async refundOrder(id) {
        const order = await this.getOrderById(id);
        if (!order || order.status !== 'completed') throw new Error('Order khong hop le!');
        await sqlDb.query('UPDATE Orders SET status = @param0 WHERE id = @param1', ['refunded', parseInt(id)]);
        await this.updateBalance(order.userId, order.total_price);
        await this.createTransaction(order.userId, 'refund', order.total_price, 'Hoan tien don #' + id);
        return order;
    }
}

module.exports = new Database();
