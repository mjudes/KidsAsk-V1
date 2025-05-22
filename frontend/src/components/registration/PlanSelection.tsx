'use client';

import { useState } from 'react';

interface PlanSelectionProps {
  initialData: {
    plan: string;
  };
  onSubmit: (data: any) => void;
  onBack: () => void;
}

interface PlanOption {
  id: string;
  name: string;
  price: string;
  billing: string;
  features: string[];
  recommended?: boolean;
}

export default function PlanSelection({ initialData, onSubmit, onBack }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState(initialData.plan);
  const [error, setError] = useState('');

  // Plan options
  const plans: PlanOption[] = [
    {
      id: 'freeTrial',
      name: 'Free Trial',
      price: '$0',
      billing: 'no payment required',
      features: [
        'Access to all educational topics',
        'Limited to 10 questions total',
        'Standard response time',
        'No credit card required'
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      price: '$4.99',
      billing: 'per month',
      features: [
        'Access to 5 educational topics',
        'Limited questions (50 per day)',
        'Standard response time'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: '$9.99',
      billing: 'per month',
      features: [
        'Access to all educational topics',
        'Unlimited questions',
        'Priority response time',
        'Ad-free experience'
      ],
      recommended: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$14.99',
      billing: 'per month',
      features: [
        'Everything in Standard plan',
        'Interactive quizzes and badges',
        'Parent dashboard with progress reports',
        'Content customization options',
        'Priority support'
      ]
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError('Please select a plan to continue');
      return;
    }
    
    onSubmit({ plan: selectedPlan });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Plan</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map(plan => (
            <div 
              key={plan.id}
              className={`border rounded-lg p-3 pt-4 cursor-pointer transition-all relative ${
                selectedPlan === plan.id 
                  ? 'border-blue-500 shadow-md bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => {
                setSelectedPlan(plan.id);
                setError('');
              }}
            >
              {plan.recommended && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-4 py-0.5 rounded-full">
                  Recommended
                </div>
              )}
              
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id={`plan-${plan.id}`}
                  name="plan"
                  value={plan.id}
                  checked={selectedPlan === plan.id}
                  onChange={() => setSelectedPlan(plan.id)}
                  className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`plan-${plan.id}`} className="ml-2 block">
                  <span className="text-base font-medium text-gray-900">{plan.name}</span>
                </label>
              </div>
              
              <div className="pl-0.5">
                <div className="mb-3">
                  <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-xs text-gray-500 ml-1 block">
                    {plan.id === 'freeTrial' ? 'no payment required' : 'per month'}
                  </span>
                </div>
                
                <ul className="space-y-1.5">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-4 w-4 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="text-red-500 text-center">{error}</div>
        )}
        
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
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition duration-200"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
