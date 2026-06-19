require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const db = require('./utils/database');

const userCommands = require('./commands/user');
const adminCommands = require('./commands/admin');
const categoryCommands = require('./commands/category');

class Bot {
    constructor() {
        this.bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
        this.setupHandlers();
    }

    async setupHandlers() {
        await db.init();
        
        this.bot.onText(/\/start/, (msg) => userCommands.start(this.bot, msg));
        this.bot.onText(/\/stop/, (msg) => userCommands.stop(this.bot, msg));
        this.bot.onText(/\/help/, (msg) => userCommands.help(this.bot, msg));
        this.bot.onText(/\/profile/, (msg) => userCommands.profile(this.bot, msg));
        this.bot.onText(/\/setname/, (msg) => userCommands.setName(this.bot, msg));
        this.bot.onText(/\/balance/, (msg) => userCommands.balance(this.bot, msg));
        
        this.bot.onText(/\/catalog/, (msg) => userCommands.catalog(this.bot, msg));
        this.bot.onText(/\/category (.+)/, (msg, match) => userCommands.category(this.bot, msg, match));
        this.bot.onText(/\/search (.+)/, (msg, match) => userCommands.search(this.bot, msg, match));
        this.bot.onText(/\/product (.+)/, (msg, match) => userCommands.product(this.bot, msg, match));
        this.bot.onText(/\/buy (.+)/, (msg, match) => userCommands.buy(this.bot, msg, match));
        
        this.bot.onText(/\/history/, (msg) => userCommands.history(this.bot, msg));
        this.bot.onText(/\/account (.+)/, (msg, match) => userCommands.account(this.bot, msg, match));
        this.bot.onText(/\/mytransactions/, (msg) => userCommands.myTransactions(this.bot, msg));
        
        this.bot.onText(/\/deposit(?: (\d+))?/, (msg, match) => userCommands.deposit(this.bot, msg, match));
        this.bot.onText(/\/deposit_history/, (msg) => userCommands.depositHistory(this.bot, msg));
        
        this.bot.onText(/\/admin/, (msg) => adminCommands.admin(this.bot, msg));
        this.bot.onText(/\/stats/, (msg) => adminCommands.stats(this.bot, msg));
        this.bot.onText(/\/users/, (msg) => adminCommands.users(this.bot, msg));
        this.bot.onText(/\/user (.+)/, (msg, match) => adminCommands.user(this.bot, msg, match));
        this.bot.onText(/\/addmoney (.+)/, (msg, match) => adminCommands.addMoney(this.bot, msg, match));
        this.bot.onText(/\/deductmoney (.+)/, (msg, match) => adminCommands.deductMoney(this.bot, msg, match));
        this.bot.onText(/\/transactions(?: (.+))?/, (msg, match) => adminCommands.transactions(this.bot, msg, match));
        
        this.bot.onText(/\/orders(?: (.+))?/, (msg, match) => adminCommands.orders(this.bot, msg, match));
        this.bot.onText(/\/order (.+)/, (msg, match) => adminCommands.order(this.bot, msg, match));
        this.bot.onText(/\/refund (.+)/, (msg, match) => adminCommands.refund(this.bot, msg, match));
        
        this.bot.onText(/\/products/, (msg) => adminCommands.products(this.bot, msg));
        this.bot.onText(/\/add/, (msg) => adminCommands.add(this.bot, msg));
        this.bot.onText(/\/edit (.+)/, (msg, match) => adminCommands.edit(this.bot, msg, match));
        this.bot.onText(/\/delete (.+)/, (msg, match) => adminCommands.delete(this.bot, msg, match));
        
        this.bot.onText(/\/deposits/, (msg) => adminCommands.deposits(this.bot, msg));
        this.bot.onText(/\/approve (.+)/, (msg, match) => adminCommands.approve(this.bot, msg, match));
        this.bot.onText(/\/reject (.+)/, (msg, match) => adminCommands.reject(this.bot, msg, match));
        
        this.bot.onText(/\/broadcast (.+)/, (msg, match) => adminCommands.broadcast(this.bot, msg, match));
        this.bot.onText(/\/export (.+)/, (msg, match) => adminCommands.export(this.bot, msg, match));
        
        this.bot.onText(/\/categories/, (msg) => categoryCommands.categories(this.bot, msg));
        this.bot.onText(/\/addcat/, (msg) => categoryCommands.addCategory(this.bot, msg));
        this.bot.onText(/\/editcat (.+)/, (msg, match) => categoryCommands.editCategory(this.bot, msg, match));
        this.bot.onText(/\/delcat (.+)/, (msg, match) => categoryCommands.deleteCategory(this.bot, msg, match));
        this.bot.onText(/\/movecat (.+)/, (msg, match) => categoryCommands.moveCategory(this.bot, msg, match));
        
        this.bot.on('photo', async (msg) => {
            const userId = msg.from.id.toString();
            const user = db.getUser(userId);
            const userState = user.state;
            
            if (userState && userState.action === 'deposit_proof') {
                await userCommands.handleDepositProof(this.bot, msg, userState);
            }
        });
        
        this.bot.on('callback_query', async (query) => {
            const data = query.data;
            
            if (data.startsWith('admin_')) {
                await adminCommands.handleCallback(this.bot, query);
            } else if (data.startsWith('buy_')) {
                const parts = data.replace('buy_', '').split('_');
                const productId = parts[0];
                const quantity = parseInt(parts[1]) || 1;
                await userCommands.handleBuyCallback(this.bot, query, productId, quantity);
            } else if (data.startsWith('product_')) {
                const productId = data.replace('product_', '');
                await userCommands.handleProductCallback(this.bot, query, productId);
            } else if (data.startsWith('category_')) {
                const categoryId = data.replace('category_', '');
                await userCommands.handleCategoryCallback(this.bot, query, categoryId);
            } else if (data.startsWith('copy_')) {
                const orderId = data.replace('copy_', '');
                await userCommands.handleCopyCallback(this.bot, query, orderId);
            } else if (data.startsWith('delcat_')) {
                const categoryId = data.replace('delcat_', '');
                await categoryCommands.handleDeleteCallback(this.bot, query, categoryId);
            } else if (data.startsWith('approve_') || data.startsWith('reject_') ||
                       data.startsWith('refund_') || data.startsWith('confirm_delete_') ||
                       data.startsWith('addmoney_') || data.startsWith('deduct_') ||
                       data.startsWith('userorders_') || data.startsWith('usertrans_') ||
                       data.startsWith('user_') || data === 'cancel') {
                await adminCommands.handleCallback(this.bot, query);
            } else {
                await userCommands.handleCallback(this.bot, query);
            }
        });
        
        this.bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
        });

        console.log('🤖 Bot is running...');
        console.log('');
        console.log('📋 Commands available:');
        console.log('');
        console.log('USER:');
        console.log('  /start, /help, /profile, /balance');
        console.log('  /catalog, /category [id], /search [keyword], /product [id]');
        console.log('  /buy [id] [qty], /history, /account [order_id]');
        console.log('  /deposit [amount], /deposit_history, /mytransactions');
        console.log('');
        console.log('ADMIN:');
        console.log('  /stats, /users, /user [id], /orders, /order [id]');
        console.log('  /addmoney [id] [amount], /deductmoney [id] [amount]');
        console.log('  /transactions [user_id], /refund [order_id]');
        console.log('  /products, /add, /edit [id], /delete [id]');
        console.log('  /categories, /addcat, /editcat [id], /delcat [id], /movecat [id] [parent]');
        console.log('  /deposits, /approve [id], /reject [id]');
        console.log('  /broadcast [msg], /export [orders|products]');
        console.log('');
    }
}

const bot = new Bot();

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await db.save();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down...');
    await db.save();
    process.exit(0);
});