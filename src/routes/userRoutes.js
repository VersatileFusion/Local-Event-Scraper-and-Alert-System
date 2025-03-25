const express = require('express');
const router = express.Router();
const User = require('../models/User');
const notificationService = require('../services/notificationService');

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *               preferences:
 *                 type: object
 *                 properties:
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   radius:
 *                     type: number
 *                   notificationPreferences:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: boolean
 *                       sms:
 *                         type: boolean
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post('/', async (req, res) => {
  try {
    console.log('👤 Creating new user:', req.body);
    const user = new User(req.body);
    await user.save();
    console.log('✅ User created successfully:', user._id);
    res.status(201).json(user);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(400).json({ error: 'Failed to create user' });
  }
});

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:userId', async (req, res) => {
  try {
    console.log(`👤 Fetching user ${req.params.userId}`);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User fetched successfully');
    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * @swagger
 * /api/users/{userId}/preferences:
 *   put:
 *     summary: Update user preferences
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               radius:
 *                 type: number
 *               notificationPreferences:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   sms:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/:userId/preferences', async (req, res) => {
  try {
    console.log(`⚙️ Updating preferences for user ${req.params.userId}`);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.preferences = {
      ...user.preferences,
      ...req.body
    };
    
    await user.save();
    console.log('✅ User preferences updated successfully');
    res.json(user);
  } catch (error) {
    console.error('❌ Error updating user preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * @swagger
 * /api/users/{userId}/location:
 *   put:
 *     summary: Update user location
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
router.put('/:userId/location', async (req, res) => {
  try {
    console.log(`📍 Updating location for user ${req.params.userId}`);
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.location.coordinates = req.body.coordinates;
    await user.save();
    
    console.log('✅ User location updated successfully');
    res.json(user);
  } catch (error) {
    console.error('❌ Error updating user location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

module.exports = router; 