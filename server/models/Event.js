const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  start: {
    type: Date,
    required: true
  },
  end: Date,
  reminderTime: {
    type: Number,  // in minutes
    default: 30
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderTimeCalculated: Date  // When the reminder should be sent
}, {
  timestamps: true
});

// Calculate reminder time before saving
eventSchema.pre('save', function(next) {
  if (this.isModified('start') || this.isModified('reminderTime')) {
    // Calculate when reminder should be sent (start time - reminder minutes)
    this.reminderTimeCalculated = new Date(
      this.start.getTime() - (this.reminderTime * 60 * 1000)
    );
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);