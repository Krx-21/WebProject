'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBooking, updateBooking } from '@/services/booking.service';
import { getAllRcps } from '@/services/rcp.service';
import { getCarsByProvider } from '@/services/car.service';
import { Promotion, PriceCalculationResult, calculatePrice, getPromotionsByProvider } from '@/services/promotion.service';
import { differenceInDays } from 'date-fns';
import { Booking } from '@/types/booking';
import { Car } from '@/types/Car';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Provider {
  _id: string;
  name: string;
  address: string;
  province?: string;
  district?: string;
}

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [providerId, setProviderId] = useState('');
  const [carId, setCarId] = useState('');
  const [promoId, setPromoId] = useState('');

  const [providers, setProviders] = useState<Provider[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  const [priceDetails, setPriceDetails] = useState<PriceCalculationResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true);

        let bookingData;

        try {
          const bookingResponse = await getBooking(bookingId);
          if (!bookingResponse.success) {
            throw new Error(bookingResponse.error || 'Failed to load booking');
          }

          bookingData = bookingResponse.data;
          setBooking(bookingData);
        } catch (fetchError) {
          console.error('Error fetching booking:', fetchError);
          throw new Error('Failed to load booking. Please try again or return to dashboard.');
        }

        if (!bookingData) {
          throw new Error('Failed to load booking data');
        }

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

        setStartDate(formatDateForInput(bookingData.start_date));
        setEndDate(formatDateForInput(bookingData.end_date));

        const bookingProviderId = bookingData.providerId ||
          (bookingData.rentalCarProvider && bookingData.rentalCarProvider._id) ||
          (bookingData.car && bookingData.car.provider && typeof bookingData.car.provider === 'object' ?
            bookingData.car.provider._id :
            (bookingData.car && bookingData.car.provider ? bookingData.car.provider : ''));

        setProviderId(bookingProviderId);
        setCarId(bookingData.carId || (bookingData.car && bookingData.car._id) || '');
        setPromoId(bookingData.promoId || '');

        const providersResponse = await getAllRcps();
        if (providersResponse.success) {
          setProviders(providersResponse.data);
        } else {
          console.error('Failed to load providers:', providersResponse.error);
        }

        if (bookingProviderId) {
          loadCars(bookingProviderId);
          loadPromotions(bookingProviderId);
        }
      } catch (err) {
        console.error('Error loading booking data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBookingData();
    }
  }, [bookingId]);

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
        setPriceDetails(null);
      } finally {
        setCalculating(false);
      }
    };

    calculateBookingPrice();
  }, [startDate, endDate, carId, promoId, cars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
      setSubmitting(true);

      const bookingData = {
        start_date: startDate,
        end_date: endDate,
        providerId,
        carId,
        promoId: promoId || undefined
      };

      if (priceDetails) {
        console.log('Updating booking with price details:', priceDetails);
      }

      const response = await updateBooking(bookingId, bookingData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        throw new Error(response.error || 'Failed to update booking');
      }
    } catch (err) {
      console.error('Edit booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading booking details...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Booking</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Booking</h1>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg text-green-700 dark:text-green-300">
              Booking updated successfully! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Car Rental Provider</label>
              <select
                value={providerId}
                onChange={(e) => {
                  setProviderId(e.target.value);
                  setCarId('');
                }}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                required
                disabled={submitting}
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name} - {provider.address}
                    {provider.district && `, ${provider.district}`}
                    {provider.province && `, ${provider.province}`}
                  </option>
                ))}
              </select>
            </div>

            {providerId && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Car</label>
                {loadingCars ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Loading cars...</span>
                  </div>
                ) : cars.length > 0 ? (
                  <select
                    value={carId}
                    onChange={(e) => setCarId(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    required
                    disabled={submitting}
                  >
                    <option value="">Select a car</option>
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.brand} {car.model} - {car.type} (฿{car.pricePerDay}/day)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400 py-2 italic">
                    No cars available from this provider
                  </div>
                )}
              </div>
            )}

            {/* Promotions Section */}
            {providerId && carId && (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select Promotion</label>
                {loadingPromotions ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Loading promotions...</span>
                  </div>
                ) : promotions.length > 0 ? (
                  <select
                    value={promoId}
                    onChange={(e) => setPromoId(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                    disabled={submitting}
                  >
                    <option value="">No promotion (regular price)</option>
                    {promotions.map((promo) => (
                      <option key={promo._id} value={promo._id}>
                        {promo.name ?? 'Promotion Details'} - {promo.discountPercentage}% off (max ฿{promo.maxDiscountAmount})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400 py-2 italic">
                    No promotions available from this provider
                  </div>
                )}
              </div>
            )}

            {/* Price Calculation Section */}
            {carId && startDate && endDate && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">Price Details</h3>

                {calculating ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Calculating price...</span>
                  </div>
                ) : priceDetails ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Base Price:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">฿{priceDetails.basePrice.toLocaleString()}</span>
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

                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                      {priceDetails.numberOfDays} days × ฿{priceDetails.pricePerDay.toLocaleString()}/day
                      {priceDetails.promoName && (
                        <span className="ml-1 text-green-600 dark:text-green-400">
                          (Promo: {priceDetails.promoName})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400 py-1">
                    Select dates and car to see price details
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
