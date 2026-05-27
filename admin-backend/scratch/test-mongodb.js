const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("MongoDB Connected Successfully!");
    
    const User = require('../models/User');
    console.log("Searching for users...");
    const users = await User.find().limit(1);
    console.log("Users:", users);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
  }
}

run();
