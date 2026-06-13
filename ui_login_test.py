import asyncio
from playwright.async_api import async_playwright
from datetime import datetime
import json
import os

class LoginTestAutomation:
    def __init__(self, test_data_file="test_data.json", log_file="test_results.log"):
        self.test_data_file = test_data_file
        self.log_file = log_file
        self.results = []
        self.target_url = None
        
    def load_test_data(self):
        """Đọc dữ liệu kiểm thử từ tệp tin cấu trúc"""
        if not os.path.exists(self.test_data_file):
            raise FileNotFoundError(f"Test data file not found: {self.test_data_file}")
        
        with open(self.test_data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    
    def write_log(self, message):
        """Ghi log ra tệp tin"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"
        print(log_entry.strip())
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry)
    
    def get_user_input(self):
        """Nhập thông tin cấu hình từ người dùng"""
        print("\n" + "=" * 60)
        print("UI LOGIN TEST AUTOMATION - CONFIGURATION")
        print("=" * 60)
        
        print("\nNhap URL trang dang nhap (vi du: http://localhost:8080/login):")
        url = input("URL: ").strip()
        
        if not url:
            url = "http://localhost:8080/login"
            print(f"Su dung URL mac dinh: {url}")
        
        if not url.startswith('http://') and not url.startswith('https://'):
            url = 'https://' + url
        
        self.target_url = url
        
        print("\nNhap CSS selector cho cac phan tu:")
        print("(Nhan Enter de su dung gia tri mac dinh)")
        
        username_selector = input("Username input selector [#username]: ").strip()
        password_selector = input("Password input selector [#password]: ").strip()
        submit_selector = input("Submit button selector [button[type='submit']]: ").strip()
        success_selector = input("Success element selector [.welcome, .dashboard]: ").strip()
        error_selector = input("Error element selector [.error-message, .alert-danger]: ").strip()
        
        self.selectors = {
            'username': username_selector if username_selector else '#username',
            'password': password_selector if password_selector else '#password',
            'submit': submit_selector if submit_selector else "button[type='submit']",
            'success': success_selector if success_selector else '.welcome, .dashboard',
            'error': error_selector if error_selector else '.error-message, .alert-danger'
        }
        
        print("\nNhap danh sach tai khoan kiem thu:")
        print("(Nhap 'done' de ket thuc nhap)")
        
        self.manual_test_cases = []
        while True:
            username = input("\nUsername (hoac 'done'): ").strip()
            if username.lower() == 'done':
                break
            password = input("Password: ").strip()
            expected = input("Ket qua mong doi (success/failure) [success]: ").strip().lower()
            if expected not in ['success', 'failure']:
                expected = 'success'
            description = input("Mo ta test case: ").strip()
            if not description:
                description = f"Test: {username}"
            
            self.manual_test_cases.append({
                'description': description,
                'username': username,
                'password': password,
                'expected': expected
            })
        
        return self.selectors
    
    async def perform_login_test(self, page, test_case):
        """Thực hiện kiểm thử đăng nhập cho một test case"""
        username = test_case.get('username', '')
        password = test_case.get('password', '')
        expected_result = test_case.get('expected', 'success')
        description = test_case.get('description', f"Test: {username}")
        
        self.write_log(f"Starting test: {description}")
        
        try:
            await page.goto(self.target_url, wait_until='networkidle')
            
            username_selector = self.selectors.get('username', '#username')
            password_selector = self.selectors.get('password', '#password')
            submit_selector = self.selectors.get('submit', "button[type='submit']")
            
            await page.wait_for_selector(username_selector, timeout=10000)
            await page.fill(username_selector, username)
            
            await page.wait_for_selector(password_selector, timeout=10000)
            await page.fill(password_selector, password)
            
            await page.click(submit_selector)
            
            result = await self.verify_login_result(page, test_case)
            
            test_result = {
                'test_case': description,
                'username': username,
                'status': result['status'],
                'message': result['message'],
                'timestamp': datetime.now().isoformat()
            }
            
            if result['status'] == 'passed':
                self.write_log(f"PASSED: {description} - {result['message']}")
            else:
                self.write_log(f"FAILED: {description} - {result['message']}")
            
            return test_result
            
        except Exception as e:
            error_result = {
                'test_case': description,
                'username': username,
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }
            self.write_log(f"ERROR: {description} - {str(e)}")
            return error_result
    
    async def verify_login_result(self, page, test_case):
        """Kiểm tra kết quả đăng nhập"""
        expected = test_case.get('expected', 'success')
        
        try:
            if expected == 'success':
                success_selector = self.selectors.get('success', '.dashboard, .welcome-message')
                await page.wait_for_selector(success_selector, timeout=15000)
                
                if await page.is_visible(success_selector):
                    return {'status': 'passed', 'message': 'Login successful - success element detected'}
                else:
                    return {'status': 'failed', 'message': 'Success element not visible'}
                    
            elif expected == 'failure':
                error_selector = self.selectors.get('error', '.error-message, .alert-danger')
                await page.wait_for_selector(error_selector, timeout=15000)
                
                if await page.is_visible(error_selector):
                    error_text = await page.text_content(error_selector)
                    return {'status': 'passed', 'message': f'Login failed as expected: {error_text}'}
                else:
                    return {'status': 'failed', 'message': 'Error element not visible'}
                    
            else:
                return {'status': 'failed', 'message': f'Unknown expected result: {expected}'}
                
        except Exception as e:
            return {'status': 'failed', 'message': f'Verification timeout: {str(e)}'}
    
    async def run_all_tests(self):
        """Chạy tất cả các test case"""
        self.get_user_input()
        
        test_cases = self.manual_test_cases if self.manual_test_cases else []
        
        if not test_cases:
            test_data = self.load_test_data()
            test_cases = test_data.get('test_cases', [])
        
        self.write_log("=" * 60)
        self.write_log("Starting UI Login Test Automation")
        self.write_log(f"Target URL: {self.target_url}")
        self.write_log(f"Total test cases: {len(test_cases)}")
        self.write_log("=" * 60)
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            context = await browser.new_context()
            page = await context.new_page()
            
            for test_case in test_cases:
                result = await self.perform_login_test(page, test_case)
                self.results.append(result)
                await asyncio.sleep(1)
            
            await browser.close()
        
        self.generate_summary()
    
    def generate_summary(self):
        """Tạo báo cáo tổng kết"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r['status'] == 'passed')
        failed = sum(1 for r in self.results if r['status'] == 'failed')
        errors = sum(1 for r in self.results if r['status'] == 'error')
        
        self.write_log("=" * 60)
        self.write_log("TEST SUMMARY")
        self.write_log("=" * 60)
        self.write_log(f"Total tests: {total}")
        self.write_log(f"Passed: {passed}")
        self.write_log(f"Failed: {failed}")
        self.write_log(f"Errors: {errors}")
        self.write_log(f"Pass rate: {(passed/total*100):.2f}%" if total > 0 else "Pass rate: N/A")
        self.write_log("=" * 60)
        
        with open('test_results.json', 'w', encoding='utf-8') as f:
            json.dump({
                'summary': {
                    'total': total,
                    'passed': passed,
                    'failed': failed,
                    'errors': errors
                },
                'target_url': self.target_url,
                'results': self.results
            }, f, indent=2, ensure_ascii=False)

def main():
    automation = LoginTestAutomation(
        test_data_file="test_data.json",
        log_file="test_results.log"
    )
    asyncio.run(automation.run_all_tests())

if __name__ == "__main__":
    main()
