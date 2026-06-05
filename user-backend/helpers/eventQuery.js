const Event = require('../models/Event');
const { classifyQueryWithAI } = require('./classifier');
const sitelink = "https://rb.gy/wgxwt0";


async function queryEvents(query, phone, isAdmin, context, orgId, userId) {
  console.log(`[Query] Processing query: "${query}" for User: ${userId} in Org: ${orgId}`);

  try {
    const aiCategory = await classifyQueryWithAI(query);

    // Numeric event index lookup
    const indexNumber = parseInt(query);
    if (!isNaN(indexNumber)) {
      const event = await Event.findOne({ orgId, userId, eventIndex: indexNumber });
      if (event) {
        return {
          type: 'single_event',
          event,
          message: formatSingleEvent(event),
        };
      } else {
        return {
          type: 'error',
          message: `कार्यक्रम #${indexNumber} नहीं मिला।`
        };
      }
    }

    if (aiCategory === 'today') {
      return await getTodayEvents(orgId, userId);
    }
    else if (aiCategory === 'upcoming') {
      return await getUpcomingEvents(orgId, userId);
    }
    else if (aiCategory === 'date') {
      return await getEventsByDate(query, orgId, userId);
    }
    else if (aiCategory === 'search') {
      return await searchEventsByKeyword(query, orgId, userId);
    }

  } catch (error) {
    console.error('Error in queryEvents:', error);
    return { error: 'कार्यक्रम खोजने में त्रुटि। कृपया पुनः प्रयास करें।' };
  }
}

// Helpers:

function formatSingleEvent(event) {
  return `# ${event.title}\n(${event.eventDate.toLocaleDateString('en-IN')} - ${event.eventTime})\n\nस्थान: ${event.venue?.address || event.address}\nआयोजक: ${event.hostName || event.organizer}\nसंपर्क: ${event.contactPhone || ""}\nLink: ${event.mediaUrl || ""}\n\nसभी कार्यक्रम - \n${sitelink}`;
}

async function getTodayEvents(orgId, userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const events = await Event.find({
    orgId,
    userId,
    eventDate: { $gte: today, $lt: tomorrow },
  }).sort({ eventTime: 1 });

  return {
    type: 'today',
    events,
    message: events.length > 0
      ? `आज के कार्यक्रम`
      : 'आज के लिए कोई कार्यक्रम निर्धारित नहीं है।'
  };
}

async function getUpcomingEvents(orgId, userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events = await Event.find({
    orgId,
    userId,
    eventDate: { $gte: today },
  }).sort({ eventDate: 1, eventTime: 1 });

  return {
    type: 'upcoming',
    events,
    message: events.length > 0
      ? `आगामी कार्यक्रमों की सूची।`
      : 'कोई आगामी कार्यक्रम नहीं मिला।'
  };
}

async function getEventsByDate(query, orgId, userId) {
  const dateMatch = query.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dateMatch) {
    const [day, month, year] = dateMatch[0].split('/');
    const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    const events = await Event.find({
      orgId,
      userId,
      eventDate: { $gte: startDate, $lte: endDate },
    }).sort({ eventTime: 1 });

    return {
      type: 'date',
      date: `${day}/${month}/${year}`,
      events,
      message: events.length > 0
        ? `${day}/${month}/${year} के कार्यक्रम`
        : `${day}/${month}/${year} को कोई कार्यक्रम नहीं मिला।`
    };
  }
  return { type: 'error', message: 'दिनांक का प्रारूप सही नहीं है।' };
}

async function searchEventsByKeyword(query, orgId, userId) {
  const searchEvents = await Event.find({
    orgId,
    userId,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { notes: { $regex: query, $options: 'i' } }
    ]
  }).sort({ eventDate: 1 });

  return {
    type: 'search',
    query,
    events: searchEvents,
    message: searchEvents.length > 0
      ? `"${query}" से मिलते-जुलते कार्यक्रम`
      : `"${query}" से कोई कार्यक्रम नहीं मिला।`
  };
}


module.exports = {
  queryEvents,
  classifyQueryWithAI,
};
