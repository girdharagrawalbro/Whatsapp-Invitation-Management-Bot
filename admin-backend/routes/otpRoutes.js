// const express = require('express');
// const router = express.Router();
// const logger = require('../helpers/logger');
// const User = require('../models/User');
// const { getOpenWAHandler } = require('../helpers/openwaMessage');

// // In-memory OTP store (Use Redis for production)
// const otpStore = new Map();

// // Send OTP
// router.post('/send', async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ error: 'Phone number is required' });

//     // Check if phone already exists
//     const existing = await User.findOne({ phone });
//     if (existing) {
//       return res.status(400).json({ error: 'Phone number already registered. Please login.' });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiry = Date.now() + 5 * 60 * 1000; // 5 mins

//     otpStore.set(phone, { otp, expiry });

//     // CONDITIONAL TESTING MODE
//     if (process.env.OTP_TESTING === 'true') {
//       console.log(`\n\x1b[33m[OTP TEST MODE ACTIVE]\x1b[0m`);
//       console.log(`\x1b[33m[TEST OTP]\x1b[0m Phone: ${phone} | OTP: \x1b[32m${otp}\x1b[0m\n`);
//       logger.info(`OTP (Test Mode) generated for ${phone}`);
//       return res.json({ success: true, message: 'OTP generated in test mode' });
//     }

//     // Send via OpenWA (Production/Normal Mode using central bot session)
//     const handler = getOpenWAHandler({
//       sessionId: process.env.OPENWA_SESSION_ID || 'my-bot-session'
//     });

//     await handler.sendText(phone, `Your Invitely verification code is: ${otp}`);

//     logger.info(`OTP sent to ${phone}`);
//     res.json({ success: true, message: 'OTP sent' });
//   } catch (error) {
//     logger.error('Error sending OTP:', error);
//     res.status(500).json({ error: 'Failed to send OTP' });
//   }
// });

// // Verify OTP
// router.post('/verify', async (req, res) => {
//   const { phone, otp } = req.body;
//   const stored = otpStore.get(phone);

//   if (!stored) return res.status(400).json({ error: 'No OTP requested for this number' });
//   if (Date.now() > stored.expiry) return res.status(400).json({ error: 'OTP expired' });
//   if (stored.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

//   otpStore.delete(phone);
//   res.json({ success: true, message: 'Verified' });
// });

// module.exports = router;
