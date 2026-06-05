require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

async function fixUsers() {
  await connectDB();

  try {
    console.log('🔄 Fetching all users from database...');
    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    let updatedCount = 0;

    for (const user of users) {
      let isModified = false;

      // 1. Force role to 'user'
      if (user.role !== 'user') {
        user.role = 'user';
        isModified = true;
      }

      // 2. Fix missing required name
      if (!user.name) {
        user.name = 'Anonymous';
        isModified = true;
      }

      // 3. Fix missing/faulty type
      if (!user.type) {
        user.type = 'contact';
        isModified = true;
      }

      // 3. Fix active status if undefined
      if (user.isActive === undefined) {
        user.isActive = true;
        isModified = true;
      }

      if (isModified) {
        await user.save();
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} users to have the role 'user' and default fields.`);
  } catch (error) {
    console.error('❌ Failed to clean up user data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

fixUsers();
