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

  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      <Sidebar page="account" onNavigate={onNavigate} onLogout={onLogout} />

      <div id="main-content-wrapper">
        <header className="page-header">
          <h1>User Account Settings</h1>
        </header>

        <div className="main-content-area">
          {loading ? (
            <p>Loading user data...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : userData ? (
            <div>
              <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Profile Details</h3>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Display Name:</strong> {userData.displayName || 'Not set'}</p>
                <p><strong>Member Since:</strong> {new Date(userData.createdAt).toLocaleDateString()}</p>
              </div>

              <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Edit Profile</h3>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '10px 15px',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Edit Display Name
                  </button>
                ) : (
                  <form onSubmit={handleUpdateDisplayName}>
                    <label htmlFor="displayName" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                      Display Name:
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        fontSize: '1rem',
                        marginBottom: '10px'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          padding: '10px 15px',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setNewDisplayName(userData.displayName || '');
                          setUpdateMessage('');
                        }}
                        style={{
                          backgroundColor: '#ccc',
                          color: 'black',
                          padding: '10px 15px',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '1rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {updateMessage && (
                  <p style={{ marginTop: '10px', color: updateMessage.includes('success') ? 'green' : 'red' }}>
                    {updateMessage}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p>No user data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
