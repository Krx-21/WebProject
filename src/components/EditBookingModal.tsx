'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Booking, BookingFormData } from '@/types/booking';
import { getAllRcps } from '@/services/rcp.service';
import { getCarsForProvider } from '@/services/car.service';
import { Car } from '@/types/Car';

interface Provider {
  _id: string;
  name: string;
  address: string;
}

interface EditBookingModalProps {
  booking: Booking;
  onSubmit: (booking: BookingFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EditBookingModal({ booking, onSubmit, onCancel, isSubmitting = false }: EditBookingModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [carId, setCarId] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCars, setLoadingCars] = useState(false);

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
          setStartDate(booking.start_date || '');
          setEndDate(booking.end_date || '');

          // Handle car ID
          if (typeof booking.car === 'string') {
            setCarId(booking.car);
          } else if (booking.car && typeof booking.car === 'object') {
            setCarId(booking.car._id);
            // If we have the car's provider, set it
            if (booking.car.provider && typeof booking.car.provider === 'object') {
              setProviderId(booking.car.provider._id);
            }
          }
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

  useEffect(() => {
    const loadCars = async () => {
      if (!providerId) {
        setCars([]);
        return;
      }

      setLoadingCars(true);
      try {
        const response = await getCarsForProvider(providerId);
        if (response.success) {
          setCars(response.data);
        } else {
          setError('Failed to load cars for this provider');
        }
      } catch (err) {
        console.error('Error loading cars:', err);
        setError('Error loading cars');
      } finally {
        setLoadingCars(false);
      }
    };

    loadCars();
  }, [providerId]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate || !carId) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }

    if (end < start) {
      setError('End date cannot be before start date');
      return;
    }

    try {
      await onSubmit({
        start_date: startDate,
        end_date: endDate,
        carId: carId
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Car Rental Provider</label>
            <select
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value);
                setCarId('');
              }}
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

          {providerId && (
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Select Car</label>
              {loadingCars ? (
                <div className="p-2 text-gray-500">Loading cars...</div>
              ) : cars.length > 0 ? (
                <select
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select a car</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>
                      {car.brand} {car.model} - {car.type} (฿{car.pricePerDay}/day)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded">
                  No cars available for this provider
                </div>
              )}
            </div>
          )}

          {carId && startDate && endDate && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Booking Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Duration: {calculateDays()} day(s)
              </p>
              {calculateDays() > 0 && (
                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                  Estimated Price: ฿{(calculateDays() * (cars.find(car => car._id === carId)?.pricePerDay || 0)).toLocaleString()}
                  <span className="text-xs text-gray-500 block mt-1">
                    (Final price may vary based on promotions and other factors)
                  </span>
                </p>
              )}
            </div>
          )}

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
              disabled={isSubmitting || !carId || !startDate || !endDate}
            >
              {isSubmitting ? 'Updating...' : 'Update Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}