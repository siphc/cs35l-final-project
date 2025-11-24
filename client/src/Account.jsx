import React from 'react';
import Sidebar from './Sidebar';
import './styles.css'; 

const Account = ({ onNavigate }) => {
  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      
      <Sidebar page="account" onNavigate={onNavigate} />

      <div id="main-content-wrapper">
        <header className="page-header">
            <h1>User Account Settings</h1> 
        </header>

        <div className="main-content-area">
            <p>This is where your team will place the profile, security, and settings components.</p>
            
            <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Profile Details</h3>
                <p><strong>Username:</strong> Test User</p>
                <p><strong>Email:</strong> student@ucla.edu</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Account;