const express = require('express');
const router = express.Router();
const { Topic } = require('../models/topic');

/**
 * Get all topics
 * @route GET /api/topics
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const topics = [
      { id: 1, name: 'Animals', icon: '🐼' },
      { id: 2, name: 'Space and Planets', icon: '🚀' },
      { id: 3, name: 'The Human Body', icon: '🧍' },
      { id: 4, name: 'Dinosaurs', icon: '🦖' },
      { id: 5, name: 'Weather and Natural Phenomena', icon: '🌦️' },
      { id: 6, name: 'Sports', icon: '⚽' },
      { id: 7, name: 'Technology and Robots', icon: '🤖' },
      { id: 8, name: 'The Ocean', icon: '🌊' },
      { id: 9, name: 'Mythical Creatures and Magic', icon: '🧙‍♂️' },
      { id: 10, name: 'Everyday Why Questions', icon: '❓' },
      { id: 11, name: 'Math', icon: '🧮' },
      { id: 12, name: 'Gaming', icon: '🎮' },
    ];
    
    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topics'
    });
  }
});

/**
 * Get a topic by ID
 * @route GET /api/topics/:id
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const topicId = parseInt(req.params.id);
    const topics = [
      { id: 1, name: 'Animals', icon: '🐼' },
      { id: 2, name: 'Space and Planets', icon: '🚀' },
      { id: 3, name: 'The Human Body', icon: '🧍' },
      { id: 4, name: 'Dinosaurs', icon: '🦖' },
      { id: 5, name: 'Weather and Natural Phenomena', icon: '🌦️' },
      { id: 6, name: 'Sports', icon: '⚽' },
      { id: 7, name: 'Technology and Robots', icon: '🤖' },
      { id: 8, name: 'The Ocean', icon: '🌊' },
      { id: 9, name: 'Mythical Creatures and Magic', icon: '🧙‍♂️' },
      { id: 10, name: 'Everyday Why Questions', icon: '❓' },
      { id: 11, name: 'Math', icon: '🧮' },
      { id: 12, name: 'Gaming', icon: '🎮' },
    ];
    
    const topic = topics.find(t => t.id === topicId);
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching topic'
    });
  }
});

module.exports = router;
