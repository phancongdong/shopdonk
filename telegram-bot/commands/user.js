const db = require('../utils/database');
const config = require('../config');

module.exports = {
    async start(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const user = await db.getUser(userId);
        const stats = await db.getStats();
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🎮 Sản phẩm', callback_data: 'catalog' },
                    { text: '🔍 Tìm kiếm', callback_data: 'search' }
                ],
                [
                    { text: `💰 ${(user.balance || 0).toLocaleString()}đ`, callback_data: 'balance' },
                    { text: '📦 Đơn hàng', callback_data: 'history' }
                ],
                [
                    { text: '👤 Profile', callback_data: 'profile' },
                    { text: '💳 Nạp tiền', callback_data: 'deposit' }
                ]
            ]
        };
        
        const welcomeMsg = `🤖 *Chào mừng đến với Shop Acc Game!*

━━━━━━━━━━━━━━━━━━━━
📊 *Shop Stats:*
📦 ${stats.totalProducts || 0} sản phẩm
🎮 ${stats.inStockProducts || 0} có hàng
👥 ${stats.totalUsers || 0} users
━━━━━━━━━━━━━━━━━━━━

📋 *Commands:*
/catalog - Xem danh mục
/search [tên] - Tìm kiếm
/product [id] - Chi tiết sản phẩm
/buy [id] [qty] - Mua (qty=1 mặc định)

/balance - Số dư
/history - Lịch sử mua
/profile - Thông tin cá nhân

/deposit [số tiền] - Nạp tiền
/help - Hướng dẫn`;
        
        await bot.sendMessage(chatId, welcomeMsg, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async stop(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const user = await db.getUser(userId);
        const stats = await db.getStats();
        
        await db.updateUser(userId, { state: null });
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🎮 Sản phẩm', callback_data: 'catalog' },
                    { text: '🔍 Tìm kiếm', callback_data: 'search' }
                ],
                [
                    { text: `💰 ${(user.balance || 0).toLocaleString()}đ`, callback_data: 'balance' },
                    { text: '📦 Đơn hàng', callback_data: 'history' }
                ],
                [
                    { text: '👤 Profile', callback_data: 'profile' },
                    { text: '💳 Nạp tiền', callback_data: 'deposit' }
                ]
            ]
        };
        
        const welcomeMsg = `🤖 *Chào mừng đến với Shop Acc Game!*

━━━━━━━━━━━━━━━━━━━━
📊 *Shop Stats:*
📦 ${stats.totalProducts || 0} sản phẩm
🎮 ${stats.inStockProducts || 0} có hàng
👥 ${stats.totalUsers || 0} users
━━━━━━━━━━━━━━━━━━━━

📋 *Commands:*
/catalog - Xem danh mục
/search [tên] - Tìm kiếm
/product [id] - Chi tiết sản phẩm
/buy [id] [qty] - Mua

/balance - Số dư
/history - Lịch sử mua
/profile - Thông tin cá nhân

/deposit [số tiền] - Nạp tiền
/help - Hướng dẫn`;
        
        await bot.sendMessage(chatId, welcomeMsg, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async help(bot, msg) {
        const chatId = msg.chat.id;
        const helpMsg = `📖 *Hướng dẫn sử dụng*

━━━━━━━━━━━━━━━━━━━━

1️⃣ *Xem & Tìm sản phẩm:*
   /catalog - Tất cả danh mục
   /category [slug] - Sản phẩm theo loại
   /search genshin - Tìm "genshin"
   /product 123 - Chi tiết sản phẩm #123
   
2️⃣ *Mua hàng:*
   /buy 123 - Mua 1 acc
   /buy 123 3 - Mua 3 acc
   
3️⃣ *Nạp tiền:*
   /deposit 100000 - Nạp 100k
   → Gửi bill để admin duyệt
   
4️⃣ *Thông tin cá nhân:*
   /balance - Số dư
   /profile - Profile
   /history - Lịch sử mua
   /mytransactions - Lịch sử giao dịch
   
5️⃣ *Lấy lại acc:*
   /account 123 - Lấy acc đơn #123
   
━━━━━━━━━━━━━━━━━━━━

💳 *Thanh toán:*
Chuyển khoản → Gửi bill → Duyệt

⚡ *Tự động giao acc ngay!*`;
        
        await bot.sendMessage(chatId, helpMsg, { parse_mode: 'Markdown' });
    },

    async profile(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const user = db.getUser(userId);
        
        const keyboard = {
            inline_keyboard: [
                [{ text: '✏️ Đổi tên', callback_data: 'setname' }],
                [{ text: '📋 Lịch sử GD', callback_data: 'mytransactions' }]
            ]
        };
        
        const profileMsg = `👤 *Thông tin cá nhân*

━━━━━━━━━━━━━━━━━━━━
🆔 Telegram ID: ${userId}
👤 Tên: ${user.name || msg.from.first_name || 'Chưa đặt'}
💰 Số dư: ${user.balance.toLocaleString()}đ
🎭 Role: ${user.role || 'user'}
━━━━━━━━━━━━━━━━━━━━
📦 Đơn hàng: ${user.orders?.length || 0}
💳 Giao dịch: ${user.transactions?.length || 0}
━━━━━━━━━━━━━━━━━━━━
📅 Tham gia: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}`;
        
        await bot.sendMessage(chatId, profileMsg, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async setName(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        await bot.sendMessage(chatId, 
            '✏️ *Đổi tên*\n\n' +
            'Gửi tên mới bạn muốn đặt:\n' +
            '(Tên sẽ hiển thị trong profile)',
            { parse_mode: 'Markdown', reply_markup: { force_reply: true } }
        );
        
        bot.once('reply_to_message', async (response) => {
            if (response.reply_to_message.message_id === msg.message_id + 1) {
                const newName = response.text.trim();
                
                if (newName.length < 2 || newName.length > 50) {
                    return bot.sendMessage(chatId, '❌ Tên phải 2-50 ký tự!');
                }
                
                await db.updateUser(userId, { name: newName });
                
                await bot.sendMessage(chatId,
                    `✅ *Đã đổi tên!*\n\n` +
                    `👤 Tên mới: ${newName}`,
                    { parse_mode: 'Markdown' }
                );
            }
        });
    },

    async balance(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const user = db.getUser(userId);
        
        const balanceMsg = `💰 *Số dư tài khoản*

━━━━━━━━━━━━━━━━━━━━
💵 Số dư: ${user.balance.toLocaleString()}đ
━━━━━━━━━━━━━━━━━━━━
📦 Đơn hàng: ${user.orders?.length || 0}
💳 Giao dịch: ${user.transactions?.length || 0}
━━━━━━━━━━━━━━━━━━━━

💡 /deposit [số tiền] - Nạp thêm`;
        
        await bot.sendMessage(chatId, balanceMsg, { parse_mode: 'Markdown' });
    },

    async catalog(bot, msg) {
        const chatId = msg.chat.id;
        const categories = await db.getCategoryTree();
        
        const buttons = [];
        
        categories.forEach(cat => {
            const productCount = cat.products?.length || 0;
            const childrenCount = cat.children?.length || 0;
            
            let text = `${cat.emoji} ${cat.name}`;
            if (productCount > 0) text += ` (${productCount})`;
            
            buttons.push([{ text, callback_data: `category_${cat.id}` }]);
            
            if (cat.children && cat.children.length > 0) {
                cat.children.forEach(child => {
                    const childCount = child.products?.length || 0;
                    buttons.push([
                        { text: `  ${child.emoji} ${child.name} (${childCount})`, 
                          callback_data: `category_${child.id}` }
                    ]);
                });
            }
        });
        
        await bot.sendMessage(chatId, '🎮 *Danh mục sản phẩm:*', {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: buttons }
        });
    },

    async category(bot, msg, match) {
        const chatId = msg.chat.id;
        const categoryId = match[1];
        const products = await db.getProductsByCategory(categoryId);
        
        if (products.length === 0) {
            return bot.sendMessage(chatId, 
                `📭 Danh mục này chưa có sản phẩm!`);
        }
        
        const cat = db.getCategoryById(categoryId);
        let message = `${cat?.emoji || '📦'} *${cat?.name || categoryId}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        products.slice(0, 15).forEach(p => {
            message += `📦 *${p.name}*\n`;
            message += `   💰 ${p.price.toLocaleString()}đ`;
            if (p.cost_price) message += ` (vốn: ${p.cost_price.toLocaleString()}đ)`;
            message += `\n   📦 Kho: ${p.stock} acc\n`;
            message += `   🆔 \`${p.id}\`\n\n`;
        });
        
        if (products.length > 15) {
            message += `\n_... và ${products.length - 15} sản phẩm khác_`;
        }
        
        message += `\n💡 /product [id] - Xem chi tiết`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async search(bot, msg, match) {
        const chatId = msg.chat.id;
        const keyword = match[1];
        const products = await db.searchProducts(keyword);
        
        if (products.length === 0) {
            return bot.sendMessage(chatId, 
                `🔍 Không tìm thấy "${keyword}"!\n\n` +
                `💡 Thử tìm với keyword khác.`);
        }
        
        let message = `🔍 *Kết quả tìm kiếm (${products.length})*\n`;
        message += `Keyword: "${keyword}"\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        products.slice(0, 20).forEach(p => {
            message += `📦 *${p.name}*\n`;
            message += `   💰 ${p.price.toLocaleString()}đ | 📦 ${p.stock} acc\n`;
            message += `   🆔 \`${p.id}\`\n\n`;
        });
        
        if (products.length > 20) {
            message += `\n_... và ${products.length - 20} sản phẩm khác_`;
        }
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async product(bot, msg, match) {
        const chatId = msg.chat.id;
        const productId = match[1];
        const product = await db.getProduct(productId);
        
        if (!product) {
            return bot.sendMessage(chatId, '❌ Sản phẩm không tồn tại!');
        }
        
        let message = `📦 *${product.name}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        
        if (product.description) {
            message += `📝 ${product.description}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
        }
        
        message += `💰 Giá bán: ${product.price.toLocaleString()}đ\n`;
        if (product.cost_price) {
            message += `💵 Giá vốn: ${product.cost_price.toLocaleString()}đ\n`;
        }
        
        message += `📦 Còn: ${product.stock} acc\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🆔 ID: \`${product.id}\`\n`;
        message += `🏷️ Category: ${product.category_name || product.category_id}`;
        
        const keyboard = {
            inline_keyboard: [
                [{ text: `🛒 Mua - ${product.price.toLocaleString()}đ`, callback_data: `buy_${productId}_1` }],
                product.stock > 1 ? 
                    [{ text: `🛒 Mua 2 - ${(product.price * 2).toLocaleString()}đ`, callback_data: `buy_${productId}_2` }] : [],
                product.stock > 2 ? 
                    [{ text: `🛒 Mua 3 - ${(product.price * 3).toLocaleString()}đ`, callback_data: `buy_${productId}_3` }] : [],
                [{ text: '🔙 Quay lại', callback_data: 'catalog' }]
            ].filter(row => row.length > 0)
        };
        
        if (product.image) {
            await bot.sendPhoto(chatId, product.image, {
                caption: message,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } else {
            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
    },

    async buy(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        const parts = match[1].split(' ');
        const productId = parts[0];
        const quantity = parseInt(parts[1]) || 1;
        
        await this.processPurchase(bot, chatId, userId, productId, quantity);
    },

    async processPurchase(bot, chatId, userId, productId, quantity = 1) {
        const product = await db.getProduct(productId);
        const user = await db.getUser(userId);
        
        if (!product) {
            return bot.sendMessage(chatId, '❌ Sản phẩm không tồn tại!');
        }

        if (!user) {
            return bot.sendMessage(chatId, '❌ User không tồn tại!');
        }

        if (product.is_hidden) {
            return bot.sendMessage(chatId, '❌ Sản phẩm này hiện không bán!');
        }

        if (product.stock < quantity) {
            return bot.sendMessage(chatId, 
                `❌ Không đủ hàng!\n` +
                `📦 Còn: ${product.stock} acc\n` +
                `🔢 Bạn muốn: ${quantity} acc`);
        }

        const totalPrice = product.price * quantity;
        
        if ((user.balance || 0) < totalPrice) {
            return bot.sendMessage(chatId, 
                `❌ Số dư không đủ!\n\n` +
                `💰 Số dư: ${(user.balance || 0).toLocaleString()}đ\n` +
                `💵 Cần: ${totalPrice.toLocaleString()}đ\n` +
                `📉 Thiếu: ${(totalPrice - (user.balance || 0)).toLocaleString()}đ\n\n` +
                `💡 /deposit [số tiền] - Nạp thêm`);
        }

        try {
            const order = await db.createOrder(userId, productId, quantity);
            const updatedUser = await db.getUser(userId);

            let message = `✅ *Mua hàng thành công!*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `📦 ${product.name}\n`;
            message += `🔢 Số lượng: ${quantity} nick\n`;
            message += `💰 Tổng: ${totalPrice.toLocaleString()}đ\n`;
            message += `💵 Số dư còn: ${(updatedUser.balance || 0).toLocaleString()}đ\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `🆔 Order: #${order.id}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            message += `🔐 *TÀI KHOẢN:*\n`;
            
            order.accounts.forEach((acc, idx) => {
                message += `\n${idx + 1}️⃣ Username: \`${acc.username}\`\n`;
                message += `   🔑 Password: \`${acc.password}\`\n`;
            });
            
            if (order.accounts.some(a => a.extra)) {
                message += `\n📧 Extra info có trong acc!`;
            }
            
            message += `\n\n⚠️ *LƯU LẬY THÔNG TIN NGAY!*`;
            
            await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            
        } catch (error) {
            await bot.sendMessage(chatId, `❌ Lỗi: ${error.message}`);
        }
    },

    async history(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const orders = db.getOrdersByUser(userId, 20);
        
        if (orders.length === 0) {
            return bot.sendMessage(chatId, 
                `📭 Bạn chưa mua hàng!\n\n` +
                `💡 /catalog - Xem sản phẩm`);
        }
        
        let message = `📋 *Lịch sử mua hàng*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
            const statusIcon = order.status === 'completed' ? '✅' : 
                              order.status === 'refunded' ? '💸' : '⏳';
            
            message += `${statusIcon} *${order.productName}*\n`;
            message += `   📦 ${order.quantity} nick - ${order.total_price.toLocaleString()}đ\n`;
            message += `   📅 ${date} | 🆔 #${order.id}\n\n`;
        });
        
        message += `\n💡 /account [order_id] - Lấy lại acc`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async account(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const orderId = match[1];
        
        const order = db.getOrderById(orderId);
        
        if (!order) {
            return bot.sendMessage(chatId, '❌ Đơn hàng không tồn tại!');
        }
        
        if (order.userId !== userId) {
            return bot.sendMessage(chatId, '❌ Đây không là đơn hàng của bạn!');
        }
        
        if (order.status !== 'completed') {
            return bot.sendMessage(chatId, 
                `❌ Đơn hàng chưa hoàn thành!\n` +
                `Status: ${order.status}`);
        }
        
        let message = `🔐 *Tài khoản đơn #${orderId}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📦 ${order.productName}\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        order.accounts.forEach((acc, idx) => {
            message += `${idx + 1}️⃣ Username: \`${acc.username}\`\n`;
            message += `   🔑 Password: \`${acc.password}\`\n`;
            if (acc.extra) {
                message += `   📧 Extra: \`${acc.extra}\`\n`;
            }
            message += `\n`;
        });
        
        const keyboard = {
            inline_keyboard: [
                [{ text: '📋 Copy All', callback_data: `copy_${orderId}` }]
            ]
        };
        
        await bot.sendMessage(chatId, message, { 
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    },

    async myTransactions(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const transactions = db.getTransactions(userId, 30);
        
        if (transactions.length === 0) {
            return bot.sendMessage(chatId, '📭 Bạn chưa có giao dịch nào!');
        }
        
        let message = `💳 *Lịch sử giao dịch*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        transactions.forEach(t => {
            const date = new Date(t.createdAt).toLocaleDateString('vi-VN');
            const icon = t.amount >= 0 ? '💰' : '💸';
            
            message += `${icon} ${t.type.toUpperCase()}\n`;
            message += `   ${t.amount >= 0 ? '+' : ''}${t.amount.toLocaleString()}đ\n`;
            message += `   ${t.description}\n`;
            message += `   📅 ${date}\n\n`;
        });
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async deposit(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const amount = match && match[1] ? parseInt(match[1]) : null;
        
        if (!amount || amount < 10000) {
            return bot.sendMessage(chatId, 
                '❌ Số tiền nạp tối thiểu 10.000đ\n' +
                'Ví dụ: /deposit 100000');
        }
        
        const bankInfo = config.PAYMENT_CONFIG;
        
        let message = `💳 *Nạp tiền vào tài khoản*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `💵 Số tiền: ${amount.toLocaleString()}đ\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        message += `🏦 *CHUYỂN KHOẢN NGÂN HÀNG:*\n`;
        message += `   Ngân hàng: ${bankInfo.bankName}\n`;
        message += `   Số TK: ${bankInfo.bankAccount}\n`;
        message += `   Tên TK: ${bankInfo.accountName}\n\n`;
        
        if (bankInfo.momoNumber) {
            message += `📱 *MOMO:*\n`;
            message += `   Số ĐT: ${bankInfo.momoNumber}\n`;
            message += `   Tên: ${bankInfo.momoName}\n\n`;
        }
        
        message += `📝 *NỘI DUNG CHUYỂN KHOẢN:*\n`;
        message += `   TG ${amount} ${userId}\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📸 Gửi BILL để admin duyệt!`;
        
        await db.updateUser(userId, { state: { action: 'deposit_proof', amount } });
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        await bot.sendMessage(chatId, 
            '📸 *Gửi ảnh BILL chuyển khoản*\n\n' +
            'Admin sẽ duyệt trong vài phút!',
            { parse_mode: 'Markdown', reply_markup: { force_reply: true } }
        );
    },

    async depositHistory(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const deposits = db.getDepositsByUser(userId, 20);
        
        if (deposits.length === 0) {
            return bot.sendMessage(chatId, '📭 Bạn chưa có lịch nạp!');
        }
        
        let message = `💳 *Lịch sử nạp tiền*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        deposits.forEach(d => {
            const date = new Date(d.createdAt).toLocaleDateString('vi-VN');
            const icon = d.status === 'approved' ? '✅' : 
                        d.status === 'rejected' ? '❌' : '⏳';
            
            message += `${icon} ${d.amount.toLocaleString()}đ\n`;
            message += `   Method: ${d.method}\n`;
            message += `   Status: ${d.status}\n`;
            message += `   📅 ${date}\n\n`;
        });
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async handleDepositProof(bot, msg, userState) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!msg.photo) {
            return bot.sendMessage(chatId, '❌ Vui lòng gửi ảnh BILL!');
        }
        
        const photoId = msg.photo[msg.photo.length - 1].file_id;
        
        const deposit = await db.addDeposit(userId, userState.amount, 'bank_transfer', photoId);
        await db.updateUser(userId, { state: null });
        
        await bot.sendMessage(chatId, 
            `✅ *Đã gửi yêu cầu nạp!*\n\n` +
            `💵 ${userState.amount.toLocaleString()}đ\n` +
            `⏳ Chờ admin duyệt...`
        );

        const admins = config.ADMIN_IDS;
        for (const adminId of admins) {
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '✅ Duyệt', callback_data: `approve_${deposit.id}` },
                        { text: '❌ Từ chối', callback_data: `reject_${deposit.id}` }
                    ]
                ]
            };
            
            try {
                await bot.sendPhoto(adminId, photoId, {
                    caption: `📥 *YÊU CẦU NẠP TIỀN*\n\n` +
                        `👤 User: ${userId}\n` +
                        `💵 Số tiền: ${userState.amount.toLocaleString()}đ\n` +
                        `📱 Method: bank_transfer\n` +
                        `📅 ${new Date().toLocaleString('vi-VN')}`,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } catch (e) {
                console.log('Failed to notify admin:', adminId);
            }
        }
    },

    async handleBuyCallback(bot, query, productId, quantity) {
        const chatId = query.message.chat.id;
        const userId = query.from.id.toString();
        await this.processPurchase(bot, chatId, userId, productId, quantity);
    },

    async handleCategoryCallback(bot, query, categoryId) {
        const chatId = query.message.chat.id;
        const products = await db.getProductsByCategory(categoryId);
        
        if (!products || products.length === 0) {
            return bot.editMessageText('📭 Danh mục này chưa có sản phẩm!', {
                chat_id: chatId,
                message_id: query.message.message_id
            });
        }
        
        const cat = await db.getCategoryById(categoryId);
        let message = `${cat?.emoji || '📦'} *${cat?.name || categoryId}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        products.slice(0, 10).forEach(p => {
            message += `📦 *${p.name}*\n`;
            message += `   💰 ${p.price.toLocaleString()}đ | 📦 ${p.stock} acc\n`;
            message += `   🆔 \`${p.id}\`\n\n`;
        });
        
        if (products.length > 10) {
            message += `\n_... và ${products.length - 10} khác_`;
        }
        
        const buttons = products.slice(0, 10).map(p => [
            { text: `🛒 ${p.name} - ${p.price.toLocaleString()}đ`, callback_data: `product_${p.id}` }
        ]);
        buttons.push([{ text: '🔙 Quay lại', callback_data: 'catalog' }]);
        
        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: query.message.message_id,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: buttons }
        });
    },

    async handleCopyCallback(bot, query, orderId) {
        const order = await db.getOrderById(orderId);
        if (!order) return;
        
        let text = '';
        order.accounts.forEach((acc, idx) => {
            text += `${idx + 1}. ${acc.username} - ${acc.password}\n`;
        });
        
        await bot.answerCallbackQuery(query.id, { text, show_alert: true });
    },

    async handleProductCallback(bot, query, productId) {
        const chatId = query.message.chat.id;
        const product = await db.getProduct(productId);
        
        if (!product) {
            return bot.answerCallbackQuery(query.id, { text: '❌ Sản phẩm không tồn tại!', show_alert: true });
        }
        
        let message = `📦 *${product.name}*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        
        if (product.description) {
            message += `📝 ${product.description}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
        }
        
        message += `💰 Giá bán: ${product.price.toLocaleString()}đ\n`;
        message += `📦 Còn: ${product.stock} acc\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `🆔 ID: \`${product.id}\`\n`;
        message += `🏷️ Category: ${product.category_name || product.category_id}`;
        
        const keyboard = {
            inline_keyboard: [
                [{ text: `🛒 Mua - ${product.price.toLocaleString()}đ`, callback_data: `buy_${productId}_1` }],
                product.stock > 1 ? [{ text: `🛒 Mua 2 - ${(product.price * 2).toLocaleString()}đ`, callback_data: `buy_${productId}_2` }] : [],
                [{ text: '🔙 Quay lại', callback_data: `category_${product.category_id}` }]
            ].filter(row => row.length > 0)
        };
        
        if (product.image) {
            try {
                await bot.deleteMessage(chatId, query.message.message_id);
                await bot.sendPhoto(chatId, product.image, {
                    caption: message,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            } catch (e) {
                await bot.editMessageText(message, {
                    chat_id: chatId,
                    message_id: query.message.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
            }
        } else {
            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        }
    },

    async handleCallback(bot, query) {
        const data = query.data;
        const chatId = query.message.chat.id;
        const userId = query.from.id.toString();
        
        if (data === 'catalog') {
            const categories = db.getCategoryTree();
            const buttons = categories.map(cat => [
                { text: `${cat.emoji} ${cat.name} (${cat.products?.length || 0})`, 
                  callback_data: `category_${cat.id}` }
            ]);
            await bot.editMessageReplyMarkup(
                { inline_keyboard: buttons },
                { chat_id: chatId, message_id: query.message.message_id }
            );
        } else if (data === 'profile') {
            await this.profile(bot, query.message);
        } else if (data === 'balance') {
            await this.balance(bot, query.message);
        } else if (data === 'history') {
            await this.history(bot, query.message);
        } else if (data === 'deposit') {
            await bot.sendMessage(chatId, 
                '💳 *Nạp tiền*\n\n' +
                '/deposit [số tiền] - Ví dụ: /deposit 100000',
                { parse_mode: 'Markdown' }
            );
        } else if (data === 'search') {
            await bot.sendMessage(chatId,
                '🔍 *Tìm kiếm sản phẩm*\n\n' +
                '/search [keyword] - Ví dụ:\n' +
                '/search genshin\n' +
                '/search AR60',
                { parse_mode: 'Markdown' }
            );
        } else if (data === 'mytransactions') {
            await this.myTransactions(bot, query.message);
        } else if (data.startsWith('category_')) {
            const categoryId = data.replace('category_', '');
            await this.handleCategoryCallback(bot, query, categoryId);
        } else if (data.startsWith('buy_')) {
            const parts = data.replace('buy_', '').split('_');
            const productId = parts[0];
            const quantity = parseInt(parts[1]) || 1;
            await this.handleBuyCallback(bot, query, productId, quantity);
        } else if (data.startsWith('product_')) {
            const productId = data.replace('product_', '');
            await this.handleProductCallback(bot, query, productId);
        } else if (data.startsWith('copy_')) {
            const orderId = data.replace('copy_', '');
            await this.handleCopyCallback(bot, query, orderId);
        } else if (data === 'setname') {
            await this.setName(bot, query.message);
        }
        
        bot.answerCallbackQuery(query.id);
    }
};