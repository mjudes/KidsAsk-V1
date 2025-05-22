'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Topic } from '../../types';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Define popular topics
  const popularTopics: Topic[] = [
    { id: 1, name: 'Animals', icon: '🐼' },
    { id: 2, name: 'Space and Planets', icon: '🚀' },
    { id: 3, name: 'The Human Body', icon: '🧍' },
    { id: 4, name: 'Dinosaurs', icon: '🦖' }
  ];
  
  // Fetch user data on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const { getCurrentUser } = await import('../../utils/authApi');
        const response = await getCurrentUser();
        
        if (response.success) {
          setUser(response.data.user);
        } else {
          // Redirect to login if not authenticated
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Redirect to login if error occurs
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    // For now, use placeholder data
    setUser({
      fullName: 'John Doe',
      email: 'john@example.com',
      subscription: {
        plan: 'basic',
        status: 'active',
        endDate: new Date('2025-06-22')
      }
    });
    setLoading(false);
    
    // Uncomment to fetch real user data
    // fetchUserData();
  }, [router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, {user?.fullName}!
          </h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">
                  Current Plan: <span className="font-bold capitalize">{user?.subscription?.plan}</span>
                </p>
                <p className="text-sm text-blue-700">
                  Status: <span className="capitalize">{user?.subscription?.status}</span>
                </p>
                <p className="text-sm text-blue-700">
                  Renewal Date: {new Date(user?.subscription?.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                Manage Subscription
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Continue Learning
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popularTopics.map(topic => (
                  <div 
                    key={topic.id}
                    className="bg-gray-100 rounded-lg p-4 flex items-center hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => router.push(`/topic/${topic.id}`)}
                  >
                    <div className="text-3xl mr-3">{topic.icon}</div>
                    <div>
                      <h3 className="font-medium">{topic.name}</h3>
                      <p className="text-sm text-gray-600">Continue exploring</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recent Activity
              </h2>
              
              <p className="text-gray-600 text-center py-6">
                No recent activity yet. Start exploring topics!
              </p>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your Badges
              </h2>
              
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                  🔍
                </div>
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                  🏆
                </div>
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center text-3xl opacity-40">
                  🦖
                </div>
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center text-3xl opacity-40">
                  🚀
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600 mt-4">
                Complete more quizzes to earn badges!
              </p>
            </div>
            
            <div className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Learning Stats
              </h2>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Questions Asked</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Topics Explored</span>
                    <span className="font-medium">2/12</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '16.6%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quizzes Completed</span>
                    <span className="font-medium">1/10</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
