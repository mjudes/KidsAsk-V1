const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  countryCode: {
    type: String,
    trim: true,
    default: '+1',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'basic',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    paymentMethod: {
      type: String,
      enum: ['credit', 'paypal'],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Add additional fields for security tracking
  loginAttempts: {
    type: Number,
    default: 0
  },
  lastLoginAttempt: {
    type: Date
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: {
    type: Date
  },
  lastLoginIP: {
    type: String
  },
  lastLoginDate: {
    type: Date
  },
  passwordResetToken: {
    type: String
  },
  passwordResetExpires: {
    type: Date
  },
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (!user.isModified('password')) {
    return next();
  }
  
  try {
    // Use a stronger salt round (12 instead of 10)
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    // Update the 'updatedAt' field
    user.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

/**
 * Register a new user
 * @param {Object} userData - User data to register
 * @returns {Promise<Object>} - Registered user object
 */
const registerUser = async (userData) => {
  try {
    const { fullName, email, password, countryCode, phoneNumber, plan, paymentMethod } = userData;
    
    // Check if user with the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Calculate subscription end date (1 month from now)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      countryCode,
      phoneNumber,
      subscription: {
        plan: plan || 'basic',
        startDate: new Date(),
        endDate: endDate,
        status: 'active',
        paymentMethod: paymentMethod || 'credit',
      }
    });
    
    // Save user to database
    await newUser.save();
    
    // Return user without password
    const userObject = newUser.toObject();
    delete userObject.password;
    
    return userObject;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Authenticate a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} ipAddress - IP address of the request
 * @returns {Promise<Object>} - Authenticated user object
 */
const authenticateUser = async (email, password, ipAddress = '') => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check if account is locked
    if (user.accountLocked && user.lockUntil && user.lockUntil > new Date()) {
      throw new Error('Account is temporarily locked. Please try again later or reset your password.');
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      // Increment login attempts
      user.loginAttempts += 1;
      user.lastLoginAttempt = new Date();
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.accountLocked = true;
        // Lock for 30 minutes
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30);
        user.lockUntil = lockUntil;
      }
      
      await user.save();
      throw new Error('Invalid email or password');
    }
    
    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.lockUntil = null;
    user.lastLoginDate = new Date();
    user.lastLoginIP = ipAddress;
    await user.save();
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    
    return userObject;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

module.exports = {
  User,
  registerUser,
  authenticateUser,
};
