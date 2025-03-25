'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import BookingList from '@/components/BookingList';
import { createBooking, getUserBookings, updateBooking, deleteBooking } from '@/services/booking.service';
import { getAllRcps } from '@/services/rcp.service';
import EditBookingModal from '@/components/EditBookingModal';
import RcpManagement from '@/components/RcpManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Booking } from '@/types/booking';

interface NewBooking {
  providerId: string;
  date: string;
}

export default function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
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
    const checkAdminStatus = () => {
      if (user?.role === 'admin') {
        setIsAdmin(true);
        return;
      }

      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setIsAdmin(userData?.role === 'admin');
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };

    checkAdminStatus();
  }, [user]);

  const loadBookings = useCallback(async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user data found in localStorage');
        router.push('/login');
        return;
      }

      const response = await getUserBookings();
      if (response.success) {
        setBookings(response.data);
      } else {
        if (response.error === 'Authentication required') {
          console.error('Authentication required, redirecting to login');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        setError(response.error || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, [router]);

  const loadProviders = useCallback(async () => {
    try {
      const response = await getAllRcps();
      if (response.success) {
        setProviders(response.data);
      } else {
        setError('Failed to load providers');
      }
    } catch (err) {
      console.error('Error loading providers:', err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && (tabParam === 'providers' || tabParam === 'bookings')) {
      setActiveTab(tabParam);
    }

    const init = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadBookings(), loadProviders()]);
      } catch (err) {
        console.error('Init error:', err);
        setError('Failed to initialize dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [user, router, loadBookings, loadProviders]);

  const handleAddBooking = async (booking: NewBooking) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (bookings.length >= 3 && !isAdmin) {
        throw new Error('Maximum booking limit (3) reached');
      }

      const response = await createBooking(booking.providerId, {
        date: booking.date,
        providerId: booking.providerId
      });

      if (response.success) {
        await loadBookings();
        setShowForm(false);
      } else {
        throw new Error(response.error || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Booking creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBooking = async (updatedBooking: Partial<Booking>) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!editingBooking?._id) {
        throw new Error('No booking selected for editing');
      }

      const bookingData = {
        date: updatedBooking.date!,
        providerId: updatedBooking.providerId!
      };
      
      const response = await updateBooking(editingBooking._id, bookingData);
      
      if (response.success) {
        await loadBookings();
        setEditingBooking(null);
      } else {
        throw new Error(response.error || 'Failed to update booking');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      const response = await deleteBooking(id);
      if (response.success) {
        await loadBookings();
      } else {
        throw new Error(response.error || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Delete booking error:', err);
      setError(`Failed to delete booking: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-pulse text-center">
          <svg className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Header */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isAdmin ? 'Admin Dashboard' : 'Your Car Rentals'}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isAdmin 
                  ? 'Manage all bookings and car providers.' 
                  : 'View and manage your car rental bookings.'}
              </p>
            </div>
            
            {!isAdmin && (
              <div className="mt-4 md:mt-0 status-pill status-primary">
                {bookings.length} / 3 Bookings
              </div>
            )}
            
            {isAdmin && (
              <div className="mt-4 md:mt-0 status-pill bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
                Admin Access
              </div>
            )}
          </div>
          
          {/* Admin Navigation Tabs */}
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-300 focus:outline-none ${
                  activeTab === 'bookings'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Manage Bookings
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors duration-300 focus:outline-none ${
                  activeTab === 'providers'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Manage Providers
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'bookings' ? (
          <>
            {/* Booking Form */}
            {!showForm ? (
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <button
                  className={`group px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2
                    ${bookings.length >= 3 && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setShowForm(true)}
                  disabled={bookings.length >= 3 && !isAdmin}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Book New Car
                </button>
                {bookings.length >= 3 && !isAdmin && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                    You have reached the maximum number of concurrent bookings (3).
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                  Book a New Car
                </h3>
                <BookingForm
                  booking={null}
                  onSubmit={handleAddBooking}
                  onCancel={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {/* Booking List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                {isAdmin ? 'All Bookings' : 'Your Current Bookings'}
              </h2>
              <BookingList 
                bookings={bookings}
                providers={providers}
                onEdit={(booking) => {
                  console.log('Edit booking:', booking);
                  setEditingBooking(booking as unknown as Booking);
                }}
                onDelete={handleDeleteBooking}
                showUser={isAdmin}
              />
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
              Manage Car Providers
            </h2>
            <RcpManagement 
              providers={providers} 
              refreshProviders={loadProviders}
              setError={setError}
            />
          </div>
        )}

        {/* Edit Booking Modal */}
        {editingBooking && (
          <EditBookingModal
            booking={editingBooking}
            onSubmit={handleEditBooking}
            onCancel={() => {
              setEditingBooking(null);
              setError('');
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
} 