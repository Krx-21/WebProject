'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Booking } from '@/types/booking';
import { Car } from '@/types/Car';
import { getAllRcps } from '@/services/rcp.service';
import { getCarsByProvider } from '@/services/car.service';
import { Promotion, PriceCalculationResult, calculatePrice, getPromotionsByProvider } from '@/services/promotion.service';
import { differenceInDays } from 'date-fns';

interface Provider {
  _id: string;
  name: string;
  address: string;
}

interface EditBookingModalProps {
  booking: Booking;
  onSubmit: (booking: Partial<Booking>, priceDetails?: PriceCalculationResult) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function EditBookingModal({ booking, onSubmit, onCancel, isSubmitting = false }: EditBookingModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [carId, setCarId] = useState('');
  const [promoId, setPromoId] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [priceDetails, setPriceDetails] = useState<PriceCalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getAllRcps();

        if (response.success) {
          setProviders(response.data);
        } else {
          setError('Failed to load providers');
        }

        if (booking) {
          const formatDateForInput = (dateString: string) => {
            if (!dateString) return '';
            try {
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            } catch (error) {
              console.error('Error formatting date:', error);
              return '';
            }
          };

          setStartDate(formatDateForInput(booking.start_date));
          setEndDate(formatDateForInput(booking.end_date));

          let determinedProviderId = '';
          if (booking.providerId) {
            determinedProviderId = booking.providerId;
          } else if (booking.rentalCarProvider?._id) {
            determinedProviderId = booking.rentalCarProvider._id;
          } else if (booking.car?.provider) {
            if (typeof booking.car.provider === 'object' && booking.car.provider._id) {
              determinedProviderId = booking.car.provider._id;
            } else if (typeof booking.car.provider === 'string') {
              determinedProviderId = booking.car.provider;
            }
          }

          setProviderId(determinedProviderId);
          setCarId(booking.carId || (booking.car && booking.car._id) || '');
          setPromoId(booking.promoId || '');

          if (determinedProviderId) {
            loadCars(determinedProviderId);
            loadPromotions(determinedProviderId);
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

  const loadCars = async (provId = providerId) => {
    if (!provId) {
      setCars([]);
      return;
    }

    setLoadingCars(true);
    try {
      const response = await getCarsByProvider(provId);
      if (response.success && response.data) {
        setCars(response.data);
      } else {
        setError(response.error || 'Failed to load cars');
      }
    } catch (err) {
      setError('Error loading cars');
    } finally {
      setLoadingCars(false);
    }
  };

  const loadPromotions = async (provId = providerId) => {
    if (!provId) {
      setPromotions([]);
      return;
    }

    setLoadingPromotions(true);
    try {
      const response = await getPromotionsByProvider(provId);
      if (response.success && response.data) {
        setPromotions(response.data);
      } else {
        console.error('Failed to load promotions:', response.error);
      }
    } catch (err) {
      console.error('Error loading promotions:', err);
    } finally {
      setLoadingPromotions(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      loadCars();
      loadPromotions();
    }
  }, [providerId]);

  useEffect(() => {
    const calculateBookingPrice = async () => {
      if (!startDate || !endDate || !carId) {
        setPriceDetails(null);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return;
      }

      const selectedCar = cars.find(car => car._id === carId);
      if (!selectedCar) {
        return;
      }

      const days = differenceInDays(end, start) || 1;

      setCalculating(true);
      try {
        const response = await calculatePrice(carId, days, promoId || undefined);

        if (response.success) {
          setPriceDetails(response.data ?? null);
        } else {
          console.error('Failed to calculate price:', response.error);
          setPriceDetails(null);
        }
      } catch (err) {
        console.error('Error calculating price:', err);
      } finally {
        setCalculating(false);
      }
    };

    calculateBookingPrice();
  }, [startDate, endDate, carId, promoId, cars]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate || !providerId) {
      setError('Please select start date, end date, and provider');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }

    if (cars.length > 0 && !carId) {
      setError('Please select a car');
      return;
    }

    try {
      await onSubmit({
        _id: booking._id,
        start_date: startDate,
        end_date: endDate,
        providerId,
        carId,
        promoId: promoId || undefined
      }, priceDetails || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-slate-200 dark:border-slate-700">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
          <p className="text-center text-slate-700 dark:text-slate-300 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-700 pb-2">
          Edit Booking
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 p-3 rounded-md shadow-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent dark:bg-slate-700 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent dark:bg-slate-700 dark:text-white outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Car Rental Provider</label>
            <select
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value);
                setCarId('');
              }}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent dark:bg-slate-700 dark:text-white outline-none transition-all duration-200"
              required
              disabled={isSubmitting}
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
            <div className="mt-4">
              <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Select Car</label>
              {loadingCars ? (
                <div className="flex items-center space-x-2 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                  <span className="text-slate-600 dark:text-slate-300">Loading cars...</span>
                </div>
              ) : cars.length > 0 ? (
                <select
                  value={carId}
                  onChange={(e) => setCarId(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent dark:bg-slate-700 dark:text-white outline-none transition-all duration-200"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a car</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>
                      {car.brand} {car.model} - {car.type} (฿{car.pricePerDay}/day)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-slate-600 dark:text-slate-400 py-2 italic">
                  No cars available from this provider
                </div>
              )}
            </div>
          )}

          {/* Promotions Section */}
          {providerId && carId && (
            <div className="mt-4">
              <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Select Promotion</label>
              {loadingPromotions ? (
                <div className="flex items-center space-x-2 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                  <span className="text-slate-600 dark:text-slate-300">Loading promotions...</span>
                </div>
              ) : promotions.length > 0 ? (
                <select
                  value={promoId}
                  onChange={(e) => setPromoId(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent dark:bg-slate-700 dark:text-white outline-none transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <option value="">No promotion (regular price)</option>
                  {promotions.map((promo) => (
                    <option key={promo._id} value={promo._id}>
                      {promo.title} - {promo.discountPercentage}% off (max ฿{promo.maxDiscountAmount})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-slate-600 dark:text-slate-400 py-2 italic">
                  No promotions available from this provider
                </div>
              )}
            </div>
          )}

          {/* Price Calculation Section */}
          {carId && startDate && endDate && (
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
              <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">Price Details</h3>

              {calculating ? (
                <div className="flex items-center space-x-2 py-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                  <span className="text-slate-600 dark:text-slate-300">Calculating price...</span>
                </div>
              ) : priceDetails ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Base Price:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">฿{priceDetails.basePrice.toLocaleString()}</span>
                  </div>

                  {priceDetails.discount && priceDetails.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount:</span>
                      <span>-฿{priceDetails.discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between pt-2 border-t border-indigo-200 dark:border-indigo-800/30">
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">Total Price:</span>
                    <span className="font-semibold text-indigo-700 dark:text-indigo-300">฿{priceDetails.finalPrice.toLocaleString()}</span>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {priceDetails.numberOfDays} days × ฿{priceDetails.pricePerDay.toLocaleString()}/day
                    {priceDetails.promoName && (
                      <span className="ml-1 text-green-600 dark:text-green-400">
                        (Promo: {priceDetails.promoName})
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-slate-600 dark:text-slate-400 py-1">
                  Select dates and car to see price details
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 shadow-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200 shadow-sm"
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