const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  topicId: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    default: 'anonymous',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // Optional fields for analytics
  messageLength: Number,
  responseLength: Number,
  processingTime: Number,
});

const Chat = mongoose.model('Chat', chatSchema);

/**
 * Save a chat message and response to the database
 * @param {Object} chatData - The chat data to save
 * @returns {Promise<Object>} - The saved chat document
 */
const saveChat = async (chatData) => {
  try {
    // Add some analytics data
    chatData.messageLength = chatData.message.length;
    chatData.responseLength = chatData.response.length;
    
    const chat = new Chat(chatData);
    return await chat.save();
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

module.exports = {
  Chat,
  saveChat,
};
