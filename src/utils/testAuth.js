import { STORAGE_KEYS } from './constants.js';

export const testAuthentication = () => {
  console.log('=== AUTHENTICATION TEST ===');
  
  // Check localStorage
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  
  console.log('Token from localStorage:', token);
  console.log('User from localStorage:', user);
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('Parsed user:', parsedUser);
      console.log('User role:', parsedUser.role);
      console.log('Is admin?', parsedUser.role === 'admin');
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
  
  // Test API call with current token
  if (token) {
    console.log('Testing API call with current token...');
    
    fetch('http://localhost:5003/shop', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('API test response status:', response.status);
      console.log('API test response headers:', response.headers);
      return response.json();
    })
    .then(data => {
      console.log('API test response data:', data);
    })
    .catch(error => {
      console.error('API test error:', error);
    });
  } else {
    console.log('No token found - user not authenticated');
  }
};

// Add to window for easy testing
if (typeof window !== 'undefined') {
  window.testAuth = testAuthentication;
}
