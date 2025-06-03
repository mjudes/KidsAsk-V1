/**
 * Authentication middleware for KidsAsk.ai
 * Verifies JWT tokens and adds userId to the request object
 */

const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'kidsask-secret-key';

/**
 * Middleware to check if user is authenticated via JWT
 * Adds userId to request object if authenticated
 * Does not block the request if no token is provided
 */
const authenticateOptional = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' from the header
    
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Add user ID to request
      req.userId = decoded.id;
      req.userRole = decoded.role;
    } catch (error) {
      // Log error but don't block the request
      logger.warn(`Token verification failed: ${error.message}`);
    }
  }
  
  // Continue to the next middleware regardless of authentication
  next();
};

/**
 * Middleware to check if user is authenticated via JWT
 * Blocks the request if no valid token is provided
 */
const authenticateRequired = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required'
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' from the header
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user ID to request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    // Continue to the next middleware
    next();
  } catch (error) {
    logger.error(`Token verification failed: ${error.message}`);
    
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticateOptional,
  authenticateRequired
};
