import React, { useState } from 'react';
import Sidebar from './sidebar.jsx';
import './messaging.css';
import './styles.css';

const Messaging = ({ user, onNavigate, onLogout }) => {
  // Fake Contacts Data
  const contacts = [
    { id: 1, name: "Instructor T. H.", role: "CS 35L Professor" },
    { id: 2, name: "Jane Doe", role: "Math 61 TA" },
    { id: 3, name: "Group 4 (Project)", role: "Study Group" }
  ];

  // Fake Conversation Data
  const [selectedContact, setSelectedContact] = useState(contacts[0]);
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

      {/* Sidebar Navigation */}
      <Sidebar
        page={showAccountPanel ? "account" : "messaging"}
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

      <div id="main-content-wrapper">
        <header className="page-header">
            <h1>Messaging Center</h1> 
        </header>

        <div className="main-content-area">
            
            <div className="messaging-container">
                {/* LEFT: Contact List */}
                <div className="contacts-list">
                    {contacts.map(contact => (
                        <div 
                            key={contact.id}
                            className={`contact-item ${selectedContact.id === contact.id ? 'active' : ''}`}
                            onClick={() => setSelectedContact(contact)}
                        >
                            <div className="contact-name">{contact.name}</div>
                            <div className="contact-role">{contact.role}</div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Chat Window */}
                <div className="chat-area">
                    <div className="chat-header">
                        Chat with: {selectedContact.name}
                    </div>
                    
                    <div className="messages-display">
                        {/* Dummy Messages */}
                        <div className="message-bubble message-received">
                            Hello! Don't forget the project is due on Friday.
                        </div>
                        <div className="message-bubble message-sent">
                            Thanks for the reminder! I am working on it now.
                        </div>
                        <div className="message-bubble message-received">
                            Great, let me know if you have questions about React.
                        </div>
                    </div>

                    <div className="chat-input-area">
                        <input type="text" placeholder="Type a message..." className="chat-input" />
                        <button className="send-button">Send</button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Messaging;