const express = require('express');
const axios = require('axios');
const router = express.Router();
const logger = require('../config/logger');
const { validateChatRequest } = require('../middleware/validators');
const { saveChat } = require('../models/chat');

/**
 * Process a chat request
 * @route POST /api/chat
 * @access Public
 */
router.post('/', validateChatRequest, async (req, res) => {
  try {
    const { message, topicId, history } = req.body;
    
    // Validate that the topic is in our allowed list
    const validTopics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    
    if (!validTopics.includes(topicId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid topic selected'
      });
    }

    // Map topic IDs to topic names
    const topicMap = {
      1: 'Animals',
      2: 'Space and Planets',
      3: 'The Human Body',
      4: 'Dinosaurs',
      5: 'Weather and Natural Phenomena',
      6: 'Sports',
      7: 'Technology and Robots',
      8: 'The Ocean',
      9: 'Mythical Creatures and Magic',
      10: 'Everyday Why Questions',
      11: 'Math',
      12: 'Lego'
    };

    // Get the current topic name
    const topicName = topicMap[topicId];

    // Forward the request to the AI service
    const aiResponse = await axios.post(process.env.AI_SERVICE_URL + '/generate', {
      message,
      topic: topicName,
      history
    });

    // Save the chat message to the database
    await saveChat({
      message,
      response: aiResponse.data.response,
      topicId,
      timestamp: new Date()
    });

    // Return the AI service response
    return res.json({
      success: true,
      response: aiResponse.data.response
    });
    
  } catch (error) {
    logger.error('Error in chat route:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

module.exports = router;
