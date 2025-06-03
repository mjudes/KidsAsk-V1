'use client';

import { useState, useEffect } from 'react';

interface PaymentDetailsProps {
  initialData: {
    plan: string;
    paymentMethod: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

export default function PaymentDetails({ initialData, onSubmit, onBack }: PaymentDetailsProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    terms: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const plans: Record<string, {name: string, price: string}> = {
    'basic': { name: 'Basic Plan', price: '$4.99/month' },
    'standard': { name: 'Standard Plan', price: '$9.99/month' },
    'premium': { name: 'Premium Plan', price: '$14.99/month' }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value
        .replace(/\s/g, '') // Remove spaces
        .replace(/\D/g, '') // Remove non-digits
        .slice(0, 16); // Limit to 16 digits

      // Format with spaces every 4 digits
      const parts = [];
      for (let i = 0; i < formattedValue.length; i += 4) {
        parts.push(formattedValue.slice(i, i + 4));
      }
      formattedValue = parts.join(' ');
    }
    
    // Format expiry date as MM/YY
    if (name === 'cardExpiry') {
      formattedValue = value
        .replace(/\D/g, '') // Remove non-digits
        .slice(0, 4); // Limit to 4 digits
      
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    }
    
    // Format CVV
    if (name === 'cardCvv') {
      formattedValue = value
        .replace(/\D/g, '') // Remove non-digits
        .slice(0, 4); // Limit to 4 digits (some cards have 4-digit CVV)
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      terms: ''
    };
    let isValid = true;

    // Only validate card details if payment method is credit
    if (formData.paymentMethod === 'credit') {
      // Card number validation - should be 16 digits (ignoring spaces)
      const cardNumberDigits = formData.cardNumber.replace(/\s/g, '');
      if (!cardNumberDigits) {
        newErrors.cardNumber = 'Card number is required';
        isValid = false;
      } else if (cardNumberDigits.length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits';
        isValid = false;
      }

      // Expiry date validation (MM/YY format)
      if (!formData.cardExpiry) {
        newErrors.cardExpiry = 'Expiry date is required';
        isValid = false;
      } else {
        const [month, year] = formData.cardExpiry.split('/');
        const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
        const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
        
        if (!month || !year || month.length !== 2 || year.length !== 2) {
          newErrors.cardExpiry = 'Expiry date must be in MM/YY format';
          isValid = false;
        } else {
          const monthNum = parseInt(month);
          const yearNum = parseInt(year);
          
          if (monthNum < 1 || monthNum > 12) {
            newErrors.cardExpiry = 'Invalid month';
            isValid = false;
          } else if (
            yearNum < currentYear || 
            (yearNum === currentYear && monthNum < currentMonth)
          ) {
            newErrors.cardExpiry = 'Card has expired';
            isValid = false;
          }
        }
      }

      // CVV validation
      if (!formData.cardCvv) {
        newErrors.cardCvv = 'Security code is required';
        isValid = false;
      } else if (formData.cardCvv.length < 3) {
        newErrors.cardCvv = 'Security code must be 3 or 4 digits';
        isValid = false;
      }
    }

    // Terms acceptance validation
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms to continue';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // If payment method is PayPal, ensure card details are not sent
        if (formData.paymentMethod === 'paypal') {
          const paypalData = {
            ...formData,
            cardNumber: undefined,
            cardExpiry: undefined,
            cardCvv: undefined
          };
          await onSubmit(paypalData);
        } else {
          await onSubmit(formData);
        }
      } catch (error) {
        console.error('Payment submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Payment Details</h2>
      <p className="text-sm text-gray-600 mb-6">
        Complete your registration by adding your payment method
      </p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-blue-500 mr-3 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">Plan Summary</h3>
            <p className="text-sm text-blue-700">
              {plans[formData.plan]?.name}: {plans[formData.plan]?.price}
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</h3>
          <div className="flex space-x-4">
            <label className="flex items-center p-4 border rounded-lg cursor-pointer bg-white">
              <input
                type="radio"
                name="paymentMethod"
                value="credit"
                checked={formData.paymentMethod === 'credit'}
                onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'credit' }))}
                className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2">Credit Card</span>
            </label>
            
            <label className="flex items-center p-4 border rounded-lg cursor-pointer bg-white">
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={formData.paymentMethod === 'paypal'}
                onChange={() => setFormData(prev => ({ ...prev, paymentMethod: 'paypal' }))}
                className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2">PayPal</span>
            </label>
          </div>
        </div>
        
        {formData.paymentMethod === 'credit' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  className={`w-full px-4 py-2 rounded-lg border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <img src="https://cdn.jsdelivr.net/npm/payment-icons/min/flat/visa.svg" className="h-6" alt="Visa" />
                  <img src="https://cdn.jsdelivr.net/npm/payment-icons/min/flat/mastercard.svg" className="h-6" alt="Mastercard" />
                  <img src="https://cdn.jsdelivr.net/npm/payment-icons/min/flat/amex.svg" className="h-6" alt="Amex" />
                </div>
              </div>
              {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="cardExpiry"
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  className={`w-full px-4 py-2 rounded-lg border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.cardExpiry && <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>}
              </div>
              
              <div>
                <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">
                  Security Code (CVV)
                </label>
                <input
                  type="text"
                  id="cardCvv"
                  name="cardCvv"
                  value={formData.cardCvv}
                  onChange={handleChange}
                  placeholder="123"
                  className={`w-full px-4 py-2 rounded-lg border ${errors.cardCvv ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.cardCvv && <p className="mt-1 text-sm text-red-500">{errors.cardCvv}</p>}
              </div>
            </div>
          </div>
        )}
        
        {formData.paymentMethod === 'paypal' && (
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-gray-700 mb-3">
              You'll be redirected to PayPal to complete your payment
            </p>
            <img src="https://cdn.jsdelivr.net/npm/payment-icons/min/flat/paypal.svg" className="h-10 mx-auto" alt="PayPal" />
          </div>
        )}
        
        <div className="pt-4">
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => {
                setAcceptTerms(!acceptTerms);
                setErrors(prev => ({ ...prev, terms: '' }));
              }}
              className="h-5 w-5 mt-0.5 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              I agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
              I understand that my subscription will auto-renew monthly until cancelled.
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-sm text-red-500">{errors.terms}</p>}
        </div>
        
        <div className="flex items-center justify-between pt-5">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
          >
            Back
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Complete Payment'
            )}
          </button>
        </div>
        
        <div className="text-center pt-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <span>Your payment information is encrypted and secure.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
