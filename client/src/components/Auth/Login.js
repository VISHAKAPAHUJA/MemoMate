import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Divider
} from '@mui/material';
import './Register.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.verifiedSuccess) {
      setVerifiedEmail(location.state.email);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      const res = await axios.post('/api/auth/login', { 
        email: email.trim(), 
        password: password.trim()
      });
  
      // Successful login handling...
  
    } catch (err) {
      const errorData = err.response?.data || {};
      const errorMessage = errorData.error || 'Login failed. Please try again.';
      
      // Handle unverified email case
      if (errorData.notVerified) {
        navigate('/verify-email', { state: { email: errorData.email } });
        return;
      }
  
      // Handle specific field errors
      if (errorData.field) {
        setError(`Please provide a valid ${errorData.field}`);
        return;
      }
  
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-screen" style={{ marginLeft: 0 }}>
      <Box className="register-form-container">
        <Box sx={{ 
          textAlign: 'center', 
          mb: 4,
          background: 'linear-gradient(135deg, #4a6baf 0%, #3a5683 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(74, 107, 175, 0.3)'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: '800',
              letterSpacing: '1px',
              mb: 1
            }}
          >
            MemoMate
          </Typography>
          <Typography 
            variant="subtitle1"
            sx={{
              fontStyle: 'italic',
              opacity: 0.9,
              letterSpacing: '0.5px'
            }}
          >
            Never miss a moment
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
          Welcome back
        </Typography>

        {verifiedEmail && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your email {verifiedEmail} has been verified successfully! Please log in.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="register-form">
          <TextField
            fullWidth
            required
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            required
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              py: 1.5,
              mb: 2,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #4a6baf 0%, #3a5683 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3a5683 0%, #2a4568 100%)'
              }
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Divider sx={{ my: 3 }}>or</Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ py: 1.5, mb: 3 }}
          >
            Continue with Google
          </Button>

          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link href="/register" sx={{ fontWeight: 'bold', color: '#4a6baf' }}>
              Register
            </Link>
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Login;