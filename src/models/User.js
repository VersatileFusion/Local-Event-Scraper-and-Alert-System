const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  preferences: {
    categories: [{
      type: String,
      enum: ['music', 'food', 'sports', 'arts', 'education', 'business', 'other']
    }],
    radius: {
      type: Number,
      default: 10, // Default radius in kilometers
      min: 1,
      max: 100
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: true
      }
    }
  },
  attendedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

console.log('👤 User model created successfully');

module.exports = User; 