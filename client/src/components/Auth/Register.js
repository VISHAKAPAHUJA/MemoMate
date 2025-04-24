 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Divider
} from '@mui/material';
import './Register.css';

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', // Make sure this field is included
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
  
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
  
      // Debug: Log the response
      console.log('Registration response:', res.data);
  
      if (res.data.user) {
        // Check if onRegister exists before calling it
        if (typeof onRegister === 'function') {
          onRegister(res.data.token, res.data.user);
          navigate('/dashboard');
        } else {
          // Fallback: Redirect to login if onRegister isn't provided
          navigate('/login');
        }
      } else {
        setError('Registration successful, but missing user data');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="register-screen" style={{ marginLeft: 0 }}>
      <Box className="register-form-container">
        {/* Stylish Header - MemoMate */}
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
          Create your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="register-form">
          {/* Added back the name field which might be required by your backend */}
          <TextField
            fullWidth
            required
            margin="normal"
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            required
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            required
            margin="normal"
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            required
            margin="normal"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
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
            {loading ? 'Registering...' : 'Create your account'}
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
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" sx={{ fontWeight: 'bold', color: '#4a6baf' }}>
              Log in
            </Link>
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Register;