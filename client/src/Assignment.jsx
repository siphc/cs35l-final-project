import React from 'react';
import Sidebar from './Sidebar';
import './Assignment.css'; // Import the specific styles for this page
import './styles.css'; // Import global styles

const Assignment = ({ onBack }) => {
  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      
      {/* Reuse the Sidebar */}
      <Sidebar page="dashboard" />

      <div id="main-content-wrapper">
        <header className="page-header">
            <h1>CS 35L - Software Construction</h1> 
        </header>

        {/* Secondary Navigation: Course Tabs */}
        <div className="course-nav">
            {/* When clicking Home, we call the onBack function to go to Dashboard */}
            <a onClick={onBack} className="course-nav-link">Home</a> 
            
            <a className="course-nav-link active">Assignments</a>
            <a className="course-nav-link">Grades</a> 
            <a className="course-nav-link">Groups</a> 
        </div>

        <div className="main-content-area">
            <h2>All Course Assignments</h2>
            
            {/* Data Table */}
            <table className="assignments-table">
                <thead>
                    <tr>
                        <th>Assignment Title</th>
                        <th>Due Date</th>
                        <th>Points</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Example 1 */}
                    <tr>
                        <td>Project Proposal (Group)</td>
                        <td>October 17th</td>
                        <td>100 Pts</td>
                        <td className="status-graded">Graded (95/100)</td>
                    </tr>
                    {/* Example 2 */}
                    <tr>
                        <td>Midterm Project Check-in</td>
                        <td>November 1st</td>
                        <td>50 Pts</td>
                        <td className="status-submitted">Submitted</td>
                    </tr>
                    {/* Example 3 */}
                    <tr>
                        <td>Final Project Report</td>
                        <td>December 5th</td>
                        <td>200 Pts</td>
                        <td className="status-unfinished">Unfinished</td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Assignment;