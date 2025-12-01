import React, { useState, useEffect } from 'react';
import './app.css'; 
import Login from './login.jsx'; 
import Dashboard from './dashboard.jsx';
import Assignment from './assignment.jsx';
import Account from './account.jsx';
import Messaging from './messaging.jsx';
import Calendar from './calendar.jsx';
import Register from './register.jsx';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');

  // 1. Check for stored user session on component mount (if they refresh the page)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const sessionId = localStorage.getItem('sessionId');
    if (storedUser && sessionId) {
      setCurrentUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard'); // Switch to dashboard on successful login
  };

  const handleLogout = async () => {
    const sessionId = localStorage.getItem('sessionId');

    // Call logout API
    if (sessionId) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionId');
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
      return (
        <Dashboard 
          user={currentUser} 
          onLogout={handleLogout} 
          onViewAssignments={() => handleSwitchView('assignments')} 
          onNavigate={handleSwitchView}
        />
      );
    }else if (currentUser && currentView === 'assignments') {
      // If viewing assignments, show the Assignment Page
      return <Assignment onBack={() => handleSwitchView('dashboard')} />;
    }else if (currentUser && currentView === 'account') {
      return <Account onNavigate={handleSwitchView} onLogout={handleLogout} />;
    }else if (currentView === 'register') {
      return <Register onSwitchToLogin={() => handleSwitchView('login')} />;
    }else if (currentUser && currentView === 'messaging') {
      return <Messaging onNavigate={handleSwitchView} onLogout={handleLogout} />;
    }else if (currentUser && currentView === 'calendar') {
      return <Calendar onNavigate={handleSwitchView} onLogout={handleLogout} />;
    }else {
      // Default view is 'login' (The missing part!)
      return (
        <Login 
          onLoginSuccess={handleLogin} 
          onSwitchToRegister={() => handleSwitchView('register')} 
        />
      );
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