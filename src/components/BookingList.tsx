'use client';

import { Booking } from '@/types/booking';
import Link from 'next/link';

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
  onDelete: (id: string) => void;
  showUser?: boolean;
}

export default function BookingList({
  bookings = [],
  providers = [],
  onDelete,
  onEdit,
  showUser = false
}: BookingListProps & { onEdit?: (booking: Booking) => void }) {
  const bookingsRef = bookings;
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900/20 p-8 rounded-lg text-center border border-slate-200 dark:border-slate-700 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400 dark:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <p className="text-slate-700 dark:text-slate-200 text-lg font-medium mt-3">No bookings found.</p>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Make a booking to get started.</p>
      </div>
    );
  }

  const getProviderName = (providerId: string): string => {
    if (!providerId) return 'Unknown provider';

    if (!Array.isArray(providers) || providers.length === 0) {
      return 'Loading provider...';
    }

    const provider = providers.find(p => p._id === providerId);

    if (provider && provider.name) {
      return provider.name;
    }

    if (Array.isArray(bookingsRef)) {
      for (const booking of bookingsRef) {
        if (booking.car && booking.car.provider) {
          if (typeof booking.car.provider === 'object' &&
              booking.car.provider._id === providerId &&
              booking.car.provider.name) {
            return booking.car.provider.name;
          }
        }

        if (booking.providerId === providerId && booking.rentalCarProvider && booking.rentalCarProvider.name) {
          return booking.rentalCarProvider.name;
        }

        if ((booking as any).provider && typeof (booking as any).provider === 'object' &&
            (booking as any).provider._id === providerId && (booking as any).provider.name) {
          return (booking as any).provider.name;
        }
      }
    }

    return 'Unknown provider';
  };

  const getProviderAddress = (providerId: string): string => {
    if (!providerId) return 'Unknown location';

    if (!Array.isArray(providers) || providers.length === 0) {
      return 'Loading location...';
    }

    const provider = providers.find(p => p._id === providerId);

    if (provider) {
      const addressParts = [
        provider.address,
        provider.district,
        provider.province
      ].filter(Boolean);

      if (addressParts.length > 0) {
        return addressParts.join(', ');
      }
    }

    if (Array.isArray(bookingsRef)) {
      for (const booking of bookingsRef) {
        if (booking.car && booking.car.provider && typeof booking.car.provider === 'object' &&
            booking.car.provider._id === providerId) {
          const providerObj = booking.car.provider;
          const addressParts = [
            providerObj.address,
            providerObj.district,
            providerObj.province
          ].filter(Boolean);

          if (addressParts.length > 0) {
            return addressParts.join(', ');
          }
        }

        if (booking.providerId === providerId && booking.rentalCarProvider) {
          const addressParts = [
            booking.rentalCarProvider.address,
            booking.rentalCarProvider.district,
            booking.rentalCarProvider.province
          ].filter(Boolean);

          if (addressParts.length > 0) {
            return addressParts.join(', ');
          }
        }

        if ((booking as any).provider && typeof (booking as any).provider === 'object' &&
            (booking as any).provider._id === providerId) {
          const providerObj = (booking as any).provider;
          const addressParts = [
            providerObj.address,
            providerObj.district,
            providerObj.province
          ].filter(Boolean);

          if (addressParts.length > 0) {
            return addressParts.join(', ');
          }
        }
      }
    }

    return 'Unknown location';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown date';

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

  const calculateDuration = (startDate: string, endDate: string): string => {
    if (!startDate || !endDate) return '0 days';

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch (error) {
      return 'Unknown duration';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Booking Confirmed';
      case 'pending':
        return 'Awaiting Confirmation';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Booking Failed';
      default:
        return 'Unknown Status';
    }
  };

  const getPaymentStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'failed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Payment Completed';
      case 'processing':
        return 'Payment Processing';
      case 'pending':
        return 'Payment Required';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Payment Status Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {bookings.map((booking: Booking) => {
        let bookingProviderId = '';
        let providerInfo: any = null;

        if (booking.car && booking.car.provider) {
          if (typeof booking.car.provider === 'string') {
            bookingProviderId = booking.car.provider;
          } else if (typeof booking.car.provider === 'object' && booking.car.provider._id) {
            bookingProviderId = booking.car.provider._id;
          }
        } else if (booking.providerId) {
          bookingProviderId = booking.providerId;
        } else if (booking.rentalCarProvider && booking.rentalCarProvider._id) {
          bookingProviderId = booking.rentalCarProvider._id;
        } else if ((booking as any).provider && typeof (booking as any).provider === 'string') {
          bookingProviderId = (booking as any).provider;
        } else if ((booking as any).provider && typeof (booking as any).provider === 'object' && (booking as any).provider._id) {
          bookingProviderId = (booking as any).provider._id;
        }

        if (booking.car && booking.car.provider) {
          if (typeof booking.car.provider === 'object') {
            providerInfo = booking.car.provider;
          } else if (bookingProviderId && Array.isArray(providers) && providers.length > 0) {
            providerInfo = providers.find(p => p._id === bookingProviderId);
          }
        } else if (booking.rentalCarProvider) {
          providerInfo = booking.rentalCarProvider;

          if (bookingProviderId && Array.isArray(providers) && providers.length > 0) {
            const fullProviderInfo = providers.find(p => p._id === bookingProviderId);
            if (fullProviderInfo) {
              providerInfo = {
                ...providerInfo,
                name: fullProviderInfo.name || providerInfo.name,
                address: fullProviderInfo.address || providerInfo.address,
                district: fullProviderInfo.district || providerInfo.district,
                province: fullProviderInfo.province || providerInfo.province
              };
            }
          }
        } else if ((booking as any).provider && typeof (booking as any).provider === 'object') {
          providerInfo = (booking as any).provider;

          if (bookingProviderId && Array.isArray(providers) && providers.length > 0) {
            const fullProviderInfo = providers.find(p => p._id === bookingProviderId);
            if (fullProviderInfo) {
              providerInfo = {
                ...providerInfo,
                name: fullProviderInfo.name || providerInfo.name,
                address: fullProviderInfo.address || providerInfo.address,
                district: fullProviderInfo.district || providerInfo.district,
                province: fullProviderInfo.province || providerInfo.province
              };
            }
          }
        } else if (bookingProviderId && Array.isArray(providers) && providers.length > 0) {
          providerInfo = providers.find(p => p._id === bookingProviderId);
        }

        let addressDisplay = 'Unknown location';
        if (providerInfo && providerInfo.address) {
          const addressParts = [
            providerInfo.address,
            providerInfo.district,
            providerInfo.province
          ].filter(Boolean);

          addressDisplay = addressParts.length > 0 ? addressParts.join(', ') : 'Address not provided';
        } else if (bookingProviderId) {
          addressDisplay = getProviderAddress(bookingProviderId);
        } else if (!Array.isArray(providers) || providers.length === 0) {
          addressDisplay = 'Loading location...';
        }

        return (
          <div
            key={booking._id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300"
          >
            {showUser && booking.user && (
              <div className="mb-4">
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium block mb-1">Customer:</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {typeof booking.user === 'string' ? booking.user :
                   (booking.user && typeof booking.user === 'object' ?
                     (booking.user as any).name || (booking.user as any).email || 'Unknown user' :
                     'Unknown user')}
                </p>
              </div>
            )}

            <div className="mb-4">
              <div className="mb-2">
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Rental Period:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Start Date:</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(booking.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">End Date:</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(booking.end_date)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Duration: {calculateDuration(booking.start_date, booking.end_date)}
              </p>
            </div>

            <div className="mb-4">
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium block mb-1">Provider:</span>
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {providerInfo?.name || getProviderName(bookingProviderId)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {addressDisplay}
                  </p>
                  {(!Array.isArray(providers) || providers.length === 0) && (
                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 italic">
                      Loading provider details...
                    </p>
                  )}
                </div>
                {bookingProviderId && (
                  <Link
                    href={`/rcps/${bookingProviderId}`}
                    className="ml-2 p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-800/30 transition-colors"
                    title="View Provider"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {booking.car && (
              <div className="mb-4">
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium block mb-1">Car:</span>
                <p className="font-medium text-slate-900 dark:text-white">
                  {booking.car.brand} {booking.car.model} - {booking.car.type}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  ฿{booking.car.pricePerDay}/day
                </p>
              </div>
            )}

            {/* Booking Status Details */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Booking Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Status:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusStyles(booking.status || 'pending')}`}>
                    {getStatusLabel(booking.status || 'pending')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Payment:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusStyles(booking.status || 'pending')}`}>
                    {getPaymentStatusLabel(booking.status || 'pending')}
                  </span>
                </div>
                {booking.totalprice && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Total Amount:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">฿{booking.totalprice.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              {/* Pay Now button for pending bookings */}
              {(booking.status === 'pending' || !booking.status) && (
                <Link
                  href={`/booking/${booking._id}/payment`}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-md transition-colors duration-200 shadow-sm inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay Now
                </Link>
              )}
              {onEdit ? (
                <button
                  onClick={() => onEdit(booking)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700 dark:hover:bg-indigo-800/30 transition-colors duration-200 shadow-sm inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <Link
                  href={`/booking/${booking._id}/edit`}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700 dark:hover:bg-indigo-800/30 transition-colors duration-200 shadow-sm inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this booking?')) {
                    onDelete(booking._id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:text-red-300 dark:bg-red-900/20 dark:border-red-700 dark:hover:bg-red-800/30 transition-colors duration-200 shadow-sm"
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