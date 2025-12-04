import React, { useState, useEffect } from 'react';
import './GroupsTab.css';

const API_BASE_URL = 'http://localhost:3001';

const GroupsTab = ({ classData, onNavigate }) => {
  const [members, setMembers] = useState({ instructor: null, students: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchMembers();
    fetchChats();
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

  const fetchChats = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(
        `${API_BASE_URL}/api/chat/list?classId=${classData.id}`,
        {
          headers: {
            'x-session-id': sessionId,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setChats(data.data.chats);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to create a chat');
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');
      const isGroupChat = selectedUsers.length > 1;

      const response = await fetch(`${API_BASE_URL}/api/chat/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          classId: classData.id,
          participantIds: selectedUsers,
          isGroupChat,
          name: isGroupChat ? groupName || 'Group Chat' : '',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.data.isNew) {
          alert('Chat created successfully!');
        } else {
          alert('This chat already exists!');
        }
        // Refresh chats list
        await fetchChats();
        // Clear selections
        setSelectedUsers([]);
        setGroupName('');
        setShowCreateForm(false);
      } else {
        alert(data.message || 'Failed to create chat');
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      alert('Could not connect to server');
    }
  };

  const handleAddToExistingChat = async () => {
    if (!selectedChat) {
      alert('Please select a chat first');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Please select at least one user to add');
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(
        `${API_BASE_URL}/api/chat/${selectedChat}/add-members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
          },
          body: JSON.stringify({
            participantIds: selectedUsers,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Members added successfully!');
        // Refresh chats list
        await fetchChats();
        // Clear selections
        setSelectedUsers([]);
        setSelectedChat(null);
      } else {
        alert(data.message || 'Failed to add members');
      }
    } catch (err) {
      console.error('Error adding members:', err);
      alert('Could not connect to server');
    }
  };

  const getChatName = (chat) => {
    const currentUserId = JSON.parse(localStorage.getItem('currentUser')).userId;

    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    } else {
      // For direct chats, show the other person's name
      const otherParticipant = chat.participants.find(
        (p) => p._id !== currentUserId
      );
      return otherParticipant
        ? otherParticipant.displayName || otherParticipant.email
        : 'Direct Chat';
    }
  };

  const viewChat = (chatId) => {
    // Navigate to messaging view with the selected chat
    // Store the selected chat ID in localStorage for the messaging component to use
    localStorage.setItem('selectedChatId', chatId);
    onNavigate('messaging');
  };

  const handleDeleteChat = async (chatId, chatName) => {
    if (!window.confirm(`Are you sure you want to delete "${chatName}"? This will also delete all messages in this chat.`)) {
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Chat deleted successfully!');
        // Refresh chats list
        await fetchChats();
      } else {
        alert(data.message || 'Failed to delete chat');
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Could not connect to server');
    }
  };

  if (loading) {
    return <p>Loading class members...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  // Combine instructor and students for selection
  const allMembers = [
    ...(members.instructor ? [{ ...members.instructor, role: 'Instructor' }] : []),
    ...members.students.map((s) => ({ ...s, role: 'Student' })),
  ];

  return (
    <div className="groups-tab-container">
      <div className="groups-section">
        <h2>Existing Chats</h2>
        {chats.length === 0 ? (
          <p style={{ color: '#666' }}>No chats created yet.</p>
        ) : (
          <div className="chats-list">
            {chats.map((chat) => (
              <div key={chat._id} className="chat-item">
                <div className="chat-info">
                  <strong>{getChatName(chat)}</strong>
                  <span className="chat-participants">
                    {chat.participants.length} participant{chat.participants.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="chat-actions">
                  <button
                    onClick={() => viewChat(chat._id)}
                    className="view-chat-btn"
                  >
                    View Chat
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat._id, getChatName(chat))}
                    className="delete-chat-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="groups-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Create New Chat</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="toggle-form-btn"
          >
            {showCreateForm ? 'Hide' : 'Show'} Form
          </button>
        </div>

        {showCreateForm && (
          <>
            <div className="action-buttons">
              <button
                onClick={handleCreateChat}
                disabled={selectedUsers.length === 0}
                className="action-btn create-btn"
              >
                Create New Chat ({selectedUsers.length} selected)
              </button>

              {chats.length > 0 && (
                <div className="add-to-existing">
                  <select
                    value={selectedChat || ''}
                    onChange={(e) => setSelectedChat(e.target.value)}
                    className="chat-select"
                  >
                    <option value="">Select a chat...</option>
                    {chats.map((chat) => (
                      <option key={chat._id} value={chat._id}>
                        {getChatName(chat)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToExistingChat}
                    disabled={!selectedChat || selectedUsers.length === 0}
                    className="action-btn add-btn"
                  >
                    Add to Selected Chat
                  </button>
                </div>
              )}
            </div>

            {selectedUsers.length > 1 && (
              <div className="group-name-input">
                <label htmlFor="groupName">Group Name (optional):</label>
                <input
                  type="text"
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="form-input"
                />
              </div>
            )}

            <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
              Select Members ({selectedUsers.length} selected)
            </h3>
            <div className="members-selection">
              {allMembers.map((member) => (
                <div key={member.id} className="member-checkbox-item">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={selectedUsers.includes(member.id)}
                    onChange={() => toggleUserSelection(member.id)}
                  />
                  <label htmlFor={`member-${member.id}`}>
                    <span className="member-name">
                      {member.displayName || member.email}
                    </span>
                    <span className="member-role-badge">{member.role}</span>
                  </label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupsTab;
