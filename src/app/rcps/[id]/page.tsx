'use client';
import { useEffect, useState, useCallback } from 'react';
import { getRcpById, getAllRcps } from '@/services/rcp.service';
import { getUserBookings, deleteBooking, updateBooking } from '@/services/booking.service';
import { RentalCarProvider } from '@/types/rcp';
import { useParams, useRouter } from 'next/navigation';
import BookingList from '@/components/BookingList';
import EditBookingModal from '@/components/EditBookingModal';
import { Booking } from '@/types/booking';
import Link from 'next/link';

export default function RcpDetail() {
  const params = useParams<{ id: string }>();
  const id = params!.id as string;
  const router = useRouter();
  
  const [rcp, setRcp] = useState<RentalCarProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBookings = useCallback(async () => {
    try {
      const response = await getUserBookings();
      
      console.log('Load bookings response:', response); // Debug logging
      
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
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError(err.message || 'Failed to load bookings');
    }
  }, [router]);

  const loadProviders = useCallback(async () => {
    try {
      const response = await getAllRcps();
      console.log('Load providers response:', response); // Debug logging
      
      if (response.success) {
        setProviders(response.data);
      } else {
        setError('Failed to load providers');
      }
    } catch (err: any) {
      setError(`Failed to load providers: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        return;
      }
      
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        const [rcpResponse] = await Promise.all([
          getRcpById(id),
          loadBookings(),
          loadProviders()
        ]);
        
        if (rcpResponse.success) {
          setRcp(rcpResponse.data);
        } else {
          setError('Failed to fetch RCP details');
        }
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, loadBookings, loadProviders]);
  
  const filteredBookings = bookings.filter((booking: any) => {
    return booking.providerId === id || 
           (booking.provider && booking.provider._id === id) ||
           (booking.provider && typeof booking.provider === 'string' && booking.provider === id) ||
           (booking.rentalCarProvider && booking.rentalCarProvider._id === id);
  });
  
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      setIsSubmitting(true);
      const response = await deleteBooking(bookingId);
      
      if (response.success) {
        setBookings(bookings.filter((booking: any) => booking._id !== bookingId));
      } else {
        setError(response.error || 'Failed to delete booking');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the booking');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
  };
  
  const handleUpdateBooking = async (updatedData: any) => {
    if (!editingBooking) return;
    
    try {
      setIsSubmitting(true);
      const response = await updateBooking(editingBooking._id, updatedData);
      
      if (response.success) {
        setBookings(bookings.map((booking: any) => 
          booking._id === editingBooking._id ? response.data : booking
        ));
        setEditingBooking(null);
      } else {
        setError(response.error || 'Failed to update booking');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-20 w-20 mb-6"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2.5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2.5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !rcp) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-4">Error</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-center mb-6">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/rcps')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Providers List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no RCP data
  if (!rcp) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto text-center">
            <p className="text-gray-700 dark:text-gray-300">No provider information available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Home</Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link href="/rcps" className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">Car Rental Providers</Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-gray-900 dark:text-white font-medium" aria-current="page">{rcp.name}</span>
            </li>
          </ol>
        </nav>

        {/* Provider main info card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 h-32">
            <div className="absolute inset-0 bg-opacity-50"></div>
          </div>
          <div className="relative px-6 py-8 -mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{rcp.name}</h1>
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded font-medium">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                {/* Contact info */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Contact Information</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Address</p>
                        <p className="text-gray-700 dark:text-gray-300">{rcp.address}</p>
                        {(rcp.district || rcp.province) && (
                          <p className="text-gray-700 dark:text-gray-300">
                            {[rcp.district, rcp.province].filter(Boolean).join(', ')}
                            {rcp.postalcode && ` ${rcp.postalcode}`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {rcp.tel && (
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                          <p className="text-gray-700 dark:text-gray-300">{rcp.tel}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Map or additional info placeholder */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">Map view coming soon</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions button group */}
            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex gap-2">
                {isAdmin && (
                  <Link 
                    href={`/dashboard?tab=providers&edit=${rcp._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Manage Provider
                  </Link>
                )}
              </div>
              
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back to Providers
              </button>
            </div>
          </div>
        </div>

        {/* User's bookings section */}
        {user && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              {`Your Bookings with ${rcp.name}`}
            </h2>
            
            {filteredBookings.length > 0 ? (
              <BookingList 
                bookings={filteredBookings}
                providers={[rcp]}
                onEdit={handleEditBooking}
                onDelete={handleDeleteBooking}
                showUser={false}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-300">You don't have any bookings with this provider yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Edit booking modal */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onSubmit={handleUpdateBooking}
          onCancel={() => setEditingBooking(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}