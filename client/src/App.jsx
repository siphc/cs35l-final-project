import React, { useState, useEffect } from 'react';
import './App.css'; 
import Login from './Login'; 
import Register from './Register';

function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard-container">
      <h2>Welcome, {user.username}!</h2>
      <p>Your authentication is successful! You have completed Milestone 1.</p>
      {/* This is where your course list and navigation links will go (Milestone 2) */}
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  // State to manage what the user is currently viewing: 'login', 'register', or 'dashboard'
  const [currentView, setCurrentView] = useState('login'); 

  // 1. Check for stored user session on component mount (if they refresh the page)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard'); // Switch to dashboard on successful login
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Clear the stored session
    setCurrentUser(null);
    setCurrentView('login'); // Return to login page
  };
  
  const handleSwitchView = (view) => {
      setCurrentView(view);
  };

  // 2. Conditional Rendering Logic
  const renderContent = () => {
    if (currentUser && currentView === 'dashboard') {
      // If logged in, show the Dashboard
      return <Dashboard user={currentUser} onLogout={handleLogout} />;
    } else if (currentView === 'register') {
      // If currentView is 'register', show the Register form
      return <Register onSwitchToLogin={() => handleSwitchView('login')} />;
    } else { 
      // Default view is 'login'
      return <Login onLoginSuccess={handleLogin} onSwitchToRegister={() => handleSwitchView('register')} />;
    }
  };

  return (
    <div className="App">
      <h1>Digital Classroom Platform</h1>
      {renderContent()}
    </div>
  );
}

export default App;