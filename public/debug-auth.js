// Debug script - Add to browser console to check authentication
console.log('=== AUTH DEBUG ===');
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('Parsed User:', JSON.parse(localStorage.getItem('user') || 'null'));
console.log('API_BASE should be:', window.location.origin + '/api');

// Test API call
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (user) {
    console.log('User ID:', user.id);
    console.log('Username:', user.username || user.name);
    
    // Test orders API
    fetch(`${window.location.origin}/api/orders?user_id=${user.id}`)
        .then(res => res.json())
        .then(data => console.log('Orders API response:', data))
        .catch(err => console.error('Orders API error:', err));
} else {
    console.log('NO USER FOUND - Please login again');
}
