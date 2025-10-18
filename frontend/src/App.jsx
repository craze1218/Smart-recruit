import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Box,
  Card,
  CardContent,
} from '@mui/material';

import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard'; // ✅ Correct import

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#121212',
    },
    primary: {
      main: '#ff6f00',
    },
    secondary: {
      main: '#ff9800',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffcc80',
    },
  },
});

function App() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) setUserId(savedUserId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* Header Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#000000', position: 'relative' }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
            <Typography variant="h5" color="primary">
              🧠 Explainable Recruitment Dashboard
            </Typography>
          </Box>
          {userId && (
            <Box sx={{ position: 'absolute', right: 16 }}>
              <Button color="secondary" variant="outlined" onClick={handleLogout}>
                🚪 Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      {!userId ? (
        <Box
          sx={{
            height: 'calc(100vh - 64px)',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            backgroundColor: 'background.default',
            px: 2,
          }}
        >
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Understand why candidates match—skills, projects, and gaps.
          </Typography>

          <Card sx={{ width: '100%', maxWidth: 400, backgroundColor: 'background.paper', p: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                🔐 Login
              </Typography>
              <LoginForm
                setUserId={(id) => {
                  localStorage.setItem('userId', id);
                  setUserId(id);
                }}
              />
            </CardContent>
          </Card>

          <Box component="footer" sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Built with React + Vite
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            height: 'calc(100vh - 64px)',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            textAlign: 'center',
            px: 2,
          }}
        >
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            Understand why candidates match—skills, projects, and gaps.
          </Typography>

          <Box sx={{ width: '100%', maxWidth: 1000 }}>
            <Dashboard />
          </Box>

          <Box component="footer" sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Built with React + Vite
            </Typography>
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
