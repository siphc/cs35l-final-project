import React, { useState } from 'react';

const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
const passwordRulesText =
  "Password must be at least 8 characters and include upper, lower, digit, and special character.";

const API_BASE_URL = 'http://localhost:3001';

function Register({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessageType('info');
        setMessage('Attempting to register user...');

        if (!email || !password) {
        setMessageType('error');
        setMessage("Please enter both an email and password.");
        return;
        }

        if (!isValidEmail(email)) {
           setMessageType('error');
           setMessage("Enter a valid email address");
           return;
        }

        if (!isValidPassword(password)) {
           setMessageType('error');
           setMessage(passwordRulesText);
           return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessageType('success');
                setMessage(`Registration successful! Switching to login...`);
                setEmail('');
                setPassword('');

                setTimeout(() => { onSwitchToLogin(); }, 1500);

            } else {
                setMessageType('error');
                setMessage(`Registration failed: ${data.message || 'Server error.'}`);
            }

        } catch (error) {
            console.error('Network or server error:', error);
            setMessageType('error');
            setMessage('Could not connect to the server.');
        }
    };

    return (
        <div className="register-container">
            <h1 className="platform-title">Digital Classroom Platform</h1>
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">email:</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <button type="submit">Register</button>
            </form>

            {message && <p className={`status-message ${messageType}`}>{message}</p>}

            <p>
                Already have an account? 
                <a href="#" onClick={(e) => {e.preventDefault(); onSwitchToLogin();}}>
                    Log in here
                </a>
            </p>
        </div>
    );
}

export default Register;