const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const logger = require('../config/logger');
const { authenticateRequired } = require('../middleware/auth');

/**
 * Middleware to check if user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    // Log debugging information
    logger.info(`Admin check - userRole: ${req.userRole}, userId: ${req.userId}`);
    
    if (req.userRole === 'admin') {
      logger.info('Admin access granted');
      return next();
    }
    
    logger.warn(`Admin access denied for user with role: ${req.userRole}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  } catch (error) {
    logger.error(`Admin auth error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking admin privileges'
    });
  }
};

/**
 * Get all users with filter options
 * @route GET /api/admin/users
 * @access Admin only
 */
router.get('/users', authenticateRequired, isAdmin, async (req, res) => {
  try {
    const { timeframe } = req.query;
    let dateFilter = {};
    
    // Set date filter based on timeframe
    const now = new Date();
    if (timeframe === 'day') {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneDayAgo } };
    } else if (timeframe === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: oneWeekAgo } };
    } else if (timeframe === 'month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: oneMonthAgo } };
    }

    // Get users with filter, exclude password
    const users = await User.find(dateFilter).select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        count: users.length
      }
    });
  } catch (error) {
    logger.error(`Admin users fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

/**
 * Get users registered in the last 24 hours with plan info
 * @route GET /api/admin/recent-users
 * @access Admin only
 */
router.get('/recent-users', authenticateRequired, isAdmin, async (req, res) => {
  try {
    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    
    // Get users registered in last 24 hours, exclude password
    const users = await User.find({ 
      createdAt: { $gte: oneDayAgo } 
    }).select('-password');
    
    // Group users by subscription plan
    const usersByPlan = users.reduce((acc, user) => {
      const plan = user.subscription?.plan || 'none';
      if (!acc[plan]) {
        acc[plan] = [];
      }
      acc[plan].push(user);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      message: 'Recent users retrieved successfully',
      data: {
        users,
        usersByPlan,
        totalCount: users.length
      }
    });
  } catch (error) {
    logger.error(`Admin recent users fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent users'
    });
  }
});

/**
 * Update user account status (suspend/activate)
 * @route PUT /api/admin/users/:userId/status
 * @access Admin only
 */
router.put('/users/:userId/status', authenticateRequired, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { accountLocked } = req.body;
    
    if (typeof accountLocked !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'accountLocked status must be a boolean value'
      });
    }
    
    // Find and update user - when an admin suspends a user, set lockUntil to null (permanent suspension)
    // When activating, clear both accountLocked and lockUntil
    const updateData = accountLocked 
      ? { 
          accountLocked: true,
          lockUntil: null, // null lockUntil indicates admin-initiated permanent suspension
          updatedAt: new Date()
        }
      : {
          accountLocked: false,
          lockUntil: null,
          updatedAt: new Date()
        };
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: `User ${accountLocked ? 'suspended' : 'activated'} successfully`,
      data: { user }
    });
  } catch (error) {
    logger.error(`Admin user status update error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

/**
 * Get user registration statistics
 * @route GET /api/admin/stats
 * @access Admin only
 */
router.get('/stats', authenticateRequired, isAdmin, async (req, res) => {
  try {
    const now = new Date();
    
    // Get date ranges
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Count users in each time period
    const [dailyCount, weeklyCount, monthlyCount, totalCount] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      User.countDocuments({ createdAt: { $gte: oneMonthAgo } }),
      User.countDocuments()
    ]);
    
    // Get plan distribution for all users
    const planDistribution = await User.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        registrations: {
          daily: dailyCount,
          weekly: weeklyCount,
          monthly: monthlyCount,
          total: totalCount
        },
        planDistribution: planDistribution.reduce((acc, item) => {
          acc[item._id || 'none'] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    logger.error(`Admin stats fetch error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;
