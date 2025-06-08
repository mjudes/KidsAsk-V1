'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define the AuthContext types
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  subscription: {
    plan: string;
    status: string;
    questionsRemaining: number;
    isFreeTrialUser: boolean;
    endDate?: string | Date;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<any>;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  login: async () => ({}),
  logout: () => {},
  refreshUser: async () => ({}),
});

// Import constants with API base URL
import { API_BASE_URL } from './constants';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Check if token exists in localStorage on initial load
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // If token exists, consider user as pre-authenticated and fetch user data
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch current user data
  const fetchCurrentUser = async () => {
    try {
      // Try to get token from localStorage first
      let token = localStorage.getItem('auth_token');
      
      // If not found in localStorage, try to extract from cookie
      if (!token) {
        const cookieMatch = document.cookie.match(/auth_token=([^;]+)/);
        token = cookieMatch ? cookieMatch[1] : null;
        
        // If found in cookie but not localStorage, synchronize them
        if (token) {
          localStorage.setItem('auth_token', token);
        }
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add token to headers if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        // Log token presence for debugging
        console.log('Token found, sending authentication request');
      } else {
        console.log('No auth token found in storage or cookies');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers,
        // Include credentials for cross-origin requests
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.user) {
          // Log successful user data retrieval with role
          console.log(`User data retrieved with role: ${data.data.user.role}`);
          setUser(data.data.user);
          setIsAuthenticated(true);
          
          // Ensure token is in both localStorage and cookie
          document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
        } else {
          console.log('User data not found in response');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log(`Failed to fetch user data: ${response.status}`);
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add token to headers if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.user) {
          setUser(data.data.user);
          return data.data.user;
        }
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        // Store token in localStorage for persistent authentication
        if (data.data.token) {
          localStorage.setItem('auth_token', data.data.token);
          
          // Also manually set cookie for Safari compatibility
          document.cookie = `auth_token=${data.data.token}; path=/; max-age=604800; SameSite=Lax`;
          
          // Log successful authentication with role
          console.log(`User authenticated with role: ${data.data.user.role}`);
        }
        // Return redirect URL based on user role
        const redirectUrl = data.data.user.role === 'admin' ? '/admin' : '/dashboard';
        return { success: true, message: 'Login successful', redirectUrl };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API if available
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user state and remove token from localStorage
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      // Redirect to login page
      router.push('/login');
    }
  };

  // Check auth status on component mount
  useEffect(() => {
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
