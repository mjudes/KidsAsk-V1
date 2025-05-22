'use client';

import { useState } from 'react';
import TopicSelector from '../components/TopicSelector';
import ChatBox from '../components/ChatBox';
import Header from '../components/Header';
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
  { id: 12, name: 'Lego', icon: '🧱' },
];

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleTopicSelect = (topicId: number) => {
    setSelectedTopic(topicId);
    // Start with a welcome message for the selected topic
    const topic = topics.find(t => t.id === topicId);
    setChatHistory([
      { 
        role: 'assistant', 
        content: `Hi there! I'm ready to talk about ${topic?.name}! What would you like to know?` 
      }
    ]);
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
      <div className="absolute top-4 right-4">
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition shadow-lg">
          Log In
        </button>
      </div>
      
      {!selectedTopic ? (
        <>
          <div className="flex-grow container mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-3">Welcome to KidsAsk.AI 🚀</h1>
              <p className="text-xl text-white mb-8">Where Curiosity Meets Knowledge in a Safe, Fun Environment!</p>
              
              <button 
                onClick={() => setSelectedTopic(1)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition transform hover:scale-105 shadow-lg"
              >
                Start Learning Now
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl text-yellow-400 mb-3">💡</div>
                <h3 className="text-xl font-bold text-blue-500 mb-2">Sparks Curiosity</h3>
                <p className="text-gray-600">Safe environment for endless exploration.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl text-green-500 mb-3">🎓</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Educational Growth</h3>
                <p className="text-gray-600">Learning aligned with education standards.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl text-red-500 mb-3">🛡️</div>
                <h3 className="text-xl font-bold text-purple-600 mb-2">Safe Learning</h3>
                <p className="text-gray-600">Parent-controlled, kid-friendly content.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl text-pink-500 mb-3">🚀</div>
                <h3 className="text-xl font-bold text-pink-500 mb-2">Interactive Learning</h3>
                <p className="text-gray-600">Personalized to your child's interests.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl text-orange-500 mb-3">🎤</div>
                <h3 className="text-xl font-bold text-orange-500 mb-2">Voice Interaction</h3>
                <p className="text-gray-600">Ask questions by voice and get friendly audio responses.</p>
              </div>
            </div>
            
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center w-full max-w-md">
                <div className="text-4xl text-purple-500 mb-3">🏆</div>
                <h3 className="text-xl font-bold text-purple-500 mb-2">Fun Achievements</h3>
                <p className="text-gray-600">Earn badges and rewards through interactive quizzes.</p>
              </div>
            </div>
          </div>
          
          <footer className="bg-gray-200 py-4 text-center text-gray-600">
            <div className="container mx-auto px-4">
              <p className="mb-2">© 2025 KidsAsk.AI</p>
              <div className="flex justify-center space-x-6">
                <a href="#" className="hover:text-gray-900">About Us</a>
                <a href="#" className="hover:text-gray-900">Terms of Use</a>
                <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                <a href="#" className="hover:text-gray-900">Refund Policy</a>
                <a href="#" className="hover:text-gray-900">Contact Us</a>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <>
          <Header />
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
