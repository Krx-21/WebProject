'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!mounted) {
    return null; 
  }

  return (
    // ลบ min-h-screen ออกและปรับ padding
    <div className="flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16">
      <div className="flex items-start justify-center"> {/* ลบ flex-1 ออก */}
        <div className="text-center p-8 max-w-2xl">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
            Welcome to DriveEasy
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your premium car rental booking platform. Book your rental car with ease.
          </p>
          {user ? (
            <div className="space-y-6">
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
            <div className="space-y-6">
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
