const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser, User } = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const { validateRegistration, validateLogin, validatePasswordReset } = require('../middleware/validators');

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

/**
 * Request password reset
 * @route POST /api/users/reset-password
 * @access Public
 */
router.post('/reset-password', validatePasswordReset, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user with this email exists
    const user = await User.findOne({ email });
    
    // Always return success response for security reasons
    // even if the email doesn't exist in our database
    // This prevents user enumeration attacks
    
    if (user) {
      // Generate a random token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration (1 hour from now)
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1);
      
      // Save token to user document
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await user.save();
      
      // In a real application, send an email with the reset link
      // For this demo, we'll just log the token
      const resetLink = `${req.headers.origin || 'http://localhost:3050'}/reset-password/${resetToken}`;
      
      logger.info(`Password reset requested for: ${email}`);
      logger.info(`Password reset link: ${resetLink}`);
      console.log(`[DEV ONLY] Reset link: ${resetLink}`);
      
      return res.status(200).json({
        success: true,
        message: 'Password reset instructions sent to your email'
      });
    }
    
    // If user doesn't exist, we still return a "success" response
    // but we'll differentiate in the frontend
    return res.status(200).json({
      success: false,
      message: 'If an account exists with this email, instructions have been sent'
    });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
});

/**
 * Verify password reset token
 * @route POST /api/users/verify-token
 * @access Public
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    // Find user with this token and ensure it's not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Token is valid
    return res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error verifying token'
    });
  }
});

/**
 * Reset password with token
 * @route POST /api/users/reset-password/:token
 * @access Public
 */
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }
    
    // Validate password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }
    
    // Find user with this token and ensure it's not expired
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // Update user password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.accountLocked = false;
    user.lockUntil = null;
    user.updatedAt = new Date();
    
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password has been reset'
    });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

module.exports = router;
