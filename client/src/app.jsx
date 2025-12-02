import React, { useState, useEffect } from 'react';
import './app.css';
import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import Assignment from './assignment.jsx';
import Account from './account.jsx';
import Messaging from './messaging.jsx';
import Calendar from './calendar.jsx';
import Register from './register.jsx';
import Course from './Course.jsx';

const API_BASE_URL = 'http://localhost:3001';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedClass, setSelectedClass] = useState(null);
  const [courseView, setCourseView] = useState('assignments');

  // 1. Check for stored user session on component mount (if they refresh the page)
  useEffect(() => {
    const verifySession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      const sessionId = localStorage.getItem('sessionId');

      if (storedUser && sessionId) {
        try {
          // Verify session is still valid with backend
          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'x-session-id': sessionId,
            },
          });

          if (response.ok) {
            // Session is valid, restore user state
            setCurrentUser(JSON.parse(storedUser));
            setCurrentView('dashboard');
          } else {
            // Session expired or invalid, clear localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sessionId');
            setCurrentView('login');
          }
        } catch (error) {
          console.error('Session verification error:', error);
          // On error, clear session and go to login
          localStorage.removeItem('currentUser');
          localStorage.removeItem('sessionId');
          setCurrentView('login');
        }
      }
    };

    verifySession();
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

  const handleSelectClass = (classObj) => {
    setSelectedClass(classObj);
    setCourseView('assignments');
    setCurrentView('course');
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
          onSelectClass={handleSelectClass}
        />
      );
    } else if (currentUser && currentView === 'course' && selectedClass) {
      // Course view with tabs (assignments, grades, groups)
      return (
        <Course
          classData={selectedClass}
          currentTab={courseView}
          onTabChange={setCourseView}
          onNavigate={handleSwitchView}
          onLogout={handleLogout}
        />
      );
    } else if (currentUser && currentView === 'assignments') {
      // If viewing assignments, show the Assignment Page
      return <Assignment onBack={() => handleSwitchView('dashboard')} />;
    } else if (currentUser && currentView === 'account') {
      return <Account onNavigate={handleSwitchView} onLogout={handleLogout} />;
    } else if (currentView === 'register') {
      return <Register onSwitchToLogin={() => handleSwitchView('login')} />;
    } else if (currentUser && currentView === 'messaging') {
      return <Messaging onNavigate={handleSwitchView} onLogout={handleLogout} />;
    } else if (currentUser && currentView === 'calendar') {
      return <Calendar onNavigate={handleSwitchView} onLogout={handleLogout} />;
    } else {
      // Default view is login
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