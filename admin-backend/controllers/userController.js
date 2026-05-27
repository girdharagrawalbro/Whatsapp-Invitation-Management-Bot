const User = require('../models/User');
const Message = require('../models/Message');

exports.getAllUsers = async (req, res) => {
  try {
    const orgId = req.session.orgId;
    const users = await User.find({ orgId: orgId }).sort({ lastActiveAt: -1 });
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
