document.addEventListener('DOMContentLoaded', function() {
    const toggleBtns = document.querySelectorAll('.toggle-password');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    initGoogleSignIn();

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.user) {
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    console.log('Login successful, user saved:', data.user);
                    
                    showModal('ÄÄƒng nháº­p thÃ nh cÃ´ng!', 'success', () => {
                        window.location.href = 'index.html';
                    });
                } else {
                    showModal(data.message || 'ÄÄƒng nháº­p tháº¥t báº¡i', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showModal('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i!', 'error');
            }
        });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value || null;
            const phone = document.getElementById('phone').value || null;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showModal('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p!', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, phone, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showModal('ÄÄƒng kÃ½ thÃ nh cÃ´ng! Vui lÃ²ng Ä‘Äƒng nháº­p.', 'success', () => {
                        window.location.href = 'login.html';
                    });
                } else {
                    showModal(data.message || 'ÄÄƒng kÃ½ tháº¥t báº¡i', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showModal('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i!', 'error');
            }
        });
    }

    function showModal(message, type = 'success', callback = null) {
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = `modal-popup modal-${type}`;
        modal.innerHTML = `
            <div class="modal-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            </div>
            <div class="modal-message">${message}</div>
            <button class="modal-btn">ÄÃ³ng</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.classList.add('show'), 10);
        
        const closeBtn = modal.querySelector('.modal-btn');
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 300);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    if (callback) callback();
                }, 300);
            }
        });
    }

    function showToast(message, type = 'success') {
        showModal(message, type);
    }

    let googleClientId = null;

    async function initGoogleSignIn() {
        try {
            const configRes = await fetch('/api/config');
            const configData = await configRes.json();
            googleClientId = configData.data?.googleClientId;
            
            if (!googleClientId) {
                console.log('Google Sign-In not configured');
                return;
            }
            
            if (typeof google !== 'undefined' && google.accounts) {
                google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleCredentialResponse
                });
                
                const googleBtnContainer = document.getElementById('googleSignInBtn');
                if (googleBtnContainer) {
                    google.accounts.id.renderButton(googleBtnContainer, {
                        type: 'standard',
                        theme: 'filled_black',
                        size: 'large',
                        width: 250,
                        text: 'signin_with',
                        shape: 'rectangular'
                    });
                }
            }
        } catch (error) {
            console.log('Failed to initialize Google Sign-In:', error);
        }
    }

    window.handleGoogleSignIn = function() {
        if (!googleClientId) {
            showModal('Google Sign-In chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh', 'error');
            return;
        }
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCredentialResponse
            });
            google.accounts.id.prompt();
        }
    }

    async function handleGoogleCredentialResponse(response) {
        const credential = response.credential;
        
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            });
            
            const data = await res.json();
            
            if (res.ok && data.user) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showModal('ÄÄƒng nháº­p thÃ nh cÃ´ng!', 'success', () => {
                    window.location.href = 'index.html';
                });
            } else {
                showModal(data.message || 'ÄÄƒng nháº­p tháº¥t báº¡i', 'error');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            showModal('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i!', 'error');
        }
    }

    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-overlay.show {
            opacity: 1;
        }
        
        .modal-popup {
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            padding: 30px 40px;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            transform: scale(0.8);
            transition: transform 0.3s ease;
            max-width: 400px;
            width: 90%;
            border: 1px solid rgba(0, 240, 255, 0.3);
        }
        
        .modal-overlay.show .modal-popup {
            transform: scale(1);
        }
        
        .modal-icon {
            width: 70px;
            height: 70px;
            margin: 0 auto 20px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .modal-success .modal-icon {
            background: linear-gradient(135deg, #4CAF50, #45a049);
        }
        
        .modal-error .modal-icon {
            background: linear-gradient(135deg, #f44336, #d32f2f);
        }
        
        .modal-icon i {
            font-size: 36px;
            color: white;
        }
        
        .modal-message {
            font-size: 18px;
            font-weight: 500;
            color: #fff;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        
        .modal-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 40px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .modal-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }
    `;
    document.head.appendChild(style);
});