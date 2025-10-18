import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';

function LoginForm({ setUserId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3001/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('userId', data.userId);
        setUserId(data.userId);
        setMessage(`✅ ${mode === 'login' ? 'Logged in' : 'Signed up'} successfully!`);
      } else {
        setMessage(data.message || `❌ ${mode === 'login' ? 'Login' : 'Signup'} failed. Try again.`);
      }
    } catch (err) {
      console.error('Error:', err);
      setMessage('🚨 Network error or server unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 6,
        p: 4,
        backgroundColor: '#1e1e1e',
        color: '#fff',
        borderRadius: 2
      }}
    >
      <Typography variant="h6" color="primary" gutterBottom align="center">
        {mode === 'login' ? '🔐 Login to Your Account' : '📝 Create an Account'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{ style: { color: '#ccc' } }}
          InputProps={{ style: { color: '#fff' } }}
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{ style: { color: '#ccc' } }}
          InputProps={{ style: { color: '#fff' } }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : mode === 'login' ? 'Login' : 'Sign Up'}
        </Button>
      </form>

      <Button
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        fullWidth
        sx={{ mt: 2, color: '#ff9800' }}
      >
        Switch to {mode === 'login' ? 'Sign Up' : 'Login'}
      </Button>

      {message && (
        <Typography
          variant="body2"
          sx={{ mt: 2, color: message.includes('✅') ? 'lightgreen' : 'tomato', textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Paper>
  );
}

export default LoginForm;
