'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 pb-8">
      <div className="flex items-start justify-center pt-24">
        <div className="text-center p-6 max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Welcome to DriveEasy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Your premium car rental booking platform. Book your rental car with ease.
          </p>
          {user ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700 dark:text-gray-200">
                Welcome back, {user.name}! Ready to book your next car?
              </p>
              <div>
                <Link
                  href="/dashboard"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <Link
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
