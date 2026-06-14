# Nested Categories System

## Giới thiệu

Hệ thống danh mục phân cấp (Nested Categories) cho phép:
- Danh mục cha chứa danh mục con
- Danh mục con có thể chứa trực tiếp sản phẩm (games)
- Truy vấn hiệu quả toàn bộ cây danh mục

## Cấu trúc dữ liệu

### 1. Bảng Categories (mở rộng)
```sql
-- Các cột mới được thêm:
parent_id INT NULL        -- ID danh mục cha (Adjacency List)
depth INT DEFAULT 0       -- Độ sâu trong cây (0 = root)
path NVARCHAR(1000)       -- Đường dẫn ID (ví dụ: "1/5/12")
```

### 2. Bảng CategoryClosure (mới)
```sql
CREATE TABLE CategoryClosure (
    ancestor_id INT NOT NULL,    -- ID tổ tiên
    descendant_id INT NOT NULL,  -- ID con cháu
    depth INT NOT NULL DEFAULT 0, -- Khoảng cách
    PRIMARY KEY (ancestor_id, descendant_id)
);
```

**Ví dụ Closure Table:**
```
Danh mục: Game (1) > Steam (2) > Steam VN (3)

CategoryClosure:
| ancestor_id | descendant_id | depth |
|-------------|---------------|-------|
| 1           | 1             | 0     | (tự tham chiếu)
| 2           | 2             | 0     |
| 3           | 3             | 0     |
| 1           | 2             | 1     | (1 là cha của 2)
| 1           | 3             | 2     | (1 là ông của 3)
| 2           | 3             | 1     | (2 là cha của 3)
```

## API Endpoints

### Danh mục
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Lấy tất cả danh mục |
| GET | `/api/categories?tree=true` | Lấy dạng cây |
| GET | `/api/categories?select=true` | Lấy cho dropdown (có prefix depth) |
| GET | `/api/categories/tree` | Lấy cây danh mục |
| GET | `/api/categories/:id` | Chi tiết danh mục |
| GET | `/api/categories/:id/path` | Đường dẫn từ root đến danh mục |
| GET | `/api/categories/:id/products` | Sản phẩm trong danh mục |
| POST | `/api/categories` | Tạo danh mục mới |
| PUT | `/api/categories/:id` | Cập nhật danh mục |
| PUT | `/api/categories/:id/move` | Di chuyển danh mục |
| DELETE | `/api/categories/:id` | Xóa danh mục (không có con) |

### Thêm sản phẩm (có thể lọc theo danh mục + con cháu)
```
GET /api/categories/:id/products?include_descendants=true
```

## Cài đặt

### 1. Chạy migration
```bash
node migrate-nested-categories.js
```

Hoặc chạy SQL thủ công:
```bash
sqlcmd -S localhost -d CayTheDB -i database/nested-categories.sql
```

### 2. Khởi động lại server
```bash
node server.js
```

## Sử dụng

### Quản trị viên
1. Truy cập `/admin/categories.html`
2. Tạo danh mục gốc (không chọn danh mục cha)
3. Tạo danh mục con (chọn danh mục cha)
4. Di chuyển danh mục bằng cách thay đổi danh mục cha

### Gán sản phẩm
1. Truy cập `/admin/products.html`
2. Dropdown danh mục hiển thị dạng cây (`—` prefix)
3. Chọn danh mục bất kỳ cấp độ nào

## Truy vấn tối ưu

### Lấy tất cả con cháu của một danh mục
```sql
SELECT c.* 
FROM Categories c
INNER JOIN CategoryClosure cc ON c.id = cc.descendant_id
WHERE cc.ancestor_id = @categoryId
```

### Lấy đường dẫn từ root
```sql
SELECT c.* 
FROM Categories c
INNER JOIN CategoryClosure cc ON c.id = cc.ancestor_id
WHERE cc.descendant_id = @categoryId
ORDER BY cc.depth
```

### Lấy sản phẩm trong danh mục và tất cả con cháu
```sql
SELECT p.* 
FROM Products p
WHERE p.category_id IN (
    SELECT descendant_id 
    FROM CategoryClosure 
    WHERE ancestor_id = @categoryId
)
```

## Lợi ích của Closure Table

1. **Hiệu suất**: O(1) để tìm tất cả con cháu/ tổ tiên
2. **Linh hoạt**: Dễ dàng truy vấn ở mọi cấp độ
3. **Tính toàn vẹn**: Closure table tự động cập nhật khi di chuyển danh mục
4. **Không giới hạn độ sâu**: Hỗ trợ cây n-levels

## Model Functions

```javascript
// Lấy cây danh mục
Category.getCategoryTree()

// Lấy tất cả con cháu
Category.getCategoryWithDescendants(id)

// Lấy đường dẫn từ root
Category.getCategoryPath(id)

// Tạo danh mục (tự động cập nhật closure table)
Category.createCategory(data)

// Cập nhật danh mục (xử lý di chuyển)
Category.updateCategory(id, data)

// Xóa danh mục (kiểm tra con)
Category.deleteCategory(id)

// Lấy sản phẩm (có thể bao gồm con cháu)
Category.getCategoryProducts(id, includeDescendants)
```
