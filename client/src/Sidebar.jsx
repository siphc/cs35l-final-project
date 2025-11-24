import React from 'react';
import './Sidebar.css'; 

// We accept "onNavigate"
const Sidebar = ({ page, onNavigate }) => {
  return (
    <div className="app-sidebar">
      <div className="ucla-logo">UCLA</div>
      
      <nav className="sidebar-nav-list">
        
        {/* Account Button */}
        <div 
            onClick={() => onNavigate('account')} 
            className={`sidebar-nav-item ${page === 'account' ? 'active' : ''}`}
        >
            <span className="sidebar-icon">👤</span> Account
        </div>

        {/* Dashboard Button */}
        <div 
            onClick={() => onNavigate('dashboard')}
            className={`sidebar-nav-item ${page === 'dashboard' ? 'active' : ''}`}
        >
            <span className="sidebar-icon">📊</span> Dashboard
        </div>

        {/* Calendar Button - UPDATE THIS */}
        <div 
            onClick={() => onNavigate('calendar')}
            className={`sidebar-nav-item ${page === 'calendar' ? 'active' : ''}`}
        >
            <span className="sidebar-icon">📅</span> Calendar
        </div>

        {/* Messaging Button (FIXED) */}
        <div 
            onClick={() => onNavigate('messaging')}
            className={`sidebar-nav-item ${page === 'messaging' ? 'active' : ''}`}
        >
            <span className="sidebar-icon">💬</span> Messaging
        </div>

      </nav>
    </div>
  );
};

export default Sidebar;