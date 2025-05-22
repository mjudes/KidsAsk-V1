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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 to-blue-500">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Explore Topics</h1>
          <p className="text-gray-600 mb-6">Select a topic below to start learning!</p>
          
          {isFreeTrial && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
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
          
          <TopicSelector topics={topics} onSelectTopic={handleSelectTopic} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
