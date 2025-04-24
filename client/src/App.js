import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Container, CssBaseline } from '@mui/material'; // Added Box

// Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import EventDashboard from './components/Events/EventDashboard';
import AddEvent from './components/Events/AddEvent';
import Sidebar from './components/Layout/Sidebar';

// Initialize axios
axios.defaults.baseURL = 'http://localhost:5000';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await axios.get('/api/auth/verify');
        setIsAuthenticated(true);
        setUser(data.user);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}> {/* Added flex container */}
        <Routes>
          {/* Public routes without sidebar */}
          <Route
            path="/"
            element={!isAuthenticated ? <Register onRegister={handleLogin} /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" replace />}
          />
          
          {/* Authenticated routes with sidebar */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <AuthenticatedLayout user={user} onLogout={handleLogout}>
                  <EventDashboard user={user} />
                </AuthenticatedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/add-event"
            element={
              isAuthenticated ? (
                <AuthenticatedLayout user={user} onLogout={handleLogout}>
                  <AddEvent user={user} />
                </AuthenticatedLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

// Layout component for authenticated routes
const AuthenticatedLayout = ({ user, onLogout, children }) => {
  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <Sidebar isAuthenticated={true} user={user} onLogout={onLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - 240px)`,
          marginLeft: '240px'
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default App;