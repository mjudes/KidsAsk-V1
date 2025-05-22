'use client';

import React from 'react';

interface RegistrationStepsProps {
  currentStep: number;
}

export default function RegistrationSteps({ currentStep }: RegistrationStepsProps) {
  const steps = [
    { id: 1, name: 'Personal Information' },
    { id: 2, name: 'Plan Selection' },
    { id: 3, name: 'Payment Details' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step circle */}
            <div className="relative flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'bg-white text-gray-400 border-gray-300'
                }`}
              >
                {currentStep > step.id ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span 
                className={`mt-2 text-sm ${
                  currentStep >= step.id ? 'text-blue-500 font-medium' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div 
                className={`flex-grow h-0.5 mx-2 ${
                  currentStep > index + 1 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
