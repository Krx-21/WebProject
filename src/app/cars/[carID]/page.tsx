'use client';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Car } from '@/types/Car';
import CommentSection from '@/components/Comment';
import BookingModal from '@/components/BookingModal';
import { getCurrentUser } from '@/services/auth.service';


export default function CarsProviderPage() {
  const params = useParams();
  const carID = params.carID;
  const [carDetails, setCarDetails] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const fetchCar = async () => {
      if (typeof carID === 'string') {
        try {
          const response = await fetch(API_ENDPOINTS.cars.getOne(carID),
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch car details');
          }
          const data = await response.json();
          console.log("Car data:", data);
          setCarDetails(data.data);
          setLoading(false);
        } catch (error: any) {
          console.error('Error fetching car:', error);
          setError(error.message || 'An unexpected error occurred');
          setLoading(false);
        }
      } else {
        console.warn('carID is not a string or is undefined');
        setError('Invalid car ID');
        setLoading(false);
      }
    };
    fetchCar();
  }, [carID]);

  if (loading) {
    return <div>Loading car details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="container-base max-w-7xl mx-auto">
        {carDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900
                dark:from-slate-200 dark:via-slate-300 dark:to-slate-400
                bg-clip-text text-transparent">
                {carDetails.brand} {carDetails.model}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {carDetails.carDescription}
              </p>
            </div>

            {/* Car Details Section */}
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Car Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.type}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Year</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.year}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Type</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.fuelType}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Top Speed</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.topSpeed} km/h</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Seating Capacity</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.seatingCapacity} seats</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Price Per Day</p>
                    <p className="text-gray-900 dark:text-white">฿{carDetails.pricePerDay}</p>
                  </div>
                </div>
              </div>

              {/* Provider Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Provider Information
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.provider.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white">
                      {carDetails.provider.address}, {carDetails.provider.district},
                      {carDetails.provider.province} {carDetails.provider.postalCode}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.provider.tel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Region</p>
                    <p className="text-gray-900 dark:text-white">{carDetails.provider.region}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <Link
                href="/cars"
                className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Cars
              </Link>

              {user && (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <CommentSection cid={carID as string} />

      {showBookingModal && carDetails && (
        <BookingModal
          car={carDetails}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </main>
  );
}