// User-related API functions

import axios from 'axios';
import config from './config';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise} - API response
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Log in a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - API response with user and token
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} - API response with user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Log out current user
 * @returns {Promise} - API response
 */
export const logoutUser = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Also clear the auth token cookie on the client side
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error logging out:', error);
    // Ensure cookie is cleared even if API call fails
    document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
    throw error;
  }
};

/**
 * Request a password reset
 * @param {string} email - User email
 * @returns {Promise} - API response
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw error;
  }
};

/**
 * Verify a password reset token
 * @param {string} token - The reset token
 * @returns {Promise} - API response
 */
export const verifyResetToken = async (token) => {
  try {
    const response = await fetch(`/api/auth/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying reset token:', error);
    throw error;
  }
};

/**
 * Reset password using token
 * @param {string} token - The reset token
 * @param {string} password - The new password
 * @returns {Promise} - API response
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await fetch(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};
