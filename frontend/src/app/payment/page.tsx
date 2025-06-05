'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PaymentDetails from '../../components/registration/PaymentDetails';
import RegistrationSteps from '../../components/RegistrationSteps';
import { useAuth } from '../../utils/AuthContext';
import { processPayment } from '../../utils/userApi';

// Define enum for clarity in step numbering
enum PaymentStep {
  PERSONAL_INFO = 1,
  PLAN_SELECTION = 2,
  PAYMENT_DETAILS = 3
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'basic';
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial form data with the selected plan from the URL
  const [formData, setFormData] = useState({
    plan: selectedPlan,
    paymentMethod: 'credit',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  // Handle payment submission
  const handlePaymentSubmit = async (data: any) => {
    setIsProcessing(true);
    
    try {
      // Use the processPayment function from userApi
      const responseData = await processPayment({
        userId: user?.id || '',
        plan: formData.plan,
        paymentDetails: {
          cardNumber: data.cardNumber.replace(/\s/g, ''), // Remove spaces
          cardExpiry: data.cardExpiry,
          cardCvv: data.cardCvv
        }
      });
      
      if (responseData.success) {
        setSuccess('Payment processed successfully! Your plan has been upgraded.');
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
        setError(responseData.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while processing your payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-95 rounded-xl shadow-xl w-full max-w-2xl">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="text-3xl text-blue-500 mr-2">🚀</div>
              <h1 className="text-2xl font-bold text-blue-500">Complete Your Payment</h1>
            </div>
            
            <RegistrationSteps currentStep={PaymentStep.PAYMENT_DETAILS} />
            
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
            
            <PaymentDetails 
              initialData={formData}
              onSubmit={handlePaymentSubmit}
              onBack={() => router.push('/upgrade')}
            />
          </div>
        </div>
      </div>
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Processing your payment...</p>
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
