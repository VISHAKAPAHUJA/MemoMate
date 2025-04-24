import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import './EventDashboard.css';

const EventDashboard = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [eventImages, setEventImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate(); // Added navigation hook

  const fetchEventImage = async (eventTitle) => {
    try {
      const unsplashApiKey = 'rmiBNY1LAmgqZ-J2-M_uPfmubgNw4Var7Vczs1kxxPQ';
      
      // Try with the full title first
      let response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(eventTitle)}&client_id=${unsplashApiKey}`
      );

      // If no results, try with keywords from the title
      if (!response.data || !response.data.urls) {
        const keywords = eventTitle.toLowerCase().split(' ');
        for (const keyword of keywords) {
          if (keyword.length > 3) {
            response = await axios.get(
              `https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&client_id=${unsplashApiKey}`
            );
            if (response.data && response.data.urls) break;
          }
        }
      }

      // Fallback to general event images if still no results
      if (!response.data || !response.data.urls) {
        response = await axios.get(
          `https://api.unsplash.com/photos/random?query=event&client_id=${unsplashApiKey}`
        );
      }

      return response.data?.urls?.regular || null;
    } catch (err) {
      console.error('Error fetching image:', err);
      return null;
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Redirect to login if no token
        return;
      }

      const res = await axios.get('/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEvents(res.data);

      // Fetch images for each event
      const imagePromises = res.data.map(async (event) => {
        try {
          const imageUrl = await fetchEventImage(event.title);
          return { id: event._id, url: imageUrl };
        } catch (err) {
          console.error(`Error fetching image for event ${event.title}:`, err);
          return { id: event._id, url: null };
        }
      });

      const imageResults = await Promise.all(imagePromises);
      const images = {};
      imageResults.forEach(result => {
        if (result.url) images[result.id] = result.url;
      });

      setEventImages(images);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch events');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login'); // Redirect to login on 401
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [navigate]); // Added navigate to dependency array

  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`/api/events/${eventToDelete}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEvents(events.filter(event => event._id !== eventToDelete));
      setEventImages(prev => {
        const newImages = {...prev};
        delete newImages[eventToDelete];
        return newImages;
      });
      setError('');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete event');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      setSelectedEvent(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress size={60} />
    </Box>
  );

  if (error) return (
    <Alert severity="error" sx={{ margin: 2 }}>
      {error}
      <Button onClick={fetchEvents} sx={{ ml: 2 }}>Retry</Button>
    </Alert>
  );

  return (
    <div className="event-dashboard">
      <div className="dashboard-header">
        <Typography variant="h4" component="h1">Your Events</Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/add-event"
          size="large"
          className="add-event-btn"
        >
          Add New Event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <Typography variant="h6">No events scheduled yet.</Typography>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/add-event"
            sx={{ mt: 2 }}
            className="create-first-event-btn"
          >
            Create Your First Event
          </Button>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event, index) => (
            <div 
              key={event._id} 
              className="event-card"
              onClick={() => setSelectedEvent(event)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="event-image-container">
                {eventImages[event._id] ? (
                  <img 
                    src={eventImages[event._id]} 
                    alt={event.title}
                    className="event-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) {
                        fallback.style.display = 'flex';
                        fallback.textContent = event.title.charAt(0).toUpperCase();
                      }
                    }}
                  />
                ) : (
                  <div className="event-image-loading">
                    <CircularProgress size={24} />
                  </div>
                )}
                <div className="event-image-fallback" style={{ display: 'none' }}>
                  {event.title.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="event-details">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-date">
                  {format(new Date(event.start), 'PPPPp')}
                </p>
                {event.location && (
                  <p className="event-location">
                    <LocationOnIcon fontSize="small" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      <div className={`event-modal ${selectedEvent ? 'active' : ''}`} onClick={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-image-container">
              {eventImages[selectedEvent._id] ? (
                <img 
                  src={eventImages[selectedEvent._id]} 
                  alt={selectedEvent.title}
                  className="modal-image"
                />
              ) : (
                <div className="modal-image-placeholder">
                  {selectedEvent.title.charAt(0).toUpperCase()}
                </div>
              )}
              <IconButton
                className="modal-close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                <CloseIcon />
              </IconButton>
            </div>
            <div className="modal-body">
              <h2 className="modal-title">{selectedEvent.title}</h2>
              <p className="modal-date">
                <strong>Date:</strong> {format(new Date(selectedEvent.start), 'PPPPp')}
              </p>
              {selectedEvent.location && (
                <p className="modal-location">
                  <LocationOnIcon fontSize="small" />
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
              )}
              {selectedEvent.description && (
                <p className="modal-description">
                  <strong>Description:</strong> {selectedEvent.description}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <Button 
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(selectedEvent._id);
                }}
                variant="outlined"
                className="delete-event-btn"
              >
                Delete Event
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        className="delete-dialog"
      >
        <DialogTitle className="dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText className="dialog-content-text">
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading} className="cancel-btn">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            disabled={loading}
            variant="contained"
            className="confirm-delete-btn"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EventDashboard;