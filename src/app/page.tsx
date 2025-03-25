'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
          Welcome to DriveEasy
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your premium car rental booking platform. Book your rental car with ease.
        </p>
        <hr className="my-8 border-gray-200 dark:border-gray-700" />
        <p className="text-lg text-gray-700 dark:text-gray-400 mb-8">
          To get started, please register or login.
        </p>
        <div className="space-x-4">
          <Link
            href="/register"
            className="inline-block px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="inline-block px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
