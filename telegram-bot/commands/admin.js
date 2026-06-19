const db = require('../utils/database');
const config = require('../config');

module.exports = {
    async admin(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const stats = await db.getStats();
        
        let message = `👑 *QUẢN TRỊ VIÊN*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `📊 *Thống kê nhanh:*\n`;
        message += `   💰 Doanh thu: ${(stats.totalRevenue || 0).toLocaleString()}đ\n`;
        message += `   📦 Sản phẩm: ${stats.totalProducts || 0}\n`;
        message += `   👥 Users: ${stats.totalUsers || 0}\n`;
        message += `   📥 Nạp chờ: ${stats.pendingDeposits || 0}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `💡 Chọn chức năng bên dưới:`;
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '📊 Thống kê', callback_data: 'admin_stats' },
                    { text: '👥 Users', callback_data: 'admin_users' }
                ],
                [
                    { text: '📦 Sản phẩm', callback_data: 'admin_products' },
                    { text: '📁 Danh mục', callback_data: 'admin_categories' }
                ],
                [
                    { text: '🛒 Đơn hàng', callback_data: 'admin_orders' },
                    { text: '💳 Giao dịch', callback_data: 'admin_transactions' }
                ],
                [
                    { text: '📥 Nạp tiền', callback_data: 'admin_deposits' },
                    { text: '📢 Thông báo', callback_data: 'admin_broadcast' }
                ],
                [
                    { text: '➕ Thêm SP', callback_data: 'admin_addproduct' }
                ]
            ]
        };
        
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async stats(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const stats = await db.getStats();
        
        let message = `📊 *THỐNG KÊ SHOP*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        message += `💰 *Doanh thu:*\n`;
        message += `   Tổng: ${(stats.totalRevenue || 0).toLocaleString()}đ\n`;
        message += `   Hôm nay: ${(stats.todayRevenue || 0).toLocaleString()}đ\n`;
        message += `   Refunds: ${(stats.totalRefunds || 0).toLocaleString()}đ\n\n`;
        
        message += `📦 *Đơn hàng:*\n`;
        message += `   Tổng: ${stats.totalOrders || 0}\n`;
        message += `   Hôm nay: ${stats.todayOrders || 0}\n\n`;
        
        message += `🎮 *Sản phẩm:*\n`;
        message += `   Tổng: ${stats.totalProducts || 0}\n`;
        message += `   Có hàng: ${stats.inStockProducts || 0}\n\n`;
        
        message += `👥 *Users:*\n`;
        message += `   Tổng: ${stats.totalUsers || 0}\n\n`;
        
        message += `💳 *Nạp:*\n`;
        message += `   Tổng nạp: ${(stats.totalDeposits || 0).toLocaleString()}đ\n`;
        message += `   Chờ duyệt: ${stats.pendingDeposits || 0}\n\n`;
        
        message += `📁 *Categories:* ${stats.totalCategories || 0}`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async users(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const users = await db.getAllUsers();
        
        if (!users || users.length === 0) {
            return bot.sendMessage(chatId, '📭 Không có user nào!');
        }
        
        let message = `👥 *Danh sách users (${users.length})*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        users.slice(0, 20).forEach(u => {
            const roleIcon = u.role === 'admin' ? '👑' : '👤';
            message += `${roleIcon} ${u.name || 'No name'}\n`;
            message += `   🆔 ${u.telegram_id}\n`;
            message += `   💰 ${(u.balance || 0).toLocaleString()}đ\n\n`;
        });
        
        if (users.length > 20) {
            message += `\n_... và ${users.length - 20} users khác_`;
        }
        
        message += `\n💡 /user [telegram_id] - Chi tiết user`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async user(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const targetUserId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const user = await db.getUser(targetUserId);
        const orders = await db.getOrdersByUser(targetUserId, 10);
        
        let message = `👤 *USER ${targetUserId}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🆔 ID: ${targetUserId}\n`;
        message += `👤 Name: ${user.name || 'Chưa đặt'}\n`;
        message += `💰 Balance: ${(user.balance || 0).toLocaleString()}đ\n`;
        message += `🎭 Role: ${user.role || 'user'}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (orders && orders.length > 0) {
            message += `📋 *Orders gần đây:*\n`;
            orders.slice(0, 5).forEach(o => {
                message += `   📦 ${o.productName} - ${(o.total_price || 0).toLocaleString()}đ\n`;
            });
        }
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '💰 Cộng tiền', callback_data: `addmoney_${targetUserId}` },
                    { text: '💸 Trừ tiền', callback_data: `deduct_${targetUserId}` }
                ]
            ]
        };
        
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async addMoney(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const parts = match[1].split(' ');
        const targetUserId = parts[0];
        const amount = parseInt(parts[1]);
        const note = parts.slice(2).join(' ') || 'Admin cộng tiền';
        
        if (!amount || amount <= 0) {
            return bot.sendMessage(chatId, 
                '❌ Số tiền không hợp lệ!\n' +
                '/addmoney [user_id] [amount] [note]');
        }
        
        const user = await db.getUser(targetUserId);
        user.balance = (user.balance || 0) + amount;
        
        await db.createTransaction(targetUserId, 'admin_add', amount, note);
        
        await bot.sendMessage(chatId,
            `✅ *Đã cộng tiền!*\n\n` +
            `👤 User: ${targetUserId}\n` +
            `💵 +${amount.toLocaleString()}đ\n` +
            `📝 ${note}\n` +
            `💰 New balance: ${user.balance.toLocaleString()}đ`,
            { parse_mode: 'Markdown' }
        );
    },

    async deductMoney(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const parts = match[1].split(' ');
        const targetUserId = parts[0];
        const amount = parseInt(parts[1]);
        const note = parts.slice(2).join(' ') || 'Admin trừ tiền';
        
        if (!amount || amount <= 0) {
            return bot.sendMessage(chatId, 
                '❌ Số tiền không hợp lệ!\n' +
                '/deductmoney [user_id] [amount] [note]');
        }
        
        const user = await db.getUser(targetUserId);
        user.balance = (user.balance || 0) - amount;
        
        await db.createTransaction(targetUserId, 'admin_deduct', -amount, note);
        
        await bot.sendMessage(chatId,
            `✅ *Đã trừ tiền!*\n\n` +
            `👤 User: ${targetUserId}\n` +
            `💸 -${amount.toLocaleString()}đ\n` +
            `📝 ${note}\n` +
            `💰 New balance: ${user.balance.toLocaleString()}đ`,
            { parse_mode: 'Markdown' }
        );
    },

    async transactions(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const targetUserId = match && match[1] ? match[1] : null;
        
        const transactions = targetUserId 
            ? await db.getTransactions(targetUserId, 30)
            : await db.getAllTransactions(50);
        
        if (!transactions || transactions.length === 0) {
            return bot.sendMessage(chatId, '📭 Không có giao dịch nào!');
        }
        
        let message = `💳 *Lịch sử giao dịch*\n`;
        message += targetUserId ? `User: ${targetUserId}\n` : '(Tất cả)\n';
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        transactions.slice(0, 20).forEach(t => {
            const date = new Date(t.created_at).toLocaleDateString('vi-VN');
            const icon = t.amount >= 0 ? '💰' : '💸';
            
            message += `${icon} ${t.type?.toUpperCase() || 'GD'}\n`;
            message += `   ${t.amount >= 0 ? '+' : ''}${(t.amount || 0).toLocaleString()}đ\n`;
            message += `   📝 ${t.description || ''}\n`;
            message += `   📅 ${date}\n\n`;
        });
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async orders(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const orders = await db.getAllOrders({});
        
        if (!orders || orders.length === 0) {
            return bot.sendMessage(chatId, '📭 Không có đơn hàng nào!');
        }
        
        let message = `📦 *Danh sách orders (${orders.length})*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        orders.slice(0, 20).forEach(o => {
            const date = new Date(o.created_at).toLocaleDateString('vi-VN');
            const icon = o.status === 'completed' ? '✅' : o.status === 'refunded' ? '💸' : '⏳';
            
            message += `${icon} #${o.id}\n`;
            message += `   📦 ${o.product_name || 'N/A'}\n`;
            message += `   👤 ${o.telegram_id}\n`;
            message += `   💰 ${(o.total_price || 0).toLocaleString()}đ\n`;
            message += `   📅 ${date}\n\n`;
        });
        
        message += `\n💡 /order [id] - Chi tiết`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async order(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const orderId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const order = await db.getOrderById(orderId);
        
        if (!order) {
            return bot.sendMessage(chatId, '❌ Order không tồn tại!');
        }
        
        let message = `📦 *ORDER #${orderId}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `👤 User: ${order.telegram_id || order.user_id}\n`;
        message += `📦 Product: ${order.product_name || 'N/A'}\n`;
        message += `🔢 Qty: ${order.quantity || 1}\n`;
        message += `💰 Total: ${(order.total_price || 0).toLocaleString()}đ\n`;
        message += `🎭 Status: ${order.status || 'completed'}\n`;
        message += `📅 Date: ${new Date(order.created_at).toLocaleString('vi-VN')}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        if (order.accounts && order.accounts.length > 0) {
            message += `🔐 *Accounts:*\n`;
            order.accounts.forEach((acc, idx) => {
                message += `${idx + 1}. ${acc.username} - ${acc.password}\n`;
            });
        }
        
        const keyboard = {
            inline_keyboard: []
        };
        
        if (order.status === 'completed') {
            keyboard.inline_keyboard.push([
                { text: '💸 Refund', callback_data: `refund_${orderId}` }
            ]);
        }
        
        await bot.sendMessage(chatId, message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async refund(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const orderId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        try {
            const order = await db.refundOrder(orderId);
            
            await bot.sendMessage(chatId,
                `✅ *Hoàn tiền thành công!*\n\n` +
                `📦 Order: #${orderId}\n` +
                `💸 Refund: ${(order.total_price || 0).toLocaleString()}đ\n` +
                `🎭 Status: refunded`
            );
        } catch (error) {
            await bot.sendMessage(chatId, `❌ ${error.message}`);
        }
    },

    async products(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const products = await db.getAllProducts(true);
        
        if (!products || products.length === 0) {
            return bot.sendMessage(chatId, '📭 Không có sản phẩm!');
        }
        
        let message = `📦 *Danh sách products (${products.length})*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        products.slice(0, 20).forEach(p => {
            const statusIcon = p.is_hidden ? '🙈' : p.stock > 0 ? '✅' : '❌';
            
            message += `${statusIcon} *${p.name}*\n`;
            message += `   💰 ${(p.price || 0).toLocaleString()}đ\n`;
            message += `   📦 ${p.stock || 0} acc\n`;
            message += `   🆔 \`${p.id}\`\n\n`;
        });
        
        if (products.length > 20) {
            message += `\n_... và ${products.length - 20} khác_`;
        }
        
        message += `\n💡 /product [id] - Chi tiết\n`;
        message += `💡 /add - Thêm sản phẩm`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async add(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        await bot.sendMessage(chatId, 
            '📦 *THÊM SẢN PHẨM MỚI*\n\n' +
            'Gửi thông tin theo format:\n\n' +
            '```\n' +
            'NAME: Tên sản phẩm\n' +
            'CATEGORY: 1\n' +
            'PRICE: 100000\n' +
            'DESC: Mô tả (optional)\n' +
            'USERNAME: username acc\n' +
            'PASSWORD: password acc\n' +
            '```',
            { parse_mode: 'Markdown' }
        );
        
        bot.once('message', async (response) => {
            if (response.from.id.toString() !== userId) return;
            
            try {
                const text = response.text || '';
                const name = text.match(/NAME:\s*(.+)/i)?.[1]?.trim();
                const category = text.match(/CATEGORY:\s*(\d+)/i)?.[1] || '1';
                const price = parseInt(text.match(/PRICE:\s*(\d+)/i)?.[1]);
                const desc = text.match(/DESC:\s*(.+)/i)?.[1]?.trim() || '';
                const accUsername = text.match(/USERNAME:\s*(.+)/i)?.[1]?.trim();
                const accPassword = text.match(/PASSWORD:\s*(.+)/i)?.[1]?.trim();
                
                if (!name || !price) {
                    return bot.sendMessage(chatId, '❌ Thiếu NAME hoặc PRICE!');
                }
                
                const accounts = accUsername && accPassword 
                    ? [{ username: accUsername, password: accPassword }]
                    : [];
                
                const product = await db.addProduct({
                    name,
                    category,
                    price,
                    description: desc,
                    accounts
                });
                
                await bot.sendMessage(chatId, 
                    `✅ *Đã thêm sản phẩm!*\n\n` +
                    `📦 ${product.name}\n` +
                    `💰 ${(product.price || price).toLocaleString()}đ\n` +
                    `📦 Stock: ${accounts.length} acc\n` +
                    `🆔 \`${product.id}\``,
                    { parse_mode: 'Markdown' }
                );
                
            } catch (error) {
                await bot.sendMessage(chatId, `❌ Lỗi: ${error.message}`);
            }
        });
    },

    async edit(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const productId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const product = await db.getProduct(productId);
        if (!product) {
            return bot.sendMessage(chatId, '❌ Sản phẩm không tồn tại!');
        }
        
        await bot.sendMessage(chatId, 
            `📝 *SỬA SẢN PHẨM #${productId}*\n\n` +
            `Current: ${product.name}\n` +
            `Price: ${(product.price || 0).toLocaleString()}đ\n\n` +
            'Gửi thông tin cần cập nhật:\n\n' +
            '```\n' +
            'NAME: Tên mới\n' +
            'PRICE: Giá mới\n' +
            'STOCK: Số lượng\n' +
            '```',
            { parse_mode: 'Markdown' }
        );
        
        bot.once('message', async (response) => {
            if (response.from.id.toString() !== userId) return;
            
            const text = response.text || '';
            const updates = {};
            
            const name = text.match(/NAME:\s*(.+)/i)?.[1]?.trim();
            const price = text.match(/PRICE:\s*(\d+)/i)?.[1];
            const stock = text.match(/STOCK:\s*(\d+)/i)?.[1];
            
            if (name) updates.name = name;
            if (price) updates.price = parseInt(price);
            if (stock) updates.stock = parseInt(stock);
            
            if (Object.keys(updates).length > 0) {
                await db.updateProduct(productId, updates);
            }
            
            const updated = await db.getProduct(productId);
            
            await bot.sendMessage(chatId,
                `✅ *Đã cập nhật!*\n\n` +
                `📦 ${updated.name}\n` +
                `💰 ${(updated.price || 0).toLocaleString()}đ\n` +
                `📦 Stock: ${updated.stock || 0} acc`
            );
        });
    },

    async delete(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const productId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const product = await db.getProduct(productId);
        if (!product) {
            return bot.sendMessage(chatId, '❌ Sản phẩm không tồn tại!');
        }
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '✅ Xóa', callback_data: `confirm_delete_${productId}` },
                    { text: '❌ Hủy', callback_data: 'cancel' }
                ]
            ]
        };
        
        await bot.sendMessage(chatId,
            `⚠️ *XÁC NHẬN XÓA*\n\n` +
            `📦 ${product.name}\n` +
            `💰 ${(product.price || 0).toLocaleString()}đ\n` +
            `📦 Stock: ${product.stock || 0}\n` +
            `🆔 ${productId}`,
            { parse_mode: 'Markdown', reply_markup: keyboard }
        );
    },

    async deposits(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const pending = await db.getPendingDeposits();
        
        if (!pending || pending.length === 0) {
            return bot.sendMessage(chatId, '✅ Không có yêu cầu nạp chờ duyệt!');
        }
        
        let message = `📥 *Yêu cầu nạp tiền (${pending.length})*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        pending.forEach(d => {
            const date = new Date(d.created_at).toLocaleString('vi-VN');
            message += `💵 ${(d.amount || 0).toLocaleString()}đ\n`;
            message += `   👤 ${d.telegram_id}\n`;
            message += `   📅 ${date}\n`;
            message += `   🆔 \`${d.id}\`\n\n`;
        });
        
        message += `\n💡 /approve [id] - Duyệt\n`;
        message += `💡 /reject [id] - Từ chối`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async approve(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const depositId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const deposit = await db.approveDeposit(depositId);
        
        if (!deposit) {
            return bot.sendMessage(chatId, '❌ Không tìm thấy hoặc đã duyệt!');
        }
        
        await bot.sendMessage(chatId,
            `✅ *Đã duyệt nạp tiền!*\n\n` +
            `👤 User: ${deposit.telegram_id}\n` +
            `💵 +${(deposit.amount || 0).toLocaleString()}đ\n` +
            `🆔 Deposit: ${depositId}`
        );
    },

    async reject(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const depositId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const deposit = await db.rejectDeposit(depositId);
        
        if (!deposit) {
            return bot.sendMessage(chatId, '❌ Không tìm thấy hoặc đã xử lý!');
        }
        
        await bot.sendMessage(chatId,
            `❌ *Đã từ chối nạp!*\n\n` +
            `👤 User: ${deposit.telegram_id}\n` +
            `💵 ${(deposit.amount || 0).toLocaleString()}đ`
        );
    },

    async broadcast(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const messageText = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const users = await db.getAllUsers();
        let success = 0;
        let failed = 0;
        
        await bot.sendMessage(chatId, `📢 Đang gửi đến ${users.length} users...`);
        
        for (const u of users) {
            try {
                await bot.sendMessage(u.telegram_id,
                    `📢 *Thông báo*\n\n${messageText}`,
                    { parse_mode: 'Markdown' }
                );
                success++;
            } catch (e) {
                failed++;
            }
        }
        
        await bot.sendMessage(chatId,
            `✅ *Broadcast hoàn tất!*\n\n` +
            `✅ Thành công: ${success}\n` +
            `❌ Thất bại: ${failed}`
        );
    },

    async handleApproveCallback(bot, query, depositId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        const deposit = await db.approveDeposit(depositId);
        
        if (!deposit) {
            return bot.answerCallbackQuery(query.id, { text: '❌ Lỗi duyệt!', show_alert: true });
        }
        
        await bot.editMessageCaption(
            `✅ *ĐÃ DUYỆT*\n\n` +
            `👤 User: ${deposit.telegram_id}\n` +
            `💵 +${(deposit.amount || 0).toLocaleString()}đ`,
            {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
            }
        );
    },

    async handleRejectCallback(bot, query, depositId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        const deposit = await db.rejectDeposit(depositId);
        
        await bot.editMessageCaption(
            `❌ *ĐÃ TỪ CHỐI*\n\n` +
            `👤 User: ${deposit?.telegram_id}\n` +
            `💵 ${(deposit?.amount || 0).toLocaleString()}đ`,
            {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
            }
        );
    },

    async handleRefundCallback(bot, query, orderId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        try {
            const order = await db.refundOrder(orderId);
            
            await bot.editMessageText(
                `✅ *ĐÃ HOÀN TIỀN*\n\n` +
                `📦 #${orderId}\n` +
                `💸 ${(order.total_price || 0).toLocaleString()}đ`,
                {
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                    parse_mode: 'Markdown'
                }
            );
        } catch (error) {
            await bot.answerCallbackQuery(query.id, { text: error.message, show_alert: true });
        }
    },

    async handleDeleteCallback(bot, query, productId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        const deleted = await db.deleteProduct(productId);
        
        if (deleted) {
            await bot.editMessageText(
                `✅ *Đã xóa sản phẩm!*\n\n🆔 ${productId}`,
                {
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                    parse_mode: 'Markdown'
                }
            );
        } else {
            await bot.answerCallbackQuery(query.id, { text: 'Lỗi xóa!', show_alert: true });
        }
    },

    async handleAddMoneyCallback(bot, query, targetUserId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        await bot.sendMessage(query.message.chat.id,
            `💰 *Cộng tiền cho ${targetUserId}*\n\n` +
            `Gửi: /addmoney ${targetUserId} [amount] [note]\n` +
            `Ví dụ: /addmoney ${targetUserId} 50000 Bonus`
        );
    },

    async handleDeductMoneyCallback(bot, query, targetUserId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        await bot.sendMessage(query.message.chat.id,
            `💸 *Trừ tiền của ${targetUserId}*\n\n` +
            `Gửi: /deductmoney ${targetUserId} [amount] [note]\n` +
            `Ví dụ: /deductmoney ${targetUserId} 10000 Penalty`
        );
    },

    async handleCallback(bot, query) {
        const data = query.data;
        const userId = query.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.answerCallbackQuery(query.id, { text: '❌ Bạn không có quyền admin!', show_alert: true });
        }
        
        const chatId = query.message.chat.id;
        const msg = { chat: { id: chatId }, from: { id: userId } };
        
        if (data === 'admin_stats') {
            await this.stats(bot, msg);
        } else if (data === 'admin_users') {
            await this.users(bot, msg);
        } else if (data === 'admin_products') {
            await this.products(bot, msg);
        } else if (data === 'admin_categories') {
            await bot.sendMessage(chatId, 
                '📁 *Danh mục*\n\n' +
                '/categories - Xem danh mục\n' +
                '/addcat - Thêm danh mục\n' +
                '/editcat [id] - Sửa danh mục\n' +
                '/delcat [id] - Xóa danh mục',
                { parse_mode: 'Markdown' }
            );
        } else if (data === 'admin_orders') {
            await this.orders(bot, msg, [null, null]);
        } else if (data === 'admin_transactions') {
            await this.transactions(bot, msg, [null, null]);
        } else if (data === 'admin_deposits') {
            await this.deposits(bot, msg);
        } else if (data === 'admin_broadcast') {
            await bot.sendMessage(chatId,
                '📢 *Gửi thông báo*\n\n' +
                '/broadcast [nội dung]\n' +
                'Ví dụ: /broadcast Shop cập nhật mới!',
                { parse_mode: 'Markdown' }
            );
        } else if (data === 'admin_addproduct') {
            await this.add(bot, msg);
        } else if (data.startsWith('approve_')) {
            const depositId = data.replace('approve_', '');
            await this.handleApproveCallback(bot, query, depositId);
        } else if (data.startsWith('reject_')) {
            const depositId = data.replace('reject_', '');
            await this.handleRejectCallback(bot, query, depositId);
        } else if (data.startsWith('refund_')) {
            const orderId = data.replace('refund_', '');
            await this.handleRefundCallback(bot, query, orderId);
        } else if (data.startsWith('confirm_delete_')) {
            const productId = data.replace('confirm_delete_', '');
            await this.handleDeleteCallback(bot, query, productId);
        } else if (data.startsWith('addmoney_')) {
            const targetUserId = data.replace('addmoney_', '');
            await this.handleAddMoneyCallback(bot, query, targetUserId);
        } else if (data.startsWith('deduct_')) {
            const targetUserId = data.replace('deduct_', '');
            await this.handleDeductMoneyCallback(bot, query, targetUserId);
        } else if (data === 'cancel') {
            await bot.deleteMessage(query.message.chat.id, query.message.message_id);
        }
        
        bot.answerCallbackQuery(query.id);
    }
};
