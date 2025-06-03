// API base URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NEXT_PUBLIC_RUNTIME_ENV === 'docker' ? 'http://api:4000' : 'http://localhost:4000');

// Application Constants
export const APP_NAME = 'KidsAsk.ai';
export const APP_DESCRIPTION = 'A safe, educational AI platform for kids';

// Max question length
export const MAX_QUESTION_LENGTH = 200;
