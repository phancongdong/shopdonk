const db = require('../utils/database');
const config = require('../config');

module.exports = {
    async categories(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const tree = db.getCategoryTree();
        
        if (tree.length === 0) {
            return bot.sendMessage(chatId, '📭 Không có category nào!');
        }
        
        let message = `📁 *DANH SÁCH CATEGORIES*\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        
        const printTree = (categories, indent = '') => {
            categories.forEach(cat => {
                const productCount = cat.products?.length || 0;
                message += `${indent}${cat.emoji} *${cat.name}* (${productCount})\n`;
                message += `${indent}   🆔 ${cat.id} | Depth: ${cat.depth}\n`;
                
                if (cat.children && cat.children.length > 0) {
                    printTree(cat.children, indent + '   ');
                }
            });
        };
        
        printTree(tree);
        
        message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        message += `💡 /addcat - Thêm category\n`;
        message += `💡 /editcat [id] - Sửa\n`;
        message += `💡 /delcat [id] - Xóa`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    },

    async addCategory(bot, msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const categories = db.getAllCategories();
        
        let parentList = '\n📁 *Danh sách parent:*\n';
        parentList += `ROOT (không có parent)\n`;
        categories.filter(c => c.depth < 2).forEach(c => {
            parentList += `${c.emoji} ${c.name} (${c.id})\n`;
        });
        
        await bot.sendMessage(chatId, 
            '📁 *THÊM CATEGORY MỚI*\n\n' +
            'Gửi theo format:\n\n' +
            '```\n' +
            'NAME: Tên category\n' +
            'PARENT: parent_id (hoặc ROOT)\n' +
            'EMOJI: 🎮\n' +
            'COLOR: #FF6B6B\n' +
            'ORDER: 1\n' +
            '```\n' +
            parentList,
            { parse_mode: 'Markdown' }
        );
        
        bot.once('message', async (response) => {
            if (response.from.id.toString() !== userId) return;
            
            try {
                const text = response.text;
                const name = text.match(/NAME:\s*(.+)/i)?.[1]?.trim();
                const parentId = text.match(/PARENT:\s*(.+)/i)?.[1]?.trim();
                const emoji = text.match(/EMOJI:\s*(.+)/i)?.[1]?.trim();
                const color = text.match(/COLOR:\s*(.+)/i)?.[1]?.trim();
                const order = text.match(/ORDER:\s*(\d+)/i)?.[1];
                
                if (!name) {
                    return bot.sendMessage(chatId, '❌ Thiếu NAME!');
                }
                
                const categoryData = {
                    name,
                    emoji: emoji || '📁',
                    color: color || '#CCCCCC',
                    display_order: parseInt(order) || 99
                };
                
                if (parentId && parentId.toUpperCase() !== 'ROOT') {
                    const parent = db.getCategoryById(parentId);
                    if (!parent) {
                        return bot.sendMessage(chatId, `❌ Parent "${parentId}" không tồn tại!`);
                    }
                    categoryData.parent_id = parentId;
                }
                
                const category = await db.addCategory(categoryData);
                
                await bot.sendMessage(chatId,
                    `✅ *Đã tạo category!*\n\n` +
                    `${category.emoji} ${category.name}\n` +
                    `🆔 ${category.id}\n` +
                    `📁 Parent: ${category.parent_id || 'ROOT'}\n` +
                    `📊 Depth: ${category.depth}`,
                    { parse_mode: 'Markdown' }
                );
                
            } catch (error) {
                await bot.sendMessage(chatId, `❌ Lỗi: ${error.message}`);
            }
        });
    },

    async editCategory(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const categoryId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const category = db.getCategoryById(categoryId);
        if (!category) {
            return bot.sendMessage(chatId, '❌ Category không tồn tại!');
        }
        
        await bot.sendMessage(chatId,
            `📁 *SỬA CATEGORY #${categoryId}*\n\n` +
            `Current:\n` +
            `  Name: ${category.name}\n` +
            `  Emoji: ${category.emoji}\n` +
            `  Color: ${category.color}\n` +
            `  Order: ${category.display_order}\n\n` +
            'Gửi theo format:\n\n' +
            '```\n' +
            'NAME: Tên mới (optional)\n' +
            'EMOJI: 🎮 (optional)\n' +
            'COLOR: #FF6B6B (optional)\n' +
            'ORDER: 1 (optional)\n' +
            '```',
            { parse_mode: 'Markdown' }
        );
        
        bot.once('message', async (response) => {
            if (response.from.id.toString() !== userId) return;
            
            const text = response.text;
            const updates = {};
            
            const name = text.match(/NAME:\s*(.+)/i)?.[1]?.trim();
            const emoji = text.match(/EMOJI:\s*(.+)/i)?.[1]?.trim();
            const color = text.match(/COLOR:\s*(.+)/i)?.[1]?.trim();
            const order = text.match(/ORDER:\s*(\d+)/i)?.[1];
            
            if (name) updates.name = name;
            if (emoji) updates.emoji = emoji;
            if (color) updates.color = color;
            if (order) updates.display_order = parseInt(order);
            
            if (Object.keys(updates).length === 0) {
                return bot.sendMessage(chatId, '❌ Không có gì để cập nhật!');
            }
            
            try {
                const updated = await db.updateCategory(categoryId, updates);
                
                await bot.sendMessage(chatId,
                    `✅ *Đã cập nhật!*\n\n` +
                    `${updated.emoji} ${updated.name}\n` +
                    `🆔 ${updated.id}`
                );
            } catch (error) {
                await bot.sendMessage(chatId, `❌ ${error.message}`);
            }
        });
    },

    async deleteCategory(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        const categoryId = match[1];
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const category = db.getCategoryById(categoryId);
        if (!category) {
            return bot.sendMessage(chatId, '❌ Category không tồn tại!');
        }
        
        const children = Object.values(db.data.categories).filter(c => c.parent_id === categoryId);
        const products = category.products?.length || 0;
        
        if (children.length > 0 || products > 0) {
            return bot.sendMessage(chatId,
                `❌ *Không thể xóa!*\n\n` +
                `📁 Children: ${children.length}\n` +
                `📦 Products: ${products}\n\n` +
                `Di chuyển hoặc xóa children/products trước!`
            );
        }
        
        const keyboard = {
            inline_keyboard: [
                [
                    { text: '✅ Xóa', callback_data: `delcat_${categoryId}` },
                    { text: '❌ Hủy', callback_data: 'cancel' }
                ]
            ]
        };
        
        await bot.sendMessage(chatId,
            `⚠️ *XÁC NHẬN XÓA CATEGORY*\n\n` +
            `${category.emoji} ${category.name}\n` +
            `🆔 ${categoryId}\n` +
            `📊 Depth: ${category.depth}`,
            { parse_mode: 'Markdown', reply_markup: keyboard }
        );
    },

    async moveCategory(bot, msg, match) {
        const chatId = msg.chat.id;
        const userId = msg.from.id.toString();
        
        if (!config.isAdmin(userId)) {
            return bot.sendMessage(chatId, '❌ Bạn không có quyền admin!');
        }
        
        const parts = match[1].split(' ');
        const categoryId = parts[0];
        const newParentId = parts[1] || 'ROOT';
        
        const category = db.getCategoryById(categoryId);
        if (!category) {
            return bot.sendMessage(chatId, '❌ Category không tồn tại!');
        }
        
        const targetParentId = newParentId.toUpperCase() === 'ROOT' ? null : newParentId;
        
        if (targetParentId === categoryId) {
            return bot.sendMessage(chatId, '❌ Không thể set làm parent của chính nó!');
        }
        
        if (targetParentId) {
            const newParent = db.getCategoryById(targetParentId);
            if (!newParent) {
                return bot.sendMessage(chatId, '❌ Parent không tồn tại!');
            }
        }
        
        try {
            const updated = await db.updateCategory(categoryId, { parent_id: targetParentId });
            
            await bot.sendMessage(chatId,
                `✅ *Đã di chuyển category!*\n\n` +
                `${updated.emoji} ${updated.name}\n` +
                `📁 New parent: ${targetParentId || 'ROOT'}\n` +
                `📊 New depth: ${updated.depth}`
            );
        } catch (error) {
            await bot.sendMessage(chatId, `❌ ${error.message}`);
        }
    },

    async handleDeleteCallback(bot, query, categoryId) {
        const userId = query.from.id.toString();
        if (!config.isAdmin(userId)) return;
        
        try {
            const deleted = await db.deleteCategory(categoryId);
            
            if (deleted) {
                await bot.editMessageText(
                    `✅ *Đã xóa category!*\n\n🆔 ${categoryId}`,
                    {
                        chat_id: query.message.chat.id,
                        message_id: query.message.message_id,
                        parse_mode: 'Markdown'
                    }
                );
            }
        } catch (error) {
            await bot.answerCallbackQuery(query.id, { text: error.message, show_alert: true });
        }
    }
};