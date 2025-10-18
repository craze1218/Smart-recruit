// src/components/LoginForm.jsx
import React, { useState } from 'react';

function LoginForm({ setUserId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3001/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          localStorage.setItem('userId', data.userId);
          setUserId(data.userId);
          setMessage(`Welcome! You are now logged in.`);
        } else {
          setMessage('Login failed. Try again.');
        }
      })
      .catch(err => {
        console.error('Error:', err);
        setMessage('Something went wrong.');
      });
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2>{mode === 'login' ? '🔐 Login' : '📝 Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" style={{ marginLeft: '1rem' }}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ marginTop: '0.5rem' }}>
        Switch to {mode === 'login' ? 'Sign Up' : 'Login'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default LoginForm;
