'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/AuthContext';
import { getAdminUsers, getRecentUsers, getAdminStats, updateUserStatus } from '../../utils/userApi';
import AdminProtected from '../../components/AdminProtected';
import DashboardHeader from '../../components/DashboardHeader';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [users, setUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Extra protection - redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      console.log('Redirecting from admin page - user is not an admin');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isAdmin, router]);
  
  // Fetch data when the component mounts and admin user is available
  useEffect(() => {
    if (user) {
      fetchStats();
      fetchRecentUsers();
      fetchUsers(timeframe);
    }
  }, [user, timeframe]);

  // Fetch users for selected timeframe
  const fetchUsers = async (selectedTimeframe: 'day' | 'week' | 'month') => {
    setIsProcessing(true);
    try {
      const response = await getAdminUsers(selectedTimeframe);
      if (response.success) {
        setUsers(response.data.users);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch recent users (last 24 hours)
  const fetchRecentUsers = async () => {
    try {
      const response = await getRecentUsers();
      if (response.success) {
        setRecentUsers(response.data.users);
      } else {
        console.error('Failed to fetch recent users:', response.message);
      }
    } catch (err) {
      console.error('Error fetching recent users:', err);
    }
  };

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      const response = await getAdminStats();
      if (response.success) {
        setStats(response.data);
      } else {
        console.error('Failed to fetch statistics:', response.message);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe);
    fetchUsers(newTimeframe);
  };

  // Handle user suspension/activation
  const handleUserStatusChange = async (userId: string, suspend: boolean) => {
    try {
      setIsProcessing(true);
      const response = await updateUserStatus(userId, suspend);
      
      if (response.success) {
        setSuccess(`User ${suspend ? 'suspended' : 'activated'} successfully`);
        
        // Refresh data
        fetchUsers(timeframe);
        fetchRecentUsers();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || `Failed to ${suspend ? 'suspend' : 'activate'} user`);
      }
    } catch (err) {
      setError(`An error occurred while ${suspend ? 'suspending' : 'activating'} user`);
      console.error('Error updating user status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Render the admin dashboard content
  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="bg-white shadow mt-6">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">KidsAsk.ai Admin Dashboard</h1>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            {error}
            <button 
              className="absolute top-0 right-0 mt-2 mr-2" 
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            {success}
            <button 
              className="absolute top-0 right-0 mt-2 mr-2" 
              onClick={() => setSuccess('')}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Registrations Today
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats?.registrations?.daily || 0}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Registrations This Week
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats?.registrations?.weekly || 0}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Registrations This Month
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats?.registrations?.monthly || 0}
              </dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Users
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats?.registrations?.total || 0}
              </dd>
            </div>
          </div>
        </div>
        
        {/* Recent Users (Last 24 Hours) */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Registrations (Last 24 Hours)
            </h3>
          </div>
          <div className="p-6">
            {recentUsers.length === 0 ? (
              <p className="text-gray-500">No users registered in the last 24 hours.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentUsers.map((user: any) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.subscription?.isFreeTrialUser ? 'Free Plan' : user.subscription?.plan || 'None'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUserStatusChange(user._id, !user.accountLocked)}
                            className={`px-3 py-1 rounded ${
                              user.accountLocked 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            disabled={isProcessing}
                          >
                            {user.accountLocked ? 'Activate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* User Report */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Report
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => handleTimeframeChange('day')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === 'day'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => handleTimeframeChange('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => handleTimeframeChange('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  timeframe === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="p-6">
            {isProcessing ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No users found for the selected timeframe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions Remaining
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user: any) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.fullName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.subscription?.isFreeTrialUser ? 'Free Plan' : user.subscription?.plan || 'None'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.subscription?.questionsRemaining || 'Unlimited'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.accountLocked 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.accountLocked ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleUserStatusChange(user._id, !user.accountLocked)}
                            className={`px-3 py-1 rounded ${
                              user.accountLocked 
                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            disabled={isProcessing}
                          >
                            {user.accountLocked ? 'Activate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Processing...</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AdminProtected>
      {renderDashboard()}
    </AdminProtected>
  );
}
