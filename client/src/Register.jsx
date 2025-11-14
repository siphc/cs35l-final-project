import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:3001';

function Register({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setMessage('Attempting to register user...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Registration successful! Switching to login...`);
                setEmail('');
                setPassword('');
                
                setTimeout(() => { onSwitchToLogin(); }, 1500); 

            } else {
                setMessage(`Registration failed: ${data.message || 'Server error.'}`);
            }

        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Could not connect to the server.');
        }
    };

    return (
        <div className="register-container">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">email:</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit">Register</button>
            </form>

            {message && <p className="status-message">{message}</p>}

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