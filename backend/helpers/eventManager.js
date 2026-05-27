const Event = require('../models/Event');
const User = require('../models/User');

function parseDate(dateString) {
  const [day, month, year] = dateString.split('/');
  return new Date(Date.UTC(year, month - 1, day));
}

async function getNextEventIndex(orgId, userId) {
  try {
    const lastEvent = await Event.findOne({ orgId, userId }, {}, { sort: { eventIndex: -1 } });
    const nextIndex = lastEvent && lastEvent.eventIndex ? lastEvent.eventIndex + 1 : 1;
    return nextIndex;
  } catch (error) {
    console.error('Error getting next event index:', error);
    return 1;
  }
}

async function saveEvent({ eventData, mediaUrls, mediaType, from, orgId, userId }) {
  try {
    const parsedDate = parseDate(eventData.date);

    // 🔍 Check for duplicate event scoped to user and org
    const duplicateEvent = await Event.findOne({
      orgId,
      userId,
      eventDate: parsedDate,
      eventTime: eventData.time,
      description: eventData.description
    });

    if (duplicateEvent) {
      console.log(`[EventManager] Duplicate event found: ${duplicateEvent._id}`);
      return { message: 'Duplicate event already exists', event: duplicateEvent };
    }

    const eventIndex = await getNextEventIndex(orgId, userId);

    const newEvent = new Event({
      orgId,
      userId,
      title: eventData.title,
      description: eventData.description,
      eventDate: parsedDate,
      eventTime: eventData.time,
      venue: {
        address: eventData.address
      },
      hostName: eventData.organizer,
      contactPhone: eventData.contactPhone,
      mediaUrl: mediaUrls, // Should be string or handled correctly
      mediaType: mediaType,
      eventIndex: eventIndex
    });

    const event = await newEvent.save();
    console.log(`[EventManager] Saved event ${event._id} for user ${userId} in org ${orgId}`);

    // If contactPhone exists, we could potentially invite those users too, 
    // but for now let's stick to the core flow.
    
    return event;

  } catch (error) {
    console.error('[EventManager] Error saving event:', error);
    throw error;
  }
}

module.exports = {
  getNextEventIndex,
  saveEvent
};
