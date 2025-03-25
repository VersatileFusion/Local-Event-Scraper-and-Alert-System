const cron = require('node-cron');
const scraperService = require('../services/scraperService');
const Event = require('../models/Event');
const User = require('../models/User');
const notificationService = require('../services/notificationService');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'scheduler-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'scheduler-combined.log' })
  ]
});

// Scraping configuration
const scrapingConfig = {
  urls: [
    'https://example.com/events',
    'https://example.com/local-events'
  ],
  selectors: {
    eventContainer: '.event-item',
    title: '.event-title',
    description: '.event-description',
    date: '.event-date',
    location: '.event-location',
    category: '.event-category',
    link: '.event-link'
  }
};

// Schedule scraping every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('🔄 Starting scheduled event scraping');
    await scraperService.initialize();
    
    const events = [];
    for (const url of scrapingConfig.urls) {
      try {
        const scrapedEvents = await scraperService.scrapeWithCheerio(url, scrapingConfig.selectors);
        events.push(...scrapedEvents);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        logger.error(`Scraping failed for ${url}:`, error);
      }
    }
    
    if (events.length > 0) {
      const savedEvents = await scraperService.saveEvents(events);
      console.log(`✅ Saved ${savedEvents.length} new events`);
      
      // Notify users about new events
      await notifyUsers(savedEvents);
    }
    
    await scraperService.close();
    console.log('✅ Scheduled scraping completed');
  } catch (error) {
    console.error('❌ Error in scheduled scraping:', error);
    logger.error('Scheduled scraping error:', error);
  }
});

// Function to notify users about new events
async function notifyUsers(events) {
  try {
    console.log('🔔 Starting user notifications for new events');
    const users = await User.find({});
    
    for (const user of users) {
      for (const event of events) {
        // Check if event matches user preferences
        if (matchesUserPreferences(user, event)) {
          await notificationService.notifyUser(user, event);
        }
      }
    }
    
    console.log('✅ User notifications completed');
  } catch (error) {
    console.error('❌ Error sending user notifications:', error);
    logger.error('User notification error:', error);
  }
}

// Function to check if event matches user preferences
function matchesUserPreferences(user, event) {
  // Check if event is within user's preferred radius
  const distance = calculateDistance(
    user.location.coordinates,
    event.location.coordinates
  );
  
  if (distance > user.preferences.radius) {
    return false;
  }
  
  // Check if event category matches user's preferences
  if (user.preferences.categories.length > 0 && 
      !user.preferences.categories.includes(event.category)) {
    return false;
  }
  
  return true;
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI/180);
}

console.log('⏰ Event scraping scheduler initialized'); 