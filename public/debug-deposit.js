// DEBUG - Paste this in browser console on deposit.html
console.log('=== DEPOSIT DEBUG ===');
console.log('localStorage user:', localStorage.getItem('user'));
console.log('localStorage token:', localStorage.getItem('token'));

const user = JSON.parse(localStorage.getItem('user') || 'null');
console.log('Parsed user:', user);
console.log('User exists?', user !== null);
console.log('User id:', user?.id);
console.log('User name:', user?.name);
console.log('User balance:', user?.balance);

// Check if depositContent element exists
const depositContent = document.getElementById('depositContent');
console.log('depositContent element:', depositContent);
console.log('depositContent innerHTML:', depositContent?.innerHTML?.substring(0, 100));

// Manual test - Force show deposit UI if user exists
if (user) {
    console.log('✅ User exists but not showing deposit UI');
    console.log('This means the JavaScript is not detecting the user correctly');
} else {
    console.log('❌ User is NULL - Need to login again');
}