// Utility functions for user-related API calls

import { API_BASE_URL } from './constants';

/**
 * Helper function to get auth headers with token if available
 * @returns Headers object with auth token if available
 */
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add token to headers if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Upgrade a user's plan
 * @param userData Object containing userId and new plan information
 * @returns Response from the API
 */
export const upgradeUserPlan = async (userData: { userId: string; plan: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/upgrade-plan`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error upgrading user plan:', error);
    return {
      success: false,
      message: 'An error occurred while upgrading the plan'
    };
  }
};

/**
 * Process payment and upgrade user plan
 * @param paymentData Object containing payment and plan information
 * @returns Response from the API
 */
export const processPayment = async (paymentData: { 
  userId: string; 
  plan: string; 
  paymentDetails: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
  }
}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/process-payment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      message: 'An error occurred while processing the payment'
    };
  }
};

/**
 * Check user's subscription status 
 * @param user The user object
 * @returns Object with subscription status information
 */
export const checkSubscriptionStatus = (user: any) => {
  if (!user || !user.subscription) {
    return {
      isExpired: false,
      isLow: false,
      needsUpgrade: false,
      message: ''
    };
  }

  const { questionsRemaining, plan, isFreeTrialUser } = user.subscription;
  
  // Check if free trial user has used all questions
  if (isFreeTrialUser && questionsRemaining <= 0) {
    return {
      isExpired: true,
      isLow: false,
      needsUpgrade: true,
      message: 'Your free trial has ended. Please upgrade to continue asking questions.'
    };
  }
  
  // Check if any plan is low on questions
  if (questionsRemaining <= 5) {
    return {
      isExpired: questionsRemaining <= 0,
      isLow: questionsRemaining > 0,
      needsUpgrade: true,
      message: questionsRemaining <= 0 
        ? `You've used all your questions for your ${isFreeTrialUser ? 'Free Plan' : plan} plan. Please upgrade to continue.`
        : `You have only ${questionsRemaining} questions remaining. Consider upgrading soon.`
    };
  }
  
  return {
    isExpired: false,
    isLow: false,
    needsUpgrade: false,
    message: ''
  };
};

/**
 * Admin API: Get all users within a timeframe
 * @param timeframe 'day', 'week', 'month', or undefined for all users
 * @returns Response from the API with users list
 */
export const getAdminUsers = async (timeframe?: 'day' | 'week' | 'month') => {
  try {
    let url = `${API_BASE_URL}/api/admin/users`;
    if (timeframe) {
      url += `?timeframe=${timeframe}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for authentication
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return {
      success: false,
      message: 'An error occurred while fetching users'
    };
  }
};

/**
 * Admin API: Get users registered in the last 24 hours
 * @returns Response from the API with recent users list and plan breakdown
 */
export const getRecentUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/recent-users`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for authentication
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recent users:', error);
    return {
      success: false,
      message: 'An error occurred while fetching recent users'
    };
  }
};

/**
 * Admin API: Get user registration statistics
 * @returns Response from the API with registration statistics
 */
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for authentication
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      success: false,
      message: 'An error occurred while fetching statistics'
    };
  }
};

/**
 * Admin API: Update user account status (suspend/activate)
 * @param userId The ID of the user to update
 * @param accountLocked Whether to lock the account (true) or unlock it (false)
 * @returns Response from the API
 */
export const updateUserStatus = async (userId: string, accountLocked: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include', // Include cookies for authentication
      body: JSON.stringify({ accountLocked }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user status:', error);
    return {
      success: false,
      message: 'An error occurred while updating user status'
    };
  }
};
