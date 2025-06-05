'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopicsPageHeader from '../../components/TopicsPageHeader';
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
        <TopicsPageHeader />
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
        <TopicsPageHeader />
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
      <TopicsPageHeader />
      
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
      
      <Footer />
    </div>
  );
}
