const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const { validateChatRequest } = require('../middleware/validators');
const { saveChat } = require('../models/chat');
const { generateResponse: generateLocalResponse } = require('../services/local_ai_service');
const { generateResponse: generateOllamaResponse, isServiceAvailable } = require('../services/ollama_ai_service');

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
    const topic = { id: topicId, name: topicName };

    // Determine if we should use the Ollama service or fall back to local
    let aiResponse;
    try {
      // Check if Ollama service is available
      if (await isServiceAvailable()) {
        logger.info(`Using Ollama AI service for topic: ${topicName}`);
        aiResponse = await generateOllamaResponse(message, topic, history);
      } else {
        logger.info(`Ollama service unavailable, using local AI for topic: ${topicName}`);
        aiResponse = await generateLocalResponse(message, topic, history);
      }
    } catch (error) {
      logger.error(`Error with AI services: ${error.message}`);
      // Fallback to guaranteed local response if all else fails
      aiResponse = { response: generateLocalResponse(message, topicId), source: 'local-fallback' };
    }

    // Save the chat message to the database
    await saveChat({
      message,
      response: aiResponse.response,
      topicId,
      timestamp: new Date(),
      source: aiResponse.source || 'local'
    });

    // Return the response
    return res.json({
      success: true,
      response: aiResponse.response,
      source: aiResponse.source || 'local'
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
