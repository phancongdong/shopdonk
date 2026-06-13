# Hướng dẫn sử dụng UI Login Test Automation

## 1. CÀI ĐẶT MÔI TRƯỜNG

### Bước 1: Cài đặt Python (nếu chưa có)
- Tải Python từ: https://www.python.org/downloads/
- Khi cài đặt, tích chọn "Add Python to PATH"

### Bước 2: Mở terminal/command prompt
```bash
# Di chuyển đến thư mục chứa script
cd C:\Users\Admin\Documents\webcaythe
```

### Bước 3: Cài đặt thư viện
```bash
pip install playwright
playwright install chromium
```

---

## 2. CHẠY CHƯƠNG TRÌNH

```bash
python ui_login_test.py
```

---

## 3. NHẬP THÔNG TIN KHI CHƯƠNG TRÌNH YÊU CẦU

### Màn hình sẽ hiển thị như sau:

```
============================================================
UI LOGIN TEST AUTOMATION - CONFIGURATION
============================================================

Nhap URL trang dang nhap (vi du: http://localhost:8080/login):
URL: _
```

### Bước 3.1: Nhập URL
- Nhập URL trang đăng nhập cần test
- Ví dụ: `https://example.com/login`
- Nhấn Enter

### Bước 3.2: Nhập CSS Selectors
```
Nhap CSS selector cho cac phan tu:
(Nhan Enter de su dung gia tri mac dinh)

Username input selector [#username]: _
```

**Cách tìm selector:**
1. Mở trình duyệt, vào trang đăng nhập
2. Nhấn F12 để mở Developer Tools
3. Click vào biểu tượng mũi tên (hoặc Ctrl+Shift+C)
4. Click vào ô nhập username → Xem HTML code
5. Tìm id, class, hoặc name attribute

**Ví dụ:**
```html
<input id="email" name="username" class="form-control">
```
→ Selector có thể là: `#email` hoặc `input[name="username"]`

**Các selector cần nhập:**
| Selector | Mô tả | Mặc định |
|----------|-------|----------|
| Username input | Ô nhập tên đăng nhập | `#username` |
| Password input | Ô nhập mật khẩu | `#password` |
| Submit button | Nút đăng nhập | `button[type='submit']` |
| Success element | Phần tử hiện khi login thành công | `.welcome, .dashboard` |
| Error element | Thông báo lỗi | `.error-message, .alert-danger` |

### Bước 3.3: Nhập danh sách tài khoản test
```
Nhap danh sach tai khoan kiem thu:
(Nhap 'done' de ket thuc nhap)

Username (hoac 'done'): _
```

**Nhập lần lượt:**
1. Username → Nhấn Enter
2. Password → Nhấn Enter
3. Ket qua mong doi (success/failure) → Nhấn Enter
4. Mo ta test case → Nhấn Enter
5. Lặp lại cho tài khoản tiếp theo
6. Nhập `done` khi hoàn tất

**Ví dụ:**
```
Username: admin
Password: admin123
Ket qua mong doi: success
Mo ta: Test login voi tai khoan admin

Username: wronguser
Password: wrongpass
Ket qua mong doi: failure
Mo ta: Test login that bai

Username: done
```

---

## 4. XEM KẾT QUẢ

### File kết quả được tạo:

**test_results.log** - Log chi tiết:
```
[2026-06-12 20:55:00] Starting test: Test login voi tai khoan admin
[2026-06-12 20:55:05] PASSED: Test login voi tai khoan admin
[2026-06-12 20:55:06] Starting test: Test login that bai
[2026-06-12 20:55:10] PASSED: Test login that bai
============================================================
TEST SUMMARY
============================================================
Total tests: 2
Passed: 2
Failed: 0
Errors: 0
Pass rate: 100.00%
```

**test_results.json** - Dữ liệu JSON để tích hợp:
```json
{
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "errors": 0
  },
  "results": [...]
}
```

---

## 5. VÍ DỤ HOÀN CHỈNH

```bash
$ python ui_login_test.py

============================================================
UI LOGIN TEST AUTOMATION - CONFIGURATION
============================================================

Nhap URL trang dang nhap (vi du: http://localhost:8080/login):
URL: https://example.com/login

Nhap CSS selector cho cac phan tu:
(Nhan Enter de su dung gia tri mac dinh)

Username input selector [#username]: #email
Password input selector [#password]: 
Submit button selector [button[type='submit']]: 
Success element selector [.welcome, .dashboard]: .user-profile
Error element selector [.error-message, .alert-danger]: .alert-danger

Nhap danh sach tai khoan kiem thu:
(Nhap 'done' de ket thuc nhap)

Username (hoac 'done'): test@example.com
Password: password123
Ket qua mong doi (success/failure) [success]: success
Mo ta test case: Test valid login

Username (hoac 'done'): invalid@example.com
Password: wrongpass
Ket qua mong doi (success/failure) [success]: failure
Mo ta test case: Test invalid credentials

Username (hoac 'done'): done
```

---

## 6. LƯU Ý QUAN TRỌNG

1. **Trình duyệt sẽ mở** (headless=False) để bạn quan sát quá trình test
2. **Selectors phải chính xác** với cấu trúc HTML của website
3. **Thời gian chờ mặc định** là 10-15 giây cho mỗi phần tử
4. **Kết quả** được lưu vào thư mục hiện tại

---

## 7. TÙY CHỈNH NÂNG CAO

Mở file `ui_login_test.py` để chỉnh sửa:

**Thay đổi thời gian chờ:**
```python
await page.wait_for_selector(username_selector, timeout=10000)  # 10 giây
```

**Thay đổi trình duyệt:**
```python
browser = await p.firefox.launch(headless=False)  # Dùng Firefox
browser = await p.webkit.launch(headless=False)   # Dùng WebKit
```

**Chạy không hiển thị trình duyệt:**
```python
browser = await p.chromium.launch(headless=True)  # Chạy ngầm
```