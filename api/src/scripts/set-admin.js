/**
 * Script to set a user as admin
 * Run with: node src/scripts/set-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/user');

// Admin email to update
const ADMIN_EMAIL = 'meronj@ecb.co.il';

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Override the DB_HOST to use localhost for local script execution
    const dbHost = 'localhost';
    const dbPort = process.env.DB_PORT || '27017';
    const dbName = process.env.DB_NAME || 'kidsaskdb';
    
    await mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

async function setUserAsAdmin() {
  try {
    // Connect to the database
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email: ADMIN_EMAIL });
    
    if (!user) {
      console.error(`User with email ${ADMIN_EMAIL} not found`);
      process.exit(1);
    }
    
    // Update user role to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${user.fullName} (${user.email}) has been set as admin successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

// Run the function
setUserAsAdmin();
