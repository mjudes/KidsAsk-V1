'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegistrationSteps from '../../components/RegistrationSteps';
import PersonalInfoForm from '../../components/registration/PersonalInfoForm';
import PlanSelection from '../../components/registration/PlanSelection';
import PaymentDetails from '../../components/registration/PaymentDetails';

enum RegistrationStep {
  PERSONAL_INFO = 1,
  PLAN_SELECTION = 2,
  PAYMENT_DETAILS = 3
}

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(RegistrationStep.PERSONAL_INFO);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    countryCode: '+1',
    plan: 'basic',
    paymentMethod: 'credit',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });
  
  const handlePersonalInfoSubmit = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(RegistrationStep.PLAN_SELECTION);
  };
  
  const handlePlanSubmit = async (data: any) => {
    const updatedFormData = { ...formData, ...data };
    setFormData(updatedFormData);
    
    // If the free trial plan is selected, skip payment and register directly
    if (data.plan === 'freeTrial') {
      try {
        // Import the API utility at runtime to avoid SSR issues
        const { registerUser } = await import('../../utils/authApi');
        
        // Call the API to register user with free trial plan
        // Using 'basic' as the plan value for the API since the backend only accepts basic, standard, premium
        const response = await registerUser({
          ...updatedFormData,
          plan: 'basic', // Map freeTrial to basic for backend compatibility
          isFreeTrialUser: true,
          questionsRemaining: 10,
          paymentMethod: 'paypal', // Set a default payment method to avoid validation issues
          cardNumber: '', // Ensure these are empty strings, not undefined
          cardExpiry: '',
          cardCvv: ''
        });
        
        if (response.success) {
          // Store free trial info in localStorage for frontend tracking
          localStorage.setItem('kidsask_free_trial', JSON.stringify({
            isFreeTrialUser: true,
            questionsRemaining: 10,
            startDate: new Date().toISOString()
          }));
          
          // Redirect to login page with success message
          router.push('/login?registered=true');
        } else {
          alert(`Registration failed: ${response.message}`);
        }
      } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'An error occurred during registration. Please try again.';
        
        // Extract the specific error message if available
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
          errorMessage = error.message;
        }
        
        alert(errorMessage);
      }
    } else {
      // Continue to payment details for paid plans
      setCurrentStep(RegistrationStep.PAYMENT_DETAILS);
    }
  };
  
  const handlePaymentSubmit = async (data: any) => {
    // Combine all data and submit to API
    const finalFormData = { ...formData, ...data };
    
    try {
      // Import the API utility at runtime to avoid SSR issues
      const { registerUser } = await import('../../utils/authApi');
      
      // Call the API to register user
      const response = await registerUser(finalFormData);
      
      if (response.success) {
        // Show success message and redirect to login page
        router.push('/login?registered=true');
      } else {
        alert(`Registration failed: ${response.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred during registration. Please try again.');
    }
  };
  
  const handleBack = () => {
    if (currentStep === RegistrationStep.PLAN_SELECTION) {
      setCurrentStep(RegistrationStep.PERSONAL_INFO);
    } else if (currentStep === RegistrationStep.PAYMENT_DETAILS) {
      setCurrentStep(RegistrationStep.PLAN_SELECTION);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white bg-opacity-95 rounded-xl shadow-xl w-full max-w-2xl">
          <div className="p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="text-3xl text-blue-500 mr-2">🚀</div>
              <h1 className="text-2xl font-bold text-blue-500">Create Your Account</h1>
            </div>
            
            <RegistrationSteps currentStep={currentStep} />
            
            <div className="mt-6">
              {currentStep === RegistrationStep.PERSONAL_INFO && (
                <PersonalInfoForm 
                  initialData={formData} 
                  onSubmit={handlePersonalInfoSubmit} 
                />
              )}
              
              {currentStep === RegistrationStep.PLAN_SELECTION && (
                <PlanSelection 
                  initialData={formData} 
                  onSubmit={handlePlanSubmit}
                  onBack={handleBack}
                />
              )}
              
              {currentStep === RegistrationStep.PAYMENT_DETAILS && (
                <PaymentDetails 
                  initialData={formData}
                  onSubmit={handlePaymentSubmit}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-100 py-4 text-center text-gray-600 mt-auto">
        <p className="mb-2">© 2025 KidsAsk.AI</p>
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
