import React, { useState, useEffect } from 'react';
import './PeopleTab.css';

const API_BASE_URL = 'http://localhost:3001';

const PeopleTab = ({ classData }) => {
  const [members, setMembers] = useState({ instructor: null, students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, [classData.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/class/${classData.id}/members`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMembers(data.data);
      } else {
        setError(data.message || 'Failed to fetch class members');
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading class members...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="people-tab-container">
      {/* Instructor Section */}
      <h2 style={{ marginTop: '20px', marginBottom: '10px' }}>Instructor</h2>
      {members.instructor && (
        <div className="member-card instructor">
          <span className="role-badge instructor">Instructor</span>
          <p style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>
            {members.instructor.displayName || members.instructor.email}
          </p>
          <p className="email" style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
            {members.instructor.email}
          </p>
        </div>
      )}

      {/* Students Section */}
      <h2 style={{ marginTop: '30px', marginBottom: '10px' }}>
        Students ({members.students.length})
      </h2>
      {members.students.length === 0 ? (
        <p style={{ color: '#666' }}>No students have joined this class yet.</p>
      ) : (
        <div className="members-grid">
          {members.students.map((student) => (
            <div key={student.id} className="member-card student">
              <span className="role-badge student">Student</span>
              <p style={{ fontWeight: 'bold', margin: '8px 0 4px 0' }}>
                {student.displayName || student.email}
              </p>
              <p className="email" style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
                {student.email}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeopleTab;
