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
          // ถ้าไม่สามารถดึงข้อมูลจาก API ได้ ให้ใช้ข้อมูลจาก Auth Context แทน
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
          <svg className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-12">
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-800">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <div className="w-full p-3 border rounded text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              {formData.name}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <div className="w-full p-3 border rounded text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              {formData.email}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Phone</label>
            <div className="w-full p-3 border rounded text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              {formData.phone || 'Not provided'}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Account Type</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Account Created</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}