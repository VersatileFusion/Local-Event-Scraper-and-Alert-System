const cheerio = require('cheerio');
const puppeteer = require('puppeteer-core');
const Event = require('../models/Event');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'scraper-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'scraper-combined.log' })
  ]
});

class ScraperService {
  constructor() {
    this.browser = null;
    console.log('🔍 Initializing Scraper Service...');
  }

  async initialize() {
    try {
      // Use system Chrome if available, otherwise fallback to headless mode
      const options = {
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_PATH || undefined
      };

      this.browser = await puppeteer.launch(options);
      console.log('🌐 Puppeteer browser initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer:', error);
      logger.error('Puppeteer initialization failed:', error);
      // Fallback to cheerio-only mode
      console.log('⚠️ Falling back to cheerio-only mode');
    }
  }

  async scrapeWithCheerio(url, selectors) {
    try {
      console.log(`🔍 Scraping with Cheerio: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const events = [];
      $(selectors.eventContainer).each((i, element) => {
        const event = {
          title: $(element).find(selectors.title).text().trim(),
          description: $(element).find(selectors.description).text().trim(),
          date: $(element).find(selectors.date).text().trim(),
          location: $(element).find(selectors.location).text().trim(),
          category: $(element).find(selectors.category).text().trim(),
          source: url,
          sourceUrl: $(element).find(selectors.link).attr('href')
        };
        events.push(event);
      });

      console.log(`✅ Found ${events.length} events from ${url}`);
      return events;
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error);
      logger.error(`Scraping error for ${url}:`, error);
      throw error;
    }
  }

  async scrapeWithPuppeteer(url, selectors) {
    if (!this.browser) {
      console.log('⚠️ Puppeteer not available, falling back to cheerio');
      return this.scrapeWithCheerio(url, selectors);
    }

    try {
      console.log(`🔍 Scraping with Puppeteer: ${url}`);
      const page = await this.browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 // 30 seconds timeout
      });

      const events = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel.eventContainer);
        return Array.from(elements).map(element => ({
          title: element.querySelector(sel.title)?.textContent.trim(),
          description: element.querySelector(sel.description)?.textContent.trim(),
          date: element.querySelector(sel.date)?.textContent.trim(),
          location: element.querySelector(sel.location)?.textContent.trim(),
          category: element.querySelector(sel.category)?.textContent.trim(),
          source: window.location.href,
          sourceUrl: element.querySelector(sel.link)?.href
        }));
      }, selectors);

      await page.close();
      console.log(`✅ Found ${events.length} events from ${url}`);
      return events;
    } catch (error) {
      console.error(`❌ Error scraping ${url} with Puppeteer:`, error);
      logger.error(`Puppeteer scraping error for ${url}:`, error);
      // Fallback to cheerio
      console.log('⚠️ Falling back to cheerio');
      return this.scrapeWithCheerio(url, selectors);
    }
  }

  async saveEvents(events) {
    try {
      console.log(`💾 Saving ${events.length} events to database...`);
      const savedEvents = await Event.insertMany(events, { ordered: false });
      console.log(`✅ Successfully saved ${savedEvents.length} events`);
      return savedEvents;
    } catch (error) {
      console.error('❌ Error saving events:', error);
      logger.error('Error saving events:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

module.exports = new ScraperService(); 