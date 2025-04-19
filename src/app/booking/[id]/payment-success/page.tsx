'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyPayment } from '@/services/payment.service';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PaymentSuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        setLoading(true);

        const response = await verifyPayment(params.id);

        if (!response.success) {
          throw new Error(response.error || 'Failed to update booking status');
        }

        setLoading(false);

        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              router.push('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err) {
        console.error('Error updating booking status:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setLoading(false);
      }
    };

    updateStatus();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600 dark:text-slate-300">Processing payment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg max-w-2xl mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
        <Link href="/dashboard" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
            <svg className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your booking has been confirmed and is now complete.
          </p>

          <div className="mb-6 flex justify-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full">
              <span className="text-blue-700 dark:text-blue-300">
                Redirecting to dashboard in {countdown} seconds...
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
