const API_BASE_URL = 'http://fms.hillary.local:5131';
const API_URL = `${API_BASE_URL}/api`;

console.log('API Base URL:', API_BASE_URL);

const originalParse = JSON.parse;
JSON.parse = function(text, reviver) {
  if (text === "undefined" || text === undefined) {
    console.error('Attempted to parse undefined as JSON:', new Error().stack);
    return undefined;
  }
  return originalParse.call(this, text, reviver);
};

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, method = 'GET', data = null) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config = {
      method,
      headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, config);
      
      if (!response.ok) {
        // First, try to get the response as text
        const responseText = await response.text();
        console.log('Error response text:', responseText);
        
        // Try to parse as JSON, but handle the case where it's not valid JSON
        try {
          if (responseText && responseText.trim()) {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
          } else {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
        } catch (parseError) {
          // If not valid JSON, use the text or a generic error
          throw new Error(responseText || `API Error: ${response.status} ${response.statusText}`);
        }
      }

      // For successful responses, check if there's content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Return text or null for non-JSON responses
        const text = await response.text();
        return text || null;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods using employee number
  async register(userData) {
    return this.request('auth/register', 'POST', userData);
  }

  async login(employeeNumber, password) {
    console.log('API Service - Login called with:', { employeeNumber });
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeNumber, 
          password 
        }),
      });

      console.log('API Response status:', response.status);
      
      // Get the response as text first
      const responseText = await response.text();
      console.log('API Response text:', responseText);
      
      if (!response.ok) {
        // Try to parse error as JSON
        try {
          if (responseText && responseText.trim()) {
            const errorData = JSON.parse(responseText);
            throw new Error(errorData.message || 'Login failed');
          } else {
            throw new Error(`Login failed: ${response.status} ${response.statusText}`);
          }
        } catch {
          throw new Error(responseText || `Login failed: ${response.status} ${response.statusText}`);
        }
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse login response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      console.log('API Success response:', data);
      
      if (data.token) {
        this.setToken(data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async forgotPassword(employeeNumber) {
    return this.request('auth/forgot-password', 'POST', { 
      employeeNumber 
    });
  }

  async resetPassword(token, newPassword, confirmPassword) {
    return this.request('auth/reset-password', 'POST', { 
      token, 
      newPassword, 
      confirmPassword 
    });
  }

  async changePassword(employeeNumber, currentPassword, newPassword) {
    return this.request('auth/change-password', 'POST', {
      employeeNumber,
      currentPassword,
      newPassword
    });
  }

  async checkEmployeeNumber(employeeNumber) {
    return this.request(`auth/check-employee/${employeeNumber}`);
  }

  async logout() {
    this.clearToken();
    return Promise.resolve();
  }

  // ... other methods remain the same
}

const apiService = new ApiService();
export default apiService;