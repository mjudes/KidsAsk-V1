import { NextResponse } from 'next/server';
import { API_BASE_URL } from '../../../../utils/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    // Forward the backend response
    if (data.success) {
      const user = data.data.user;
      const token = data.data.token;
      
      // Add redirect URL based on user role
      const redirectUrl = user.role === 'admin' ? '/admin' : '/topics';
      
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
          redirectUrl
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || 'Login failed'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during login'
    }, { status: 500 });
  }
}
