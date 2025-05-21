const Joi = require('joi');

/**
 * Middleware for validating chat requests
 */
const validateChatRequest = (req, res, next) => {
  // Define validation schema
  const schema = Joi.object({
    message: Joi.string().required().max(500),
    topicId: Joi.number().integer().required(),
    history: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'assistant').required(),
        content: Joi.string().required()
      })
    ).optional()
  });

  // Validate request body
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }

  next();
};

module.exports = {
  validateChatRequest,
};
