'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllRcps } from '@/services/rcp.service';
import { getUserBookings, createBooking, deleteBooking, updateBooking } from '@/services/booking.service';
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import EditBookingModal from '@/components/EditBookingModal';
import RcpManagement from '@/components/RcpManagement';
import { Booking } from '@/types/booking';
import { RentalCarProvider } from '@/types/rcp';

interface NewBooking {
  providerId: string;
  date: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<RentalCarProvider[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = () => {
      if (!user) {
        router.push('/login');
        return;
      }
      setIsAdmin(user.role === 'admin');
    };

    checkAuth();
  }, [mounted, user, router]);

  useEffect(() => {
    if (!mounted || !user) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [bookingsResponse, providersResponse] = await Promise.all([
          getUserBookings(),
          getAllRcps()
        ]);

        if (bookingsResponse.success) {
          setBookings(bookingsResponse.data as Booking[]);
        } else {
          setError(bookingsResponse.error || 'Failed to load bookings');
        }

        if (providersResponse.success) {
          setProviders(providersResponse.data);
        } else {
          setError(providersResponse.error || 'Failed to load providers');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [mounted, user]);

  const handleAddBooking = async (booking: NewBooking) => {
    try {
      setIsSubmitting(true);
      setError('');

      const response = await createBooking(booking.providerId, {
        date: booking.date,
        providerId: booking.providerId
      });

      if (response.success) {
        setBookings(prev => [...prev, response.data as Booking]);
        setShowForm(false);
      } else {
        setError(response.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Create booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBooking = async (updatedBooking: Partial<Booking>) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (!updatedBooking._id) {
        throw new Error('Invalid booking data: Missing ID');
      }

      const response = await updateBooking(updatedBooking._id, {
        date: updatedBooking.date!,
        providerId: updatedBooking.providerId!
      });

      if (response.success) {
        setBookings(prev => prev.map(booking => 
          booking._id === updatedBooking._id ? response.data as Booking : booking
        ));
        setEditingBooking(null);
      } else {
        throw new Error(response.error || 'Failed to update booking');
      }
    } catch (err) {
      console.error('Edit booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const response = await deleteBooking(id);
      if (response.success) {
        setBookings(prev => prev.filter(booking => booking._id !== id));
      } else {
        throw new Error(response.error || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Delete booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
    }
  };

  const refreshProviders = async () => {
    try {
      const response = await getAllRcps();
      if (response.success) {
        setProviders(response.data);
      } else {
        setError(response.error || 'Failed to refresh providers');
      }
    } catch (err) {
      console.error('Error refreshing providers:', err);
      setError('Failed to refresh providers');
    }
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse text-center">
          <svg className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {user.name}
        </h1>
        <button
          onClick={() => router.push('/api/auth/logout')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${
                activeTab === 'bookings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Bookings
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('providers')}
                className={`${
                  activeTab === 'providers'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Manage Providers
              </button>
            )}
          </nav>
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">My Bookings</h2>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              New Booking
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <BookingList
              bookings={bookings}
              providers={providers}
              onEdit={(booking) => setEditingBooking(booking)}
              onDelete={handleDeleteBooking}
              showUser={isAdmin}
            />
          )}
        </div>
      )}

      {activeTab === 'providers' && isAdmin && (
        <RcpManagement
          providers={providers}
          refreshProviders={refreshProviders}
          setError={setError}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">New Booking</h2>
            <BookingForm
              onSubmit={handleAddBooking}
              onCancel={() => setShowForm(false)}
              isSubmitting={isSubmitting}
              booking={null}
            />
          </div>
        </div>
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onSubmit={handleEditBooking}
          onCancel={() => setEditingBooking(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}