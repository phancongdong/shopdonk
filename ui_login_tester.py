"""
UI Login Testing Automation
Script tự động kiểm thử giao diện đăng nhập cho website riêng
"""

import asyncio
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from datetime import datetime
from pathlib import Path
import json
from dataclasses import dataclass, asdict
from enum import Enum
from typing import Optional


class LoginStatus(Enum):
    SUCCESS = "success"
    INVALID_CREDENTIALS = "invalid_credentials"
    ACCOUNT_LOCKED = "account_locked"
    CAPTCHA_REQUIRED = "captcha_required"
    TWO_FA_REQUIRED = "two_fa_required"
    CONNECTION_ERROR = "connection_error"
    SYSTEM_ERROR = "system_error"
    UNKNOWN = "unknown"


@dataclass
class TestConfig:
    url: str
    username_selector: str
    password_selector: str
    submit_selector: str
    success_selector: str
    error_selector: str
    locked_selector: str
    captcha_selector: str
    two_fa_selector: str
    timeout: int = 30000


@dataclass
class TestResult:
    status: LoginStatus
    message: str
    timestamp: str
    screenshot: Optional[str] = None
    details: Optional[dict] = None


class UILoginTester:
    def __init__(self, config_file: str = "login_test_config.json"):
        self.config_file = config_file
        self.config: Optional[TestConfig] = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.log_dir = Path("test_logs")
        self.screenshot_dir = Path("test_screenshots")
        self._setup_directories()
    
    def _setup_directories(self):
        self.log_dir.mkdir(exist_ok=True)
        self.screenshot_dir.mkdir(exist_ok=True)
    
    def load_config(self) -> TestConfig:
        if Path(self.config_file).exists():
            with open(self.config_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return TestConfig(**data)
        return self._create_default_config()
    
    def _create_default_config(self) -> TestConfig:
        default_config = TestConfig(
            url="http://localhost:8080/login",
            username_selector="#username",
            password_selector="#password",
            submit_selector="button[type='submit']",
            success_selector=".dashboard, .user-avatar, .account-menu",
            error_selector=".error-message, .alert-danger",
            locked_selector=".account-locked, .locked-message",
            captcha_selector=".captcha, #captcha",
            two_fa_selector=".two-factor, .otp-input"
        )
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(default_config), f, indent=2)
        return default_config
    
    def write_log(self, message: str, level: str = "INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}"
        print(log_entry)
        
        log_file = self.log_dir / f"test_{datetime.now().strftime('%Y%m%d')}.log"
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(log_entry + "\n")
    
    async def take_screenshot(self, name: str) -> str:
        screenshot_path = self.screenshot_dir / f"{name}_{datetime.now().strftime('%H%M%S')}.png"
        await self.page.screenshot(path=str(screenshot_path))
        self.write_log(f"Screenshot saved: {screenshot_path}")
        return str(screenshot_path)
    
    async def init_browser(self, headless: bool = False):
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(headless=headless)
        self.context = await self.browser.new_context(
            viewport={'width': 1280, 'height': 720},
            locale='vi-VN'
        )
        self.page = await self.context.new_page()
        self.write_log("Browser initialized successfully")
    
    async def close_browser(self):
        if self.browser:
            await self.browser.close()
            self.write_log("Browser closed")
    
    async def navigate_to_login_page(self) -> bool:
        try:
            self.write_log(f"Navigating to: {self.config.url}")
            await self.page.goto(self.config.url, wait_until='networkidle', timeout=self.config.timeout)
            await self.page.wait_for_selector(self.config.username_selector, timeout=self.config.timeout)
            self.write_log("Login page loaded successfully")
            return True
        except Exception as e:
            self.write_log(f"Failed to load login page: {str(e)}", "ERROR")
            await self.take_screenshot("login_page_error")
            return False
    
    async def fill_credentials(self, username: str, password: str) -> bool:
        try:
            self.write_log(f"Filling username: {username}")
            await self.page.fill(self.config.username_selector, username)
            
            self.write_log("Filling password")
            await self.page.fill(self.config.password_selector, password)
            
            self.write_log("Credentials filled successfully")
            return True
        except Exception as e:
            self.write_log(f"Failed to fill credentials: {str(e)}", "ERROR")
            await self.take_screenshot("fill_credentials_error")
            return False
    
    async def submit_login(self) -> bool:
        try:
            self.write_log("Clicking login button")
            await self.page.click(self.config.submit_selector)
            self.write_log("Login button clicked")
            await asyncio.sleep(2)
            return True
        except Exception as e:
            self.write_log(f"Failed to click login button: {str(e)}", "ERROR")
            await self.take_screenshot("submit_error")
            return False
    
    async def check_login_result(self) -> TestResult:
        timestamp = datetime.now().isoformat()
        
        try:
            if await self._is_element_visible(self.config.captcha_selector):
                screenshot = await self.take_screenshot("captcha_detected")
                return TestResult(
                    status=LoginStatus.CAPTCHA_REQUIRED,
                    message="CAPTCHA verification required",
                    timestamp=timestamp,
                    screenshot=screenshot
                )
            
            if await self._is_element_visible(self.config.two_fa_selector):
                screenshot = await self.take_screenshot("two_fa_required")
                return TestResult(
                    status=LoginStatus.TWO_FA_REQUIRED,
                    message="Two-factor authentication required",
                    timestamp=timestamp,
                    screenshot=screenshot
                )
            
            if await self._is_element_visible(self.config.locked_selector):
                screenshot = await self.take_screenshot("account_locked")
                return TestResult(
                    status=LoginStatus.ACCOUNT_LOCKED,
                    message="Account is locked",
                    timestamp=timestamp,
                    screenshot=screenshot
                )
            
            if await self._is_element_visible(self.config.error_selector):
                error_text = await self.page.text_content(self.config.error_selector)
                screenshot = await self.take_screenshot("login_failed")
                return TestResult(
                    status=LoginStatus.INVALID_CREDENTIALS,
                    message=f"Invalid credentials: {error_text}",
                    timestamp=timestamp,
                    screenshot=screenshot
                )
            
            if await self._is_element_visible(self.config.success_selector):
                screenshot = await self.take_screenshot("login_success")
                return TestResult(
                    status=LoginStatus.SUCCESS,
                    message="Login successful",
                    timestamp=timestamp,
                    screenshot=screenshot
                )
            
            current_url = self.page.url
            if current_url != self.config.url:
                screenshot = await self.take_screenshot("redirect_detected")
                return TestResult(
                    status=LoginStatus.SUCCESS,
                    message=f"Login successful - redirected to: {current_url}",
                    timestamp=timestamp,
                    screenshot=screenshot,
                    details={"redirect_url": current_url}
                )
            
            screenshot = await self.take_screenshot("unknown_state")
            return TestResult(
                status=LoginStatus.UNKNOWN,
                message="Unable to determine login status",
                timestamp=timestamp,
                screenshot=screenshot
            )
            
        except Exception as e:
            screenshot = await self.take_screenshot("check_error")
            return TestResult(
                status=LoginStatus.SYSTEM_ERROR,
                message=f"Error checking login result: {str(e)}",
                timestamp=timestamp,
                screenshot=screenshot
            )
    
    async def _is_element_visible(self, selector: str, timeout: int = 5000) -> bool:
        try:
            element = self.page.wait_for_selector(selector, timeout=timeout)
            return element is not None and await element.is_visible()
        except:
            return False
    
    async def run_test(self, username: str, password: str) -> TestResult:
        self.config = self.load_config()
        
        try:
            await self.init_browser(headless=False)
            
            if not await self.navigate_to_login_page():
                return TestResult(
                    status=LoginStatus.CONNECTION_ERROR,
                    message="Failed to load login page",
                    timestamp=datetime.now().isoformat()
                )
            
            if not await self.fill_credentials(username, password):
                return TestResult(
                    status=LoginStatus.SYSTEM_ERROR,
                    message="Failed to fill credentials",
                    timestamp=datetime.now().isoformat()
                )
            
            if not await self.submit_login():
                return TestResult(
                    status=LoginStatus.SYSTEM_ERROR,
                    message="Failed to submit login form",
                    timestamp=datetime.now().isoformat()
                )
            
            result = await self.check_login_result()
            
            self.write_log(f"Test completed - Status: {result.status.value}")
            self.write_log(f"Message: {result.message}")
            
            return result
            
        except Exception as e:
            self.write_log(f"Test failed with exception: {str(e)}", "ERROR")
            return TestResult(
                status=LoginStatus.SYSTEM_ERROR,
                message=f"Test exception: {str(e)}",
                timestamp=datetime.now().isoformat()
            )
        finally:
            await self.close_browser()
    
    def save_result(self, result: TestResult, filename: str = "test_result.json"):
        result_file = self.log_dir / filename
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(asdict(result), f, indent=2, ensure_ascii=False)
        self.write_log(f"Result saved to: {result_file}")


async def main():
    print("=" * 60)
    print("UI LOGIN TEST AUTOMATION")
    print("=" * 60)
    
    print("\nNhap URL trang dang nhap (Enter de dung mac dinh):")
    url_input = input("URL: ").strip()
    
    print("\nNhap username test:")
    username = input("Username: ").strip()
    
    print("\nNhap password test:")
    password = input("Password: ").strip()
    
    if not username or not password:
        print("\nError: Username va password khong duoc de trong!")
        return
    
    print("\n" + "=" * 60)
    print("Starting test...")
    print("=" * 60)
    
    tester = UILoginTester()
    
    if url_input:
        tester.config = tester.load_config()
        tester.config.url = url_input if url_input.startswith('http') else f'https://{url_input}'
    
    result = await tester.run_test(username, password)
    tester.save_result(result)
    
    print("\n" + "=" * 60)
    print("TEST RESULT")
    print("=" * 60)
    print(f"Status: {result.status.value}")
    print(f"Message: {result.message}")
    if result.screenshot:
        print(f"Screenshot: {result.screenshot}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
