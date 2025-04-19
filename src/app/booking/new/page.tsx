'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { createBooking } from '@/services/booking.service';
import { PriceCalculationResult } from '@/services/promotion.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface BookingData {
  start_date: string;
  end_date: string;
  providerId: string;
  carId?: string;
  promoId?: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<PriceCalculationResult | null>(null);

  const carId = searchParams.get('carId');
  const providerId = searchParams.get('providerId');

  const handleSubmit = async (bookingData: BookingData, priceDetails?: PriceCalculationResult) => {
    setIsSubmitting(true);
    setError(null);

    if (priceDetails) {
      setBookingDetails(priceDetails);
    }

    try {
      const response = await createBooking(bookingData.providerId, bookingData);

      if (response.success) {
        router.push(`/booking/${response.data._id}/payment`);
      } else {
        setError(response.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-teal-900/10 dark:to-indigo-900/10 border border-teal-100 dark:border-teal-800/30 p-6 rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <svg className="w-16 h-16 text-teal-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Booking Successful!</h2>
            <p className="text-slate-600 dark:text-slate-400">Your booking has been created successfully.</p>
          </div>

          {bookingDetails && (
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                Booking Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Base Price:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">฿{bookingDetails.basePrice.toLocaleString()}</span>
                </div>

                {bookingDetails.discount && bookingDetails.discount > 0 && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/20 p-3 rounded-md border border-teal-100 dark:border-teal-800/30">
                    <div className="flex justify-between items-center text-teal-700 dark:text-teal-300">
                      <span className="font-medium">Promotion Discount:</span>
                      <span className="font-bold">-฿{bookingDetails.discount.toLocaleString()}</span>
                    </div>
                    {bookingDetails.promoDiscountPercentage && (
                      <div className="text-sm text-teal-600 dark:text-teal-400 mt-1 text-right">
                        ({bookingDetails.promoDiscountPercentage}% off)
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Final Price:</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">฿{bookingDetails.finalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <Link href="/dashboard" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm">
              View My Bookings
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors duration-200 shadow-sm dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              Make Another Booking
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">New Booking</h1>
          <Link
            href="/dashboard"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 p-4 rounded-md shadow-sm mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">Error</p>
            </div>
            <p className="mt-1 ml-7">{error}</p>
          </div>
        )}

        {isSubmitting && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
              <LoadingSpinner size="lg" />
              <p className="text-center mt-4 text-slate-700 dark:text-slate-300">Creating your booking...</p>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <BookingForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              booking={null}
              preSelectedCarId={carId || undefined}
              preSelectedProviderId={providerId || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
