'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import TopicSelector from '../../components/TopicSelector';
import { Topic } from '../../types';

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const fetchUserData = async () => {
    try {
      // Import the API utility at runtime
      const { getCurrentUser } = await import('../../utils/authApi');
      const response = await getCurrentUser();
      
      if (response.success) {
        setUserName(response.data.user.fullName.split(' ')[0]); // Use first name only
        setIsAuthenticated(true);
      } else {
        // User is not authenticated, redirect to home page
        setIsAuthenticated(false);
        router.push('/?authRequired=true');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Authentication failed, redirect to home page
      setIsAuthenticated(false);
      router.push('/?authRequired=true');
    } finally {
      setAuthChecked(true);
    }
  };
  
  useEffect(() => {
    // Immediately check authentication status when the component mounts
    const hasAuthToken = document.cookie.includes('auth_token=');
    if (hasAuthToken) {
      fetchUserData();
    } else {
      // No auth token, redirect to home page with auth required flag
      router.push('/?authRequired=true');
      return;
    }
    
    async function fetchTopics() {
      try {
        const { getTopics } = await import('../../utils/api');
        const response = await getTopics();
        
        if (response.success) {
          setTopics(response.data);
        } else {
          setError('Failed to load topics');
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        setError('An error occurred while loading topics');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTopics();
    
    // Check for free trial status
    const freeTrialData = localStorage.getItem('kidsask_free_trial');
    if (freeTrialData) {
      try {
        const parsedData = JSON.parse(freeTrialData);
        if (parsedData.isFreeTrialUser) {
          setIsFreeTrial(true);
          setRemainingQuestions(parsedData.questionsRemaining || 0);
        }
      } catch (e) {
        console.error('Error parsing free trial data:', e);
      }
    }
  }, []);
  
  const handleSelectTopic = (topicId: number) => {
    router.push(`/topic/${topicId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Loading topics...</p>
          {!authChecked && <p className="text-white text-sm mt-2">Checking authentication...</p>}
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Import the API utility at runtime
      const { logoutUser } = await import('../../utils/authApi');
      await logoutUser();
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute top-4 right-4 flex space-x-2">
        {!userName ? (
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-lg"
          >
            Log In
          </button>
        ) : (
          <>
            <button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-lg flex items-center"
            >
              <span>Dashboard</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition shadow-lg flex items-center"
            >
              <span>Logout</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        )}
      </div>
      
      {userName && (
        <div className="absolute top-4 left-4 p-4 bg-white bg-opacity-90 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 fade-in">
          <p className="text-lg font-medium">👋 Hi, {userName}!</p>
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-6">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold text-white mb-3">What Would You Like to Learn? 🌟</h1>
          <p className="text-lg text-white max-w-3xl mx-auto">
            Choose a topic and start your amazing learning adventure! Every question brings
            you closer to becoming a knowledge superhero! 🚀
          </p>
          
          {isFreeTrial && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6 max-w-md mx-auto mt-4">
              <p className="font-medium text-yellow-800">
                Free Trial: <span className="font-bold">{remainingQuestions}</span> questions remaining
              </p>
              {remainingQuestions === 0 && (
                <div className="mt-2">
                  <p className="text-sm text-yellow-800 mb-2">Your free trial has ended. Upgrade to continue learning!</p>
                  <button 
                    onClick={() => router.push('/upgrade')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-lg text-sm transition"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="max-w-7xl mx-auto">
          <TopicSelector topics={topics} onSelectTopic={handleSelectTopic} />
        </div>
      </main>
      
      <footer className="bg-gray-100 py-4 text-center text-gray-600 mt-auto">
        <p className="mb-2">© 2025 KidsAsk.AI</p>
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-sm hover:text-gray-900">About Us</a>
          <a href="#" className="text-sm hover:text-gray-900">Terms of Use</a>
          <a href="#" className="text-sm hover:text-gray-900">Privacy Policy</a>
          <a href="#" className="text-sm hover:text-gray-900">Refund Policy</a>
          <a href="#" className="text-sm hover:text-gray-900">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
