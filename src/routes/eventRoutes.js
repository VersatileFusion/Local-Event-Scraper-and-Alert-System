const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const scraperService = require('../services/scraperService');
const notificationService = require('../services/notificationService');

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get events with filters
 *     description: Retrieve events based on location, category, and date range
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location coordinates in format "latitude,longitude"
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Search radius in kilometers
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [music, food, sports, arts, education, business, other]
 *         description: Event category
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for event search
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for event search
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching events with filters:', req.query);
    const { location, radius, category, startDate, endDate } = req.query;
    
    let query = {};
    
    // Location-based query
    if (location) {
      const [latitude, longitude] = location.split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: (radius || 10) * 1000 // Convert km to meters
        }
      };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const events = await Event.find(query);
    console.log(`✅ Found ${events.length} events`);
    res.json(events);
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * @swagger
 * /api/events/{eventId}/feedback:
 *   post:
 *     summary: Submit event feedback
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [attended, not_interested]
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 */
router.post('/:eventId/feedback', async (req, res) => {
  try {
    console.log(`📝 Submitting feedback for event ${req.params.eventId}`);
    const { userId, status } = req.body;
    
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    event.feedback.push({
      userId,
      status,
      date: new Date()
    });
    
    await event.save();
    console.log('✅ Feedback submitted successfully');
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

/**
 * @swagger
 * /api/events/scrape:
 *   post:
 *     summary: Trigger event scraping
 *     description: Manually trigger the event scraping process
 *     responses:
 *       200:
 *         description: Scraping process started
 */
router.post('/scrape', async (req, res) => {
  try {
    console.log('🔄 Starting manual event scraping');
    await scraperService.initialize();
    
    // Example scraping configuration
    const selectors = {
      eventContainer: '.event-item',
      title: '.event-title',
      description: '.event-description',
      date: '.event-date',
      location: '.event-location',
      category: '.event-category',
      link: '.event-link'
    };
    
    // Example URLs to scrape
    const urls = [
      'https://example.com/events',
      'https://example.com/local-events'
    ];
    
    const events = [];
    for (const url of urls) {
      try {
        const scrapedEvents = await scraperService.scrapeWithCheerio(url, selectors);
        events.push(...scrapedEvents);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
      }
    }
    
    if (events.length > 0) {
      await scraperService.saveEvents(events);
    }
    
    await scraperService.close();
    console.log('✅ Scraping process completed');
    res.json({ message: 'Scraping process completed', eventsFound: events.length });
  } catch (error) {
    console.error('❌ Error during scraping:', error);
    res.status(500).json({ error: 'Failed to complete scraping process' });
  }
});

module.exports = router; 