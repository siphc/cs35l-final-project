import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './sidebar.jsx';
import './messaging.css';
import './styles.css';

const API_BASE_URL = 'http://localhost:3001';

const Messaging = ({ onNavigate, onLogout }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setCurrentUser(user);

    // Fetch all chats
    fetchChats();

    // Check if there's a pre-selected chat from localStorage
    const preSelectedChatId = localStorage.getItem('selectedChatId');
    if (preSelectedChatId) {
      // Load that chat
      loadChat(preSelectedChatId);
      // Clear the localStorage item
      localStorage.removeItem('selectedChatId');
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/chat/list`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setChats(data.data.chats);
        // If no chat is selected and there are chats, select the first one
        if (!selectedChat && data.data.chats.length > 0) {
          const preSelectedChatId = localStorage.getItem('selectedChatId');
          if (preSelectedChatId) {
            const chatToSelect = data.data.chats.find(
              (c) => c._id === preSelectedChatId
            );
            if (chatToSelect) {
              setSelectedChat(chatToSelect);
              fetchMessages(chatToSelect._id);
            }
            localStorage.removeItem('selectedChatId');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      const sessionId = localStorage.getItem('sessionId');

      // Fetch chat details
      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSelectedChat(data.data.chat);
        fetchMessages(chatId);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
        headers: {
          'x-session-id': sessionId,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessages(data.data.messages);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedChat) {
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(
        `${API_BASE_URL}/api/chat/${selectedChat._id}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
          },
          body: JSON.stringify({
            content: newMessage,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new message to the messages list
        setMessages([...messages, data.data.message]);
        setNewMessage('');
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Could not send message');
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChat) return;

    const chatName = getChatName(selectedChat);
    if (!window.confirm(`Are you sure you want to delete "${chatName}"? This will also delete all messages in this chat.`)) {
      return;
    }

    try {
      const sessionId = localStorage.getItem('sessionId');

      const response = await fetch(`${API_BASE_URL}/api/chat/${selectedChat._id}`, {
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
        // Clear selected chat and messages
        setSelectedChat(null);
        setMessages([]);
      } else {
        alert(data.message || 'Failed to delete chat');
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Could not delete chat');
    }
  };

  const getChatName = (chat) => {
    if (!currentUser) return 'Chat';

    if (chat.isGroupChat) {
      return chat.name || 'Group Chat';
    } else {
      // For direct chats, show the other person's name
      const otherParticipant = chat.participants.find(
        (p) => p._id !== currentUser.userId
      );
      return otherParticipant
        ? otherParticipant.displayName || otherParticipant.email
        : 'Direct Chat';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
        <Sidebar page="messaging" onNavigate={onNavigate} onLogout={onLogout} />
        <div id="main-content-wrapper">
          <div className="main-content-area">
            <p>Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="body-with-right-side-primary-nav-expanded full-width-context-user_19897">
      <Sidebar page="messaging" onNavigate={onNavigate} onLogout={onLogout} />

      <div id="main-content-wrapper">
        <header className="page-header">
          <h1>Messaging Center</h1>
        </header>

        <div className="main-content-area">
          {chats.length === 0 ? (
            <div className="no-chats-message">
              <p>You don't have any chats yet.</p>
              <p>Go to a class and navigate to the Groups tab to create a chat.</p>
            </div>
          ) : (
            <div className="messaging-container">
              {/* LEFT: Chat List */}
              <div className="contacts-list">
                <h3 style={{ padding: '10px', margin: 0, borderBottom: '1px solid #ddd' }}>
                  Your Chats
                </h3>
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`contact-item ${
                      selectedChat?._id === chat._id ? 'active' : ''
                    }`}
                    onClick={() => handleSelectChat(chat)}
                  >
                    <div className="contact-name">{getChatName(chat)}</div>
                    <div className="contact-role">
                      {chat.classId?.name || 'Unknown Class'} •{' '}
                      {chat.participants.length} members
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT: Chat Window */}
              {selectedChat ? (
                <div className="chat-area">
                  <div className="chat-header">
                    <div>
                      <strong>{getChatName(selectedChat)}</strong>
                      <div style={{ fontSize: '0.85em', color: '#666' }}>
                        {selectedChat.classId?.name} •{' '}
                        {selectedChat.participants.length} participants
                      </div>
                    </div>
                    <button
                      onClick={handleDeleteChat}
                      className="delete-chat-header-btn"
                      title="Delete chat"
                    >
                      Delete Chat
                    </button>
                  </div>

                  <div className="messages-display">
                    {messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isSent = message.sender._id === currentUser?.userId;
                        return (
                          <div
                            key={message._id}
                            className={`message-bubble ${
                              isSent ? 'message-sent' : 'message-received'
                            }`}
                          >
                            {!isSent && (
                              <div className="message-sender">
                                {message.sender.displayName || message.sender.email}
                              </div>
                            )}
                            <div className="message-content">{message.content}</div>
                            <div className="message-time">
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="chat-input-area">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="chat-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-button">
                      Send
                    </button>
                  </form>
                </div>
              ) : (
                <div className="chat-area">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#999',
                    }}
                  >
                    Select a chat to start messaging
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messaging;
