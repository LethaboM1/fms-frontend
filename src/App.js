import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import DriverDashboard from './components/dashboards/DriverDashboard';
import ServiceTruckDriverDashboard from './components/dashboards/ServiceTruckDriverDashboard';
import MachineLogBookDashboard from './components/dashboards/MachineLogBookDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null); 

  useEffect(() => {
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
      setCurrentView('dashboard');
    }
    setLoading(false);

    // Global functions for navigation
    window.showLogin = () => setCurrentView('login');
    window.showRegister = () => setCurrentView('register');
  }, []);

  const handleLogin = (userData) => {
    console.log('App.js - User logged in:', userData);
    console.log('App.js - User role:', userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleRegister = (userData) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    handleLogin(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentView('login');
  };

  // Navigation functions
  const showLogin = () => setCurrentView('login');
  const showRegister = () => setCurrentView('register');
  const showForgotPassword = () => setCurrentView('forgot-password');

  // Navigation handlers for different dashboards
  const handleNavigateToAdmin = () => {
    if (user?.role === 'admin') {
      setCurrentView('dashboard'); // Admin dashboard is already default
    }
  };

  const handleNavigateToMachineLogBook = () => {
    setCurrentView('machine-log-book');
  };

  const handleBackToDriverDashboard = () => {
    setCurrentView('dashboard');
  };

  const renderDashboard = () => {
    console.log('renderDashboard called with user:', user);
    console.log('User role:', user?.role);
    
    switch (user.role) {
      case 'admin':
        console.log('Rendering AdminDashboard');
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'manager':
        console.log('Rendering ManagerDashboard');
        return <ManagerDashboard user={user} onLogout={handleLogout} />;
      case 'driver':
        console.log('Rendering DriverDashboard');
        return (
          <DriverDashboard 
            user={user} 
            onLogout={handleLogout} 
            onNavigateToAdmin={handleNavigateToAdmin}
            onNavigateToMachineLogBook={handleNavigateToMachineLogBook}
          />
        );
      case 'service_truck_driver':
        console.log('Rendering ServiceTruckDriverDashboard');
        return <ServiceTruckDriverDashboard user={user} onLogout={handleLogout} />;
      default:
        console.log('Rendering default AdminDashboard for role:', user.role);
        return <AdminDashboard user={user} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  const renderCurrentView = () => {
    console.log('Current view:', currentView);
    console.log('User exists:', !!user);
    
    switch (currentView) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            onShowRegister={showRegister}
            onShowForgotPassword={showForgotPassword}
          />
        );
      case 'register':
        return <Register onRegister={handleRegister} onShowLogin={showLogin} />;
      case 'forgot-password':
        return <ForgotPassword onShowLogin={showLogin} />;
      case 'dashboard':
        return user ? renderDashboard() : (
          <Login 
            onLogin={handleLogin} 
            onShowRegister={showRegister}
            onShowForgotPassword={showForgotPassword}
          />
        );
      case 'machine-log-book': // ADD THIS CASE
        return user ? (
          <MachineLogBookDashboard 
            user={user} 
            onBack={handleBackToDriverDashboard}
            selectedMachine={selectedMachine}
          />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onShowRegister={showRegister}
            onShowForgotPassword={showForgotPassword}
          />
        );
      default:
        return (
          <Login 
            onLogin={handleLogin} 
            onShowRegister={showRegister}
            onShowForgotPassword={showForgotPassword}
          />
        ); 
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {renderCurrentView()}
    </div>
  );
}

export default App;