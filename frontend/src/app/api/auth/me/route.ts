import { NextResponse } from 'next/server';
import { API_BASE_URL } from '../../../../utils/constants';

export async function GET(request: Request) {
  try {
    // Extract token from cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }
    
    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    const data = await response.json();
    
    // Forward the backend response
    if (data.success) {
      return NextResponse.json({
        success: true,
        message: 'User data retrieved successfully',
        data: {
          user: data.data.user
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.message || 'Failed to retrieve user data'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error while retrieving user data'
    }, { status: 500 });
  }
}
