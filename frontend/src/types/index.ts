// Topic type definition
export interface Topic {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

// Chat message type definition
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  message?: string;
}
