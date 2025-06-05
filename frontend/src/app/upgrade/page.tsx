'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlanSelection from '../../components/registration/PlanSelection';
import RegistrationSteps from '../../components/RegistrationSteps';
import { useAuth } from '../../utils/AuthContext';
import { upgradeUserPlan } from '../../utils/userApi';

// Define enum for clarity in step numbering
enum UpgradeStep {
  PLAN_SELECTION = 2,
  PAYMENT_DETAILS = 3
}

export default function UpgradePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Check if we can get user info, but don't block the page if not authenticated
  useEffect(() => {
    // If user data is already loaded, no need to do anything
    if (user) return;
    
    // If loading, wait for it to complete
    if (isLoading) return;
    
    // If not authenticated but we have a token, try to refresh user data
    const token = localStorage.getItem('auth_token');
    if (token && typeof refreshUser === 'function') {
      refreshUser().catch(err => {
        console.error('Error refreshing user data:', err);
      });
    }
  }, [user, isLoading, refreshUser]);

  const handlePlanSubmit = async (data: any) => {
    setIsProcessing(true);
    
    try {
      // Don't process the API call here - instead redirect to payment page
      // with the selected plan as a query parameter
      
      // Skip payment for free trial if applicable
      if (data.plan === 'freeTrial') {
        // Use the upgradeUserPlan function
        const responseData = await upgradeUserPlan({
          userId: user?.id || '',
          plan: data.plan
        });
        
        if (responseData.success) {
          setSuccess('Your plan has been upgraded successfully!');
          // If refreshUser is available, refresh user data
          if (typeof refreshUser === 'function') {
            try {
              await refreshUser();
            } catch (e) {
              console.error('Error refreshing user data:', e);
            }
          }
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError(responseData.message || 'Failed to upgrade plan. Please try again.');
        }
      } else {
        // For paid plans, redirect to the payment page
        router.push(`/payment?plan=${data.plan}`);
      }
    } catch (err) {
      setError('An error occurred during the upgrade process. Please try again.');
      console.error('Plan upgrade error:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Only show loading if we're explicitly waiting for something
  if (isLoading && typeof isLoading !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Get current user plan info
  const currentPlan = user?.subscription?.plan || 'freeTrial';
  const questionsRemaining = user?.subscription?.questionsRemaining || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-95 rounded-xl shadow-xl w-full max-w-2xl">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="text-3xl text-blue-500 mr-2">🚀</div>
              <h1 className="text-2xl font-bold text-blue-500">Upgrade Your Plan</h1>
            </div>
            
            <RegistrationSteps currentStep={UpgradeStep.PLAN_SELECTION} />
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                {success}
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="font-bold text-lg text-blue-800">Your Current Plan</h2>
              <p className="text-blue-700">
                {currentPlan === 'freeTrial' 
                  ? `Free Trial (${questionsRemaining} questions remaining)` 
                  : `${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan (${questionsRemaining} questions remaining)`}
              </p>
              {currentPlan === 'freeTrial' && (
                <p className="text-sm text-blue-600 mt-1">
                  Upgrade now to get more questions and continue your learning journey!
                </p>
              )}
            </div>
            
            <PlanSelection 
              initialData={{ plan: currentPlan === 'freeTrial' ? 'basic' : currentPlan }}
              onSubmit={handlePlanSubmit}
              onBack={() => router.push('/dashboard')}
              isUpgrade={true}
            />
          </div>
        </div>
      </div>
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Processing your upgrade...</p>
          </div>
        </div>
      )}
      
      <footer className="bg-gray-100 py-4 text-center text-gray-600 mt-auto">
        <p className="mb-2"><a href="http://localhost:3050/" className="hover:text-gray-900">© 2025 KidsAsk.AI</a></p>
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
