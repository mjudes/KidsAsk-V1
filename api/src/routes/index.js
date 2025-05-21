const express = require('express');
const router = express.Router();

const chatRoutes = require('./chat');
const topicRoutes = require('./topics');
const userRoutes = require('./users');

// Base routes
router.use('/chat', chatRoutes);
router.use('/topics', topicRoutes);
router.use('/users', userRoutes);

module.exports = router;
