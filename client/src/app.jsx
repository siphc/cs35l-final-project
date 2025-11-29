import React, { useState, useEffect } from 'react';
import './app.css'; 
import Login from './login.jsx'; 
import Dashboard from './dashboard.jsx';
import Assignment from './assignment.jsx';
import Account from './account.jsx';
import Messaging from './messaging.jsx';
import Calendar from './calendar.jsx';
import Register from './register.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState({ username: 'Test User' });
  const [currentView, setCurrentView] = useState('login');

  // 1. Check for stored user session on component mount (if they refresh the page)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser != null && storedUser!==undefined) {
      setCurrentUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard'); // Switch to dashboard on successful login
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser'); // Clear the stored session
    alert('Logged out successfully!');
    setCurrentUser({ username: 'Test User' }); // Reset to test user
    setCurrentView('dashboard'); // Return to dashboard
    window.location.reload(); // Refresh the page
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
    }else if (currentView === 'register') {
      return <Register onSwitchToLogin={() => handleSwitchView('login')} />;
    }else if (currentUser && currentView === 'messaging') {
      return <Messaging user={currentUser} onNavigate={handleSwitchView} onLogout={handleLogout} />;
    }else if (currentUser && currentView === 'calendar') {
      return <Calendar user={currentUser} onNavigate={handleSwitchView} onLogout={handleLogout} />;
    }else if (currentUser && currentView.startsWith('course-')) {
      // Handle all course pages
      return <CoursePage user={currentUser} onNavigate={handleSwitchView} onLogout={handleLogout} />;
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
      {renderContent()}
    </div>
  );
}

export default App;