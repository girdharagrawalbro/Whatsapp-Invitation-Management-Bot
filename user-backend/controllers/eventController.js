const Event = require('../models/Event');
const logger = require('../helpers/logger');

exports.getAllEvents = async (req, res, next) => {
  try {
    const orgId = req.session.orgId;
    const userId = req.session.userId;
    const query = { orgId };
    if (userId) query.userId = userId;

    const events = await Event.find(query).sort({ eventDate: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

exports.getTodayCount = async (req, res, next) => {
  try {
    const orgId = req.session.orgId;
    const userId = req.session.userId;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const query = {
      orgId,
      eventDate: { $gte: start, $lte: end }
    };
    if (userId) query.userId = userId;

    const count = await Event.countDocuments(query);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

exports.getUpcomingCount = async (req, res, next) => {
  try {
    const orgId = req.session.orgId;
    const userId = req.session.userId;
    const now = new Date();
    
    const query = {
      orgId,
      eventDate: { $gt: now }
    };
    if (userId) query.userId = userId;

    const count = await Event.countDocuments(query);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

exports.createEvent = async (req, res, next) => {
  try {
    const { title, eventDate, eventTime, venue, hostName, contactPhone, notes, mediaUrl, mediaType } = req.body;
    const orgId = req.session.orgId;
    const userId = req.session.userId || req.body.userId; // Allow specifying user if admin

    if (!title || !eventDate) {
      return res.status(400).json({ error: 'Title and eventDate are required' });
    }

    const event = new Event({
      orgId,
      userId: userId || req.session.userId, // Fallback to session
      title,
      eventDate,
      eventTime,
      venue,
      hostName,
      contactPhone,
      notes,
      mediaUrl,
      mediaType
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const orgId = req.session.orgId;
    const userId = req.session.userId;
    const updateData = req.body;

    const query = { _id: req.params.id, orgId };
    if (userId) query.userId = userId;

    const event = await Event.findOneAndUpdate(query, updateData, { new: true });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const orgId = req.session.orgId;
    const userId = req.session.userId;
    
    const query = { _id: req.params.id, orgId };
    if (userId) query.userId = userId;

    const event = await Event.findOneAndDelete(query);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const { extractEventDetailsFromMedia } = require('../helpers/eventExtractor');
const fs = require('fs');

exports.uploadEventMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaType = req.body.mediaType || 'image';
    const filePath = req.file.path;

    const extractedEvents = await extractEventDetailsFromMedia(filePath, mediaType);
    
    fs.unlink(filePath, () => {});

    if (extractedEvents.error) {
      return res.status(500).json({ error: extractedEvents.error });
    }

    res.json({ 
      success: true, 
      extractedData: extractedEvents[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getEventStats = async (req, res, next) => {
  try {
    const orgId = req.session.orgId;
    const userId = req.session.userId;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0,0,0,0);

    const query = { orgId };
    if (userId) query.userId = userId;

    const [todayCount, totalCount] = await Promise.all([
      Event.countDocuments({ ...query, eventDate: { $gte: todayStart, $lte: todayEnd } }),
      Event.countDocuments({ ...query, createdAt: { $gte: monthStart } })
    ]);

    res.json({ today: todayCount, total: totalCount });
  } catch (error) {
    next(error);
  }
};