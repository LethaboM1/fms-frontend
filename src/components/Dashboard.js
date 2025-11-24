import React from 'react';

function Dashboard({ user, onLogout }) {
  return (
    <div style={{ padding: '20px' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6'
      }}>
        <div>
          <h1>Fuel Management System</h1>
          <p>Welcome, {user.fullName} ({user.role}) - {user.station}</p>
        </div>
        <button 
          onClick={onLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>
      
      <main style={{ padding: '20px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2>Dashboard Overview</h2>
          <p>User Role: <strong>{user.role}</strong></p>
          <p>Station: <strong>{user.station}</strong></p>
          <p>Email: <strong>{user.email}</strong></p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;