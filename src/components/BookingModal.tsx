'use client';

import { useState } from 'react';
import { BookingFormData } from '@/types/booking';
import { Car } from '@/types/Car';
import { createBooking } from '@/services/booking.service';
import { useRouter } from 'next/navigation';

interface BookingModalProps {
  car: Car;
  onClose: () => void;
}

export default function BookingModal({ car, onClose }: BookingModalProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setIsSubmitting(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      setIsSubmitting(false);
      return;
    }

    if (end < start) {
      setError('End date cannot be before start date');
      setIsSubmitting(false);
      return;
    }

    try {
      const bookingData: BookingFormData = {
        start_date: startDate,
        end_date: endDate,
        carId: car._id
      };

      const response = await createBooking(car._id, bookingData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(response.error || 'Failed to create booking');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        {success ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900 dark:text-white">Booking Successful!</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your booking has been confirmed. Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Book {car.brand} {car.model}</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{car.brand} {car.model}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{car.type} • {car.year}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">฿{car.pricePerDay}/day</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Booking Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Duration: {calculateDays()} day(s)
                  </p>
                  {calculateDays() > 0 && (
                    <p className="text-gray-700 dark:text-gray-300 font-semibold">
                      Estimated Price: ฿{(calculateDays() * car.pricePerDay).toLocaleString()}
                      <span className="text-xs text-gray-500 block mt-1">
                        (Final price may vary based on promotions and other factors)
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !startDate || !endDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Book Now'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
