const express = require('express');
const router = express.Router();
const AdminUser = require('../models/AdminUser.js');
const bcrypt = require('bcryptjs');
const responseModifier = require('../utils/responseModifier.js');


// Login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log(phone)
    const account = await AdminUser.findOne({ phone });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    req.session.orgId = account._id;

    const response = responseModifier(account);
    res.json({ success: true, organization: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current Profile
router.get('/me', async (req, res) => {
  if (!req.session.orgId) {
    return res.status(401).json({ error: 'Login required' });
  }

  try {
    const account = await AdminUser.findById(req.session.orgId);

    if (!account) return res.status(404).json({ error: 'Account not found' });

    const response = responseModifier(account);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const authMiddleware = require('../helpers/authMiddleware');

// Get all Admin Users
router.get('/admin-users', authMiddleware, async (req, res) => {
  try {
    const admins = await AdminUser.find().select('-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create admin user
router.post('/admin-users', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }
    const existing = await AdminUser.findOne({ phone });
    if (existing) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new AdminUser({
      name,
      phone,
      email,
      password: hashedPassword,
      role: 'admin'
    });
    await newAdmin.save();
    res.status(201).json(responseModifier(newAdmin));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update admin user
router.put('/admin-users/:id', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const updated = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Admin user not found' });
    res.json(responseModifier(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete admin user
router.delete('/admin-users/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await AdminUser.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Admin user not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;

