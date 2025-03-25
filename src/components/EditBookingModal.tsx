'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Booking } from '@/types/booking';
import { getAllRcps } from '@/services/rcp.service';

interface Provider {
  _id: string;
  name: string;
  address: string;
}

interface EditBookingModalProps {
  booking: Booking;
  onSubmit: (booking: Partial<Booking>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EditBookingModal({ booking, onSubmit, onCancel, isSubmitting = false }: EditBookingModalProps) {
  const [date, setDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  // เมื่อ component โหลดและมีการเปลี่ยนแปลง booking ข้อมูล
  useEffect(() => {
    const loadData = async () => {
      try {
        // โหลดข้อมูล providers
        const response = await getAllRcps();
        
        if (response.success) {
          setProviders(response.data);
        } else {
          setError('Failed to load providers');
        }
        
        // ตั้งค่า initial values
        if (booking) {
          console.log('Setting form with booking:', booking);
          setDate(booking.date || '');
          
          setProviderId(booking.providerId || (booking.rentalCarProvider && booking.rentalCarProvider._id) || '');
        }
      } catch (err) {
        console.error('Error initializing form:', err);
        setError('Failed to initialize form');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [booking]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!date || !providerId) {
      setError('Please select both date and provider');
      return;
    }

    try {
      await onSubmit({
        _id: booking._id,
        date,
        providerId
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <p className="text-center text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
          Edit Booking
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 p-3 rounded font-medium">
              {error}
            </div>
          )}
          
          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Rental Date</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Car Rental Provider</label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="">Select a provider</option>
              {providers.map((provider) => (
                <option key={provider._id} value={provider._id}>
                  {provider.name} - {provider.address}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}