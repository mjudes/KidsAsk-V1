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
  
  const topicId = parseInt(params.id);
  
  useEffect(() => {
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
    
    fetchTopicDetails();
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
  
  if (isLoading) {
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-500 to-teal-600">
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
                      onClick={() => router.push('/register')}
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
      
      <footer className="py-2 bg-white bg-opacity-10">
        <div className="container mx-auto px-4">
          <p className="text-center text-white text-opacity-80 text-xs">
            © 2025 KidsAsk.AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
