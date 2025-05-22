import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

// API Gateway URL from environment variables or default to container URL when running in Docker
// or localhost when running in development
const API_URL = process.env.API_GATEWAY_URL || (process.env.NEXT_PUBLIC_RUNTIME_ENV === 'docker' ? 
  'http://api:4000' : 'http://localhost:4000');

export async function GET(request) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Not authenticated' 
        }, 
        { status: 401 }
      );
    }
    
    // Forward request to API Gateway with token
    const response = await axios.get(`${API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Return response from API Gateway
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in me API route:', error);
    
    // Handle different types of errors
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.response.data.message || 'Failed to get user profile'
        }, 
        { status: error.response.status || 500 }
      );
    } else if (error.request) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No response from API service. Please try again later.' 
        }, 
        { status: 503 }
      );
    } else {
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
