import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';

const GradesTab = ({ classData }) => {
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeForm, setGradeForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, [classData.id]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/assignment/grades/${classData.id}`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGradesData(data.data);
      } else {
        setError(data.message || 'Failed to fetch grades');
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (assignmentId, studentId) => {
    const gradeKey = `${assignmentId}-${studentId}`;
    const gradeData = gradeForm[gradeKey];

    if (!gradeData || gradeData.score === undefined) {
      alert('Please enter a score');
      return;
    }

    try {
      setSaving(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/assignment/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          assignmentId,
          studentId,
          score: parseFloat(gradeData.score),
          feedback: gradeData.feedback || '',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Grade saved successfully!');
        fetchGrades(); // Refresh the grades
        setGradeForm({});
      } else {
        alert(data.message || 'Failed to save grade');
      }
    } catch (err) {
      console.error('Error saving grade:', err);
      alert('Could not connect to server');
    } finally {
      setSaving(false);
    }
  };

  const updateGradeForm = (assignmentId, studentId, field, value) => {
    const gradeKey = `${assignmentId}-${studentId}`;
    setGradeForm({
      ...gradeForm,
      [gradeKey]: {
        ...gradeForm[gradeKey],
        [field]: value,
      },
    });
  };

  if (loading) {
    return <p>Loading grades...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // Student View
  if (classData.role === 'Student') {
    const { grades } = gradesData;

    return (
      <div>
        <h2>My Grades</h2>
        {grades.length === 0 ? (
          <p>No graded assignments yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Assignment</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Due Date</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Score</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{grade.assignment.title}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(grade.assignment.dueDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#4CAF50' }}>
                    {grade.score}/{grade.assignment.pointsPossible}
                  </td>
                  <td style={{ padding: '12px', fontStyle: 'italic', color: '#666' }}>
                    {grade.feedback || 'No feedback'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // Instructor View
  const { assignments } = gradesData;

  return (
    <div>
      <h2>Grade Assignments</h2>

      {assignments.length === 0 ? (
        <p>No assignments created yet.</p>
      ) : !selectedAssignment ? (
        <div>
          <p style={{ marginBottom: '15px' }}>Select an assignment to grade:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => setSelectedAssignment(assignment)}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  backgroundColor: '#f9f9f9',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9e9e9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              >
                <h3 style={{ margin: '0 0 8px 0' }}>{assignment.title}</h3>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()} | {assignment.pointsPossible} points |{' '}
                  {assignment.grades.length} student(s) graded
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedAssignment(null)}
            style={{
              marginBottom: '15px',
              padding: '8px 15px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
          >
            ← Back to Assignments
          </button>

          <h3>{selectedAssignment.title}</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Points Possible: {selectedAssignment.pointsPossible}
          </p>

          {selectedAssignment.grades.length === 0 ? (
            <p>No students to grade yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedAssignment.grades.map((grade) => {
                const gradeKey = `${selectedAssignment.id}-${grade.student.id}`;
                const currentFormData = gradeForm[gradeKey] || {
                  score: grade.score !== undefined ? grade.score : '',
                  feedback: grade.feedback || '',
                };

                return (
                  <div
                    key={grade.student.id}
                    style={{
                      padding: '15px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0' }}>
                      {grade.student.displayName}
                      <span style={{ fontSize: '0.9em', color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                        ({grade.student.email})
                      </span>
                    </h4>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                      <div>
                        <label htmlFor={`score-${gradeKey}`} style={{ display: 'block', marginBottom: '5px' }}>
                          Score:
                        </label>
                        <input
                          type="number"
                          id={`score-${gradeKey}`}
                          value={currentFormData.score}
                          onChange={(e) => updateGradeForm(selectedAssignment.id, grade.student.id, 'score', e.target.value)}
                          min="0"
                          max={selectedAssignment.pointsPossible}
                          step="0.5"
                          style={{
                            width: '80px',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                          }}
                        />
                        <span style={{ marginLeft: '5px' }}>/ {selectedAssignment.pointsPossible}</span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label htmlFor={`feedback-${gradeKey}`} style={{ display: 'block', marginBottom: '5px' }}>
                          Feedback:
                        </label>
                        <textarea
                          id={`feedback-${gradeKey}`}
                          value={currentFormData.feedback}
                          onChange={(e) => updateGradeForm(selectedAssignment.id, grade.student.id, 'feedback', e.target.value)}
                          placeholder="Optional feedback..."
                          rows="2"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleGradeSubmit(selectedAssignment.id, grade.student.id)}
                        disabled={saving}
                        style={{
                          padding: '8px 20px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          alignSelf: 'flex-end',
                        }}
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GradesTab;
