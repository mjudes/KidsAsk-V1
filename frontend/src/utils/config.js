// Config for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:4000',
    aiServiceUrl: 'http://localhost:5050',
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.kidsask.ai',
    aiServiceUrl: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'https://ai.kidsask.ai',
  },
};

// Determine current environment
const environment = process.env.NODE_ENV || 'development';

// Export config based on environment
export default config[environment];
