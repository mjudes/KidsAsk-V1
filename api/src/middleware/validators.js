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

/**
 * Middleware for validating user registration
 */
const validateRegistration = (req, res, next) => {
  // Define validation schema
  const schema = Joi.object({
    fullName: Joi.string().required().min(3).max(100).trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required().min(8).pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$') // At least one uppercase, one lowercase, one number
    ),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match'
    }),
    countryCode: Joi.string().trim(),
    phoneNumber: Joi.string().trim().allow(''),
    plan: Joi.string().valid('basic', 'standard', 'premium'),
    paymentMethod: Joi.string().valid('credit', 'paypal'),
    cardNumber: Joi.when('paymentMethod', {
      is: 'credit',
      then: Joi.string().pattern(/^\d{16}$/).messages({
        'string.pattern.base': 'Card number must be 16 digits'
      }),
      otherwise: Joi.optional()
    }),
    cardExpiry: Joi.when('paymentMethod', {
      is: 'credit',
      then: Joi.string(),
      otherwise: Joi.optional()
    }),
    cardCvv: Joi.when('paymentMethod', {
      is: 'credit',
      then: Joi.string().pattern(/^\d{3,4}$/).messages({
        'string.pattern.base': 'CVV must be 3 or 4 digits'
      }),
      otherwise: Joi.optional()
    })
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

/**
 * Middleware for validating login
 */
const validateLogin = (req, res, next) => {
  // Define validation schema
  const schema = Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
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
  validateRegistration,
  validateLogin
};
