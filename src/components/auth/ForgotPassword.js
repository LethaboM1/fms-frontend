import React, { useState } from 'react';

const ForgotPassword = ({ onShowLogin }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Simple validation
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // In a real app, you would send a reset email here
    // For now, just show a success message
    setMessage('Password reset instructions have been sent to your email.');
    setEmail('');
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '50px auto', 
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Reset Password</h2>
      <p style={{ textAlign: 'center', color: '#7c7b7b', marginBottom: '20px' }}>
        Enter your email to receive reset instructions
      </p>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffe6e6',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{ 
          color: 'green', 
          backgroundColor: '#e6ffe6',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '15px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Address:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            placeholder="Enter your email"
          />
        </div>
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '12px',
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Send Reset Instructions
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onShowLogin && onShowLogin();
          }}
          style={{ color: '#111111ff', textDecoration: 'none' }}
        >
          Back to Login
        </a>
      </p>
    </div>
  );
};

export default ForgotPassword;