import React, { useState, useEffect } from 'react';
import './App.css'; 
import Login from './Login'; 
import Dashboard from './Dashboard';
import Assignment from './Assignment.jsx';
import Account from './Account';
import Messaging from './Messaging.jsx';
import Calendar from './Calendar.jsx';
import Register from './Register';

function App() {
  const [currentUser, setCurrentUser] = useState({ username: 'Test User' });
  const [currentView, setCurrentView] = useState('dashboard');

  // 1. Check for stored user session on component mount (if they refresh the page)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser===undefined || storedUser===null) {
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
      return <Account onNavigate={handleSwitchView} />;
    }else if (currentView === 'register') {
      return <Register onSwitchToLogin={() => handleSwitchView('login')} />;
    }else if (currentUser && currentView === 'messaging') {
      return <Messaging onNavigate={handleSwitchView} />;
    }else if (currentUser && currentView === 'calendar') {
      return <Calendar onNavigate={handleSwitchView} />;
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