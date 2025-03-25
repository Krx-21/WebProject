'use client';
import { useEffect, useState, useCallback } from 'react';
import { getRcpById, getAllRcps } from '@/services/rcp.service';
import { getUserBookings, deleteBooking, updateBooking } from '@/services/booking.service';
import { RentalCarProvider } from '@/types/rcp';
import { useParams, useRouter } from 'next/navigation';
import BookingList from '@/components/BookingList';
import EditBookingModal from '@/components/EditBookingModal';
import { Booking } from '@/types/booking';

export default function RcpDetail() {
  const params = useParams<{ id: string }>();
  const id = params!.id as string;
  const router = useRouter();
  
  const [rcp, setRcp] = useState<RentalCarProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
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

  // Check user authentication
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

  // Fetch RCP details and data
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

  // Handle editing booking
  const handleEditBooking = async (updatedBooking: Partial<Booking>) => {
    setIsSubmitting(true);
    setError('');

    try {
      // Debug logs
      console.log('Updating booking with data:', updatedBooking);
      
      if (!updatedBooking._id) {
        throw new Error('Invalid booking data: Missing ID');
      }

      const response = await updateBooking(updatedBooking._id, {
        date: updatedBooking.date!,
        providerId: updatedBooking.providerId!
      });
      
      console.log('Update response:', response);
      
      if (response.success) {
        await loadBookings(); // Reload bookings after update
        setEditingBooking(null);
      } else {
        throw new Error(response.error || 'Failed to update booking');
      }
    } catch (err: any) {
      console.error('Edit booking error:', err);
      setError(`Failed to update booking: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (id: string) => {
    try {
      const response = await deleteBooking(id);
      if (response.success) {
        await loadBookings();
      } else {
        throw new Error(response.error || 'Failed to delete booking');
      }
    } catch (err: any) {
      console.error('Delete booking error:', err);
      setError(`Failed to delete booking: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-800 min-h-screen">
        <p className="text-center text-gray-800 dark:text-white">Loading...</p>
      </div>
    );
  }

  if (error || !rcp) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-100 dark:bg-gray-800 min-h-screen">
        <p className="text-center text-red-600 dark:text-red-400">{error || 'Provider not found'}</p>
      </div>
    );
  }

  // Filter bookings for this specific RCP
  const filteredBookings = bookings.filter((booking: any) => 
    booking.rentalCarProvider?._id === id);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {rcp.name}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded font-medium">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Provider Details</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-medium">Address:</span> {rcp.address}
            </p>
            {rcp.tel && (
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                <span className="font-medium">Tel:</span> {rcp.tel}
              </p>
            )}
            {rcp.province && (
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Province:</span> {rcp.province}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Back to Providers
          </button>
        </div>
      </div>

      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            {`Your Bookings with ${rcp.name}`}
          </h2>
          
          <BookingList 
            bookings={filteredBookings}
            providers={[rcp]}
            onEdit={(booking) => {
              console.log('Edit booking:', booking); // Debug log
              setEditingBooking(booking as unknown as Booking);
            }}
            onDelete={handleDeleteBooking}
            showUser={isAdmin}
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
  );
}