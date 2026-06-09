# Tài khoản hệ thống ShopGame

## 🔐 Tài khoản Admin

```
Email: admin@shopgame.vn
Password: admin123456
Balance: 10,000,000 VND (Cần update qua SQL)
Role: admin (Cần update qua SQL)
```

### Cập nhật quyền admin trong SQL Server:
```sql
USE CayTheDB;
UPDATE Users 
SET role = 'admin', 
    balance = 10000000 
WHERE email = 'admin@shopgame.vn';
```

---

## 👤 Tài khoản User mẫu

### User 1
```
Email: user1@gmail.com
Password: 123456
Name: Nguyen Van A
```

### User 2
```
Email: user2@gmail.com
Password: 123456
Name: Tran Thi B
```

### User 3
```
Email: user3@gmail.com
Password: 123456
Name: Le Van C
```

---

## 📝 Hướng dẫn sử dụng

### Đăng nhập
1. Mở http://localhost:3000/login.html
2. Nhập email và password
3. Click "Đăng nhập"

### Đăng ký tài khoản mới
1. Mở http://localhost:3000/register.html
2. Điền đầy đủ thông tin
3. Click "Đăng ký"

### Nạp tiền (Admin)
1. Đăng nhập với tài khoản admin
2. Vào trang "Nạp Tiền"
3. Chọn phương thức thanh toán
4. Nhập số tiền và xác nhận

### Mua tài khoản game
1. Đăng nhập
2. Chọn game muốn mua
3. Click vào sản phẩm
4. Xem chi tiết và mua

---

## 🔧 API Testing

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shopgame.vn","password":"admin123456"}'
```

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@gmail.com","password":"123456"}'
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Get Categories
```bash
curl http://localhost:3000/api/categories
```

---

## ⚠️ Lưu ý bảo mật

1. **Đổi mật khẩu admin** ngay sau khi đăng nhập lần đầu
2. Không commit file `.env` lên git
3. Mật khẩu nên có độ dài tối thiểu 8 ký tự
4. Sử dụng HTTPS trong môi trường production

---

© 2026 ShopGame