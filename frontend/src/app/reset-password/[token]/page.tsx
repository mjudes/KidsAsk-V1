'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function NewPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Verify token validity when the component mounts
    async function verifyToken() {
      try {
        setIsLoading(true);
        const { verifyResetToken } = await import('../../../utils/authApi');
        const response = await verifyResetToken(token);
        
        if (!response.success) {
          setIsTokenValid(false);
          setErrors(prev => ({
            ...prev,
            general: 'Invalid or expired password reset link. Please request a new one.'
          }));
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsTokenValid(false);
        setErrors(prev => ({
          ...prev,
          general: 'Error verifying reset token. Please try again.'
        }));
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      verifyToken();
    } else {
      setIsTokenValid(false);
      setErrors(prev => ({
        ...prev,
        general: 'Invalid reset link. Token is missing.'
      }));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      password: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setErrors(prev => ({ ...prev, general: '' }));
      
      try {
        const { resetPassword } = await import('../../../utils/authApi');
        const response = await resetPassword(token, formData.password);
        
        if (response.success) {
          setIsCompleted(true);
        } else {
          setErrors(prev => ({ ...prev, general: response.message || 'Password reset failed' }));
        }
      } catch (error) {
        console.error('Password reset error:', error);
        setErrors(prev => ({ ...prev, general: 'An error occurred. Please try again.' }));
      } finally {
        setIsLoading(false);
      }
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

          {!isTokenValid ? (
            <div>
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
              <div className="text-center mt-4">
                <Link href="/reset-password" className="text-blue-500 hover:underline">
                  Request a new password reset
                </Link>
              </div>
            </div>
          ) : isCompleted ? (
            <div>
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                <span className="mr-2">✅</span>
                <div>
                  <p className="font-medium">Password Reset Successful!</p>
                  <p className="mt-1">Your password has been reset. You can now login with your new password.</p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/login" 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your new password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Confirm your new password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
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
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
          
          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password? <Link href="/login" className="text-blue-500 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
      
      <footer className="bg-white bg-opacity-10 py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-white text-opacity-80">
            <a href="http://localhost:3050/" className="hover:text-white">© 2025 KidsAsk.AI. All rights reserved.</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
