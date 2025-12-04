// import React, { useState, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import './Auth.css';

// const ResetPassword = ({ onShowLogin }) => {
//   const [searchParams] = useSearchParams();
//   const [formData, setFormData] = useState({
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [token, setToken] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const urlToken = searchParams.get('token');
//     if (urlToken) {
//       setToken(urlToken);
//     }
//   }, [searchParams]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     if (formData.newPassword !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     if (formData.newPassword.length < 6) {
//       setError('Password must be at least 6 characters long');
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch('/api/auth/reset-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           token: token,
//           newPassword: formData.newPassword,
//           confirmPassword: formData.confirmPassword
//         }),
//       });

//       if (response.ok) {
//         setMessage('Password has been reset successfully! You can now login with your new password.');
//         setFormData({ newPassword: '', confirmPassword: '' });
        
//         // Redirect to login after 3 seconds
//         setTimeout(() => {
//           onShowLogin();
//         }, 3000);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || 'Error resetting password');
//       }
//     } catch (error) {
//       setError('Network error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <div className="auth-container">
//         <div className="auth-card">
//           <div className="alert alert-error">
//             Invalid or missing reset token. Please check your email link.
//           </div>
//           <div className="auth-footer">
//             <a href="#" onClick={onShowLogin}>Back to Login</a>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <h2>Set New Password</h2>
//           <p>Enter your new password below</p>
//         </div>

//         {error && (
//           <div className="alert alert-error">
//             {error}
//           </div>
//         )}

//         {message && (
//           <div className="alert alert-success">
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>New Password:</label>
//             <input
//               type="password"
//               name="newPassword"
//               value={formData.newPassword}
//               onChange={handleChange}
//               required
//               disabled={loading}
//               minLength="6"
//             />
//           </div>
//           <div className="form-group">
//             <label>Confirm New Password:</label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               disabled={loading}
//               minLength="6"
//             />
//           </div>
          
//           <button 
//             type="submit" 
//             className="btn-primary"
//             disabled={loading}
//           >
//             {loading ? 'Resetting Password...' : 'Reset Password'}
//           </button>
//         </form>

//         <div className="auth-footer">
//           <p>
//             <a href="#" onClick={onShowLogin}>
//               Back to Login
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiService from '../services/api'; // Import your API service
import './Auth.css';

const ResetPassword = ({ onShowLogin }) => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Using apiService
      const data = await apiService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      
      setMessage(data.message || 'Password has been reset successfully! You can now login with your new password.');
      setFormData({ newPassword: '', confirmPassword: '' });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        if (onShowLogin) {
          onShowLogin();
        }
      }, 3000);
    } catch (err) {
      setError(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="alert alert-error">
            Invalid or missing reset token. Please check your email link.
          </div>
          <div className="auth-footer">
            <a href="#" onClick={onShowLogin}>Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Set New Password</h2>
          <p>Enter your new password below</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
              placeholder="Enter new password (min. 6 characters)"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength="6"
              placeholder="Confirm new password"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <a href="#" onClick={onShowLogin}>
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;