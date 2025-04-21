'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBooking, updateBookingStatus } from '@/services/booking.service';
import { Booking } from '@/types/booking';
import QRCode from '@/components/QRCode';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate, formatCurrency } from '@/utils/formatters';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BookingPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);

  const paymentVerificationUrl = `${window.location.origin}/api/verify-payment?id=${params.id}`;

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const response = await getBooking(params.id);

        if (response.success) {
          setBooking(response.data);

          if (response.data.status) {
            setPaymentStatus(response.data.status as any);
          }
        } else {
          setError(response.error || 'Failed to fetch booking details');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();

    const interval = setInterval(async () => {
      try {
        const response = await getBooking(params.id);
        if (response.success && response.data.status) {
          setPaymentStatus(response.data.status as any);

          if (response.data.status === 'completed') {
            clearInterval(interval);
            setTimeout(() => {
              router.push('/dashboard');
            }, 5000);
          }
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
      }
    }, 5000);

    setStatusCheckInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.id, router]);

  const handleCompletePayment = async () => {
    try {
      setPaymentStatus('processing');

      const response = await updateBookingStatus(params.id, 'completed');

      if (response.success) {
        setPaymentStatus('completed');

        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setPaymentStatus('failed');
        setError(response.error || 'Failed to complete payment');
      }
    } catch (err) {
      console.error('Error completing payment:', err);
      setPaymentStatus('failed');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600 dark:text-slate-300">Loading payment details...</span>
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

  if (!booking) {
    return (
      <div className="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg max-w-2xl mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Booking not found</p>
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
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Payment Status Banner */}
          {paymentStatus === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your booking is pending payment. Please scan the QR code to complete your payment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Processing your payment. Please wait...
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Payment completed successfully! You will be redirected to the dashboard shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Payment failed. Please try again or contact support.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Summary</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Review your booking details and complete payment
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Booking Details</h2>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 block">Booking ID</span>
                      <span className="text-slate-900 dark:text-white font-medium">{booking._id}</span>
                    </div>

                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 block">Rental Period</span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {booking.start_date && booking.end_date ? (
                          <>
                            {formatDate(new Date(booking.start_date))} - {formatDate(new Date(booking.end_date))}
                          </>
                        ) : 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 block">Provider</span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {booking.rentalCarProvider?.name || 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 block">Car</span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {booking.car ? `${booking.car.brand} ${booking.car.model} (${booking.car.type})` : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Details</h2>

                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 block">Total Amount</span>
                      <span className="text-2xl text-slate-900 dark:text-white font-bold">
                        {booking.totalprice ? formatCurrency(booking.totalprice) : 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 block">Payment Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        paymentStatus === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        paymentStatus === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        paymentStatus === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* QR Code for Payment */}
                  {paymentStatus === 'pending' && (
                    <div className="mt-6 flex flex-col items-center">
                      <div className="relative">
                        <div className="bg-white p-4 rounded-lg shadow-md border-2 border-blue-500">
                          <QRCode
                            value={paymentVerificationUrl}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                          Payment QR
                        </div>
                      </div>
                      <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 max-w-xs">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center font-medium">
                          Scan this QR code to complete your payment and confirm your booking
                        </p>
                      </div>

                      {/* Demo button - Remove in production */}
                      <button
                        onClick={handleCompletePayment}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors shadow-md"
                      >
                        Simulate Payment (Demo)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Back to Dashboard
              </Link>

              {paymentStatus === 'completed' && (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View My Bookings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
