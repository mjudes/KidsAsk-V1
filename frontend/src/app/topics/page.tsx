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
  
  const fetchUserData = async () => {
    try {
      // Import the API utility at runtime
      const { getCurrentUser } = await import('../../utils/authApi');
      const response = await getCurrentUser();
      
      if (response.success) {
        setUserName(response.data.user.fullName.split(' ')[0]); // Use first name only
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  useEffect(() => {
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
    
    // Check if user is logged in and fetch their name
    const hasAuthToken = document.cookie.includes('auth_token=');
    if (hasAuthToken) {
      fetchUserData();
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
    
    fetchTopics();
  }, []);
  
  const handleSelectTopic = (topicId: number) => {
    router.push(`/topic/${topicId}`);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="absolute top-4 right-4">
        {!userName ? (
          <button 
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-lg"
          >
            Log In
          </button>
        ) : null}
      </div>
      
      {userName && (
        <div className="absolute top-4 left-4 p-4 bg-white bg-opacity-90 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 fade-in">
          <p className="text-lg font-medium">👋 Hi, {userName}!</p>
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8 mt-6">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gradient mb-3">What Would You Like to Learn? 🌟</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
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
                    onClick={() => router.push('/register')}
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
      
      <footer className="bg-white bg-opacity-10 backdrop-blur-sm text-white py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">KidsAsk.AI</h2>
              <p className="text-white text-opacity-80">A safe space for curious minds</p>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-6">
              <div>
                <h3 className="font-semibold mb-2">For Parents</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Safety Features</a></li>
                  <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Privacy Policy</a></li>
                  <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Contact Us</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Topics</h3>
                <ul className="space-y-1">
                  <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Animals</a></li>
                  <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">Space</a></li>
                  <li><a href="#" className="text-white text-opacity-80 hover:text-opacity-100">All Topics</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white border-opacity-20 text-center text-sm text-white text-opacity-80">
            <p>&copy; 2025 KidsAsk.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
