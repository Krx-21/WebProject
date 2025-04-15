'use client';

import { useState, useEffect } from 'react';
import { getAllRcps } from '@/services/rcp.service';
import { getCarsForProvider } from '@/services/car.service';
import { Booking, BookingFormData } from '@/types/booking';
import { Car } from '@/types/Car';
import { FormEvent } from 'react';

interface Provider {
  _id: string;
  name: string;
  address: string;
}

interface BookingFormProps {
  onSubmit: (booking: BookingFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  booking: Booking | null;
}

export default function BookingForm({ onSubmit, onCancel, isSubmitting = false, booking }: BookingFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [carId, setCarId] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCars, setLoadingCars] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await getAllRcps();
        console.log('Providers response:', response); // Debug log

        if (response.success) {
          const providersData = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];

          setProviders(providersData);
        } else {
          setError('Failed to load providers');
          console.error('Failed to load providers:', response.error);
        }
      } catch (err) {
        console.error('Error loading providers:', err);
        setError('Error loading providers');
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

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

  useEffect(() => {
    if (booking) {
      console.log('Setting form with booking:', booking);
      setStartDate(booking.start_date);
      setEndDate(booking.end_date);

      if (typeof booking.car === 'string') {
        setCarId(booking.car);
      } else if (booking.car && typeof booking.car === 'object') {
        setCarId(booking.car._id);
        if (booking.car.provider && typeof booking.car.provider === 'object') {
          setProviderId(booking.car.provider._id);
        }
      }
    }
  }, [booking]);

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
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  if (loading) return <div className="p-4 text-center">Loading providers...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
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
            className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
            className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
          className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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
              className="w-full p-2 border rounded text-gray-800 dark:text-gray-300 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
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

      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !carId || !startDate || !endDate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}