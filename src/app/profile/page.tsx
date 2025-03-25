'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/user.service';

export default function Profile() {
  const router = useRouter();
  const { user, updateUserData } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
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
            phone: response.data.phone || ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      const response = await updateUserProfile({
        name: formData.name,
        phone: formData.phone
      });

      if (response.success) {
        setSuccess('Profile updated successfully');
        setIsEditMode(false);
        
        // อัปเดตข้อมูลผู้ใช้ใน context ถ้ามี updateUserData
        if (updateUserData) {
          updateUserData({
            name: formData.name
          });
        }
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-6 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditMode}
              className={`w-full p-3 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${!isEditMode ? 'opacity-75' : ''}`}
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={true} // อีเมลไม่สามารถแก้ไขได้
              className="w-full p-3 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-75"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block mb-1 text-gray-700 dark:text-gray-300">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditMode}
              className={`w-full p-3 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 ${!isEditMode ? 'opacity-75' : ''}`}
            />
          </div>

          {isEditMode && (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>

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