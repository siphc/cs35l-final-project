import React from 'react';
import Sidebar from './sidebar.jsx';
import AssignmentsTab from './AssignmentsTab.jsx';
import GradesTab from './GradesTab.jsx';
import GroupsTab from './GroupsTab.jsx';
import './Course.css';
import './styles.css';

const Course = ({ classData, currentTab, onTabChange, onNavigate, onLogout }) => {
  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      {/* Reuse the Sidebar */}
      <Sidebar page="dashboard" onNavigate={onNavigate} onLogout={onLogout} />

      <div id="main-content-wrapper">
        <header className="page-header">
          <h1>{classData.name}</h1>
          <p>{classData.description}</p>
          <p style={{ fontSize: '0.9em', opacity: 0.7 }}>
            Your role: {classData.role} | Code: {classData.classCode}
          </p>
        </header>

        {/* Course Navigation Tabs */}
        <div className="course-nav">
          <a
            onClick={() => onNavigate('dashboard')}
            className="course-nav-link"
            style={{ cursor: 'pointer' }}
          >
            Home
          </a>
          <a
            onClick={() => onTabChange('assignments')}
            className={`course-nav-link ${currentTab === 'assignments' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Assignments
          </a>
          <a
            onClick={() => onTabChange('grades')}
            className={`course-nav-link ${currentTab === 'grades' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Grades
          </a>
          <a
            onClick={() => onTabChange('groups')}
            className={`course-nav-link ${currentTab === 'groups' ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            Groups
          </a>
        </div>

        <div className="main-content-area">
          {currentTab === 'assignments' && (
            <AssignmentsTab classData={classData} />
          )}
          {currentTab === 'grades' && (
            <GradesTab classData={classData} />
          )}
          {currentTab === 'groups' && (
            <GroupsTab classData={classData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Course;
