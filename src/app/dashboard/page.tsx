'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllRcps, getMyRcp } from '@/services/rcp.service';
import { getUserBookings, deleteBooking } from '@/services/booking.service';
import BookingList from '@/components/BookingList';
import RcpManagement from '@/components/RcpManagement';
import { Booking } from '@/types/booking';
import { RentalCarProvider } from '@/types/rcp';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<RentalCarProvider[]>([]);
  const [myProvider, setMyProvider] = useState<RentalCarProvider[]>([]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('bookings');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

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
      setIsProvider(user.role === 'provider');
    };

    checkAuth();
  }, [mounted, user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const providersResponse = await getAllRcps();
      if (providersResponse.success) {
        setProviders(providersResponse.data);
      } else {
        if (providersResponse.error === 'Authentication required') {
          console.error('Authentication required, redirecting to login');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        setError(providersResponse.error || 'Failed to load providers');
      }

      if (user?.role === 'provider') {
        console.log('Loading provider data for user:', user);
        const myProviderResponse = await getMyRcp();
        console.log('My provider response:', myProviderResponse);
        if (myProviderResponse.success) {
          console.log('Setting my provider data:', myProviderResponse.data);
          setMyProvider(myProviderResponse.data || []);
        } else {
          console.error('Failed to load provider data:', myProviderResponse.error);
        }
      }

      const bookingsResponse = await getUserBookings();
      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data as Booking[]);
      } else {
        if (bookingsResponse.error === 'Authentication required') {
          console.error('Authentication required, redirecting to login');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        setError(bookingsResponse.error || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted || !user) return;
    loadData();

    const tabParam = searchParams.get('tab');
    if (tabParam === 'providers' && (isAdmin || isProvider)) {
      setActiveTab('providers');
    }
  }, [mounted, user, searchParams, isAdmin, isProvider]);



  const handleDeleteBooking = async (id: string) => {
    try {
      const response = await deleteBooking(id);
      if (response.success) {
        await loadData();
      } else {
        throw new Error(response.error || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Delete booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete booking');
    }
  };

  const refreshProviders = async () => {
    await loadData();
  };

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-center">
          <svg className="w-12 h-12 mx-auto text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-slate-700 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-slate-900/10 pt-8 pb-12">
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-indigo-700 bg-clip-text text-transparent dark:from-slate-300 dark:via-slate-200 dark:to-indigo-300">
            Welcome, {user.name}
          </h1>

          {!isAdmin && (
            <div className="px-4 py-2 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 rounded-full font-medium text-sm shadow-sm">
              {bookings.length} / 3 Bookings
            </div>
          )}

          {isAdmin && (
            <div className="px-4 py-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full font-medium text-sm shadow-sm">
              Admin Access
            </div>
          )}

          {isProvider && (
            <div className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full font-medium text-sm shadow-sm">
              Provider Access
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 p-4 mb-6 rounded-lg shadow-sm">
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

        <div className="mb-6">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`${
                  activeTab === 'bookings'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-indigo-500 hover:border-indigo-300 dark:text-slate-400 dark:hover:text-indigo-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                My Bookings
              </button>
              {(isAdmin || isProvider) && (
                <button
                  onClick={() => setActiveTab('providers')}
                  className={`${
                    activeTab === 'providers'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-indigo-500 hover:border-indigo-300 dark:text-slate-400 dark:hover:text-indigo-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  {isAdmin ? 'Manage Providers' : 'My Provider Profile'}
                </button>
              )}
            </nav>
          </div>
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">My Bookings</h2>
              <Link
                href="/booking/new"
                className={`group px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2
                  ${bookings.length >= 3 && !isAdmin ? 'opacity-50 pointer-events-none' : ''}`}
                aria-disabled={bookings.length >= 3 && !isAdmin}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-transform group-hover:rotate-90 duration-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Booking
              </Link>
            </div>

            {bookings.length >= 3 && !isAdmin && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-100 dark:border-red-800/20 inline-block">
                You have reached the maximum number of concurrent bookings (3).
              </p>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              </div>
            ) : (
              <BookingList
                bookings={bookings}
                providers={providers}
                onDelete={handleDeleteBooking}
                showUser={isAdmin}
              />
            )}
          </div>
        )}

        {activeTab === 'providers' && (isAdmin || isProvider) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-6 pb-2 border-b border-slate-200 dark:border-slate-700">
              {isAdmin ? 'Manage Car Providers' : 'My Provider Profile'}
            </h2>
            {isProvider && (
              <div className="mb-4">
                {/* Log provider data */}
                {(() => { console.log('Rendering provider tab with myProvider:', myProvider); return null; })()}
                {myProvider.length === 0 && !isLoading && (
                  <p className="text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                    No provider profile found. You can create one below.
                  </p>
                )}
              </div>
            )}
            <RcpManagement
              providers={isAdmin ? providers : myProvider}
              refreshProviders={refreshProviders}
              setError={setError}
            />
          </div>
        )}


      </div>
    </div>
  );
}