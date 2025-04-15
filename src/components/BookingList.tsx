'use client';

import { useState, useEffect } from 'react';
import { Booking } from '@/types/booking';
import { Car } from '@/types/Car';

interface Provider {
  _id: string;
  name: string;
  address: string;
  province?: string;
  district?: string;
}

interface BookingListProps {
  bookings: Booking[];
  providers: Provider[];
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
  showUser?: boolean;
}

export default function BookingList({
  bookings = [],
  providers = [],
  onEdit,
  onDelete,
  showUser = false
}: BookingListProps) {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <p className="text-gray-700 dark:text-gray-200 text-lg font-medium mt-3">No bookings found.</p>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Make a booking to get started.</p>
      </div>
    );
  }

  console.log('Providers in BookingList:', providers);
  console.log('Bookings in BookingList:', bookings);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking: Booking) => {
        console.log('Processing booking:', booking);

        // Get car information
        let carInfo: any = null;
        if (booking.car) {
          if (typeof booking.car === 'object') {
            carInfo = booking.car;
          }
        }

        return (
          <div
            key={booking._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
          >
            {showUser && booking.user && (
              <div className="mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Customer:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {typeof booking.user === 'string' ? booking.user :
                   (booking.user && typeof booking.user === 'object' ?
                     (booking.user as any).name || (booking.user as any).email || 'Unknown user' :
                     'Unknown user')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Start Date:</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.start_date)}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">End Date:</span>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(booking.end_date)}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Car:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {carInfo ? `${carInfo.brand} ${carInfo.model} (${carInfo.type})` : 'Car information not available'}
              </p>
              {carInfo && carInfo.provider && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Provider: {carInfo.provider.name}
                </p>
              )}
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Total Price:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(booking.totalprice)}
              </p>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => onEdit(booking)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-600 rounded hover:bg-blue-100 dark:text-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:hover:bg-blue-800/30"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    onDelete(booking._id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-600 rounded hover:bg-red-100 dark:text-red-300 dark:bg-red-900/20 dark:border-red-700 dark:hover:bg-red-800/30"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}