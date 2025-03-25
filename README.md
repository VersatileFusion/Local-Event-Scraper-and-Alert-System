# Local Event Scraper and Alert System 🎉

A powerful Node.js application that automatically scrapes local events from various sources and sends personalized notifications to users based on their preferences.

## Features 🌟

- **Automated Event Scraping**: Scrapes events from multiple sources using both Puppeteer and Cheerio
- **Smart Event Matching**: Filters events based on user preferences (location, categories, radius)
- **Multi-Channel Notifications**: Supports both SMS (via Twilio) and Email notifications
- **User Preferences**: Allows users to set their location, preferred categories, and notification preferences
- **RESTful API**: Well-documented API endpoints for managing users and events
- **Swagger Documentation**: Interactive API documentation
- **MongoDB Integration**: Efficient data storage and retrieval
- **Scheduled Scraping**: Automated event updates using node-cron
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack 🛠️

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Web Scraping**: Puppeteer, Cheerio
- **API Documentation**: Swagger UI
- **Notifications**: Twilio (SMS), Nodemailer (Email)
- **Scheduling**: node-cron
- **Logging**: Winston

## Prerequisites 📋

- Node.js (v14 or higher)
- MongoDB
- Google Chrome (for Puppeteer)
- Twilio Account (optional, for SMS notifications)
- SMTP Server (optional, for email notifications)

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/local-event-scraper.git
cd local-event-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/
NODE_ENV=development

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# SMTP Configuration (Optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# Chrome Configuration (optional)
CHROME_PATH=C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
```

## Usage 💡

1. Start the server:
```bash
npm run dev
```

2. Seed the database with sample data:
```bash
npm run seed
```

3. Start the event scraper:
```bash
npm run scrape
```

## API Endpoints 🌐

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId/preferences` - Update user preferences
- `PUT /api/users/:userId/location` - Update user location

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:eventId` - Get event details
- `GET /api/events/search` - Search events by criteria

## API Documentation 📚

Once the server is running, visit:
```
http://localhost:3000/api-docs
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Puppeteer](https://pptr.dev/)
- [Twilio](https://www.twilio.com/)
- [Swagger](https://swagger.io/)

## Support 💬

If you have any questions or need help, please open an issue in the GitHub repository. 