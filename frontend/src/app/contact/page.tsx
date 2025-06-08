'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainPageHeader from '../../components/MainPageHeader';
import Footer from '../../components/Footer';
import Script from 'next/script';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    customerNumber: '',
    email: '',
    phoneNumber: '',
    contactReason: 'parents',
    message: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
    captcha: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  // Initialize reCAPTCHA
  useEffect(() => {
    // Define the callback function for when reCAPTCHA loads
    window.onRecaptchaLoad = () => {
      setCaptchaLoaded(true);
    };

    // Define the callback function for when reCAPTCHA is successfully completed
    window.onCaptchaVerify = (token: string) => {
      setCaptchaToken(token);
      // Clear captcha error if it exists
      if (errors.captcha) {
        setErrors(prev => ({ ...prev, captcha: '' }));
      }
    };

    // Define the callback function for when reCAPTCHA expires
    window.onCaptchaExpired = () => {
      setCaptchaToken(null);
    };

    return () => {
      // Clean up
      window.onRecaptchaLoad = undefined;
      window.onCaptchaVerify = undefined;
      window.onCaptchaExpired = undefined;
    };
  }, [errors.captcha]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      message: '',
      captcha: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Your name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Your email is required';
      isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please provide a message';
      isValid = false;
    }

    if (!captchaToken) {
      newErrors.captcha = 'Please complete the CAPTCHA verification';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // In a real application, you would submit this to your backend along with the captchaToken
      // The backend would verify the token with Google's reCAPTCHA API
      // For now, we'll just simulate a successful submission
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        
        // Reset captcha after submission
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
        setCaptchaToken(null);
      }, 1500);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <MainPageHeader />
        <div className="flex-grow flex items-center justify-center px-4 py-12">
          <div className="bg-white bg-opacity-95 rounded-xl shadow-xl w-full max-w-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Message Received!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for contacting us. Our support team will review your message and get back to you as soon as possible.
            </p>
            <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200">
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainPageHeader />
      <div className="flex-grow px-4 py-12">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center">
            Contact KidsAsk.AI
            <span className="ml-2">🚀</span>
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Info Section */}
            <div className="bg-white bg-opacity-95 rounded-xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl text-blue-500 mr-2">📧</div>
                <h2 className="text-xl font-bold text-blue-500">Email Us Directly</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700 mb-1">For Parents</h3>
                  <p className="text-sm text-gray-600 mb-2">Inquiries regarding your child's membership</p>
                  <a href="mailto:parents-cs@kidsask.ai" className="text-blue-600 hover:underline">
                    parents-cs@kidsask.ai
                  </a>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-700 mb-1">For Schools</h3>
                  <p className="text-sm text-gray-600 mb-2">Questions regarding pupils and school accounts</p>
                  <a href="mailto:schools-cs@kidsask.ai" className="text-green-600 hover:underline">
                    schools-cs@kidsask.ai
                  </a>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-700 mb-1">For Potential Partners</h3>
                  <p className="text-sm text-gray-600 mb-2">Inquiries about collaboration opportunities</p>
                  <a href="mailto:partnership@kidsask.ai" className="text-purple-600 hover:underline">
                    partnership@kidsask.ai
                  </a>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-medium text-amber-700 mb-1">Technical Support</h3>
                  <p className="text-sm text-gray-600 mb-2">For technical issues and troubleshooting</p>
                  <a href="mailto:tech-support@kidsask.ai" className="text-amber-600 hover:underline">
                    tech-support@kidsask.ai
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form Section */}
            <div className="bg-white bg-opacity-95 rounded-xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <div className="text-3xl text-blue-500 mr-2">📝</div>
                <h2 className="text-xl font-bold text-blue-500">Contact KidsAsk.AI</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Full Name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="customerNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Number (if applicable)
                  </label>
                  <input
                    type="text"
                    id="customerNumber"
                    name="customerNumber"
                    value={formData.customerNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer Number"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address*
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone Number"
                  />
                </div>
                
                <div>
                  <label htmlFor="contactReason" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Category*
                  </label>
                  <select
                    id="contactReason"
                    name="contactReason"
                    value={formData.contactReason}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="parents">Parents - Child Membership</option>
                    <option value="schools">Schools - Pupil Accounts</option>
                    <option value="partnership">Potential Partnership</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Please describe your inquiry..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                </div>
                
                <div className="mb-4 flex flex-col items-center">
                  <div 
                    id="recaptcha" 
                    className="g-recaptcha" 
                    data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    data-callback="onCaptchaVerify"
                    data-expired-callback="onCaptchaExpired"
                  ></div>
                  {errors.captcha && <p className="mt-1 text-sm text-red-500">{errors.captcha}</p>}
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition duration-200 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Submit Message'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          <p className="text-center text-sm mt-8">
            <Link href="/" className="text-white hover:underline font-medium">
              Return to Homepage
            </Link>
          </p>
        </div>
      </div>
      
      <Footer />

      {/* reCAPTCHA Script */}
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad"
        strategy="lazyOnload"
      />
    </div>
  );
}

// Add TypeScript interface for window object to include our custom properties
declare global {
  interface Window {
    onRecaptchaLoad?: () => void;
    onCaptchaVerify?: (token: string) => void;
    onCaptchaExpired?: () => void;
    grecaptcha?: {
      reset: () => void;
    };
  }
}
