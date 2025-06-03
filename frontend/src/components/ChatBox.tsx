'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatBox({ messages, onSendMessage, isLoading, disabled = false, placeholder = "Type your question here..." }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [isMicSupported, setIsMicSupported] = useState(true);
  const [micPermissionState, setMicPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isDocker, setIsDocker] = useState(false);
  
  // Check if browser supports SpeechRecognition and if we're in a Docker environment
  useEffect(() => {
    // Try to detect if we're running in Docker (simplified detection)
    const checkDockerEnvironment = () => {
      // Check for common environment variables or behaviors that might indicate Docker
      if (
        window.location.hostname === 'localhost' && 
        (window.navigator.userAgent.includes('HeadlessChrome') || 
         window.location.port === '3000' || 
         document.cookie.includes('docker=true'))
      ) {
        console.log('Possible Docker environment detected');
        setIsDocker(true);
        return true;
      }
      return false;
    };
    
    const possibleDocker = checkDockerEnvironment();
    
    // Check if the browser supports the Speech Recognition API
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.log('Speech recognition not supported in this browser');
        setIsMicSupported(false);
      } else {
        // Check if browser has navigator.permissions API (more reliable for checking permissions)
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'microphone' as PermissionName })
            .then((permissionStatus) => {
              setMicPermissionState(permissionStatus.state as 'granted' | 'denied' | 'prompt');
              
              // Only check for microphone if permission is granted or prompt
              if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
                // Additional check to confirm microphone availability
                if (!possibleDocker) {
                  checkMicrophoneAvailability();
                } else {
                  // In Docker, we'll assume microphone might not be available but we won't block the UI
                  console.log('Docker environment: microphone might not be available');
                  setIsMicSupported(false);
                }
              } else {
                setIsMicSupported(false);
              }
              
              // Listen for permission changes
              permissionStatus.onchange = () => {
                setMicPermissionState(permissionStatus.state as 'granted' | 'denied' | 'prompt');
                if (permissionStatus.state === 'granted') {
                  setIsMicSupported(true);
                } else if (permissionStatus.state === 'denied') {
                  setIsMicSupported(false);
                  setIsListening(false);
                }
              };
            })
            .catch(error => {
              console.log('Error checking permission:', error);
              // Fallback to older method if permissions API fails
              checkMicrophoneAvailability();
            });
        } else {
          // Fallback for browsers that don't support permissions API
          checkMicrophoneAvailability();
        }
      }
    } catch (err) {
      console.log('Error checking speech recognition:', err);
      setIsMicSupported(false);
    }
  }, []);
  
  // Function to check for actual microphone hardware
  const checkMicrophoneAvailability = () => {
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        setIsMicSupported(true);
        // Release the stream immediately
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((error) => {
        console.log('Microphone access issue:', error);
        setIsMicSupported(false);
      });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !disabled) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };
  
  // Function to handle voice input
  const toggleListening = () => {
    if (disabled || isLoading) return;
    
    // If in Docker environment, show a notification that microphone access might be limited
    if (isDocker && !isListening) {
      alert("Note: Microphone access might be limited in Docker environments. If voice input doesn't work, please try using the app outside of Docker.");
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not available');
      return;
    }
    
    // If we were already listening, stop
    if (isListening) {
      try {
        // We need to recreate the recognition object since it's not stored as a ref
        const recognition = new SpeechRecognition();
        recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      setIsListening(false);
      return;
    }
    
    // Otherwise start listening
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      setIsListening(true);
      
      recognition.onresult = (event) => {
        try {
          const transcript = event.results[0][0].transcript;
          setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
        } catch (e) {
          console.error('Error processing speech result:', e);
        }
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        // Provide user feedback based on error type
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermissionState('denied');
          setIsMicSupported(false);
        } else if (event.error === 'no-speech') {
          // This is a common error that occurs when no speech is detected
          // We don't need to change mic support status for this
          console.log('No speech detected');
        } else if (event.error === 'network') {
          alert("Network error occurred. Please check your internet connection.");
        } else if (isDocker && (event.error === 'audio-capture' || event.error === 'not-allowed')) {
          alert("Microphone access failed. This may be due to Docker container limitations.");
        }
        
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      setIsListening(false);
      
      if (isDocker) {
        alert("Could not access microphone. This is a common limitation in Docker environments.");
      }
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden">
      {/* Chat content area */}
      <div className="flex-grow p-5 overflow-y-auto flex flex-col space-y-5">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={message.role === 'user' ? 'user-message' : 'assistant-message'}
          >
            <div className="flex items-start">
              <div className="text-base leading-relaxed">{message.content}</div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="assistant-message">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="w-full py-3 px-4 pr-24 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md"
            disabled={isLoading || disabled}
          />          {/* Microphone button with Docker-aware tooltips */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading || disabled || (!isMicSupported && micPermissionState === 'denied')}
            className={`absolute right-14 top-1/2 transform -translate-y-1/2 ${
              !isMicSupported && micPermissionState === 'denied'
                ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                : isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : isDocker && !isMicSupported
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-blue-400 hover:bg-blue-500'
            } text-white rounded-full p-2 transition-colors`}
            title={
              !isMicSupported && micPermissionState === 'denied'
                ? "Microphone access denied. Check browser permissions."
                : isDocker && !isMicSupported
                  ? "Microphone might not work in Docker environment. Click to try anyway."
                  : isListening 
                    ? "Stop listening" 
                    : "Start voice input"
            }
            aria-label={
              !isMicSupported && micPermissionState === 'denied'
                ? "Microphone access denied" 
                : isDocker && !isMicSupported
                  ? "Microphone might not work in Docker"
                  : isListening 
                    ? "Stop listening" 
                    : "Start voice input"
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </button>
          {/* Send button */}
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors"
            disabled={isLoading || !inputValue.trim() || disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l9 2-9-18-9 18 9-2z"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
