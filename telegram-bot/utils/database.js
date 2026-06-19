const fs = require('fs').promises;
const path = require('path');
const { DATABASE_PATH } = require('../config');

class Database {
    constructor() {
        this.data = {
            users: {},
            products: {},
            orders: [],
            deposits: [],
            transactions: [],
            categories: {
                'genshin': { 
                    id: 'genshin',
                    name: 'Genshin Impact', 
                    slug: 'genshin-impact',
                    emoji: '🎮', 
                    parent_id: null,
                    depth: 0,
                    path: 'genshin',
                    display_order: 1,
                    icon: null,
                    color: '#FF6B6B',
                    products: [],
                    createdAt: new Date().toISOString()
                },
                'lol': { 
                    id: 'lol',
                    name: 'League of Legends', 
                    slug: 'league-of-legends',
                    emoji: '⚔️', 
                    parent_id: null,
                    depth: 0,
                    path: 'lol',
                    display_order: 2,
                    icon: null,
                    color: '#4ECDC4',
                    products: [],
                    createdAt: new Date().toISOString()
                },
                'valorant': { 
                    id: 'valorant',
                    name: 'Valorant', 
                    slug: 'valorant',
                    emoji: '🎯', 
                    parent_id: null,
                    depth: 0,
                    path: 'valorant',
                    display_order: 3,
                    icon: null,
                    color: '#45B7D1',
                    products: [],
                    createdAt: new Date().toISOString()
                },
                'pubg': { 
                    id: 'pubg',
                    name: 'PUBG Mobile', 
                    slug: 'pubg-mobile',
                    emoji: '🔫', 
                    parent_id: null,
                    depth: 0,
                    path: 'pubg',
                    display_order: 4,
                    icon: null,
                    color: '#96CEB4',
                    products: [],
                    createdAt: new Date().toISOString()
                },
                'freefire': { 
                    id: 'freefire',
                    name: 'Free Fire', 
                    slug: 'free-fire',
                    emoji: '🔥', 
                    parent_id: null,
                    depth: 0,
                    path: 'freefire',
                    display_order: 5,
                    icon: null,
                    color: '#FFEAA7',
                    products: [],
                    createdAt: new Date().toISOString()
                },
                'other': { 
                    id: 'other',
                    name: 'Khác', 
                    slug: 'other',
                    emoji: '📦', 
                    parent_id: null,
                    depth: 0,
                    path: 'other',
                    display_order: 99,
                    icon: null,
                    color: '#DDA0DD',
                    products: [],
                    createdAt: new Date().toISOString()
                }
            },
            categoryClosure: {},
            stats: {
                totalRevenue: 0,
                totalOrders: 0,
                totalUsers: 0,
                totalDeposits: 0,
                totalRefunds: 0
            }
        };
        this.filePath = path.resolve(DATABASE_PATH);
    }

    async init() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            this.data = JSON.parse(data);
            
            if (!this.data.transactions) this.data.transactions = [];
            if (!this.data.categoryClosure) this.data.categoryClosure = {};
            if (!this.data.stats) {
                this.data.stats = {
                    totalRevenue: 0,
                    totalOrders: 0,
                    totalUsers: 0,
                    totalDeposits: 0,
                    totalRefunds: 0
                };
            }
            
            Object.keys(this.data.users).forEach(uid => {
                if (!this.data.users[uid].role) {
                    this.data.users[uid].role = 'user';
                }
            });
            
            console.log('✅ Database loaded successfully');
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.save();
                console.log('✅ Database created successfully');
            } else {
                throw error;
            }
        }
    }

    async save() {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2));
    }

    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                id: userId,
                name: null,
                email: null,
                phone: null,
                balance: 0,
                role: 'user',
                orders: [],
                transactions: [],
                createdAt: new Date().toISOString()
            };
        }
        return this.data.users[userId];
    }

    async updateUser(userId, updates) {
        const user = this.getUser(userId);
        Object.assign(user, updates);
        await this.save();
        return user;
    }

    async createTransaction(userId, type, amount, description) {
        const transaction = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            userId,
            type,
            amount,
            description,
            createdAt: new Date().toISOString()
        };
        this.data.transactions.push(transaction);
        
        const user = this.getUser(userId);
        if (!user.transactions) user.transactions = [];
        user.transactions.push(transaction.id);
        
        if (type === 'deposit' || type === 'admin_add') {
            this.data.stats.totalDeposits = (this.data.stats.totalDeposits || 0) + amount;
        } else if (type === 'refund') {
            this.data.stats.totalRefunds = (this.data.stats.totalRefunds || 0) + amount;
        }
        
        await this.save();
        return transaction;
    }

    getTransactions(userId, limit = 50) {
        const safeLimit = Math.max(1, Math.min(100, parseInt(limit) || 50));
        return this.data.transactions
            .filter(t => t.userId === userId)
            .slice(-safeLimit)
            .reverse();
    }

    getAllTransactions(limit = 100) {
        return this.data.transactions.slice(-limit).reverse();
    }

    async addProduct(product) {
        const id = Date.now().toString();
        product.id = id;
        product.slug = this.generateSlug(product.name);
        product.createdAt = new Date().toISOString();
        product.updatedAt = new Date().toISOString();
        
        if (!product.stock && product.accounts) {
            product.stock = product.accounts.length;
        }
        if (!product.account_type) product.account_type = 'multiple';
        if (!product.is_hidden) product.is_hidden = false;
        if (!product.featured) product.featured = false;
        if (!product.cost_price) product.cost_price = 0;
        if (!product.original_price) product.original_price = product.price;
        
        this.data.products[id] = product;
        
        if (product.category && this.data.categories[product.category]) {
            if (!this.data.categories[product.category].products) {
                this.data.categories[product.category].products = [];
            }
            this.data.categories[product.category].products.push(id);
        }
        
        await this.save();
        return product;
    }

    getProduct(productId) {
        return this.data.products[productId];
    }

    getAllProducts(includeHidden = false) {
        return Object.values(this.data.products)
            .filter(p => includeHidden || !p.is_hidden);
    }

    getProductsByCategory(category, includeHidden = false) {
        return Object.values(this.data.products)
            .filter(p => p.category === category && (includeHidden || !p.is_hidden));
    }

    async updateProduct(productId, updates) {
        const product = this.data.products[productId];
        if (!product) return null;
        
        Object.assign(product, updates);
        product.updatedAt = new Date().toISOString();
        
        if (updates.accounts) {
            product.stock = updates.accounts.length;
        }
        
        await this.save();
        return product;
    }

    async deleteProduct(productId) {
        const product = this.data.products[productId];
        if (!product) return false;
        
        if (product.category && this.data.categories[product.category]) {
            const idx = this.data.categories[product.category].products.indexOf(productId);
            if (idx > -1) {
                this.data.categories[product.category].products.splice(idx, 1);
            }
        }
        
        delete this.data.products[productId];
        await this.save();
        return true;
    }

    async searchProducts(keyword) {
        const kw = keyword.toLowerCase();
        return Object.values(this.data.products)
            .filter(p => !p.is_hidden)
            .filter(p => 
                p.name.toLowerCase().includes(kw) ||
                (p.description && p.description.toLowerCase().includes(kw)) ||
                (p.category && p.category.toLowerCase().includes(kw))
            );
    }

    getProductsByFilter(filters = {}) {
        let products = Object.values(this.data.products).filter(p => !p.is_hidden);
        
        if (filters.category) {
            products = products.filter(p => p.category === filters.category);
        }
        if (filters.min_price) {
            products = products.filter(p => p.price >= filters.min_price);
        }
        if (filters.max_price) {
            products = products.filter(p => p.price <= filters.max_price);
        }
        if (filters.featured) {
            products = products.filter(p => p.featured);
        }
        if (filters.in_stock) {
            products = products.filter(p => p.stock > 0);
        }
        
        return products;
    }

    async createOrder(userId, productId, quantity = 1) {
        const product = this.data.products[productId];
        const user = this.getUser(userId);
        
        if (!product) throw new Error('Sản phẩm không tồn tại!');
        if (product.stock < quantity) throw new Error('Không đủ hàng!');
        if (user.balance < product.price * quantity) throw new Error('Số dư không đủ!');
        
        const totalPrice = product.price * quantity;
        const accounts = [];
        
        if (product.account_type === 'multiple' && product.accounts) {
            for (let i = 0; i < quantity; i++) {
                accounts.push(product.accounts.shift());
            }
            await this.updateProduct(productId, { 
                accounts: product.accounts,
                stock: product.accounts.length,
                is_hidden: product.accounts.length === 0
            });
        } else {
            for (let i = 0; i < quantity; i++) {
                accounts.push({
                    username: product.account_username || 'N/A',
                    password: product.account_password || 'N/A'
                });
            }
            await this.updateProduct(productId, { 
                stock: product.stock - quantity,
                is_hidden: product.stock - quantity <= 0
            });
        }
        
        user.balance -= totalPrice;
        
        const order = {
            id: Date.now().toString(),
            userId,
            productId,
            productName: product.name,
            productImage: product.image,
            quantity,
            unitPrice: product.price,
            total_price: totalPrice,
            accounts,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        
        this.data.orders.push(order);
        user.orders.push(order.id);
        
        this.data.stats.totalOrders++;
        this.data.stats.totalRevenue += totalPrice;
        
        await this.createTransaction(userId, 'purchase', -totalPrice, 
            `Mua ${product.name} (${quantity} nick)`);
        
        await this.save();
        return order;
    }

    getOrderById(orderId) {
        return this.data.orders.find(o => o.id === orderId);
    }

    getOrdersByUser(userId, limit = 20) {
        return this.data.orders
            .filter(o => o.userId === userId)
            .slice(-limit)
            .reverse();
    }

    getAllOrders(filters = {}) {
        let orders = [...this.data.orders].reverse();
        
        if (filters.status) {
            orders = orders.filter(o => o.status === filters.status);
        }
        if (filters.userId) {
            orders = orders.filter(o => o.userId === filters.userId);
        }
        if (filters.limit) {
            orders = orders.slice(0, filters.limit);
        }
        
        return orders;
    }

    async refundOrder(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if (!order) throw new Error('Đơn hàng không tồn tại!');
        if (order.status !== 'completed') throw new Error('Đơn hàng không thể hoàn!');
        
        order.status = 'refunded';
        order.refundedAt = new Date().toISOString();
        
        const user = this.getUser(order.userId);
        user.balance += order.total_price;
        
        this.data.stats.totalRefunds += order.total_price;
        
        await this.createTransaction(order.userId, 'refund', order.total_price,
            `Hoàn tiền đơn hàng #${orderId}`);
        
        await this.save();
        return order;
    }

    async addDeposit(userId, amount, method, proof = null) {
        const deposit = {
            id: Date.now().toString(),
            userId,
            amount,
            method,
            proof,
            transaction_code: 'DEP' + Date.now() + Math.floor(Math.random() * 1000),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        this.data.deposits.push(deposit);
        await this.save();
        return deposit;
    }

    async approveDeposit(depositId) {
        const deposit = this.data.deposits.find(d => d.id === depositId);
        if (!deposit || deposit.status !== 'pending') return null;
        
        deposit.status = 'approved';
        deposit.approvedAt = new Date().toISOString();
        
        const user = this.getUser(deposit.userId);
        user.balance += deposit.amount;
        
        await this.createTransaction(deposit.userId, 'deposit', deposit.amount,
            `Nạp tiền qua ${deposit.method} - Mã GD: ${deposit.transaction_code}`);
        
        await this.save();
        return deposit;
    }

    async rejectDeposit(depositId) {
        const deposit = this.data.deposits.find(d => d.id === depositId);
        if (!deposit || deposit.status !== 'pending') return null;
        
        deposit.status = 'rejected';
        deposit.rejectedAt = new Date().toISOString();
        
        await this.save();
        return deposit;
    }

    getPendingDeposits() {
        return this.data.deposits.filter(d => d.status === 'pending');
    }

    getDepositsByUser(userId, limit = 20) {
        return this.data.deposits
            .filter(d => d.userId === userId)
            .slice(-limit)
            .reverse();
    }

    getAllDeposits(limit = 100) {
        return this.data.deposits.slice(-limit).reverse();
    }

    async addCategory(data) {
        const id = data.id || Date.now().toString();
        const parentId = data.parent_id || null;
        
        let depth = 0;
        let path = id;
        
        if (parentId && this.data.categories[parentId]) {
            const parent = this.data.categories[parentId];
            depth = parent.depth + 1;
            path = parent.path + '/' + id;
        }
        
        const category = {
            id,
            name: data.name,
            slug: data.slug || this.generateSlug(data.name),
            emoji: data.emoji || '📁',
            parent_id: parentId,
            depth,
            path,
            display_order: data.display_order || 99,
            icon: data.icon || null,
            color: data.color || '#CCCCCC',
            products: [],
            createdAt: new Date().toISOString()
        };
        
        this.data.categories[id] = category;
        await this.save();
        return category;
    }

    getCategoryById(categoryId) {
        return this.data.categories[categoryId];
    }

    getAllCategories() {
        return Object.values(this.data.categories)
            .sort((a, b) => {
                if (a.depth !== b.depth) return a.depth - b.depth;
                return (a.display_order || 99) - (b.display_order || 99);
            });
    }

    getCategoryTree() {
        const buildTree = (parentId = null) => {
            return Object.values(this.data.categories)
                .filter(c => c.parent_id === parentId)
                .sort((a, b) => (a.display_order || 99) - (b.display_order || 99))
                .map(c => ({
                    ...c,
                    children: buildTree(c.id)
                }));
        };
        return buildTree();
    }

    async updateCategory(categoryId, updates) {
        const category = this.data.categories[categoryId];
        if (!category) return null;
        
        if (updates.parent_id !== undefined && updates.parent_id !== category.parent_id) {
            const newParentId = updates.parent_id || null;
            
            if (newParentId === categoryId) {
                throw new Error('Không thể set category làm cha của chính nó!');
            }
            
            if (newParentId) {
                const newParent = this.data.categories[newParentId];
                if (!newParent) {
                    throw new Error('Category cha không tồn tại!');
                }
                
                const checkDescendant = (catId) => {
                    const cat = this.data.categories[catId];
                    if (!cat) return false;
                    if (cat.id === newParentId) return true;
                    if (cat.parent_id) return checkDescendant(cat.parent_id);
                    return false;
                };
                
                if (checkDescendant(categoryId)) {
                    throw new Error('Không thể set descendant làm cha!');
                }
                
                category.depth = newParent.depth + 1;
                category.path = newParent.path + '/' + categoryId;
            } else {
                category.depth = 0;
                category.path = categoryId;
            }
            
            category.parent_id = newParentId;
        }
        
        Object.keys(updates).forEach(key => {
            if (key !== 'parent_id' && updates[key] !== undefined) {
                category[key] = updates[key];
            }
        });
        
        category.updatedAt = new Date().toISOString();
        await this.save();
        return category;
    }

    async deleteCategory(categoryId) {
        const category = this.data.categories[categoryId];
        if (!category) return false;
        
        const children = Object.values(this.data.categories)
            .filter(c => c.parent_id === categoryId);
        
        if (children.length > 0) {
            throw new Error('Không thể xóa category có children! Di chuyển hoặc xóa children trước.');
        }
        
        if (category.products && category.products.length > 0) {
            throw new Error('Không thể xóa category có sản phẩm!');
        }
        
        delete this.data.categories[categoryId];
        await this.save();
        return true;
    }

    getStats() {
        return {
            ...this.data.stats,
            totalUsers: Object.keys(this.data.users).length,
            totalProducts: Object.keys(this.data.products).length,
            totalCategories: Object.keys(this.data.categories).length,
            pendingDeposits: this.data.deposits.filter(d => d.status === 'pending').length,
            inStockProducts: Object.values(this.data.products).filter(p => p.stock > 0 && !p.is_hidden).length,
            todayOrders: this.data.orders.filter(o => {
                const today = new Date().toDateString();
                return new Date(o.createdAt).toDateString() === today;
            }).length,
            todayRevenue: this.data.orders
                .filter(o => {
                    const today = new Date().toDateString();
                    return new Date(o.createdAt).toDateString() === today && o.status === 'completed';
                })
                .reduce((sum, o) => sum + o.total_price, 0)
        };
    }

    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/[đ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    exportOrders(filters = {}) {
        return this.getAllOrders(filters).map(o => ({
            id: o.id,
            user_id: o.userId,
            product: o.productName,
            quantity: o.quantity,
            total: o.total_price,
            status: o.status,
            date: o.createdAt
        }));
    }

    exportProducts(includeHidden = false) {
        return this.getAllProducts(includeHidden).map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            cost_price: p.cost_price || 0,
            stock: p.stock,
            account_type: p.account_type,
            is_hidden: p.is_hidden,
            created_at: p.createdAt
        }));
    }
}

module.exports = new Database();
