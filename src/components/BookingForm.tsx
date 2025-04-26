'use client';

import { useState, useEffect } from 'react';
import { getAllRcps } from '@/services/rcp.service';
import { getCarsByProvider } from '@/services/car.service';
import { Promotion, PriceCalculationResult, calculatePrice, getPromotionsByProvider } from '@/services/promotion.service';
import { Booking } from '@/types/booking';
import { Car } from '@/types/Car';
import { FormEvent } from 'react';
import { differenceInDays } from 'date-fns';

interface Provider {
  _id: string;
  name: string;
  address: string;
}

interface NewBooking {
  providerId: string;
  start_date: string;
  end_date: string;
  carId?: string;
  promoId?: string;
}

interface BookingFormProps {
  onSubmit: (booking: NewBooking, priceDetails?: PriceCalculationResult) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  booking: Booking | null;
  preSelectedProviderId?: string;
  preSelectedCarId?: string;
}

export default function BookingForm({ onSubmit, onCancel, isSubmitting = false, booking, preSelectedProviderId, preSelectedCarId }: BookingFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [carId, setCarId] = useState('');
  const [promoId, setPromoId] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [priceDetails, setPriceDetails] = useState<PriceCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await getAllRcps();

        if (response.success) {
          const providersData = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];

          setProviders(providersData);
        } else {
          setError('Failed to load providers');
        }
      } catch (err) {
        setError('Error loading providers');
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  useEffect(() => {
    if (booking) {
      setStartDate(booking.start_date || '');
      setEndDate(booking.end_date || '');
      setProviderId(booking.providerId || booking.rentalCarProvider?._id || '');
      setCarId(booking.carId || '');
      setPromoId(booking.promoId || '');
    }
  }, [booking]);

  useEffect(() => {
    if (preSelectedProviderId) {
      setProviderId(preSelectedProviderId);
    }
  }, [preSelectedProviderId]);

  useEffect(() => {
    if (preSelectedCarId && providerId) {
      setCarId(preSelectedCarId);
    }
  }, [preSelectedCarId, providerId, cars]);

  useEffect(() => {
    const loadCars = async () => {
      if (!providerId) {
        setCars([]);
        return;
      }

      setLoadingCars(true);
      try {
        const response = await getCarsByProvider(providerId);
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

    const loadPromotions = async () => {
      if (!providerId) {
        setPromotions([]);
        return;
      }

      setLoadingPromotions(true);
      try {
        const response = await getPromotionsByProvider(providerId);
        if (response.success && response.data) {
          setPromotions(response.data);
        } else {
          console.warn('Failed to load promotions:', response.error);
          setPromotions([]);
        }
      } catch (err) {
        console.warn('Error loading promotions:', err);
        setPromotions([]);
      } finally {
        setLoadingPromotions(false);
      }
    };

    loadCars();
    loadPromotions();

    setPriceDetails(null);
    setPromoId('');
  }, [providerId]);

  useEffect(() => {
    const calculateTotalPrice = async () => {
      if (!carId || !startDate || !endDate) {
        setPriceDetails(null);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setPriceDetails(null);
        return;
      }

      const days = differenceInDays(end, start) || 1; 

      setCalculatingPrice(true);
      try {
        const response = await calculatePrice(carId, days, promoId || undefined);
        if (response.success && response.data) {
          setPriceDetails(response.data);
        } else {
          console.warn('Failed to calculate price:', response.error);
          setPriceDetails(null);
        }
      } catch (err) {
        console.warn('Error calculating price:', err);
        setPriceDetails(null);
      } finally {
        setCalculatingPrice(false);
      }
    };

    calculateTotalPrice();
  }, [carId, startDate, endDate, promoId]);

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
        start_date: startDate,
        end_date: endDate,
        providerId,
        carId,
        promoId: promoId || undefined
      }, priceDetails || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      <span className="ml-3 text-slate-600 dark:text-slate-300">Loading providers...</span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300 p-3 rounded-md shadow-sm">
          {error}
        </div>
      )}

      <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">Book Your Car</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || new Date().toISOString().split('T')[0]}
            className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none transition-all duration-200"
            required
          />
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/10 p-4 rounded-md border border-slate-200 dark:border-slate-700">
        <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Car Rental Provider</label>
        <select
          value={providerId}
          onChange={(e) => {
            setProviderId(e.target.value);
            setCarId(''); 
          }}
          className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none transition-all duration-200"
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
        <div className="bg-slate-50 dark:bg-slate-900/10 p-4 rounded-md border border-slate-200 dark:border-slate-700">
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
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none transition-all duration-200"
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

      {/* Price Details */}
      {carId && startDate && endDate && (
        <div className="bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900/10 dark:to-indigo-900/20 p-4 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Price Details</h4>

          {calculatingPrice ? (
            <div className="flex items-center space-x-2 py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
              <span className="text-slate-600 dark:text-slate-300">Calculating price...</span>
            </div>
          ) : priceDetails ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Price per day:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">฿{priceDetails.pricePerDay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Number of days:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{priceDetails.numberOfDays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Base price:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">฿{priceDetails.basePrice.toLocaleString()}</span>
              </div>

              {priceDetails.discount && priceDetails.promoId && (
                <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-md border border-teal-100 dark:border-teal-800/30 my-3">
                  <div className="flex justify-between items-center text-teal-700 dark:text-teal-300 font-medium mb-2">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
                      </svg>
                      <span>Promotion Applied</span>
                    </span>
                    <span className="bg-teal-100 dark:bg-teal-800/40 px-2 py-1 rounded text-sm">
                      {priceDetails.promoName || promotions.find(p => p._id === priceDetails.promoId)?.title || 'Promotion'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-teal-600 dark:text-teal-400">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-teal-100 dark:border-teal-800/30">
                      <div className="text-xs text-teal-500 dark:text-teal-500 mb-1">Discount Amount</div>
                      <div className="font-bold text-lg text-teal-600 dark:text-teal-400">-฿{priceDetails.discount.toLocaleString()}</div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-2 rounded border border-teal-100 dark:border-teal-800/30">
                      <div className="text-xs text-teal-500 dark:text-teal-500 mb-1">Discount Rate</div>
                      <div className="font-bold text-lg text-teal-600 dark:text-teal-400">
                        {priceDetails.promoDiscountPercentage || promotions.find(p => p._id === priceDetails.promoId)?.discountPercentage || 0}%
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-teal-600/80 dark:text-teal-400/80 mt-2 text-center italic">
                    Promotion discount has been applied to your booking
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">Total price:</span>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">฿{priceDetails.finalPrice.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-600 dark:text-slate-400 py-2 italic">
              Unable to calculate price. Please check your selection.
            </div>
          )}
        </div>
      )}

      {/* Promotions */}
      {providerId && carId && startDate && endDate && (
        <div className="bg-slate-50 dark:bg-slate-900/10 p-4 rounded-md border border-slate-200 dark:border-slate-700">
          <label className="block mb-1 text-indigo-600 dark:text-indigo-400 font-medium">Apply Promotion (Optional)</label>
          {loadingPromotions ? (
            <div className="flex items-center space-x-2 py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
              <span className="text-slate-600 dark:text-slate-300">Loading promotions...</span>
            </div>
          ) : promotions.length > 0 ? (
            <select
              value={promoId}
              onChange={(e) => setPromoId(e.target.value)}
              className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-800 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none transition-all duration-200"
              disabled={isSubmitting}
            >
              <option value="">No promotion (regular price)</option>
              {promotions.map((promo) => {
                let providerName = 'Unknown Provider';
                if (promo.provider) {
                  if (typeof promo.provider === 'object' && promo.provider.name) {
                    providerName = promo.provider.name;
                  }
                }

                return (
                  <option key={promo._id} value={promo._id}>
                    {promo.title} - {promo.discountPercentage}% off (up to ฿{promo.maxDiscountAmount}) | {providerName}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="text-slate-600 dark:text-slate-400 py-2 italic">
              No promotions available for this provider
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 shadow-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || calculatingPrice}
          className="px-5 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors duration-200 shadow-sm font-medium flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            'Complete Booking'
          )}
        </button>
      </div>
    </form>
  );
}