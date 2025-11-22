import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5002';

function Login({ onLoginSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        setMessage('Attempting to log in...'); 

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`Login successful! Welcome, ${data.data.user.email}.`);
                localStorage.setItem('currentUser', JSON.stringify(data.data.user));
                onLoginSuccess(data.user);
            } else {
                setMessage(`Login failed: ${data.message || 'Invalid credentials.'}`);
            }

        } catch (error) {
            console.error('Network or server error:', error);
            setMessage('Could not connect to the server. Is the backend running?');
        }
        setPassword('');
    };

    return (
        <div className="login-container">
            <h2>User Login</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">email:</label>
                <input type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit">Log In</button>
            </form>

            {message && <p className="status-message">{message}</p>}

            <p>
                Don't have an account? 
                <a href="#" onClick={(e) => {e.preventDefault(); onSwitchToRegister();}}>
                    Register here
                </a>
            </p>
        </div>
    );
}

export default Login;