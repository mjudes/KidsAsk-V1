'use client';

import { useAuth } from '../utils/AuthContext';
import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminProtectedProps {
  children: ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // If not loading and either not logged in or not an admin, redirect
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, isLoading, router]);
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show access denied if not an admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-500 font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have admin privileges.</p>
        </div>
      </div>
    );
  }
  
  // If user is admin, show the protected content
  return <>{children}</>;
}
