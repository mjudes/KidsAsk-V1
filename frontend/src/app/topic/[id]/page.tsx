'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import ChatBox from '../../../components/ChatBox';
import { ChatMessage, Topic } from '../../../types';

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const topicId = parseInt(params.id);
  
  // Function to handle logout
  const handleLogout = async () => {
    try {
      // Import the API utility at runtime
      const { logoutUser } = await import('../../../utils/authApi');
      await logoutUser();
      
      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  useEffect(() => {
    // Fetch user data to know if user is logged in
    const fetchUserData = async () => {
      try {
        // Import the API utility at runtime
        const { getCurrentUser } = await import('../../../utils/authApi');
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

    // Check if user has auth token in cookie
    const hasAuthToken = document.cookie.includes('auth_token=');
    if (hasAuthToken) {
      fetchUserData();
    } else {
      // No auth token, redirect immediately
      setIsAuthenticated(false);
      setAuthChecked(true); // Mark auth check as complete
      router.push('/?authRequired=true');
      return;
    }
    
    async function fetchTopicDetails() {
      try {
        // Check if topicId is valid
        if (isNaN(topicId)) {
          setError('Invalid topic ID');
          setIsLoading(false);
          return;
        }
        
        // Import API function at runtime to avoid SSR issues
        const { getTopics } = await import('../../../utils/api');
        const response = await getTopics();
        
        if (response.success) {
          const foundTopic = response.data.find((t: Topic) => t.id === topicId);
          
          if (foundTopic) {
            setTopic(foundTopic);
            // Set initial welcome message
            setChatHistory([{ 
              role: 'assistant', 
              content: `Hi there! I'm ready to talk about ${foundTopic.name}! What would you like to know?` 
            }]);
          } else {
            setError('Topic not found');
          }
        } else {
          setError('Failed to load topic details');
        }
      } catch (error) {
        console.error('Error fetching topic details:', error);
        setError('An error occurred while loading the topic');
      } finally {
        setIsLoading(false);
      }
    }
    
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
    
    // Only fetch topic details if authenticated
    if (isAuthenticated || hasAuthToken) {
      fetchTopicDetails();
    }
  }, [topicId]);
  
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !topic) return;
    
    // For free trial users, check if they have questions remaining
    if (isFreeTrial && remainingQuestions !== null) {
      if (remainingQuestions <= 0) {
        setChatHistory(prev => [
          ...prev, 
          { role: 'user', content: message },
          { 
            role: 'assistant', 
            content: "I'm sorry, but your free trial has ended. Please upgrade your plan to continue asking questions!"
          }
        ]);
        return;
      }
    }
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setMessageLoading(true);
    
    try {
      // Import the API utility at runtime to avoid SSR issues
      const { sendChatMessage } = await import('../../../utils/api');
      const response = await sendChatMessage(message, topic.id, chatHistory);
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
      
      // For free trial users, decrement and store remaining questions
      if (isFreeTrial && remainingQuestions !== null) {
        const updatedQuestions = remainingQuestions - 1;
        setRemainingQuestions(updatedQuestions);
        
        localStorage.setItem('kidsask_free_trial', JSON.stringify({
          isFreeTrialUser: true,
          questionsRemaining: updatedQuestions,
          startDate: JSON.parse(localStorage.getItem('kidsask_free_trial') || '{}').startDate
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I couldn't process your question. Please try again."
      }]);
    } finally {
      setMessageLoading(false);
    }
  };
  
  const handleChangeTopic = () => {
    router.push('/topics');
  };
  
  // If we haven't checked auth status yet or we're still loading topic data, show loading state
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-white text-lg">Loading topic...</p>
          {!authChecked && <p className="text-white text-sm mt-2">Checking authentication...</p>}
        </div>
        <Footer />
      </div>
    );
  }
  
  // If user is not authenticated, redirect happens in useEffect, but we'll return null to avoid flashing content
  if (!isAuthenticated) {
    return null;
  }
  
  if (error || !topic) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error || 'Topic not found'}</div>
          <button 
            onClick={() => router.push('/topics')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Browse Topics
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Add absolute positioned logout button */}
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
      
      {/* Simple header with back button and topic name */}
      <div className="bg-white bg-opacity-10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/topics')}
              className="text-white p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              aria-label="Back to topics"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center mx-auto">
              <div className="text-3xl mr-2">{topic.icon}</div>
              <h1 className="text-xl font-bold text-white">{topic.name}</h1>
            </div>
            <div className="w-10"></div> {/* Empty div to balance the layout */}
          </div>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
          {/* Free trial notification if applicable */}
          {isFreeTrial && (
            <div className="bg-yellow-50 border-b border-yellow-200 py-2 px-4">
              <p className="font-medium text-yellow-800 text-center text-sm">
                Free Trial: <span className="font-bold">{remainingQuestions}</span> questions remaining
                {remainingQuestions === 0 && (
                  <span className="block mt-1">
                    Your free trial has ended. 
                    <button 
                      onClick={() => router.push('/upgrade')}
                      className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition"
                    >
                      Upgrade Now
                    </button>
                  </span>
                )}
              </p>
            </div>
          )}
          
          <ChatBox 
            messages={chatHistory}
            onSendMessage={handleSendMessage}
            isLoading={messageLoading}
            disabled={isFreeTrial && remainingQuestions !== null && remainingQuestions <= 0}
            placeholder={
              isFreeTrial && remainingQuestions !== null && remainingQuestions <= 0
                ? "Your free trial has ended. Please upgrade to continue."
                : `Ask a question about ${topic.name}...`
            }
          />
        </div>
      </div>
      
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
