const twilio = require('twilio');
const nodemailer = require('nodemailer');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'notification-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'notification-combined.log' })
  ]
});

class NotificationService {
  constructor() {
    console.log('📱 Initializing Notification Service...');
    this.twilioClient = null;
    this.smtpTransporter = null;
    this.initializeServices();
  }

  initializeServices() {
    // Initialize Twilio if credentials are provided
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('✅ Twilio initialized successfully');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Twilio:', error.message);
        logger.warn('Twilio initialization failed:', error);
      }
    } else {
      console.log('ℹ️ Twilio credentials not provided, SMS notifications disabled');
    }

    // Initialize SMTP if credentials are provided
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        this.smtpTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        console.log('✅ SMTP initialized successfully');
      } catch (error) {
        console.warn('⚠️ Failed to initialize SMTP:', error.message);
        logger.warn('SMTP initialization failed:', error);
      }
    } else {
      console.log('ℹ️ SMTP credentials not provided, email notifications disabled');
    }
  }

  async sendSMS(to, message) {
    if (!this.twilioClient) {
      console.log('ℹ️ SMS notifications are disabled');
      return false;
    }

    try {
      await this.twilioClient.messages.create({
        body: message,
        to: to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      console.log(`✅ SMS sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${to}:`, error);
      logger.error('SMS sending failed:', error);
      return false;
    }
  }

  async sendEmail(to, subject, text, html) {
    if (!this.smtpTransporter) {
      console.log('ℹ️ Email notifications are disabled');
      return false;
    }

    try {
      await this.smtpTransporter.sendMail({
        from: process.env.SMTP_USER,
        to: to,
        subject: subject,
        text: text,
        html: html
      });
      console.log(`✅ Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  async notifyUser(user, event) {
    const notificationResults = {
      sms: false,
      email: false
    };

    if (user.notificationPreferences.sms && this.twilioClient) {
      const message = `New event: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\nDescription: ${event.description}`;
      notificationResults.sms = await this.sendSMS(user.phone, message);
    }

    if (user.notificationPreferences.email && this.smtpTransporter) {
      const subject = `New Event Alert: ${event.title}`;
      const text = `New event found:\n\nTitle: ${event.title}\nDate: ${event.date}\nLocation: ${event.location}\nDescription: ${event.description}`;
      const html = `
        <h2>New Event Alert</h2>
        <h3>${event.title}</h3>
        <p><strong>Date:</strong> ${event.date}</p>
        <p><strong>Location:</strong> ${event.location}</p>
        <p><strong>Description:</strong> ${event.description}</p>
      `;
      notificationResults.email = await this.sendEmail(user.email, subject, text, html);
    }

    return notificationResults;
  }
}

module.exports = new NotificationService(); 
module.exports = new NotificationService(); 