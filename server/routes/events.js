const express = require('express');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');

const router = express.Router();

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Create Event
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, start, end, reminderTime } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Event title is required' });
    }

    if (!start) {
      return res.status(400).json({ error: 'Start date is required' });
    }

    const event = new Event({ 
      title: title.trim(),
      start: new Date(start),
      end: end ? new Date(end) : null,
      reminderTime: reminderTime || 30,
      user: req.userId 
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Event creation error:', err);
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create event',
      details: err.message 
    });
  }
});

// Get All Events for User
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await Event.find({ user: req.userId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Event
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Find and delete only if event belongs to the user
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found or not authorized' 
      });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid event ID' });
    }
    
    res.status(500).json({ 
      error: 'Failed to delete event',
      details: err.message 
    });
  }
});

module.exports = router;