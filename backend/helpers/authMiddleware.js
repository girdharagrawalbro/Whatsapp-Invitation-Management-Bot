const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session || !req.session.orgId) {
      return res.status(401).json({ success: false, error: 'Login required' });
    }

    const user = await User.findById(req.session.userId || req.session.orgId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
