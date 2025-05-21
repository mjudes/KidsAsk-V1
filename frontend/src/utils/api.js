import axios from 'axios';
import config from './config';

/**
 * Send a chat message to the API
 * @param {string} message - User's message
 * @param {number} topicId - The selected topic ID
 * @param {Array} history - Previous conversation history
 * @returns {Promise} - API response
 */
export const sendChatMessage = async (message, topicId, history) => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        topicId,
        history
      }),
    });
    
    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get all available topics
 * @returns {Promise} - API response with topics
 */
export const getTopics = async () => {
  try {
    const response = await fetch('/api/topics', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};
