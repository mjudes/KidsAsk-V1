import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth token cookie
    const cookieStore = cookies();
    cookieStore.delete('auth_token');
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Error in logout API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during logout'
      }, 
      { status: 500 }
    );
  }
}
