const AdminUser = require('../models/AdminUser');

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.session || !req.session.orgId) {
      return res.status(401).json({ success: false, error: 'Login required' });
    }

    const adminUser = await AdminUser.findById(req.session.AdminUserId || req.session.orgId);
    if (!adminUser) {
      req.session.destroy();
      return res.status(401).json({ success: false, error: 'AdminUser not found' });
    }

    if (!adminUser.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    req.AdminUser = adminUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
