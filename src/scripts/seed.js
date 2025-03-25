const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
require('dotenv').config();

const sampleUsers = [
  {
    name: 'Erfan Ahmadvand',
    phone: '+989109924707',
    location: {
      type: 'Point',
      coordinates: [51.5074, -0.1278] // London coordinates
    },
    preferences: {
      categories: ['music', 'food', 'arts'],
      radius: 10,
      notificationPreferences: {
        email: false,
        sms: true
      }
    }
  },
  {
    name: 'John Doe',
    phone: '+1234567890',
    location: {
      type: 'Point',
      coordinates: [40.7128, -74.0060] // New York coordinates
    },
    preferences: {
      categories: ['sports', 'education'],
      radius: 15,
      notificationPreferences: {
        email: true,
        sms: true
      }
    }
  }
];

const sampleEvents = [
  {
    title: 'Summer Music Festival',
    description: 'A day of live music featuring local bands',
    date: new Date('2024-07-15'),
    location: {
      type: 'Point',
      coordinates: [51.5074, -0.1278]
    },
    address: 'Central Park, London',
    category: 'music',
    source: 'Local Events Website',
    sourceUrl: 'https://example.com/events/summer-festival',
    price: 25
  },
  {
    title: 'Food & Wine Tasting',
    description: 'Sample local cuisine and wines',
    date: new Date('2024-08-01'),
    location: {
      type: 'Point',
      coordinates: [51.5074, -0.1278]
    },
    address: 'Downtown Restaurant, London',
    category: 'food',
    source: 'Local Events Website',
    sourceUrl: 'https://example.com/events/food-tasting',
    price: 50
  },
  {
    title: 'Art Exhibition',
    description: 'Contemporary art showcase',
    date: new Date('2024-09-10'),
    location: {
      type: 'Point',
      coordinates: [40.7128, -74.0060]
    },
    address: 'Modern Art Gallery, New York',
    category: 'arts',
    source: 'Local Events Website',
    sourceUrl: 'https://example.com/events/art-exhibition',
    price: 15
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log('🧹 Cleared existing data');
    
    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${users.length} users`);
    
    // Insert sample events
    const events = await Event.insertMany(sampleEvents);
    console.log(`✅ Inserted ${events.length} events`);
    
    console.log('✨ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 