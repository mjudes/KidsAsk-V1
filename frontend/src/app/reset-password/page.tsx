'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Import the API utility at runtime
      const { requestPasswordReset } = await import('../../utils/authApi');
      
      // Call the API to request password reset
      const response = await requestPasswordReset(email);
      
      setIsSubmitted(true);
      setEmailExists(response.success);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-95 rounded-xl shadow-xl w-full max-w-md p-8">
          <div className="flex items-center mb-8">
            <div className="text-3xl text-blue-500 mr-2">🚀</div>
            <h1 className="text-2xl font-bold text-blue-500">Reset Your Password</h1>
          </div>
          
          {!isSubmitted ? (
            <>
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <p className="text-gray-700 mb-6">
                Enter your email address below and we'll send you instructions to reset your password.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="you@example.com"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div>
              {emailExists ? (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Reset instructions sent!</p>
                  <p className="mt-1">We've sent password reset instructions to <span className="font-semibold">{email}</span>. Please check your inbox and follow the instructions.</p>
                </div>
              ) : (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Email not found</p>
                  <p className="mt-1">We couldn't find an account with that email address. Would you like to register instead?</p>
                  <div className="mt-4">
                    <Link href="/register" className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                      Create an Account
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setError('');
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Try another email
                </button>
              </div>
            </div>
          )}
          
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password? <Link href="/login" className="text-blue-500 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      
      <footer className="bg-white bg-opacity-10 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-white text-opacity-80">
            © 2025 KidsAsk.AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
