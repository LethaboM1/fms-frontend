// // // import React, { useState } from 'react';

// // // const Register = ({ onRegister, onShowLogin }) => {
// // //   const [formData, setFormData] = useState({
// // //     employeeNumber: '',
// // //     password: '',
// // //     confirmPassword: '',
// // //     fullName: '',
// // //     role: 'driver'
// // //   });
// // //   const [error, setError] = useState('');
// // //   const [success, setSuccess] = useState('');
// // //   const [isLoading, setIsLoading] = useState(false);

// // //   const handleChange = (e) => {
// // //     const { name, value } = e.target;
    
// // //     // Special handling for employee number - only allow numbers
// // //     if (name === 'employeeNumber') {
// // //       // Remove any non-numeric characters
// // //       const numericValue = value.replace(/[^0-9]/g, '');
// // //       setFormData({
// // //         ...formData,
// // //         [name]: numericValue
// // //       });
// // //     } else {
// // //       setFormData({
// // //         ...formData,
// // //         [name]: value
// // //       });
// // //     }
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setError('');
// // //     setSuccess('');
// // //     setIsLoading(true);

// // //     try {
// // //       // Simulate API call delay
// // //       await new Promise(resolve => setTimeout(resolve, 1000));

// // //       // Validate required fields
// // //       if (!formData.employeeNumber.trim()) {
// // //         setError('Employee number is required');
// // //         return;
// // //       }

// // //       // Validate employee number contains only numbers
// // //       if (!/^\d+$/.test(formData.employeeNumber)) {
// // //         setError('Employee number must contain only numbers');
// // //         return;
// // //       }

// // //       if (formData.employeeNumber.length < 3) {
// // //         setError('Employee number must be at least 3 digits long');
// // //         return;
// // //       }

// // //       if (formData.password !== formData.confirmPassword) {
// // //         setError('Passwords do not match');
// // //         return;
// // //       }

// // //       if (formData.password.length < 6) {
// // //         setError('Password must be at least 6 characters long');
// // //         return;
// // //       }

// // //       if (!formData.fullName.trim()) {
// // //         setError('Full name is required');
// // //         return;
// // //       }

// // //       // Check if user already exists with the same employee number
// // //       const users = JSON.parse(localStorage.getItem('users') || '[]');
// // //       const existingUser = users.find(user => 
// // //         user.employeeNumber === formData.employeeNumber
// // //       );
      
// // //       if (existingUser) {
// // //         setError('Employee number already registered');
// // //         return;
// // //       }

// // //       // Create user object
// // //       const user = {
// // //         id: Date.now(),
// // //         employeeNumber: formData.employeeNumber,
// // //         password: formData.password, // In real app, this should be hashed
// // //         fullName: formData.fullName,
// // //         role: formData.role,
// // //         createdAt: new Date().toISOString()
// // //       };

// // //       // Save to localStorage
// // //       users.push(user);
// // //       localStorage.setItem('users', JSON.stringify(users));

// // //       // REMOVED: onRegister(user) call - we don't want to auto-login
// // //       // Only show success message and navigate to login

// // //       setSuccess('Registration successful! Redirecting to login...');
      
// // //       // Reset form
// // //       setFormData({
// // //         employeeNumber: '',
// // //         password: '',
// // //         confirmPassword: '',
// // //         fullName: '',
// // //         role: 'driver'
// // //       });

// // //       // Automatically navigate to login after 2 seconds
// // //       setTimeout(() => {
// // //         if (onShowLogin) {
// // //           onShowLogin();
// // //         }
// // //       }, 2000);

// // //     } catch (err) {
// // //       setError('An error occurred during registration. Please try again.');
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const handleLogin = (e) => {
// // //     e.preventDefault();
// // //     if (onShowLogin) {
// // //       onShowLogin();
// // //     }
// // //   };

// // //   // Handle key press to prevent non-numeric input
// // //   const handleKeyPress = (e) => {
// // //     if (e.target.name === 'employeeNumber') {
// // //       // Allow only numbers and control keys
// // //       if (!/[0-9]/.test(e.key) && 
// // //           e.key !== 'Backspace' && 
// // //           e.key !== 'Delete' && 
// // //           e.key !== 'Tab' && 
// // //           e.key !== 'Enter' && 
// // //           e.key !== 'ArrowLeft' && 
// // //           e.key !== 'ArrowRight' &&
// // //           e.key !== 'Home' &&
// // //           e.key !== 'End') {
// // //         e.preventDefault();
// // //       }
// // //     }
// // //   };

// // //   return (
// // //     <div style={{
// // //       display: 'flex',
// // //       justifyContent: 'center',
// // //       alignItems: 'center',
// // //       minHeight: '100vh',
// // //       backgroundColor: '#f5f5f5',
// // //       padding: '20px',
// // //       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
// // //     }}>
// // //       <div style={{
// // //         width: '100%',
// // //         maxWidth: '420px',
// // //         padding: '40px 30px',
// // //         backgroundColor: 'white',
// // //         borderRadius: '12px',
// // //         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
// // //         border: '1px solid #e1e5e9'
// // //       }}>
// // //         {/* Header Section with Logo */}
// // //         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
// // //           <div style={{
// // //             width: '200px',
// // //             height: '110px',
// // //             borderRadius: '70%',
// // //             display: 'flex',
// // //             alignItems: 'center',
// // //             justifyContent: 'center',
// // //             margin: '0 auto 16px',
// // //             overflow: 'hidden',
// // //             backgroundColor: 'white'
// // //           }}>
// // //             <img 
// // //               src="/fuel2.jpg" 
// // //               alt="FMS Logo"
// // //               style={{
// // //                 width: '195%',
// // //                 height: '205%',
// // //                 objectFit: 'cover',
// // //                 borderRadius: '50%'
// // //               }}
// // //               onError={(e) => {
// // //                 // Fallback if image doesn't load
// // //                 e.target.style.display = 'none';
// // //                 e.target.nextSibling.style.display = 'flex';
// // //               }}
// // //             />
// // //           </div>
// // //         </div>

// // //         {/* Error Message */}
// // //         {error && (
// // //           <div style={{
// // //             backgroundColor: '#fee',
// // //             color: '#c33',
// // //             padding: '12px 16px',
// // //             borderRadius: '8px',
// // //             marginBottom: '20px',
// // //             fontSize: '14px',
// // //             border: '1px solid #fcc'
// // //           }}>
// // //             {error}
// // //           </div>
// // //         )}

// // //         {/* Success Message */}
// // //         {success && (
// // //           <div style={{
// // //             backgroundColor: '#efe',
// // //             color: '#363',
// // //             padding: '12px 16px',
// // //             borderRadius: '8px',
// // //             marginBottom: '20px',
// // //             fontSize: '14px',
// // //             border: '1px solid #cfc'
// // //           }}>
// // //             {success}
// // //           </div>
// // //         )}

// // //         {/* Registration Form */}
// // //         <form onSubmit={handleSubmit}>
// // //           <div style={{ marginBottom: '20px' }}>
// // //             <label style={{
// // //               display: 'block',
// // //               marginBottom: '8px',
// // //               fontSize: '14px',
// // //               fontWeight: '500',
// // //               color: '#333'
// // //             }}>
// // //               Full Name
// // //             </label>
// // //             <input
// // //               type="text"
// // //               name="fullName"
// // //               value={formData.fullName}
// // //               onChange={handleChange}
// // //               required
// // //               disabled={isLoading}
// // //               placeholder="Enter your full name"
// // //               style={{
// // //                 width: '100%',
// // //                 padding: '12px 16px',
// // //                 border: '1px solid #ddd',
// // //                 borderRadius: '8px',
// // //                 fontSize: '14px',
// // //                 transition: 'all 0.2s',
// // //                 boxSizing: 'border-box'
// // //               }}
// // //               onFocus={(e) => {
// // //                 e.target.style.borderColor = '#28a745';
// // //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// // //               }}
// // //               onBlur={(e) => {
// // //                 e.target.style.borderColor = '#ddd';
// // //                 e.target.style.boxShadow = 'none';
// // //               }}
// // //             />
// // //           </div>

// // //           <div style={{ marginBottom: '20px' }}>
// // //             <label style={{
// // //               display: 'block',
// // //               marginBottom: '8px',
// // //               fontSize: '14px',
// // //               fontWeight: '500',
// // //               color: '#333'
// // //             }}>
// // //               Employee Number
// // //             </label>
// // //             <input
// // //               type="text"
// // //               inputMode="numeric"
// // //               pattern="[0-9]*"
// // //               name="employeeNumber"
// // //               value={formData.employeeNumber}
// // //               onChange={handleChange}
// // //               onKeyPress={handleKeyPress}
// // //               required
// // //               disabled={isLoading}
// // //               placeholder="Enter your employee number (numbers only)"
// // //               style={{
// // //                 width: '100%',
// // //                 padding: '12px 16px',
// // //                 border: '1px solid #ddd',
// // //                 borderRadius: '8px',
// // //                 fontSize: '14px',
// // //                 transition: 'all 0.2s',
// // //                 boxSizing: 'border-box'
// // //               }}
// // //               onFocus={(e) => {
// // //                 e.target.style.borderColor = '#28a745';
// // //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// // //               }}
// // //               onBlur={(e) => {
// // //                 e.target.style.borderColor = '#ddd';
// // //                 e.target.style.boxShadow = 'none';
// // //               }}
// // //             />
// // //           </div>

// // //           <div style={{ marginBottom: '20px' }}>
// // //             <label style={{
// // //               display: 'block',
// // //               marginBottom: '8px',
// // //               fontSize: '14px',
// // //               fontWeight: '500',
// // //               color: '#333'
// // //             }}>
// // //               Password
// // //             </label>
// // //             <input
// // //               type="password"
// // //               name="password"
// // //               value={formData.password}
// // //               onChange={handleChange}
// // //               required
// // //               disabled={isLoading}
// // //               placeholder="Enter your password (min. 6 characters)"
// // //               style={{
// // //                 width: '100%',
// // //                 padding: '12px 16px',
// // //                 border: '1px solid #ddd',
// // //                 borderRadius: '8px',
// // //                 fontSize: '14px',
// // //                 transition: 'all 0.2s',
// // //                 boxSizing: 'border-box'
// // //               }}
// // //               onFocus={(e) => {
// // //                 e.target.style.borderColor = '#28a745';
// // //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// // //               }}
// // //               onBlur={(e) => {
// // //                 e.target.style.borderColor = '#ddd';
// // //                 e.target.style.boxShadow = 'none';
// // //               }}
// // //             />
// // //           </div>

// // //           <div style={{ marginBottom: '20px' }}>
// // //             <label style={{
// // //               display: 'block',
// // //               marginBottom: '8px',
// // //               fontSize: '14px',
// // //               fontWeight: '500',
// // //               color: '#333'
// // //             }}>
// // //               Confirm Password
// // //             </label>
// // //             <input
// // //               type="password"
// // //               name="confirmPassword"
// // //               value={formData.confirmPassword}
// // //               onChange={handleChange}
// // //               required
// // //               disabled={isLoading}
// // //               placeholder="Confirm your password"
// // //               style={{
// // //                 width: '100%',
// // //                 padding: '12px 16px',
// // //                 border: '1px solid #ddd',
// // //                 borderRadius: '8px',
// // //                 fontSize: '14px',
// // //                 transition: 'all 0.2s',
// // //                 boxSizing: 'border-box'
// // //               }}
// // //               onFocus={(e) => {
// // //                 e.target.style.borderColor = '#28a745';
// // //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// // //               }}
// // //               onBlur={(e) => {
// // //                 e.target.style.borderColor = '#ddd';
// // //                 e.target.style.boxShadow = 'none';
// // //               }}
// // //             />
// // //           </div>

// // //           <div style={{ marginBottom: '24px' }}>
// // //             <label style={{
// // //               display: 'block',
// // //               marginBottom: '8px',
// // //               fontSize: '14px',
// // //               fontWeight: '500',
// // //               color: '#333'
// // //             }}>
// // //               Role
// // //             </label>
// // //             <select
// // //               name="role"
// // //               value={formData.role}
// // //               onChange={handleChange}
// // //               disabled={isLoading}
// // //               style={{
// // //                 width: '100%',
// // //                 padding: '12px 16px',
// // //                 border: '1px solid #ddd',
// // //                 borderRadius: '8px',
// // //                 fontSize: '14px',
// // //                 transition: 'all 0.2s',
// // //                 boxSizing: 'border-box',
// // //                 backgroundColor: 'white',
// // //                 cursor: 'pointer'
// // //               }}
// // //               onFocus={(e) => {
// // //                 e.target.style.borderColor = '#28a745';
// // //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// // //               }}
// // //               onBlur={(e) => {
// // //                 e.target.style.borderColor = '#ddd';
// // //                 e.target.style.boxShadow = 'none';
// // //               }}
// // //             >
// // //               <option value="clerk_attendant">Clerk/Attendant</option>
// // //               <option value="manager">Manager</option>
// // //               <option value="driver">Driver</option>
// // //                <option value="service_truck_driver">Service Truck Driver</option>
// // //               <option value="external_attendant">External Attendant</option>
// // //             </select>
// // //           </div>

// // //           <button
// // //             type="submit"
// // //             disabled={isLoading}
// // //             style={{
// // //               width: '100%',
// // //               padding: '14px',
// // //               backgroundColor: isLoading ? '#ccc' : '#28a745',
// // //               color: 'white',
// // //               border: 'none',
// // //               borderRadius: '8px',
// // //               fontSize: '15px',
// // //               fontWeight: '600',
// // //               cursor: isLoading ? 'not-allowed' : 'pointer',
// // //               transition: 'all 0.2s',
// // //               marginBottom: '24px'
// // //             }}
// // //             onMouseOver={(e) => {
// // //               if (!isLoading) {
// // //                 e.target.style.backgroundColor = '#218838';
// // //               }
// // //             }}
// // //             onMouseOut={(e) => {
// // //               if (!isLoading) {
// // //                 e.target.style.backgroundColor = '#28a745';
// // //               }
// // //             }}
// // //           >
// // //             {isLoading ? (
// // //               <span>Creating Account...</span>
// // //             ) : (
// // //               <span>Create Account</span>
// // //             )}
// // //           </button>
// // //         </form>

// // //         {/* Login Link */}
// // //         <div style={{
// // //           textAlign: 'center',
// // //           paddingTop: '20px',
// // //           borderTop: '1px solid #e1e5e9'
// // //         }}>
// // //           <p style={{
// // //             margin: '0',
// // //             color: '#666',
// // //             fontSize: '14px'
// // //           }}>
// // //             Already have an account?{' '}
// // //             <a
// // //               href="#"
// // //               onClick={handleLogin}
// // //               style={{
// // //                 color: '#28a745',
// // //                 textDecoration: 'none',
// // //                 fontWeight: '600'
// // //               }}
// // //               onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
// // //               onMouseOut={(e) => e.target.style.textDecoration = 'none'}
// // //             >
// // //               Login here
// // //             </a>
// // //           </p>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Register;

// // import React, { useState } from 'react';
// // import apiService from '../../services/api';

// // const Register = ({ onRegister, onShowLogin }) => {
// //   const [formData, setFormData] = useState({
// //     employeeNumber: '',
// //     password: '',
// //     confirmPassword: '',
// //     fullName: '',
// //     role: 'driver'
// //   });
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [isLoading, setIsLoading] = useState(false);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
    
// //     // Special handling for employee number - only allow numbers
// //     if (name === 'employeeNumber') {
// //       // Remove any non-numeric characters
// //       const numericValue = value.replace(/[^0-9]/g, '');
// //       setFormData({
// //         ...formData,
// //         [name]: numericValue
// //       });
// //     } else {
// //       setFormData({
// //         ...formData,
// //         [name]: value
// //       });
// //     }
// //   };

 
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError('');
// //     setSuccess('');
// //     setIsLoading(true);

// //      try {
// //     const data = await apiService.register({
// //       employeeNumber: formData.employeeNumber,
// //       password: formData.password,
// //       fullName: formData.fullName,
// //       role: formData.role,
// //       email: `${formData.employeeNumber}@gmail.com`, 
// //       station: formData.station || 'Main Station' 
// //     });

// //       setSuccess('Registration successful! Redirecting to login...');
      
// //       // Reset form
// //       setFormData({
// //         employeeNumber: '',
// //         password: '',
// //         confirmPassword: '',
// //         fullName: '',
// //         role: 'driver'
// //       });

// //       // Redirect to login after 2 seconds
// //       setTimeout(() => {
// //         if (onShowLogin) {
// //           onShowLogin();
// //         }
// //       }, 2000);

// //     } catch (err) {
// //       setError(err.message || 'An error occurred during registration.');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };
// //   const handleLogin = (e) => {
// //     e.preventDefault();
// //     if (onShowLogin) {
// //       onShowLogin();
// //     }
// //   };

// //   // Handle key press to prevent non-numeric input
// //   const handleKeyPress = (e) => {
// //     if (e.target.name === 'employeeNumber') {
// //       // Allow only numbers and control keys
// //       if (!/[0-9]/.test(e.key) && 
// //           e.key !== 'Backspace' && 
// //           e.key !== 'Delete' && 
// //           e.key !== 'Tab' && 
// //           e.key !== 'Enter' && 
// //           e.key !== 'ArrowLeft' && 
// //           e.key !== 'ArrowRight' &&
// //           e.key !== 'Home' &&
// //           e.key !== 'End') {
// //         e.preventDefault();
// //       }
// //     }
// //   };

// //   return (
// //     <div style={{
// //       display: 'flex',
// //       justifyContent: 'center',
// //       alignItems: 'center',
// //       minHeight: '100vh',
// //       backgroundColor: '#f5f5f5',
// //       padding: '20px',
// //       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
// //     }}>
// //       <div style={{
// //         width: '100%',
// //         maxWidth: '420px',
// //         padding: '40px 30px',
// //         backgroundColor: 'white',
// //         borderRadius: '12px',
// //         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
// //         border: '1px solid #e1e5e9'
// //       }}>
// //         {/* Header Section with Logo */}
// //         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
// //           <div style={{
// //             width: '200px',
// //             height: '110px',
// //             borderRadius: '70%',
// //             display: 'flex',
// //             alignItems: 'center',
// //             justifyContent: 'center',
// //             margin: '0 auto 16px',
// //             overflow: 'hidden',
// //             backgroundColor: 'white'
// //           }}>
// //             <img 
// //               src="/fuel2.jpg" 
// //               alt="FMS Logo"
// //               style={{
// //                 width: '195%',
// //                 height: '205%',
// //                 objectFit: 'cover',
// //                 borderRadius: '50%'
// //               }}
// //               onError={(e) => {
// //                 // Fallback if image doesn't load
// //                 e.target.style.display = 'none';
// //                 e.target.nextSibling.style.display = 'flex';
// //               }}
// //             />
// //           </div>
// //         </div>

// //         {/* Error Message */}
// //         {error && (
// //           <div style={{
// //             backgroundColor: '#fee',
// //             color: '#c33',
// //             padding: '12px 16px',
// //             borderRadius: '8px',
// //             marginBottom: '20px',
// //             fontSize: '14px',
// //             border: '1px solid #fcc'
// //           }}>
// //             {error}
// //           </div>
// //         )}

// //         {/* Success Message */}
// //         {success && (
// //           <div style={{
// //             backgroundColor: '#efe',
// //             color: '#363',
// //             padding: '12px 16px',
// //             borderRadius: '8px',
// //             marginBottom: '20px',
// //             fontSize: '14px',
// //             border: '1px solid #cfc'
// //           }}>
// //             {success}
// //           </div>
// //         )}

// //         {/* Registration Form */}
// //         <form onSubmit={handleSubmit}>
// //           <div style={{ marginBottom: '20px' }}>
// //             <label style={{
// //               display: 'block',
// //               marginBottom: '8px',
// //               fontSize: '14px',
// //               fontWeight: '500',
// //               color: '#333'
// //             }}>
// //               Full Name
// //             </label>
// //             <input
// //               type="text"
// //               name="fullName"
// //               value={formData.fullName}
// //               onChange={handleChange}
// //               required
// //               disabled={isLoading}
// //               placeholder="Enter your full name"
// //               style={{
// //                 width: '100%',
// //                 padding: '12px 16px',
// //                 border: '1px solid #ddd',
// //                 borderRadius: '8px',
// //                 fontSize: '14px',
// //                 transition: 'all 0.2s',
// //                 boxSizing: 'border-box'
// //               }}
// //               onFocus={(e) => {
// //                 e.target.style.borderColor = '#28a745';
// //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// //               }}
// //               onBlur={(e) => {
// //                 e.target.style.borderColor = '#ddd';
// //                 e.target.style.boxShadow = 'none';
// //               }}
// //             />
// //           </div>

// //           <div style={{ marginBottom: '20px' }}>
// //             <label style={{
// //               display: 'block',
// //               marginBottom: '8px',
// //               fontSize: '14px',
// //               fontWeight: '500',
// //               color: '#333'
// //             }}>
// //               Employee Number
// //             </label>
// //             <input
// //               type="text"
// //               inputMode="numeric"
// //               pattern="[0-9]*"
// //               name="employeeNumber"
// //               value={formData.employeeNumber}
// //               onChange={handleChange}
// //               onKeyPress={handleKeyPress}
// //               required
// //               disabled={isLoading}
// //               placeholder="Enter your employee number (numbers only)"
// //               style={{
// //                 width: '100%',
// //                 padding: '12px 16px',
// //                 border: '1px solid #ddd',
// //                 borderRadius: '8px',
// //                 fontSize: '14px',
// //                 transition: 'all 0.2s',
// //                 boxSizing: 'border-box'
// //               }}
// //               onFocus={(e) => {
// //                 e.target.style.borderColor = '#28a745';
// //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// //               }}
// //               onBlur={(e) => {
// //                 e.target.style.borderColor = '#ddd';
// //                 e.target.style.boxShadow = 'none';
// //               }}
// //             />
// //           </div>

// //           <div style={{ marginBottom: '20px' }}>
// //             <label style={{
// //               display: 'block',
// //               marginBottom: '8px',
// //               fontSize: '14px',
// //               fontWeight: '500',
// //               color: '#333'
// //             }}>
// //               Password
// //             </label>
// //             <input
// //               type="password"
// //               name="password"
// //               value={formData.password}
// //               onChange={handleChange}
// //               required
// //               disabled={isLoading}
// //               placeholder="Enter your password (min. 6 characters)"
// //               style={{
// //                 width: '100%',
// //                 padding: '12px 16px',
// //                 border: '1px solid #ddd',
// //                 borderRadius: '8px',
// //                 fontSize: '14px',
// //                 transition: 'all 0.2s',
// //                 boxSizing: 'border-box'
// //               }}
// //               onFocus={(e) => {
// //                 e.target.style.borderColor = '#28a745';
// //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// //               }}
// //               onBlur={(e) => {
// //                 e.target.style.borderColor = '#ddd';
// //                 e.target.style.boxShadow = 'none';
// //               }}
// //             />
// //           </div>

// //           <div style={{ marginBottom: '20px' }}>
// //             <label style={{
// //               display: 'block',
// //               marginBottom: '8px',
// //               fontSize: '14px',
// //               fontWeight: '500',
// //               color: '#333'
// //             }}>
// //               Confirm Password
// //             </label>
// //             <input
// //               type="password"
// //               name="confirmPassword"
// //               value={formData.confirmPassword}
// //               onChange={handleChange}
// //               required
// //               disabled={isLoading}
// //               placeholder="Confirm your password"
// //               style={{
// //                 width: '100%',
// //                 padding: '12px 16px',
// //                 border: '1px solid #ddd',
// //                 borderRadius: '8px',
// //                 fontSize: '14px',
// //                 transition: 'all 0.2s',
// //                 boxSizing: 'border-box'
// //               }}
// //               onFocus={(e) => {
// //                 e.target.style.borderColor = '#28a745';
// //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// //               }}
// //               onBlur={(e) => {
// //                 e.target.style.borderColor = '#ddd';
// //                 e.target.style.boxShadow = 'none';
// //               }}
// //             />
// //           </div>

// //           <div style={{ marginBottom: '24px' }}>
// //             <label style={{
// //               display: 'block',
// //               marginBottom: '8px',
// //               fontSize: '14px',
// //               fontWeight: '500',
// //               color: '#333'
// //             }}>
// //               Role
// //             </label>
// //             <select
// //               name="role"
// //               value={formData.role}
// //               onChange={handleChange}
// //               disabled={isLoading}
// //               style={{
// //                 width: '100%',
// //                 padding: '12px 16px',
// //                 border: '1px solid #ddd',
// //                 borderRadius: '8px',
// //                 fontSize: '14px',
// //                 transition: 'all 0.2s',
// //                 boxSizing: 'border-box',
// //                 backgroundColor: 'white',
// //                 cursor: 'pointer'
// //               }}
// //               onFocus={(e) => {
// //                 e.target.style.borderColor = '#28a745';
// //                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
// //               }}
// //               onBlur={(e) => {
// //                 e.target.style.borderColor = '#ddd';
// //                 e.target.style.boxShadow = 'none';
// //               }}
// //             >
// //               <option value="clerk_attendant">Clerk/Attendant</option>
// //               <option value="manager">Manager</option>
// //               <option value="driver">Driver</option>
// //                <option value="service_truck_driver">Service Truck Driver</option>
// //               <option value="external_attendant">External Attendant</option>
// //             </select>
// //           </div>

// //           <button
// //             type="submit"
// //             disabled={isLoading}
// //             style={{
// //               width: '100%',
// //               padding: '14px',
// //               backgroundColor: isLoading ? '#ccc' : '#28a745',
// //               color: 'white',
// //               border: 'none',
// //               borderRadius: '8px',
// //               fontSize: '15px',
// //               fontWeight: '600',
// //               cursor: isLoading ? 'not-allowed' : 'pointer',
// //               transition: 'all 0.2s',
// //               marginBottom: '24px'
// //             }}
// //             onMouseOver={(e) => {
// //               if (!isLoading) {
// //                 e.target.style.backgroundColor = '#218838';
// //               }
// //             }}
// //             onMouseOut={(e) => {
// //               if (!isLoading) {
// //                 e.target.style.backgroundColor = '#28a745';
// //               }
// //             }}
// //           >
// //             {isLoading ? (
// //               <span>Creating Account...</span>
// //             ) : (
// //               <span>Create Account</span>
// //             )}
// //           </button>
// //         </form>

// //         {/* Login Link */}
// //         <div style={{
// //           textAlign: 'center',
// //           paddingTop: '20px',
// //           borderTop: '1px solid #e1e5e9'
// //         }}>
// //           <p style={{
// //             margin: '0',
// //             color: '#666',
// //             fontSize: '14px'
// //           }}>
// //             Already have an account?{' '}
// //             <a
// //               href="#"
// //               onClick={handleLogin}
// //               style={{
// //                 color: '#28a745',
// //                 textDecoration: 'none',
// //                 fontWeight: '600'
// //               }}
// //               onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
// //               onMouseOut={(e) => e.target.style.textDecoration = 'none'}
// //             >
// //               Login here
// //             </a>
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Register;

// import React, { useState, useEffect } from 'react';
// import apiService from '../../services/api';

// const Register = ({ onRegister, onShowLogin }) => {
//   const [formData, setFormData] = useState({
//     employeeNumber: '',
//     password: '',
//     confirmPassword: '',
//     fullName: '',
//     role: 'driver',
//     station: 'Main Station' // Add station field
//   });
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   // Test CORS on component mount
//   useEffect(() => {
//     testCors();
//   }, []);

//   // Test CORS function
//   const testCors = async () => {
//     try {
//       console.log('Testing CORS connection to backend...');
//       const response = await fetch('http://localhost:5131/api/auth/register', {
//         method: 'OPTIONS',
//         headers: {
//           'Content-Type': 'application/json',
//           'Origin': 'http://localhost:3000'
//         }
//       });
//       console.log('OPTIONS response status:', response.status);
//       console.log('CORS headers:', {
//         'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
//         'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
//         'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
//       });
//     } catch (error) {
//       console.log('CORS test error:', error);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     // Special handling for employee number - only allow numbers
//     if (name === 'employeeNumber') {
//       // Remove any non-numeric characters
//       const numericValue = value.replace(/[^0-9]/g, '');
//       setFormData({
//         ...formData,
//         [name]: numericValue
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: value
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setIsLoading(true);

//     try {
//       // Frontend validation
//       if (!formData.employeeNumber.trim()) {
//         throw new Error('Employee number is required');
//       }

//       if (!/^\d+$/.test(formData.employeeNumber)) {
//         throw new Error('Employee number must contain only numbers');
//       }

//       if (formData.employeeNumber.length < 3) {
//         throw new Error('Employee number must be at least 3 digits long');
//       }

//       if (!formData.fullName.trim()) {
//         throw new Error('Full name is required');
//       }

//       if (formData.password.length < 6) {
//         throw new Error('Password must be at least 6 characters long');
//       }

//       if (formData.password !== formData.confirmPassword) {
//         throw new Error('Passwords do not match');
//       }

//       console.log('Sending registration request...', {
//         employeeNumber: formData.employeeNumber,
//         fullName: formData.fullName,
//         email: `${formData.employeeNumber}@gmail.com`
//       });

//       const data = await apiService.register({
//         employeeNumber: formData.employeeNumber,
//         password: formData.password,
//         fullName: formData.fullName,
//         role: formData.role,
//         email: `${formData.employeeNumber}@gmail.com`, 
//         station: formData.station
//       });

//       console.log('Registration successful:', data);
//       setSuccess('Registration successful! Redirecting to login...');
      
//       // Reset form
//       setFormData({
//         employeeNumber: '',
//         password: '',
//         confirmPassword: '',
//         fullName: '',
//         role: 'driver',
//         station: 'Main Station'
//       });

//       // Redirect to login after 2 seconds
//       setTimeout(() => {
//         if (onShowLogin) {
//           onShowLogin();
//         }
//       }, 2000);

//     } catch (err) {
//       console.error('Registration error:', err);
//       setError(err.message || 'An error occurred during registration.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (onShowLogin) {
//       onShowLogin();
//     }
//   };

//   // Handle key press to prevent non-numeric input
//   const handleKeyPress = (e) => {
//     if (e.target.name === 'employeeNumber') {
//       // Allow only numbers and control keys
//       if (!/[0-9]/.test(e.key) && 
//           e.key !== 'Backspace' && 
//           e.key !== 'Delete' && 
//           e.key !== 'Tab' && 
//           e.key !== 'Enter' && 
//           e.key !== 'ArrowLeft' && 
//           e.key !== 'ArrowRight' &&
//           e.key !== 'Home' &&
//           e.key !== 'End') {
//         e.preventDefault();
//       }
//     }
//   };

//   // Add a test button to manually test CORS
//   const handleTestCors = async () => {
//     await testCors();
//   };

//   return (
//     <div style={{
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       minHeight: '100vh',
//       backgroundColor: '#f5f5f5',
//       padding: '20px',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//     }}>
//       <div style={{
//         width: '100%',
//         maxWidth: '420px',
//         padding: '40px 30px',
//         backgroundColor: 'white',
//         borderRadius: '12px',
//         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
//         border: '1px solid #e1e5e9'
//       }}>
//         {/* Header Section with Logo */}
//         <div style={{ textAlign: 'center', marginBottom: '32px' }}>
//           <div style={{
//             width: '200px',
//             height: '110px',
//             borderRadius: '70%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             margin: '0 auto 16px',
//             overflow: 'hidden',
//             backgroundColor: 'white'
//           }}>
//             <img 
//               src="/fuel2.jpg" 
//               alt="FMS Logo"
//               style={{
//                 width: '195%',
//                 height: '205%',
//                 objectFit: 'cover',
//                 borderRadius: '50%'
//               }}
//               onError={(e) => {
//                 // Fallback if image doesn't load
//                 e.target.style.display = 'none';
//                 e.target.nextSibling.style.display = 'flex';
//               }}
//             />
//           </div>
//           <h2 style={{ margin: 0, color: '#333' }}>Register Account</h2>
//         </div>

//         {/* Success Message */}
//         {success && (
//           <div style={{
//             backgroundColor: '#efe',
//             color: '#363',
//             padding: '12px 16px',
//             borderRadius: '8px',
//             marginBottom: '20px',
//             fontSize: '14px',
//             border: '1px solid #cfc'
//           }}>
//             {success}
//           </div>
//         )}

//         {/* Registration Form */}
//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: '20px' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '8px',
//               fontSize: '14px',
//               fontWeight: '500',
//               color: '#333'
//             }}>
//               Full Name *
//             </label>
//             <input
//               type="text"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               required
//               disabled={isLoading}
//               placeholder="Enter your full name"
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 transition: 'all 0.2s',
//                 boxSizing: 'border-box'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#28a745';
//                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = '#ddd';
//                 e.target.style.boxShadow = 'none';
//               }}
//             />
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '8px',
//               fontSize: '14px',
//               fontWeight: '500',
//               color: '#333'
//             }}>
//               Employee Number *
//             </label>
//             <input
//               type="text"
//               inputMode="numeric"
//               pattern="[0-9]*"
//               name="employeeNumber"
//               value={formData.employeeNumber}
//               onChange={handleChange}
//               onKeyPress={handleKeyPress}
//               required
//               disabled={isLoading}
//               placeholder="Enter your employee number (numbers only)"
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 transition: 'all 0.2s',
//                 boxSizing: 'border-box'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#28a745';
//                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = '#ddd';
//                 e.target.style.boxShadow = 'none';
//               }}
//             />
//             <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
//               Must be at least 3 digits, numbers only
//             </small>
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '8px',
//               fontSize: '14px',
//               fontWeight: '500',
//               color: '#333'
//             }}>
//               Password *
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               disabled={isLoading}
//               placeholder="Enter your password (min. 6 characters)"
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 transition: 'all 0.2s',
//                 boxSizing: 'border-box'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#28a745';
//                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = '#ddd';
//                 e.target.style.boxShadow = 'none';
//               }}
//             />
//           </div>

//           <div style={{ marginBottom: '20px' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '8px',
//               fontSize: '14px',
//               fontWeight: '500',
//               color: '#333'
//             }}>
//               Confirm Password *
//             </label>
//             <input
//               type="password"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               disabled={isLoading}
//               placeholder="Confirm your password"
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 transition: 'all 0.2s',
//                 boxSizing: 'border-box'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#28a745';
//                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = '#ddd';
//                 e.target.style.boxShadow = 'none';
//               }}
//             />
//           </div>

//           <div style={{ marginBottom: '24px' }}>
//             <label style={{
//               display: 'block',
//               marginBottom: '8px',
//               fontSize: '14px',
//               fontWeight: '500',
//               color: '#333'
//             }}>
//               Role *
//             </label>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               disabled={isLoading}
//               style={{
//                 width: '100%',
//                 padding: '12px 16px',
//                 border: '1px solid #ddd',
//                 borderRadius: '8px',
//                 fontSize: '14px',
//                 transition: 'all 0.2s',
//                 boxSizing: 'border-box',
//                 backgroundColor: 'white',
//                 cursor: 'pointer'
//               }}
//               onFocus={(e) => {
//                 e.target.style.borderColor = '#28a745';
//                 e.target.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.1)';
//               }}
//               onBlur={(e) => {
//                 e.target.style.borderColor = '#ddd';
//                 e.target.style.boxShadow = 'none';
//               }}
//             >
//               <option value="clerk_attendant">Clerk/Attendant</option>
//               <option value="manager">Manager</option>
//               <option value="driver">Driver</option>
//               <option value="service_truck_driver">Service Truck Driver</option>
//               <option value="external_attendant">External Attendant</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             style={{
//               width: '100%',
//               padding: '14px',
//               backgroundColor: isLoading ? '#ccc' : '#28a745',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               fontSize: '15px',
//               fontWeight: '600',
//               cursor: isLoading ? 'not-allowed' : 'pointer',
//               transition: 'all 0.2s',
//               marginBottom: '24px'
//             }}
//             onMouseOver={(e) => {
//               if (!isLoading) {
//                 e.target.style.backgroundColor = '#218838';
//               }
//             }}
//             onMouseOut={(e) => {
//               if (!isLoading) {
//                 e.target.style.backgroundColor = '#28a745';
//               }
//             }}
//           >
//             {isLoading ? (
//               <span>Creating Account...</span>
//             ) : (
//               <span>Create Account</span>
//             )}
//           </button>
//         </form>

//         {/* Login Link */}
//         <div style={{
//           textAlign: 'center',
//           paddingTop: '20px',
//           borderTop: '1px solid #e1e5e9'
//         }}>
//           <p style={{
//             margin: '0',
//             color: '#666',
//             fontSize: '14px'
//           }}>
//             Already have an account?{' '}
//             <a
//               href="#"
//               onClick={handleLogin}
//               style={{
//                 color: '#28a745',
//                 textDecoration: 'none',
//                 fontWeight: '600',
//                 cursor: 'pointer'
//               }}
//               onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
//               onMouseOut={(e) => e.target.style.textDecoration = 'none'}
//             >
//               Login here
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;

import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const Register = ({ onRegister, onShowLogin }) => {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'driver',
    station: 'Main Station'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeNumberAvailable, setEmployeeNumberAvailable] = useState(null);
  const [checkingEmployeeNumber, setCheckingEmployeeNumber] = useState(false);

  // Check if employee number is already registered when it changes
  useEffect(() => {
    const checkEmployeeNumber = async () => {
      if (formData.employeeNumber.length >= 3 && /^\d+$/.test(formData.employeeNumber)) {
        setCheckingEmployeeNumber(true);
        try {
          const result = await apiService.checkEmployeeNumber(formData.employeeNumber);
          // If employee number exists (isRegistered: true), it's NOT available
          setEmployeeNumberAvailable(!result.isRegistered);
        } catch (error) {
          console.error('Error checking employee number:', error);
          setEmployeeNumberAvailable(null);
        } finally {
          setCheckingEmployeeNumber(false);
        }
      } else {
        setEmployeeNumberAvailable(null);
      }
    };

    // Add a delay to avoid checking on every keystroke
    const timeoutId = setTimeout(checkEmployeeNumber, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.employeeNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'employeeNumber') {
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
      // Frontend validation
      if (!formData.employeeNumber.trim()) {
        throw new Error('Employee number is required');
      }

      if (!/^\d+$/.test(formData.employeeNumber)) {
        throw new Error('Employee number must contain only numbers');
      }

      if (formData.employeeNumber.length < 3) {
        throw new Error('Employee number must be at least 3 digits long');
      }

      // Check if employee number is already registered
      if (employeeNumberAvailable === false) {
        throw new Error('This employee number is already registered. Please use a different number or login.');
      }

      // If still checking, wait for the result
      if (employeeNumberAvailable === null && formData.employeeNumber.length >= 3) {
        throw new Error('Please wait while we verify the employee number availability.');
      }

      if (!formData.fullName.trim()) {
        throw new Error('Full name is required');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      console.log('Sending registration request...', {
        employeeNumber: formData.employeeNumber,
        fullName: formData.fullName,
        email: `${formData.employeeNumber}@gmail.com`
      });

      const data = await apiService.register({
        employeeNumber: formData.employeeNumber,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role,
        email: `${formData.employeeNumber}@gmail.com`, 
        station: formData.station
      });

      console.log('Registration successful:', data);
      setSuccess('Registration successful! Redirecting to login...');
      
      // Reset form
      setFormData({
        employeeNumber: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        role: 'driver',
        station: 'Main Station'
      });

      // Reset availability status
      setEmployeeNumberAvailable(null);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        if (onShowLogin) {
          onShowLogin();
        }
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration.');
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

  const handleKeyPress = (e) => {
    if (e.target.name === 'employeeNumber') {
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
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          </div>
          <h2 style={{ margin: 0, color: '#333' }}>Register Account</h2>
        </div>

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
              Full Name *
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
              Employee Number *
            </label>
            <div style={{ position: 'relative' }}>
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
                  paddingRight: '100px', // Space for status indicator
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
              
              {/* Employee Number Status Indicator */}
              {formData.employeeNumber.length >= 3 && (
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {checkingEmployeeNumber ? (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      <span className="spinner" style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        border: '2px solid #ddd',
                        borderTopColor: '#28a745',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: '4px'
                      }}></span>
                      Checking...
                    </span>
                  ) : employeeNumberAvailable === true ? (
                    <span style={{ fontSize: '12px', color: '#28a745', fontWeight: '500' }}>
                      ✓ Available
                    </span>
                  ) : employeeNumberAvailable === false ? (
                    <span style={{ fontSize: '12px', color: '#dc3545', fontWeight: '500' }}>
                      ✗ Already registered
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            
            {/* <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Must be at least 4 digits, numbers only
            </small> */}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Password *
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
              Confirm Password *
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
              Role *
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
              {/* <option value="external_attendant">External Attendant</option> */}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || (employeeNumberAvailable === false)}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading || employeeNumberAvailable === false ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: isLoading || employeeNumberAvailable === false ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '24px'
            }}
            onMouseOver={(e) => {
              if (!isLoading && employeeNumberAvailable !== false) {
                e.target.style.backgroundColor = '#218838';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && employeeNumberAvailable !== false) {
                e.target.style.backgroundColor = '#28a745';
              }
            }}
          >
            {isLoading ? (
              <span>Creating Account...</span>
            ) : employeeNumberAvailable === false ? (
              <span>Employee Number Already Registered</span>
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
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            >
              Login here
            </a>
          </p>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;