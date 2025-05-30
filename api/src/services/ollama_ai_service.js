/**
 * ollama_ai_service.js
 * 
 * Provides AI response generation for KidsAsk using Ollama
 */
const axios = require('axios');
const logger = require('../config/logger');

// Get Ollama API URL from environment variables or use default
const OLLAMA_API_URL = process.env.AI_SERVICE_URL || 'http://ollama-api:5000';

/**
 * Generates a response using the Ollama AI service
 * 
 * @param {string} message - The question from the user
 * @param {object} topic - The topic object
 * @param {array} history - Previous conversation history
 * @returns {Promise<string>} - The AI-generated response
 */
async function generateResponse(message, topic, history = []) {
  try {
    logger.info(`Generating response with Ollama AI for topic: ${topic.name}, message: ${message.substring(0, 50)}...`);
    
    // Format the request for the Ollama service
    const requestData = {
      message,
      topic: topic.name,
      history
    };

    // Make the request to the Ollama API
    const response = await axios.post(`${OLLAMA_API_URL}/generate`, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout for AI response
    });

    if (response.status === 200 && response.data.response) {
      logger.info(`Successfully received AI response for topic: ${topic.name}`);
      return {
        response: response.data.response,
        source: 'ollama'
      };
    } else {
      logger.error(`Unexpected response from Ollama AI service: ${JSON.stringify(response.data)}`);
      throw new Error('Invalid response from AI service');
    }
  } catch (error) {
    logger.error(`Error generating response with Ollama AI: ${error.message}`);
    
    // If there's a connection error or timeout, we'll fall back to the local AI
    logger.info('Falling back to local response generation');
    const localAiService = require('./local_ai_service');
    return localAiService.generateResponse(message, topic, history);
  }
}

/**
 * Checks if the Ollama AI service is available
 * 
 * @returns {Promise<boolean>} - True if the service is available
 */
async function isServiceAvailable() {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200 && response.data.status === 'ok';
  } catch (error) {
    logger.error(`Ollama AI service health check failed: ${error.message}`);
    return false;
  }
}

module.exports = {
  generateResponse,
  isServiceAvailable
};
