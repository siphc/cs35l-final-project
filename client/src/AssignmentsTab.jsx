import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001';

const AssignmentsTab = ({ classData }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    pointsPossible: 100
  });
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [classData.id]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/assignment/list/${classData.id}`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAssignments(data.data.assignments);
      } else {
        setError(data.message || 'Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setModalMessage('');

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/assignment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          classId: classData.id,
          ...formData,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setModalMessage('Assignment created successfully!');
        setFormData({ title: '', description: '', dueDate: '', pointsPossible: 100 });
        fetchAssignments(); // Refresh the list
        setTimeout(() => {
          setShowCreateModal(false);
          setModalMessage('');
        }, 1500);
      } else {
        setModalMessage(data.message || 'Failed to create assignment');
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setModalMessage('Could not connect to server');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment? All associated grades will also be deleted.')) {
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/assignment/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchAssignments(); // Refresh the list
      } else {
        alert(data.message || 'Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('Could not connect to server');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setModalMessage('');
    setFormData({ title: '', description: '', dueDate: '', pointsPossible: 100 });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Assignments</h2>
        {classData.role === 'Instructor' && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Create Assignment
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading assignments...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : assignments.length === 0 ? (
        <p>No assignments yet. {classData.role === 'Instructor' && 'Click "Create Assignment" to add one.'}</p>
      ) : (
        <table className="assignments-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Assignment Title</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Due Date</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Points</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>
                {classData.role === 'Student' ? 'Grade' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>
                  <strong>{assignment.title}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{assignment.description}</small>
                </td>
                <td style={{ padding: '12px' }}>{formatDate(assignment.dueDate)}</td>
                <td style={{ padding: '12px' }}>{assignment.pointsPossible}</td>
                <td style={{ padding: '12px' }}>
                  {classData.role === 'Student' ? (
                    assignment.userGrade ? (
                      <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                        {assignment.userGrade.score}/{assignment.pointsPossible}
                      </span>
                    ) : (
                      <span style={{ color: '#999' }}>Ungraded</span>
                    )
                  ) : (
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        padding: '5px 15px',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="create-assignment-form">
              <label htmlFor="assignmentTitle">Title:</label>
              <input
                type="text"
                id="assignmentTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Midterm Project"
              />

              <label htmlFor="assignmentDescription">Description:</label>
              <textarea
                id="assignmentDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the assignment..."
                rows="4"
              />

              <label htmlFor="assignmentDueDate">Due Date:</label>
              <input
                type="datetime-local"
                id="assignmentDueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />

              <label htmlFor="assignmentPoints">Points Possible:</label>
              <input
                type="number"
                id="assignmentPoints"
                value={formData.pointsPossible}
                onChange={(e) => setFormData({ ...formData, pointsPossible: parseInt(e.target.value) })}
                required
                min="0"
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  style={{
                    backgroundColor: '#ccc',
                    color: 'black',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
            {modalMessage && <p className="modal-message">{modalMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsTab;
