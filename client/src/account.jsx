import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar.jsx';
import './styles.css';

const API_BASE_URL = 'http://localhost:3001';

const Account = ({ onNavigate, onLogout }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setUserData(data.data);
        setNewDisplayName(data.data.displayName || '');
      } else {
        setError(data.message || 'Failed to fetch user data.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Server connection error while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    setUpdateMessage('Updating...');

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/profile/update-displayName`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ displayName: newDisplayName }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUpdateMessage('Display name updated successfully!');
        setUserData(data.data);
        setIsEditing(false);
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage(data.message || 'Failed to update display name.');
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      setUpdateMessage('Server connection error.');
    }
  };

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