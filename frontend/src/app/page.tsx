'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopicSelector from '../components/TopicSelector';
import ChatBox from '../components/ChatBox';
import MainPageHeader from '../components/MainPageHeader';
import Footer from '../components/Footer';
import { Topic, ChatMessage } from '../types';

// Define the available topics
const topics: Topic[] = [
  { id: 1, name: 'Animals', icon: '🐼' },
  { id: 2, name: 'Space and Planets', icon: '🚀' },
  { id: 3, name: 'The Human Body', icon: '🧍' },
  { id: 4, name: 'Dinosaurs', icon: '🦖' },
  { id: 5, name: 'Weather and Natural Phenomena', icon: '🌦️' },
  { id: 6, name: 'Sports', icon: '⚽' },
  { id: 7, name: 'Technology and Robots', icon: '🤖' },
  { id: 8, name: 'The Ocean', icon: '🌊' },
  { id: 9, name: 'Mythical Creatures and Magic', icon: '🧙‍♂️' },
  { id: 10, name: 'Everyday Why Questions', icon: '❓' },
  { id: 11, name: 'Math', icon: '🧮' },
  { id: 12, name: 'Gaming', icon: '🎮' },
];

export default function Home() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  
  // Check URL parameters for authentication required flag
  useEffect(() => {
    // Check if URL has authRequired parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('authRequired') === 'true') {
      setAuthRequired(true);
      
      // Clear the parameter from URL without page refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleTopicSelect = (topicId: number) => {
    // Redirect to the topics page where authentication will be checked
    router.push(`/topics`);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    setIsLoading(true);
    
    try {
      // Import the API utility at runtime to avoid SSR issues
      const { sendChatMessage } = await import('../utils/api');
      
      // Send message to API
      const data = await sendChatMessage(message, selectedTopic, chatHistory);
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm sorry, I couldn't process your question. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setSelectedTopic(null);
    setChatHistory([]);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <MainPageHeader />
      
      {/* Auth required notification */}
      {authRequired && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 container mx-auto mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                <strong>Authentication Required:</strong> Please log in or register to access the topic pages and chat with KidsAsk AI.
              </p>
              <div className="mt-2 flex space-x-3">
                <button 
                  onClick={() => router.push('/login')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
                >
                  Log In
                </button>
                <button 
                  onClick={() => router.push('/register')}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!selectedTopic ? (
        <>
          <div className="flex-grow container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-white mb-3">Welcome to KidsAsk.AI 🚀</h1>
              <p className="text-xl text-white mb-8">Where Curiosity Meets Knowledge in a Safe, Fun Environment!</p>
              
              <div className="flex justify-center mb-12">
                <button 
                  onClick={() => router.push('/register')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-3 rounded-full text-lg font-medium transition shadow-lg hover-float"
                >
                  Register & Start Learning Now
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="mb-2">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-blue-500 font-medium mb-1">Sparks Curiosity</h3>
                <p className="text-sm">Safe environment for endless exploration.</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="mb-2">
                  <span className="text-3xl">🎓</span>
                </div>
                <h3 className="text-green-600 font-medium mb-1">Educational Growth</h3>
                <p className="text-sm">Learning aligned with education standards.</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="mb-2">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-purple-600 font-medium mb-1">Safe Learning</h3>
                <p className="text-sm">Parent-controlled, kid-friendly content.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="mb-2">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-pink-500 font-medium mb-1">Interactive Learning</h3>
                <p className="text-sm">Personalized to your child's interests.</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="mb-2">
                  <span className="text-3xl">✏️</span>
                </div>
                <h3 className="text-orange-500 font-medium mb-1">Voice Interaction</h3>
                <p className="text-sm">Ask questions by voice and get friendly audio responses.</p>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-4 text-center w-full max-w-md">
                <div className="mb-2">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-purple-500 font-medium mb-1">Fun Achievements</h3>
                <p className="text-sm">Earn badges and rewards through interactive quizzes.</p>
              </div>
            </div>
          </div>
          
          <Footer />
        </>
      ) : (
        <>
          <MainPageHeader />
          <div className="flex-grow container mx-auto px-4 py-8">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Topic: {topics.find(t => t.id === selectedTopic)?.name}
                </h2>
                <button 
                  onClick={resetChat}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Change Topic
                </button>
              </div>
              <ChatBox 
                messages={chatHistory}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
          <Footer />
        </>
      )}
    </main>
  );
}
