import React from 'react';
import Sidebar from './Sidebar';
import './styles.css';

const Dashboard = ({ onViewAssignments, onNavigate }) => {
  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      
      <Sidebar page="dashboard" onNavigate={onNavigate} />

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
                
                <button onClick={onViewAssignments} className="dashboard-button" 
                    style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                    View Assignments
                </button>
            </div>

            {/* 2. Course Cards */}
            <h2>My Courses</h2>
            <div className="dashboard-card-grid">
                <div className="dashboard-card" style={{ backgroundColor: '#3f51b5', color: 'white' }}>
                    <h3>CS 35L - Software Construction</h3>
                    <p>Due: Weekly Project Report 6 - 11/28</p>
                    <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: T. H.</p>
                </div>
                <div className="dashboard-card" style={{ backgroundColor: '#00bcd4', color: 'white' }}>
                    <h3>2SF-MATH-61 Calculus</h3>
                    <p>Quiz 4 is due 11/20</p>
                    <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: Jane Doe</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;