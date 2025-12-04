import React, { useState } from 'react';
import apiService from '../../services/api';

const Login = ({ onLogin, onShowRegister, onShowForgotPassword }) => {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for employee number - only allow numbers
    if (name === 'employeeNumber') {
      // Remove any non-numeric characters
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData({
        ...formData,
        [name]: numericValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login with:', {
        employeeNumber: formData.employeeNumber,
        password: '***' // Don't log actual password
      });
      
      const data = await apiService.login(
        formData.employeeNumber, 
        formData.password
      );
      
      console.log('API Response:', data);
      console.log('Data.User:', data.User);
      console.log('Data.user:', data.user);
      console.log('Full response structure:', JSON.stringify(data, null, 2));
      
      // Check different possible structures
      const user = data.User || data.user || data;
      console.log('Extracted user:', user);
      
      if (user) {
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        console.log('User stored in localStorage:', user);
        
        // Navigate to dashboard
        if (onLogin) {
          onLogin(user);
        }
      } else {
        throw new Error('No user data returned from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press to prevent non-numeric input for employee number
  const handleKeyPress = (e) => {
    if (e.target.name === 'employeeNumber') {
      // Allow only numbers and control keys
      if (!/[0-9]/.test(e.key) && 
          e.key !== 'Backspace' && 
          e.key !== 'Delete' && 
          e.key !== 'Tab' && 
          e.key !== 'Enter' && 
          e.key !== 'ArrowLeft' && 
          e.key !== 'ArrowRight' &&
          e.key !== 'Home' &&
          e.key !== 'End') {
        e.preventDefault();
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (onShowForgotPassword) {
      onShowForgotPassword();
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (onShowRegister) {
      onShowRegister();
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e1e5e9'
      }}>
        {/* Header Section with Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '200px',
            height: '110px',
            borderRadius: '70%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}>
            <img 
              src="/fuel2.jpg" 
              alt="FMS Logo"
              style={{
                width: '205%',
                height: '205%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Employee Number
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              required
              disabled={isLoading}
              placeholder="Enter your employee number"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#28a745';
                e.target.style.boxShadow = '0 0 0 2px rgba(163, 177, 166, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Password
              </label>
              <a
                href="#"
                onClick={handleForgotPassword}
                style={{
                  color: '#28a745',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '500',
                  textAlign: 'right'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot password
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 46px 12px 16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#28a745';
                  e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ddd';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {/* Eye Icon */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#28a745'}
                onMouseOut={(e) => e.target.style.color = '#666'}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '24px'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#218838';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#28a745';
              }
            }}
          >
            {isLoading ? (
              <span>Signing In...</span>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e1e5e9'
        }}>
          <p style={{
            margin: '0',
            color: '#666',
            fontSize: '14px'
          }}>
            Don't have an account?{' '}
            <a
              href="#"
              onClick={handleRegister}
              style={{
                color: '#28a745',
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;