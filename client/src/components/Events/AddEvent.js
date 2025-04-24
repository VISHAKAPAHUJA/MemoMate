import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EventIcon from '@mui/icons-material/Event';
import './AddEvent.css';
import clickSound from './sounds/click.mp3';
import errorSound from './sounds/error.mp3';

const AddEvent = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    start: new Date(),
    end: null,
    reminderTime: 30
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const playSound = (sound) => {
    const audio = new Audio(sound);
    audio.play().catch(() => {});
  };

  const vibrate = () => {
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      if (!formData.title.trim()) throw new Error('Event title is required');

      const eventData = {
        title: formData.title.trim(),
        start: formData.start,
        reminderTime: Number(formData.reminderTime),
        user: user?._id
      };

      if (formData.end) {
        if (formData.end < formData.start) throw new Error('End date must be after start date');
        eventData.end = formData.end;
      }

      await axios.post('/api/events', eventData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        transformRequest: [(data) => {
          const transformed = {
            ...data,
            start: data.start.toISOString(),
          };
          if (data.end) transformed.end = data.end.toISOString();
          return JSON.stringify(transformed);
        }]
      });

      playSound(clickSound);
      vibrate();
      navigate('/dashboard');

    } catch (err) {
      playSound(errorSound);
      vibrate();

      let errorMessage = 'Failed to create event. Please try again.';
      if (err.response) {
        errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm" className="form-container">
        <div className="background-animation">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="bubble" />
          ))}
        </div>

        <Box className="form-header">
          <EventIcon className="header-icon" />
          <Typography variant="h4" className="form-title">Create New Event</Typography>
          <Typography variant="subtitle1" className="form-subtitle">
            Fill in the details to schedule your event
          </Typography>
        </Box>

        {error && <Alert severity="error" className="error-alert">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} className="event-form">
          <TextField
            fullWidth
            label="Event Title *"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            className="form-input"
            error={!!error && !formData.title.trim()}
            sx={{ mb: 3 }}
          />

          <Box className="date-time-group" sx={{ mb: 3 }}>
            <DateTimePicker
              label="Start Date & Time *"
              value={formData.start}
              onChange={(newValue) => setFormData({ ...formData, start: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth className="form-input" />}
            />
          </Box>

          <Box className="date-time-group" sx={{ mb: 3 }}>
            <DateTimePicker
              label="End Date & Time (Optional)"
              value={formData.end}
              onChange={(newValue) => setFormData({ ...formData, end: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth className="form-input" />}
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel>Reminder Time (Minutes Before)</InputLabel>
            <Select
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              label="Reminder Time (Minutes Before)"
              className="select-input"
            >
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
              <MenuItem value={1440}>1 day</MenuItem>
            </Select>
          </FormControl>

          <Box className="button-group">
            <Button variant="outlined" onClick={() => navigate('/dashboard')} className="cancel-button" sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.title.trim()}
              className="submit-button"
            >
              {loading ? (
                <span className="loading-dots">
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              ) : 'Create Event'}
            </Button>
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AddEvent;
