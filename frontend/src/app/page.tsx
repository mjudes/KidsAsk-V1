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
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-purple-100">
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        {!selectedTopic ? (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-6">Welcome to KidsAsk.ai!</h1>
            <p className="text-xl mb-8">Choose a topic to start asking questions:</p>
            <TopicSelector topics={topics} onSelectTopic={handleTopicSelect} />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">
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
        )}
      </div>
      
      <Footer />
    </main>
  );
}
