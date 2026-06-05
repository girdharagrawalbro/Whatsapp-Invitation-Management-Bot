require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

const MONGO_URI = "mongodb+srv://girdharagrawalbro:7909905038@cluster0.czsb19m.mongodb.net/whatsappBot?retryWrites=true&w=majority&appName=Cluster0";

async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database successfully.');

    const phone = '9876543210';
    const password = 'admin123';
    const name = 'Invitely Admin';

    // Check if organization already exists
    const existing = await AdminUser.findOne({ phone });
    if (existing) {
      console.log(`Organization with phone ${phone} already exists.`);
      // Update password just in case
      existing.password = await bcrypt.hash(password, 10);
      existing.role = 'admin';
      existing.name = name;
      existing.onboardingStatus = 'complete';
      await existing.save();
      console.log('Updated existing admin organization credentials.');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = await AdminUser.create({
        phone,
        password: hashedPassword,
        name,
        role: 'admin',
        onboardingStatus: 'complete',
        isActive: true
      });
      console.log(`Successfully seeded admin organization:\nPhone: ${phone}\nPassword: ${password}`);
    }
  } catch (error) {
    console.error('Error seeding admin organization:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedAdmin();
