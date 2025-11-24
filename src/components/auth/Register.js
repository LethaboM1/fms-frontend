import React, { useState } from 'react';

const Register = ({ onRegister, onShowLogin }) => {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'driver'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Validate required fields
      if (!formData.employeeNumber.trim()) {
        setError('Employee number is required');
        return;
      }

      // Validate employee number contains only numbers
      if (!/^\d+$/.test(formData.employeeNumber)) {
        setError('Employee number must contain only numbers');
        return;
      }

      if (formData.employeeNumber.length < 3) {
        setError('Employee number must be at least 3 digits long');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return;
      }

      // Check if user already exists with the same employee number
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(user => 
        user.employeeNumber === formData.employeeNumber
      );
      
      if (existingUser) {
        setError('Employee number already registered');
        return;
      }

      // Create user object
      const user = {
        id: Date.now(),
        employeeNumber: formData.employeeNumber,
        password: formData.password, // In real app, this should be hashed
        fullName: formData.fullName,
        role: formData.role,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));

      // REMOVED: onRegister(user) call - we don't want to auto-login
      // Only show success message and navigate to login

      setSuccess('Registration successful! Redirecting to login...');
      
      // Reset form
      setFormData({
        employeeNumber: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'driver'
      });

      // Automatically navigate to login after 2 seconds
      setTimeout(() => {
        if (onShowLogin) {
          onShowLogin();
        }
      }, 2000);

    } catch (err) {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (onShowLogin) {
      onShowLogin();
    }
  };

  // Handle key press to prevent non-numeric input
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
                width: '195%',
                height: '205%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
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

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#efe',
            color: '#363',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            border: '1px solid #cfc'
          }}>
            {success}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Enter your full name"
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
                e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

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
              placeholder="Enter your employee number (numbers only)"
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
                e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Enter your password (min. 6 characters)"
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
                e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              placeholder="Confirm your password"
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
                e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#28a745';
                e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="clerk_attendant">Clerk/Attendant</option>
              <option value="manager">Manager</option>
              <option value="driver">Driver</option>
               <option value="service_truck_driver">Service Truck Driver</option>
              <option value="external_attendant">External Attendant</option>
            </select>
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
              <span>Creating Account...</span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Login Link */}
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
            Already have an account?{' '}
            <a
              href="#"
              onClick={handleLogin}
              style={{
                color: '#28a745',
                textDecoration: 'none',
                fontWeight: '600'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;