const winston = require('winston');

// Define the logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'kidsask-api' },
  transports: [
    // Console transport for all logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...metadata }) => {
            let msg = `${timestamp} ${level}: ${message}`;
            if (Object.keys(metadata).length > 0 && metadata.service) {
              msg += ` ${JSON.stringify(metadata)}`;
            }
            return msg;
          }
        )
      )
    }),
    // File transport for error logs
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxFiles: 5,
      maxsize: 5242880 // 5MB
    })
  ]
});

module.exports = logger;
