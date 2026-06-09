# ShopGame - Shop bán tài khoản game uy tín

Website bán tài khoản game giống như ShopAcc.me với đầy đủ tính năng backend và frontend.

## Tính năng

### Frontend
- ✅ Trang chủ hiển thị sản phẩm theo danh mục
- ✅ Đăng ký / Đăng nhập
- ✅ Trang tin tức
- ✅ Lịch sử mua hàng
- ✅ Nạp tiền tài khoản
- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Dark sidebar với hiệu ứng đẹp

### Backend
- ✅ REST API đầy đủ
- ✅ Authentication & Authorization
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục (CRUD)
- ✅ Đặt hàng tự động
- ✅ Nạp tiền và duyệt nạp
- ✅ Quản lý user & balance (Admin)
- ✅ Lịch sử giao dịch

## Công nghệ

### Frontend
- HTML5, CSS3, JavaScript
- Font Awesome 6.4.0
- Google Fonts (Be Vietnam Pro)
- CSS Grid, Flexbox

### Backend
- Node.js, Express.js
- SQL Server (mssql)
- bcryptjs (mã hóa mật khẩu)
- express-validator (validation)

## Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd webcaythe
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình database
Tạo file `.env`:
```env
DB_SERVER=localhost
DB_DATABASE=CayTheDB
DB_USER=sa
DB_PASSWORD=your_password
# Hoặc dùng Windows Authentication
USE_WINDOWS_AUTH=true
```

### 4. Tạo database
```bash
# Chạy trong SQL Server Management Studio
:r database/schema.sql
:r database/seed.sql
```

Hoặc:
```bash
sqlcmd -S localhost -d master -i database/schema.sql
sqlcmd -S localhost -d CayTheDB -i database/seed.sql
```

### 5. Chạy server
```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

## API Documentation

Xem chi tiết tại [API.md](./API.md)

### Endpoints chính

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/orders` - Tạo đơn hàng
- `POST /api/deposits` - Tạo yêu cầu nạp tiền

## Cấu trúc thư mục

```
webcaythe/
├── config/
│   └── database.js        # Cấu hình kết nối DB
├── controllers/
│   ├── authController.js  # Xử lý authentication
│   ├── adminController.js # Xử lý admin
│   ├── productController.js # Xử lý sản phẩm
│   ├── orderController.js # Xử lý đơn hàng
│   └── depositController.js # Xử lý nạp tiền
├── database/
│   ├── schema.sql         # Cấu trúc DB
│   └── seed.sql           # Dữ liệu mẫu
├── middleware/
│   └── auth.js            # Middleware authentication
├── models/
│   ├── User.js            # Model User
│   ├── Product.js         # Model Product
│   ├── Category.js        # Model Category
│   ├── Order.js           # Model Order
│   └── Deposit.js         # Model Deposit
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html             # Các trang frontend
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── products.js
│   ├── orders.js
│   └── deposits.js
├── server.js              # Entry point
├── package.json
├── API.md                 # API Documentation
└── README.md
```

## Database Schema

### Tables
- **Users** - Người dùng (id, name, email, password, balance, role)
- **Categories** - Danh mục game (id, name, slug, icon)
- **Products** - Sản phẩm (id, category_id, name, price, stock)
- **Orders** - Đơn hàng (id, user_id, product_id, total_price, status)
- **Deposits** - Nạp tiền (id, user_id, amount, method, status)
- **Transactions** - Lịch sử giao dịch (id, user_id, type, amount)
- **News** - Tin tức (id, title, content, views)

## License

MIT License

© 2026 ShopGame