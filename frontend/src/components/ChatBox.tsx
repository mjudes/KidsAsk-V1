'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatBox({ messages, onSendMessage, isLoading }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="bg-blue-500 text-white py-3 px-4 font-semibold">
        <div className="flex items-center">
          <div className="mr-2 text-xl">🤖</div>
          <div>KidsAsk.AI Chat</div>
        </div>
      </div>
      
      <div className="flex-grow p-4 overflow-y-auto flex flex-col bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={message.role === 'user' ? 'user-message' : 'assistant-message'}
          >
            {message.role === 'user' ? (
              <div className="flex items-start">
                <div className="flex-grow">{message.content}</div>
                <div className="ml-2 text-lg">👧</div>
              </div>
            ) : (
              <div className="flex items-start">
                <div className="mr-2 text-lg">🤖</div>
                <div>{message.content}</div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="assistant-message">
            <div className="flex items-center space-x-2">
              <div className="mr-2 text-lg">🤖</div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4 relative bg-white">
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question here..."
            className="input-field pr-12 flex-grow"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading || !inputValue.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-500">
          Ask any question about your selected topic! 
        </div>
      </form>
    </div>
  );
}
