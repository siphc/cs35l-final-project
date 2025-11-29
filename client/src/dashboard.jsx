import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar.jsx';
import './styles.css';

const Dashboard = ({ user, onViewAssignments, onNavigate, onLogout }) => {
  const [showAccountPanel, setShowAccountPanel] = useState(false);

  const handleAccountClick = () => {
    setShowAccountPanel(true);
  };

  const handleCloseAccountPanel = () => {
    setShowAccountPanel(false);
  };

  const handleLogout = () => {
    setShowAccountPanel(false);
    onLogout();
  };

  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">

      <Sidebar
        page={showAccountPanel ? "account" : "dashboard"}
        onNavigate={(view) => {
          if (view === 'account') {
            handleAccountClick();
          } else {
            setShowAccountPanel(false);
            onNavigate(view);
          }
        }}
      />

      {showAccountPanel && (
        <AccountPanel
          user={user}
          onClose={handleCloseAccountPanel}
          onLogout={handleLogout}
        />
      )}

      <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start' }}>
        {/* Main Content - Dashboard and My Courses */}
        <div id="main-content-wrapper" style={{ flex: 1, padding: '0 20px 20px 0' }}>
          <header className="page-header">
              <h1>Dashboard</h1>
          </header>

          <div className="dashboard-card-grid" style={{ marginLeft: '20px', marginRight: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div
                className="dashboard-card"
                style={{ backgroundColor: '#3f51b5', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate('course-cs35l')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
              >
                  <h3>CS 35L - Software Construction</h3>
                  <p>Due: Weekly Project Report 6 - 11/28</p>
                  <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: T. H.</p>
              </div>
              <div
                className="dashboard-card"
                style={{ backgroundColor: '#00bcd4', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate('course-math61')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
              >
                  <h3>MATH 61 - Discrete Structures</h3>
                  <p>Quiz 4 is due 11/20</p>
                  <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: Jane Doe</p>
              </div>
              <div
                className="dashboard-card"
                style={{ backgroundColor: '#9c27b0', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate('course-cs33')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
              >
                  <h3>CS 33 - Computer Organization</h3>
                  <p>Due: Lab 5 - Assembly Programming - 12/05</p>
                  <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: P. Eggert</p>
              </div>
              <div
                className="dashboard-card"
                style={{ backgroundColor: '#f44336', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate('course-cs111')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
              >
                  <h3>CS 111 - Operating Systems</h3>
                  <p>Midterm 2 - 12/10</p>
                  <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: R. Reiher</p>
              </div>
              <div
                className="dashboard-card"
                style={{ backgroundColor: '#ff9800', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate('course-cs118')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
              >
                  <h3>CS 118 - Computer Networks</h3>
                  <p>Due: Project 2 - TCP Implementation - 12/08</p>
                  <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: L. Zhang</p>
              </div>
              <div
                className="dashboard-card"
                style={{ backgroundColor: '#4caf50', color: 'white', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => onNavigate('course-math33a')}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'; }}
              >
                  <h3>MATH 33A - Linear Algebra</h3>
                  <p>Homework 8 - 11/25</p>
                  <p style={{ fontSize: '0.8em', opacity: 0.8 }}>Instructor: M. Hill</p>
              </div>
          </div>
        </div>

        {/* Right Column - Quick Access */}
        <div style={{ width: '300px', flexShrink: 0, padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginRight: '20px', marginTop: '20px' }}>
          <h2 style={{ color: '#2774AE', marginTop: 0 }}>Quick Access</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
              onClick={() => onNavigate('messaging')}
              className="dashboard-button"
              style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1rem', textDecoration: 'none' }}
              >
      Go to Messaging Center
  </button>

              <button className="dashboard-button"
                  style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                  View Assignments
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;