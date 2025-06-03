'use client';

import { useRouter } from 'next/navigation';
import { checkSubscriptionStatus } from '../utils/userApi';

interface SubscriptionAlertProps {
  user: any;
  className?: string;
}

export default function SubscriptionAlert({ user, className = '' }: SubscriptionAlertProps) {
  const router = useRouter();
  const status = checkSubscriptionStatus(user);
  
  if (!status.isExpired && !status.isLow) {
    return null;
  }
  
  return (
    <div className={`rounded-lg p-4 mb-4 ${status.isExpired ? 'bg-red-50 border border-red-300' : 'bg-yellow-50 border border-yellow-300'} ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${status.isExpired ? 'text-red-500' : 'text-yellow-500'}`}>
          {status.isExpired ? (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className={`text-sm ${status.isExpired ? 'text-red-800' : 'text-yellow-800'}`}>
            {status.message}
          </p>
          <p className="mt-3 text-sm md:mt-0 md:ml-6">
            <button
              onClick={() => router.push('/upgrade')}
              className={`font-medium ${status.isExpired ? 'text-red-700 hover:text-red-600' : 'text-yellow-700 hover:text-yellow-600'} whitespace-nowrap`}
            >
              Upgrade Now <span aria-hidden="true">&rarr;</span>
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
