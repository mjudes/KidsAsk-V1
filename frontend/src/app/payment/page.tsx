'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PaymentDetails from '../../components/registration/PaymentDetails';
import { useAuth } from '../../utils/AuthContext';
import { API_BASE_URL } from '../../utils/constants';
import { processPayment } from '../../utils/userApi';

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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
        <p className="text-gray-600">Please enter your payment details to upgrade your plan.</p>
      </div>
      
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
      
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Processing your payment...</p>
          </div>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/upgrade" className="text-blue-500 hover:underline">
          Go Back to Plan Selection
        </Link>
      </div>
    </div>
  );
}
