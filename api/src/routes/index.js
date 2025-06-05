const express = require('express');
const router = express.Router();

const chatRoutes = require('./chat');
const topicRoutes = require('./topics');
const userRoutes = require('./users');
const adminRoutes = require('./admin');

// Base routes
router.use('/chat', chatRoutes);
router.use('/topics', topicRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
