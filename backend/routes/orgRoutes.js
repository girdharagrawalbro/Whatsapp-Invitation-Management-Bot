const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const responseModifier = require('../utils/responseModifier.js');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { phone, password, name, email, language } = req.body;

    const existing = await User.findOne({ phone });
    if (existing) return res.status(400).json({ error: `${language === 'hi' ? 'यह फोन नंबर पहले से पंजीकृत है' : 'Phone number already exists'}` });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      phone,
      password: hashedPassword,
      name,
      email,
      role: 'admin',
      defaultLanguage: language || 'en',
      onboardingStatus: 'complete' // Automatically set onboarding to complete upon signup
    });

    req.session.orgId = user._id;

    const response = responseModifier(user);
    res.json({ success: true, organization: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password, language } = req.body;
    
    const account = await User.findOne({ phone });

    if (!account || (account.role === 'user' && !account.password)) {
      return res.status(404).json({ error: `${language === 'hi' ? 'खाता नहीं मिला' : 'Account not found'}` });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ error: `${language === 'hi' ? 'गलत पासवर्ड' : 'Incorrect password'}` });

    if (account.role === 'admin') {
      req.session.orgId = account._id;
      if (language) {
        account.defaultLanguage = language;
        await account.save();
      }
    } else {
      req.session.orgId = account.orgId; // Link to the organization admin
      req.session.userId = account._id;
    }

    const response = responseModifier(account);
    res.json({ success: true, organization: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get Current Profile
router.get('/me', async (req, res) => {
  const language = req.query?.language || req.body?.language; // Support both
  if (!req.session.orgId && !req.session.userId) {
    return res.status(401).json({ error: `${language === 'hi' ? 'लॉगिन आवश्यक है' : 'Login required'}` });
  }
  
  try {
    const account = await User.findById(req.session.userId || req.session.orgId);
    
    if (!account) return res.status(404).json({ error: 'Account not found' });
    
    const response = responseModifier(account);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile/Settings
router.put('/me', async (req, res) => {
  try {
    const targetId = req.session.userId || req.session.orgId;
    if (!targetId) return res.status(401).json({ error: 'Not authenticated' });

    const updates = req.body;
    const allowedUpdates = ['name', 'email', 'isServicePaused', 'notificationPreferences', 'dailyBriefingHour', 'dailyBriefingMinute', 'defaultLanguage'];
    
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(targetId, { $set: filteredUpdates }, { new: true });
    res.json({ success: true, organization: responseModifier(updatedUser) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Profile
router.delete('/me', async (req, res) => {
  try {
    const targetId = req.session.userId || req.session.orgId;
    if (!targetId) return res.status(401).json({ error: 'Not authenticated' });

    await User.findByIdAndDelete(targetId);
    req.session.destroy();
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

