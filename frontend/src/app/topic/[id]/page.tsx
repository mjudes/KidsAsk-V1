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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 to-blue-500">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="text-4xl mr-2">{topic.icon}</div>
              <h2 className="text-2xl font-bold text-white">
                Topic: {topic.name}
              </h2>
            </div>
            <button 
              onClick={handleChangeTopic}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            >
              Change Topic
            </button>
          </div>
          
          {isFreeTrial && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
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
      
      <Footer />
    </div>
  );
}
