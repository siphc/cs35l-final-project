import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar.jsx';
import './styles.css';

const API_BASE_URL = 'http://localhost:3001';

const Dashboard = ({ onNavigate, onLogout, onSelectClass }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [generatedClassCode, setGeneratedClassCode] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/class/my-classes`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setClasses(data.data);
      } else {
        setError(data.message || 'Failed to fetch classes');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    setModalMessage('Joining class...');

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/class/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ classCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setModalMessage('Successfully joined class!');
        setClassCode('');
        setTimeout(() => {
          setShowJoinModal(false);
          setModalMessage('');
          fetchClasses(); // Refresh class list
        }, 1500);
      } else {
        setModalMessage(data.message || 'Failed to join class');
      }
    } catch (err) {
      console.error('Error joining class:', err);
      setModalMessage('Could not connect to server');
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setModalMessage('Creating class...');

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/class/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ name: className, description: classDescription }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGeneratedClassCode(data.data.classCode);
        setModalMessage(`Class created! Share this code with students: ${data.data.classCode}`);
        setClassName('');
        setClassDescription('');
        setTimeout(() => {
          fetchClasses(); // Refresh class list
        }, 500);
      } else {
        setModalMessage(data.message || 'Failed to create class');
      }
    } catch (err) {
      console.error('Error creating class:', err);
      setModalMessage('Could not connect to server');
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setModalMessage('');
    setGeneratedClassCode('');
    setClassName('');
    setClassDescription('');
  };

  const closeJoinModal = () => {
    setShowJoinModal(false);
    setModalMessage('');
    setClassCode('');
  };

  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">

      <Sidebar page="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div id="main-content-wrapper">
        <header className="page-header">
            <h1>Dashboard</h1>
        </header>

        <div className="main-content-area">
            {/* 1. Quick Action Buttons */}
            <h2>Quick Access</h2>
            <div className="quick-access-buttons" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <button
                onClick={() => onNavigate('messaging')}
                className="dashboard-button"
                style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none' }}
                >
                    Go to Messaging Center
                </button>

                <button
                onClick={() => setShowJoinModal(true)}
                className="dashboard-button"
                style={{ backgroundColor: '#ff9800', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                    Join Class
                </button>

                <button
                onClick={() => setShowCreateModal(true)}
                className="dashboard-button"
                style={{ backgroundColor: '#9c27b0', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                    Create Class
                </button>
            </div>

            {/* 2. Course Cards */}
            <h2>My Classes</h2>
            {loading ? (
                <p>Loading classes...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : classes.length === 0 ? (
                <p>You haven't joined or created any classes yet. Use the buttons above to get started!</p>
            ) : (
                <div className="dashboard-card-grid">
                    {classes.map((cls, index) => (
                        <div
                            key={cls.id}
                            className="dashboard-card"
                            onClick={() => onSelectClass(cls)}
                            style={{
                                backgroundColor: index % 2 === 0 ? '#3f51b5' : '#00bcd4',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            <h3>{cls.name}</h3>
                            <p>{cls.description}</p>
                            <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Role: {cls.role}</p>
                            <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Code: {cls.classCode}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={closeJoinModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join a Class</h2>
            <form onSubmit={handleJoinClass}>
              <label htmlFor="classCode">Class Code:</label>
              <input
                type="text"
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                required
                placeholder="Enter 6-character code"
                maxLength="6"
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ backgroundColor: '#ff9800', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Join</button>
                <button type="button" onClick={closeJoinModal} style={{ backgroundColor: '#ccc', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
            {modalMessage && <p className="modal-message">{modalMessage}</p>}
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create a Class</h2>
            {!generatedClassCode ? (
              <form onSubmit={handleCreateClass}>
                <label htmlFor="className">Class Name:</label>
                <input
                  type="text"
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  placeholder="e.g., CS 35L - Software Construction"
                />
                <label htmlFor="classDescription">Description:</label>
                <textarea
                  id="classDescription"
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  required
                  placeholder="Describe the class..."
                  rows="3"
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" style={{ backgroundColor: '#9c27b0', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Create</button>
                  <button type="button" onClick={closeCreateModal} style={{ backgroundColor: '#ccc', color: 'black', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <p style={{ fontSize: '1.1em', marginBottom: '15px' }}>Class created successfully!</p>
                <p style={{ fontSize: '1.3em', fontWeight: 'bold', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px', color: '#333' }}>
                  Class Code: {generatedClassCode}
                </p>
                <p style={{ marginTop: '10px' }}>Share this code with students so they can join your class.</p>
                <button onClick={closeCreateModal} style={{ backgroundColor: '#9c27b0', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' }}>Done</button>
              </div>
            )}
            {modalMessage && !generatedClassCode && <p className="modal-message">{modalMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;