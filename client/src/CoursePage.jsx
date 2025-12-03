import React from 'react';
import Sidebar from './Sidebar';
import './styles.css';

const CoursePage = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      <Sidebar
        page="course"
        onNavigate={onNavigate}
      />

      <div id="main-content-wrapper">
        <header className="page-header">
          <h1>Course Page</h1>
        </header>

        <div style={{ padding: '20px' }}>
          {/* Blank page content - ready for future implementation */}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
