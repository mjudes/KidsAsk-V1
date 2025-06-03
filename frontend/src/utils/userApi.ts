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
        ? `You've used all your questions for your ${plan} plan. Please upgrade to continue.`
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
