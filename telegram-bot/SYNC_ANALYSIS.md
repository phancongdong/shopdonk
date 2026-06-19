# 📊 PHÂN TÍCH & ĐỒNG BỘ HÓA WEB → TELEGRAM BOT

## 1. PHÂN TÍCH TÍNH NĂNG WEB HIỆN CÓ

### 1.1 USER FEATURES (Người dùng)

| Tính năng | Web API | Bot hiện có | Cần thêm |
|-----------|---------|-------------|----------|
| Đăng ký/Đăng nhập | `register`, `login` | ✅ Auto (Telegram ID) | - |
| Google Sign-In | `googleSignIn` | ❌ | Không cần (Telegram auth) |
| Xem profile | `getProfile` | ✅ `/balance` | `/profile` |
| Xem số dư | `getBalance` | ✅ `/balance` | - |
| Cập nhật tên | `updateName` | ❌ | `/setname` |
| Lịch sử giao dịch | `getMyTransactions` | ✅ `/history` | Chi tiết hơn |
| Đổi mật khẩu | `changePasswordDirect` | ❌ | Không cần (Telegram) |
| Xem danh mục | `getCategories`, `getCategoryTree` | ✅ `/catalog` | Nested categories |
| Xem sản phẩm | `getProducts`, `getProductById` | ✅ `/product` | Search, filters |
| Tìm kiếm sản phẩm | `search` param | ❌ | `/search [keyword]` |
| Mua sản phẩm | `createOrder` | ✅ `/buy` | Quantity support |
| Xem đơn hàng | `getOrders`, `getOrderById` | ✅ `/history` | Chi tiết |
| Xem account đã mua | `getOrderAccount` | ✅ In `/history` | `/account [order_id]` |
| Nạp tiền | `createDeposit` | ✅ `/deposit` | - |
| Xem lịch nạp | `getDepositsByUser` | ❌ | `/deposit_history` |
| Bank transfer info | `bankTransferDeposit` | ✅ In `/deposit` | - |

### 1.2 ADMIN FEATURES (Quản trị)

| Tính năng | Web API | Bot hiện có | Cần thêm |
|-----------|---------|-------------|----------|
| Dashboard stats | `getOrderStats`, `getOrdersCountToday` | ✅ `/stats` | Chi tiết |
| Quản lý users | `getAllUsers` | ❌ | `/users` |
| Cập nhật user | `updateUser` | ❌ | `/edituser [id]` |
| Xem orders user | `getUserOrders` | ✅ `/orders` | Filter by user |
| Cộng/trừ tiền user | `adjustBalance`, `setUserBalance` | ❌ | `/addmoney`, `/deductmoney` |
| Xem transactions | `getTransactions` | ❌ | `/transactions [user_id]` |
| Quản lý categories | `createCategory`, `updateCategory`, `deleteCategory` | ❌ | `/addcat`, `/editcat`, `/delcat` |
| Di chuyển category | `moveCategory` | ❌ | `/movecat` |
| Quản lý products | `createProduct`, `updateProduct`, `deleteProduct` | ✅ `/add`, `/edit`, `/delete` | Bulk add |
| Quản lý orders | `getAllOrdersAdmin`, `updateOrderStatus` | ✅ `/orders` | Filter, status |
| Quản lý deposits | `getDeposits`, `approveDeposit`, `rejectDeposit` | ✅ `/deposits`, `/approve` | - |
| Admin add deposit | `adminAddDeposit` | ❌ | `/admindeposit [user_id] [amount]` |
| Quản lý banners | Banner CRUD | ❌ | Không cần (web only) |
| SEO settings | SEO CRUD | ❌ | Không cần (web only) |
| Social links | Social CRUD | ❌ | Không cần (web only) |
| Broadcast | ❌ | ✅ `/broadcast` | - |

### 1.3 FEATURES WEB CÓ, BOT CHƯA CÓ

**HIGH PRIORITY:**
1. ✅ Category management (CRUD + nested + move)
2. ✅ User management (list, edit, balance adjust)
3. ✅ Transaction history (admin + user)
4. ✅ Search products
5. ✅ Quantity purchase (buy multiple accounts)
6. ✅ Admin add deposit directly

**MEDIUM PRIORITY:**
7. ✅ Export orders/products
8. ✅ Product filters (price range, category)
9. ✅ Order status management
10. ✅ Refund system (cancel order)

**LOW PRIORITY (Web-specific):**
- Banner management
- SEO settings
- Social links
- Google Sign-In (Telegram has own auth)
- Password change (Telegram auth)

---

## 2. KẾ HOẠCH ĐỒNG BỘ HÓA

### PHASE 1: Core Features (Ngày 1)

**1.1 Nâng cấp Database**
- Thêm trường: `cost_price`, `original_price`, `is_hidden`, `featured`
- Nested categories (parent_id, depth)
- Transactions table
- User roles (admin, ctv, user)

**1.2 User Commands**
- `/profile` - Xem thông tin profile
- `/search [keyword]` - Tìm kiếm sản phẩm
- `/buy [id] [qty]` - Mua nhiều acc
- `/deposit_history` - Lịch sử nạp tiền
- `/account [order_id]` - Lấy lại acc đã mua

**1.3 Admin Commands**
- `/users` - Danh sách users
- `/edituser [id]` - Chỉnh sửa user
- `/addmoney [id] [amount]` - Cộng tiền
- `/deductmoney [id] [amount]` - Trừ tiền

### PHASE 2: Category Management (Ngày 2)

**2.1 Category Commands**
- `/categories` - Xem danh sách categories (nested tree)
- `/addcat` - Thêm category
- `/editcat [id]` - Sửa category
- `/delcat [id]` - Xóa category
- `/movecat [id] [parent_id]` - Di chuyển category

**2.2 Database Update**
- Thêm CategoryClosure table (nested sets)
- Support parent_id, depth, path

### PHASE 3: Transaction & Refund (Ngày 3)

**3.1 Transaction Commands**
- `/transactions [user_id]` - Xem transactions (admin)
- `/mytransactions` - Xem transactions của mình

**3.2 Refund System**
- `/cancel [order_id]` - Hủy đơn hàng (user, nếu pending)
- `/refund [order_id]` - Hoàn tiền (admin)

**3.3 Admin Deposit**
- `/admindeposit [user_id] [amount]` - Admin cộng tiền trực tiếp

### PHASE 4: Filters & Export (Ngày 4)

**4.1 Product Filters**
- `/products [category] [min_price] [max_price]` - Filter sản phẩm
- `/featured` - Sản phẩm nổi bật

**4.2 Order Filters**
- `/orders [status] [date]` - Filter đơn hàng

**4.3 Export**
- `/export orders` - Export orders to file
- `/export products` - Export products to file

### PHASE 5: Security & Roles (Ngày 5)

**5.1 Role-based Access**
- Admin: Full access
- CTV: Limited admin (products, orders only)
- User: Basic commands

**5.2 Security**
- Rate limiting
- Input validation
- Log actions

---

## 3. CHI TIẾT TRIỂN KHAI

### 3.1 Database Schema Update

```javascript
// telegram-bot/utils/database.js - Cập nhật

this.data = {
    users: {},
    products: {},
    orders: [],
    deposits: [],
    transactions: [],
    categories: {},
    categoryClosure: {},
    stats: {
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalDeposits: 0
    }
};

// User schema
{
    id: userId,
    name: string,
    email: string (optional),
    phone: string (optional),
    balance: number,
    role: 'user' | 'ctv' | 'admin',
    orders: [],
    transactions: [],
    createdAt: date,
    updatedAt: date
}

// Product schema (sync với web)
{
    id: string,
    name: string,
    slug: string,
    category_id: string,
    price: number,
    cost_price: number,
    original_price: number,
    description: string,
    image: string,
    stock: number,
    featured: boolean,
    account_type: 'single' | 'multiple',
    account_username: string,
    account_password: string,
    accounts_list: string (multi-line),
    is_hidden: boolean,
    createdAt: date,
    updatedAt: date
}

// Category schema (nested)
{
    id: string,
    name: string,
    slug: string,
    icon: string,
    color: string,
    image: string,
    parent_id: string | null,
    depth: number,
    path: string,
    display_order: number,
    createdAt: date
}

// Order schema (sync với web)
{
    id: string,
    userId: string,
    productId: string,
    productName: string,
    quantity: number,
    total_price: number,
    accounts: array,
    status: 'pending' | 'completed' | 'cancelled',
    createdAt: date
}

// Transaction schema
{
    id: string,
    userId: string,
    type: 'deposit' | 'withdraw' | 'purchase' | 'refund' | 'admin_add',
    amount: number,
    description: string,
    createdAt: date
}

// Deposit schema
{
    id: string,
    userId: string,
    amount: number,
    method: 'bank' | 'momo' | 'admin',
    transaction_code: string,
    proof: string (photo_id),
    status: 'pending' | 'approved' | 'rejected',
    createdAt: date
}
```

### 3.2 Commands Detail

**USER COMMANDS:**

```
/start - Welcome + menu
/help - Hướng dẫn
/catalog - Danh mục sản phẩm (nested tree)
/category [slug] - Sản phẩm theo danh mục
/search [keyword] - Tìm kiếm sản phẩm
/product [id] - Chi tiết sản phẩm
/buy [id] [qty=1] - Mua sản phẩm (quantity support)
/balance - Số dư + thông tin
/profile - Thông tin profile
/setname [name] - Đổi tên
/history - Lịch sử mua hàng
/account [order_id] - Lấy lại tài khoản
/deposit [amount] - Nạp tiền
/deposit_history - Lịch sử nạp
/mytransactions - Lịch sử giao dịch
```

**ADMIN COMMANDS:**

```
/stats - Thống kê chi tiết
/users - Danh sách users
/user [id] - Chi tiết user
/edituser [id] - Chỉnh sửa user
/addmoney [id] [amount] [note] - Cộng tiền
/deductmoney [id] [amount] [note] - Trừ tiền
/transactions [user_id] - Lịch sử giao dịch user

/categories - Danh sách categories (tree)
/addcat - Thêm category
/editcat [id] - Sửa category
/delcat [id] - Xóa category
/movecat [id] [parent_id] - Di chuyển category

/products - Danh sách products
/add - Thêm product (bulk support)
/edit [id] - Sửa product
/delete [id] - Xóa product
/bulkadd [category] [price] [accounts] - Thêm nhiều acc nhanh

/orders [status] [user_id] - Danh sách orders (filter)
/order [id] - Chi tiết order
/refund [id] - Hoàn tiền đơn hàng

/deposits - Yêu cầu nạp chờ duyệt
/approve [id] - Duyệt nạp
/reject [id] - Từ chối nạp
/admindeposit [user_id] [amount] - Cộng tiền trực tiếp

/export orders - Export orders
/export products - Export products
/broadcast [message] - Gửi tin nhắn tất cả users
```

### 3.3 Action Buttons (Inline Keyboard)

**Product Detail:**
```
[🛒 Mua ngay - 100.000đ] [📋 Xem acc mẫu]
[🔙 Quay lại danh mục]
```

**Order Detail:**
```
[🔐 Xem tài khoản] [📋 Copy acc]
[🔙 Quay lại lịch sử]
```

**Deposit Approval:**
```
[✅ Duyệt] [❌ Từ chối]
[👤 Xem profile user]
```

### 3.4 Format Messages

**Product Card:**
```
📦 *Acc Genshin AR60*
━━━━━━━━━━━━━━━━━━━━
💰 Giá: 100.000đ
💵 Giá vốn: 50.000đ
📦 Kho: 5 acc
🏷️ Danh mục: Genshin Impact
⭐ Nổi bật: Yes
━━━━━━━━━━━━━━━━━━━━
📝 Mô tả:
Acc AR60, full map探索
5* characters: Hu Tao, Raiden
━━━━━━━━━━━━━━━━━━━━
🆔 ID: 1692345678901
```

**Order Card:**
```
📦 *Đơn hàng #123*
━━━━━━━━━━━━━━━━━━━━
🎮 Sản phẩm: Acc Genshin AR60
🔢 Số lượng: 2 nick
💰 Tổng: 200.000đ
📅 Ngày: 18/06/2026
━━━━━━━━━━━━━━━━━━━━
🔐 *Tài khoản:*
1️⃣ user@email.com - pass123
2️⃣ user2@email.com - pass456
━━━━━━━━━━━━━━━━━━━━
⚠️ Lưu lại thông tin này!
```

---

## 4. THỰC HIỆN CODE

### 4.1 Cập nhật Database Class

```javascript
// utils/database.js - Thêm methods

async createTransaction(userId, type, amount, description) {
    const transaction = {
        id: Date.now().toString(),
        userId,
        type,
        amount,
        description,
        createdAt: new Date().toISOString()
    };
    this.data.transactions.push(transaction);
    
    const user = this.getUser(userId);
    user.transactions.push(transaction.id);
    
    await this.save();
    return transaction;
}

async getTransactions(userId, limit = 20) {
    return this.data.transactions
        .filter(t => t.userId === userId)
        .slice(-limit)
        .reverse();
}

async refundOrder(orderId) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'completed') return null;
    
    order.status = 'refunded';
    
    const user = this.getUser(order.userId);
    user.balance += order.total_price;
    
    await this.createTransaction(
        order.userId,
        'refund',
        order.total_price,
        `Hoàn tiền đơn hàng #${orderId}`
    );
    
    await this.save();
    return order;
}

async searchProducts(keyword) {
    const kw = keyword.toLowerCase();
    return Object.values(this.data.products)
        .filter(p => !p.is_hidden)
        .filter(p => 
            p.name.toLowerCase().includes(kw) ||
            p.description?.toLowerCase().includes(kw)
        );
}

async getCategoryTree() {
    const buildTree = (parentId = null, depth = 0) => {
        return Object.values(this.data.categories)
            .filter(c => c.parent_id === parentId)
            .map(c => ({
                ...c,
                depth,
                children: buildTree(c.id, depth + 1)
            }));
    };
    return buildTree();
}
```

### 4.2 Thêm Commands Mới

**File: commands/user.js - Thêm**

```javascript
async profile(bot, msg) {
    const userId = msg.from.id.toString();
    const user = db.getUser(userId);
    
    await bot.sendMessage(msg.chat.id,
        `👤 *Thông tin cá nhân*\n\n` +
        `🆔 ID: ${userId}\n` +
        `👤 Tên: ${user.name || msg.from.first_name}\n` +
        `💰 Số dư: ${user.balance.toLocaleString()}đ\n` +
        `📦 Đơn hàng: ${user.orders?.length || 0}\n` +
        `📅 Tham gia: ${new Date(user.createdAt).toLocaleDateString('vi-VN')}`,
        { parse_mode: 'Markdown' }
    );
}

async search(bot, msg, match) {
    const keyword = match[1];
    const products = await db.searchProducts(keyword);
    
    if (products.length === 0) {
        return bot.sendMessage(msg.chat.id, 
            `🔍 Không tìm thấy sản phẩm với keyword "${keyword}"`
        );
    }
    
    let message = `🔍 *Kết quả tìm kiếm (${products.length})*\n\n`;
    products.slice(0, 20).forEach(p => {
        message += `📦 *${p.name}*\n`;
        message += `   💰 ${p.price.toLocaleString()}đ | 📦 ${p.stock} acc\n`;
        message += `   🆔 \`${p.id}\`\n\n`;
    });
    
    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
}

async buyMultiple(bot, msg, match) {
    const parts = match[1].split(' ');
    const productId = parts[0];
    const quantity = parseInt(parts[1]) || 1;
    
    // Logic mua nhiều acc...
}
```

**File: commands/admin.js - Thêm**

```javascript
async users(bot, msg) {
    if (!config.isAdmin(msg.from.id.toString())) return;
    
    const users = Object.values(db.data.users);
    let message = `👥 *Danh sách users (${users.length})*\n\n`;
    
    users.slice(0, 30).forEach(u => {
        message += `👤 ${u.name || 'No name'}\n`;
        message += `   🆔 ${u.id}\n`;
        message += `   💰 ${u.balance?.toLocaleString() || 0}đ\n`;
        message += `   📦 ${u.orders?.length || 0} orders\n\n`;
    });
    
    await bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
}

async addMoney(bot, msg, match) {
    if (!config.isAdmin(msg.from.id.toString())) return;
    
    const parts = match[1].split(' ');
    const userId = parts[0];
    const amount = parseInt(parts[1]);
    const note = parts.slice(2).join(' ') || 'Admin cộng tiền';
    
    if (!amount || amount <= 0) {
        return bot.sendMessage(msg.chat.id, '❌ Số tiền không hợp lệ!');
    }
    
    const user = db.getUser(userId);
    user.balance += amount;
    
    await db.createTransaction(userId, 'admin_add', amount, note);
    await db.save();
    
    await bot.sendMessage(msg.chat.id,
        `✅ *Đã cộng tiền!*\n\n` +
        `👤 User: ${userId}\n` +
        `💵 +${amount.toLocaleString()}đ\n` +
        `💰 Số dư mới: ${user.balance.toLocaleString()}đ`,
        { parse_mode: 'Markdown' }
    );
    
    // Notify user
    try {
        await bot.sendMessage(userId,
            `💰 *Bạn đã nhận được tiền!*\n\n` +
            `💵 +${amount.toLocaleString()}đ\n` +
            `📝 ${note}\n` +
            `💰 Số dư: ${user.balance.toLocaleString()}đ`
        );
    } catch (e) {}
}
```

---

## 5. TIMELINE

| Ngày | Task | Files |
|------|------|-------|
| 1 | Database schema update | `utils/database.js` |
| 1 | User commands: profile, search | `commands/user.js` |
| 1 | Admin: users, addmoney | `commands/admin.js` |
| 2 | Category management | `commands/category.js` (new) |
| 2 | Nested categories | `utils/database.js` |
| 3 | Transactions, refund | `commands/transaction.js` (new) |
| 3 | Admin deposit | `commands/admin.js` |
| 4 | Filters, search advanced | `commands/user.js` |
| 4 | Export functionality | `commands/export.js` (new) |
| 5 | Roles, security | `middleware/auth.js` (new) |
| 5 | Final testing | All files |

---

## 6. CHECKLIST ĐỒNG BỘ HÓA

### Web → Bot Features

```
☐ USER FEATURES
  ☐ Profile view (/profile)
  ☐ Change name (/setname)
  ☐ Search products (/search)
  ☐ Buy multiple (/buy [id] [qty])
  ☐ View account (/account [order_id])
  ☐ Deposit history (/deposit_history)
  ☐ Transaction history (/mytransactions)
  
☐ ADMIN FEATURES
  ☐ Users list (/users)
  ☐ User detail (/user [id])
  ☐ Edit user (/edituser [id])
  ☐ Add money (/addmoney)
  ☐ Deduct money (/deductmoney)
  ☐ Transactions (/transactions)
  
  ☐ Categories list (tree)
  ☐ Add category
  ☐ Edit category
  ☐ Delete category
  ☐ Move category
  
  ☐ Bulk add products
  ☐ Product filters
  ☐ Order filters
  ☐ Refund order
  
  ☐ Export orders
  ☐ Export products
  
☐ DATABASE
  ☐ Nested categories
  ☐ Transactions table
  ☐ User roles
  ☐ Product fields sync
  
☐ SECURITY
  ☐ Role-based access
  ☐ Input validation
  ☐ Rate limiting
```

---

**Tác giả:** Kilo Analysis  
**Ngày:** 2026-06-18  
**Phiên bản:** 1.0