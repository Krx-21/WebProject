import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.ico"
                alt="Rent a Ride Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Rent a Ride</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Premium car rental services for all your needs. Experience luxury, convenience, and reliability.
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <h3 className="text-base font-medium text-blue-800 dark:text-blue-300 mb-2">Educational Purpose Disclaimer</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              This website is a sample project created for educational purposes only. It is not a real car rental service and does not process actual bookings or payments. All content, data, and functionality are simulated for demonstration and learning.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Rent a Ride. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}