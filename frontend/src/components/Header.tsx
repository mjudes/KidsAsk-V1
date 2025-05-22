'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
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
    <header className="bg-white bg-opacity-10 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
            K
          </div>
          <h1 className="text-2xl font-display font-bold text-white">KidsAsk.AI</h1>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link href="/" className="text-white hover:text-blue-200 transition">Home</Link>
            </li>
            <li>
              <Link href="/topics" className="text-white hover:text-blue-200 transition">Topics</Link>
            </li>
            <li>
              <Link href="/guide" className="text-white hover:text-blue-200 transition">Parent Guide</Link>
            </li>
          </ul>
          
          {isLoggedIn ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-full transition"
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
            <div className="flex space-x-2">
              <Link 
                href="/login" 
                className="text-white hover:text-blue-200 transition px-4 py-2"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-lg"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
