const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./config/logger');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet()); // Security headers

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:3050', 'http://frontend:3000'], // Allow both local and Docker hostnames
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logging

// Connect to MongoDB
connectDB();

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;
