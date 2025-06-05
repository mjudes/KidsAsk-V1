'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MainPageHeader() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    // Check for auth token in cookies
    const hasAuthToken = document.cookie.includes('auth_token=');
    setIsLoggedIn(hasAuthToken);
    
    // Fetch user data if logged in
    if (hasAuthToken) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      // Import the API utility at runtime
      const { getCurrentUser } = await import('../utils/authApi');
      const response = await getCurrentUser();
      
      if (response.success) {
        setUserName(response.data.user.fullName.split(' ')[0]); // Use first name only
        setIsAdmin(response.data.user.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Import the API utility at runtime
      const { logoutUser } = await import('../utils/authApi');
      await logoutUser();
      
      // Remove cookie and redirect to home
      document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
      setIsLoggedIn(false);
      setShowDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            K
          </div>
          <span className="text-2xl text-blue-600 font-bold font-display">KidsAsk.AI</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md transition"
              >
                <span>{userName || 'Account'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link 
                    href="/dashboard" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowDropdown(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link 
                href="/guide" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition shadow-lg hover-float"
              >
                Parent Guide
              </Link>
              <Link 
                href="/login" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-medium transition shadow-lg hover-float"
              >
                Log In
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
