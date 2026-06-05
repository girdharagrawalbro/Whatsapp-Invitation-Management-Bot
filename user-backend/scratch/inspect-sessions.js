const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Find active sessions in sessions collection
    if (collections.some(c => c.name === 'sessions')) {
      const sessions = await mongoose.connection.db.collection('sessions').find().toArray();
      console.log("Sessions count:", sessions.length);
      sessions.forEach(s => {
        console.log("Session ID:", s._id);
        console.log("Session Data:", JSON.stringify(s.session));
      });
    } else {
      console.log("No sessions collection found.");
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed:", error);
  }
}

run();
