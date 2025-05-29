const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser, User } = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { validateRegistration, validateLogin } = require('../middleware/validators');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'kidsask-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const userData = req.body;
    
    // Register user
    const newUser = await registerUser(userData);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error registering user'
    });
  }
});

/**
 * User login
 * @route POST /api/users/login
 * @access Public
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get client IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Authenticate user with IP address
    const user = await authenticateUser(email, password, ip);
    
    // Generate JWT token with additional security measures
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        ip: ip, // Include IP in token for additional validation
        iat: Math.floor(Date.now() / 1000)
      }, 
      JWT_SECRET,
      { 
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256' // Explicitly specify the algorithm
      });
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

/**
 * Get current user profile
 * @route GET /api/users/me
 * @access Private
 */
router.get('/me', async (req, res) => {
  try {
    // For now, return a placeholder
    // This will be replaced with actual authentication middleware
    res.json({ 
      success: true,
      message: 'User profile endpoint - to be implemented',
      data: {
        user: {
          id: 1,
          fullName: 'Test User',
          email: 'test@example.com',
          role: 'user',
          subscription: {
            plan: 'basic',
            status: 'active'
          }
        }
      }
    });
  } catch (error) {
    logger.error(`Get user profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

module.exports = router;
