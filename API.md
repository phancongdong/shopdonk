# ShopGame API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Một số API yêu cầu authentication. Thêm header:
```
x-user-id: <user_id>
```

---

## Authentication APIs

### Register
```
POST /api/auth/register
Body: {
  "name": "User Name",
  "email": "user@email.com",
  "password": "password123"
}
```

### Login
```
POST /api/auth/login
Body: {
  "email": "user@email.com",
  "password": "password123"
}
```

### Get Profile
```
GET /api/auth/profile/:id
```

### Update Name
```
PUT /api/auth/name/:id
Body: { "name": "New Name" }
```

### Request Email Verification
```
POST /api/auth/email/request/:id
Body: { "newEmail": "new@email.com" }
```

### Confirm Email Change
```
POST /api/auth/email/confirm/:id
Body: { "code": "123456" }
```

### Request Password Verification
```
POST /api/auth/password/request/:id
Body: {
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

### Confirm Password Change
```
POST /api/auth/password/confirm/:id
Body: { "code": "123456" }
```

---

## Product APIs

### Get All Products
```
GET /api/products?category_id=1&search=keyword&limit=20
```

Query params:
- `category_id` - Filter by category
- `category_slug` - Filter by category slug
- `search` - Search keyword
- `min_price` - Minimum price
- `max_price` - Maximum price
- `limit` - Number of results (default: 50)

### Get Featured Products
```
GET /api/products/featured?limit=10
```

### Get Product by ID
```
GET /api/products/:id
```

### Get Product by Slug
```
GET /api/products/slug/:slug
```

### Create Product (Admin)
```
POST /api/products
Body: {
  "category_id": 1,
  "name": "Product Name",
  "description": "Description",
  "price": 100000,
  "original_price": 150000,
  "image": "https://...",
  "stock": 10,
  "features": "Features"
}
```

### Update Product (Admin)
```
PUT /api/products/:id
Body: { ...fields to update }
```

### Delete Product (Admin)
```
DELETE /api/products/:id
```

---

## Category APIs

### Get All Categories
```
GET /api/categories
```

### Get Category by ID
```
GET /api/categories/:id
```

### Create Category (Admin)
```
POST /api/categories
Body: {
  "name": "Category Name",
  "icon": "fas fa-icon",
  "display_order": 1
}
```

### Update Category (Admin)
```
PUT /api/categories/:id
Body: { ...fields to update }
```

### Delete Category (Admin)
```
DELETE /api/categories/:id
```

---

## Order APIs

### Get Orders
```
GET /api/orders
Headers: x-user-id: <user_id>
Query: ?status=pending&limit=20
```

### Get Order by ID
```
GET /api/orders/:id
Headers: x-user-id: <user_id>
```

### Create Order
```
POST /api/orders
Headers: x-user-id: <user_id>
Body: {
  "product_id": 1,
  "quantity": 1
}
```

### Update Order Status (Admin)
```
PUT /api/orders/:id/status
Body: { "status": "completed" }
```

### Cancel Order
```
PUT /api/orders/:id/cancel
Headers: x-user-id: <user_id>
```

### Get Order Stats (Admin)
```
GET /api/orders/stats
```

---

## Deposit APIs

### Get Deposits
```
GET /api/deposits
Headers: x-user-id: <user_id>
Query: ?status=pending&limit=20
```

### Create Deposit
```
POST /api/deposits
Headers: x-user-id: <user_id>
Body: {
  "amount": 100000,
  "method": "bank_transfer",
  "transaction_code": "TXN123"
}
```

### Get Bank Transfer Info
```
POST /api/deposits/bank-transfer
Headers: x-user-id: <user_id>
Body: { "amount": 100000 }
```

### Approve Deposit (Admin)
```
POST /api/deposits/:id/approve
```

### Reject Deposit (Admin)
```
POST /api/deposits/:id/reject
```

---

## Admin APIs

### Get All Users
```
GET /api/admin/users
```

### Set User Balance
```
PUT /api/admin/balance/:id
Body: {
  "balance": 100000,
  "description": "Admin update"
}
```

### Adjust User Balance
```
PUT /api/admin/balance/:id/adjust
Body: {
  "amount": 50000,
  "description": "Bonus"
}
```

### Get User Transactions
```
GET /api/admin/transactions/:id?limit=20
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., email exists)
- `500` - Server Error

---

## Setup Database

1. Run schema.sql:
```sql
-- In SQL Server Management Studio
:r schema.sql
```

2. Run seed.sql:
```sql
:r seed.sql
```

Or run directly:
```bash
sqlcmd -S localhost -d CayTheDB -i database/schema.sql
sqlcmd -S localhost -d CayTheDB -i database/seed.sql
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@email.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@email.com","password":"password123"}'
```

### Get Products
```bash
curl http://localhost:3000/api/products
```

### Get Categories
```bash
curl http://localhost:3000/api/categories
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"product_id":1,"quantity":1}'
```

---

## Notes

1. Tất cả prices đều tính bằng VND
2. User balance có thể âm (tùy thuộc vào logic business)
3. Order status: `pending`, `completed`, `cancelled`
4. Deposit status: `pending`, `completed`, `rejected`
5. Transaction types: `deposit`, `purchase`, `refund`, `SET_BALANCE`

---

© 2026 ShopGame API