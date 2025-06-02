/**
 * OpenAI Service for KidsAsk-V1
 * Handles interaction with the AI service for generating kid-friendly responses
 */
const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');
const { cacheManager } = require('../utils/cacheManager');

// Configure AI service URL from environment or use default
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:5050';

/**
 * Generate a response to a kid's question using the OpenAI-powered AI service
 * 
 * @param {string} message - The question from the child
 * @param {string} topic - The topic category
 * @param {Array} history - Previous conversation history (optional)
 * @returns {Promise<string>} - The AI-generated response
 */
async function generateResponse(message, topic, history = []) {
  try {
    // Check cache first for faster responses
    const cacheKey = `${topic}:${message}`;
    const cachedResponse = cacheManager.get(cacheKey);
    
    if (cachedResponse) {
      logger.info(`Cache hit for question about ${topic}`);
      return cachedResponse;
    }
    
    // Prepare request to AI service
    const requestData = {
      message,
      topic,
      history: history.slice(-3) // Only send last 3 exchanges to reduce context size
    };
    
    // Call the AI service
    const response = await axios.post(`${AI_SERVICE_URL}/generate`, requestData, {
      timeout: 10000 // 10 second timeout
    });
    
    // Get the response text
    const responseText = response.data.response;
    
    // Cache the response for future similar questions
    cacheManager.set(cacheKey, responseText);
    
    return responseText;
  } catch (error) {
    logger.error(`Error generating AI response: ${error.message}`);
    
    // Provide a friendly error message
    return "I'm sorry, I'm having trouble thinking right now. Could you try asking me something else?";
  }
}

/**
 * Check the health of the AI service
 * 
 * @returns {Promise<Object>} - Health status information
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 5000 // 5 second timeout
    });
    
    return {
      status: 'ok',
      aiService: response.data
    };
  } catch (error) {
    logger.error(`AI Service health check failed: ${error.message}`);
    
    return {
      status: 'error',
      message: 'AI Service is not responding correctly',
      error: error.message
    };
  }
}

module.exports = {
  generateResponse,
  checkHealth
};
