'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/services/user.service';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = () => {
      if (!user) {
        router.push('/login');
        return;
      }
    };

    checkAuth();
  }, [mounted, user, router]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await getUserProfile();

        if (response.success) {
          console.log('Profile data received:', response.data);
          setUserProfile(response.data);

          setFormData({
            name: response.data.name || user.name || '',
            email: response.data.email || user.email || '',
            phone: response.data.telephoneNumber || ''
          });
        } else {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: ''
          });
          setError('Could not load full profile data. Basic information is displayed.');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted && user) {
      loadUserProfile();
    }
  }, [user, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-center">
          <svg className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-slate-700 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 pt-8 pb-12 px-4">
      <div className="max-w-4xl mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="mb-8 flex items-center">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-indigo-700 bg-clip-text text-transparent dark:from-slate-300 dark:via-slate-200 dark:to-indigo-300">
            My Profile
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 p-4 rounded-md shadow-sm mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6 bg-slate-50 dark:bg-slate-900/20 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div>
            <label className="flex items-center mb-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Name
            </label>
            <div className="w-full p-3 border rounded-md text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm">
              {formData.name}
            </div>
          </div>

          <div>
            <label className="flex items-center mb-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Email
            </label>
            <div className="w-full p-3 border rounded-md text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm">
              {formData.email}
            </div>
          </div>

          <div>
            <label className="flex items-center mb-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Phone
            </label>
            <div className="w-full p-3 border rounded-md text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 shadow-sm">
              {formData.phone || 'Not provided'}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 dark:border-slate-700 pt-8">
          <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Account Type</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white text-lg pl-10">
                {user?.role === 'admin' ? 'Administrator' : user?.role === 'provider' ? 'Provider' : 'User'}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Account Created</span>
              </div>
              <p className="font-medium text-slate-900 dark:text-white text-lg pl-10">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}