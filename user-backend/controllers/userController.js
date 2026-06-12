const User = require('../models/User');
const Message = require('../models/Message');

exports.getAllUsers = async (req, res) => {
  try {
    const orgId = req.session.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Unauthorized: No organization session' });
    }
    const users = await User.find({ orgId, role: 'user' }).sort({ lastActiveAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { phone, name, type } = req.body;
    const orgId = req.session.orgId;

    if (!phone || !/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const user = new User({
      orgId: orgId,
      phone,
      name,
      lastActiveAt: new Date(),
      role: 'user'
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Phone number already exists' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.updateUser = async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, orgId: orgId },
      req.body,
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found or unauthorized' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const user = await User.findOneAndDelete({ _id: req.params.id, orgId: orgId });

    if (!user) return res.status(404).json({ error: 'User not found or unauthorized' });

    // Clean up messages for this user
    // await Message.deleteMany({ user: user._id }); // If Message model is used

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    const orgId = req.session.orgId;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'IDs array required' });
    }

    await User.deleteMany({ _id: { $in: ids }, orgId: orgId });
    // Cleanup messages
    // await Message.deleteMany({ user: { $in: ids } });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper to format organization response
const formatOrganizationResponse = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  // Remove password from response
  delete userObj.password;
  return {
    ...userObj,
    adminPhone: user.phone // compatibility with frontend AuthContext
  };
};

// @desc    Register a new organization (admin user)
// @route   POST /api/organizations/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, phone, password, email, language } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, phone, and password are required' });
    }

    if (!/^\d{10,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered. Please login.' });
    }

    // Create new organization admin
    const user = new User({
      name,
      phone,
      password,
      email,
      role: 'admin', // Signs up as organization admin
      defaultLanguage: (language === 'hi' ? 'hi' : 'en'),
      isActive: true,
      lastActiveAt: new Date()
    });

    await user.save();

    // Set session
    req.session.orgId = user._id;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      organization: formatOrganizationResponse(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Authenticate organization user
// @route   POST /api/organizations/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { phone, password, language } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    // Find the user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone number or password' });
    }

    // Update last active
    user.lastActiveAt = new Date();
    if (language && (language === 'en' || language === 'hi')) {
      user.defaultLanguage = language;
    }
    await user.save();

    // Set session
    req.session.orgId = user._id;
    req.session.role = user.role;

    res.json({
      success: true,
      organization: formatOrganizationResponse(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get currently logged in organization details
// @route   GET /api/organizations/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const userId = req.session.orgId;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    res.json(formatOrganizationResponse(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Logout user & clear session
// @route   POST /api/organizations/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to destroy session' });
      }
      res.clearCookie('connect.sid'); // default express-session cookie name
      res.json({ success: true, message: 'Logged out successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
