require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Organization = require('../models/Organization');
const User = require('../models/User');
const connectDB = require('../config/db');

async function seed() {
  await connectDB();
  
  try {
    // Clear existing data (optional, but good for a fresh start)
    // await Organization.deleteMany({});
    // await User.deleteMany({});

    console.log('🌱 Seeding database...');

    // 1. Create Admin (Organization)
    const adminPhone = '919876543210';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    let org = await Organization.findOne({ adminPhone });
    if (!org) {
      org = await Organization.create({
        name: 'Invitely Demo Admin',
        adminPhone: adminPhone,
        password: hashedPassword,
        ward: 'Ward 12',
        zone: 'North Zone',
        email: 'admin@invitely.com',
        plan: 'pro'
      });
      console.log(`✅ Admin Organization created: ${org.name}`);
    } else {
      console.log('ℹ️ Admin Organization already exists');
    }

    // 2. Create 5 Fake Users
    const fakeUsers = [
      { name: 'Rahul Sharma', phone: '919000000001', type: 'invitation' },
      { name: 'Priya Verma', phone: '919000000002', type: 'invitation' },
      { name: 'Amit Singh', phone: '919000000003', type: 'contact' },
      { name: 'Sneha Gupta', phone: '919000000004', type: 'invitation' },
      { name: 'Vikram Malhotra', phone: '919000000005', type: 'contact' }
    ];

    for (const userData of fakeUsers) {
      const existingUser = await User.findOne({ organizationId: org._id, phone: userData.phone });
      if (!existingUser) {
        await User.create({
          organizationId: org._id,
          ...userData,
          lastInteraction: new Date()
        });
        console.log(`👤 User created: ${userData.name}`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.name}`);
      }
    }

    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();
