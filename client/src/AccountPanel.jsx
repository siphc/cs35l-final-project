import React from 'react';
import './AccountPanel.css';

const AccountPanel = ({ user, onClose, onLogout }) => {
  // Get user initials
  const getInitials = (name) => {
    if (!name) return 'TU';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Parse first and last name
  const nameParts = user.username ? user.username.trim().split(' ') : ['Test', 'User'];
  const firstName = nameParts[0] || 'Test';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

  return (
    <>
      {/* Overlay */}
      <div className="account-overlay" onClick={onClose}></div>

      {/* Slide-out Panel */}
      <div className="account-panel">
        {/* Close X Button */}
        <button className="close-panel-button" onClick={onClose}>
          ✕
        </button>

        <div className="account-panel-content">
          {/* User Initials Circle */}
          <div className="user-initials-circle">
            {getInitials(user.username)}
          </div>

          {/* Last Name, First Name */}
          <div className="user-name-display">
            <p className="user-fullname">{lastName}, {firstName}</p>
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </div>
    </>
  );
};

export default AccountPanel;
