import { NextResponse } from 'next/server';
import axios from 'axios';

// API Gateway URL from environment variables or default to container URL when running in Docker
// or localhost when running in development
const API_URL = process.env.API_GATEWAY_URL || (process.env.NEXT_PUBLIC_RUNTIME_ENV === 'docker' ? 
  'http://api:4000' : 'http://localhost:4000');

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Forward request to API Gateway
    const response = await axios.post(`${API_URL}/api/users/verify-token`, body);
    
    // Return response from API Gateway
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in verify token API route:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return NextResponse.json(
        { 
          success: false, 
          message: error.response.data.message || 'Token verification failed' 
        }, 
        { status: error.response.status || 500 }
      );
    } else if (error.request) {
      // The request was made but no response was received
      return NextResponse.json(
        { 
          success: false, 
          message: 'No response from API service. Please try again later.' 
        }, 
        { status: 503 }
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      return NextResponse.json(
        { 
          success: false, 
          message: 'An unexpected error occurred' 
        }, 
        { status: 500 }
      );
    }
  }
}
