'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { Car } from '@/types/Car';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [topCars, setTopCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopCars = async () => {
      try {
        setLoading(true);

        const response = await fetch(API_ENDPOINTS.cars.getAll);

        if (!response.ok) {
          throw new Error('Failed to fetch cars');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch cars');
        }

        const allCars = data.data;

        const carsWithRatings = await Promise.all(
          allCars.map(async (car: Car) => {
            try {
              const commentsResponse = await fetch(API_ENDPOINTS.comments.getAll(car.id));

              if (commentsResponse.ok) {
                const commentsData = await commentsResponse.json();

                if (commentsData.success) {
                  return {
                    ...car,
                    comments: commentsData.data,
                    avgRating: commentsData.data.length > 0
                      ? commentsData.data.reduce((sum: number, comment: any) => sum + comment.rating, 0) / commentsData.data.length
                      : 0
                  };
                }
              }

              return { ...car, comments: [], avgRating: 0 };
            } catch (error) {
              console.error(`Error fetching comments for car ${car.id}:`, error);
              return { ...car, comments: [], avgRating: 0 };
            }
          })
        );

        const sortedCars = [...carsWithRatings]
          .sort((a: any, b: any) => b.avgRating - a.avgRating)
          .slice(0, 3);

        setTopCars(sortedCars);
      } catch (err) {
        console.error('Error fetching top cars:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTopCars();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] bg-repeat"></div>

        {/* Car Silhouette */}
        <div className="absolute right-0 bottom-0 w-full md:w-1/2 h-full opacity-10 md:opacity-20">
          <div className="relative w-full h-full">
            <div className="absolute bottom-0 right-0 w-full h-3/4 bg-[url('/car-silhouette.svg')] bg-no-repeat bg-contain bg-right-bottom"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-6 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              <span className="block">Rent a Ride</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Anytime, Anywhere</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-xl">
              Premium car rental service with flexible booking options, competitive rates, and a wide selection of vehicles.
            </p>

            {user ? (
              <div className="space-y-6">
                <p className="text-lg text-slate-200">
                  Welcome back, <span className="font-semibold text-teal-400">{user.name}</span>! Ready for your next journey?
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                  >
                    <span>Go to Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link
                    href="/cars"
                    className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 font-semibold rounded-lg hover:bg-blue-400/10 transition-all flex items-center justify-center"
                  >
                    <span>Browse Cars</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 00.8-.4l3-4a1 1 0 00.2-.6V8a1 1 0 00-1-1h-3.05A2.5 2.5 0 0010 5.05V5a1 1 0 00-1-1H3zm11.854 7.146a.5.5 0 01.292.708l-1.5 2.5a.5.5 0 01-.854-.516l1.5-2.5a.5.5 0 01.562-.192z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                  >
                    <span>Get Started</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-transparent border-2 border-blue-400 text-blue-400 font-semibold rounded-lg hover:bg-blue-400/10 transition-all flex items-center justify-center"
                  >
                    <span>Sign In</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
                <p className="text-slate-400 text-sm">
                  Join thousands of satisfied customers who trust Rent a Ride for their car rental needs.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose <span className="text-blue-600 dark:text-blue-400">Rent a Ride</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We offer a seamless car rental experience with premium features designed to make your journey comfortable and hassle-free.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/70 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Quick Booking Process</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Book your desired car in minutes with our streamlined booking process. No paperwork, no hassle.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Secure & Reliable</h3>
              <p className="text-slate-600 dark:text-slate-400">
                All our cars are regularly maintained and sanitized to ensure your safety and comfort during your journey.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Competitive Pricing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get the best value for your money with our transparent pricing and special promotions for loyal customers.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/50 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Flexible Pickup & Return</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Choose from multiple convenient locations for pickup and return, making your travel planning easier.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Simple Documentation</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Minimal paperwork required. Just bring your license and payment method, and you&apos;re ready to drive.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">24/7 Customer Support</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Our dedicated support team is available around the clock to assist you with any questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How It <span className="text-indigo-600 dark:text-indigo-400">Works</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Renting a car with Rent a Ride is simple and straightforward. Follow these easy steps to get on the road quickly.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-200 dark:bg-blue-800 hidden md:block"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-blue-100 dark:border-blue-900">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Choose Your Car</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Browse our extensive fleet and select the perfect vehicle for your needs and budget.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-blue-100 dark:border-blue-900">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Book Your Dates</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Select your pickup and return dates and times that work best for your schedule.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-blue-100 dark:border-blue-900">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Confirm & Pay</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Review your booking details and complete the payment securely online.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-blue-100 dark:border-blue-900">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Enjoy Your Ride</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Pick up your car at the designated location and enjoy your journey with peace of mind.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              href="/cars"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg inline-flex items-center"
            >
              <span>Start Booking Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Top Rated <span className="text-blue-600 dark:text-blue-400">Cars</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Explore our highest-rated cars chosen by our customers. Quality and comfort guaranteed.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shadow-md h-[400px] animate-pulse">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="p-6">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
                    <div className="flex space-x-2 mb-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg max-w-2xl mx-auto">
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
          ) : topCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">No cars found. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topCars.map((car) => {
                const avgRating = (car as any).avgRating || 0;

                const formattedPrice = new Intl.NumberFormat('th-TH').format(car.pricePerDay);

                return (
                  <div key={car.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all group">
                    <div className="relative h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      {car.image && car.image.length > 0 ? (
                        <Image
                          src={car.image[0]}
                          alt={`${car.brand} ${car.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-slate-300 dark:bg-slate-800 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9h.01M21 9h.01M3 15h.01M21 15h.01M3 21h18" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l18-3v13l-18 3V6z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg font-medium">
                        ฿{formattedPrice}/day
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute bottom-2 left-2 bg-white dark:bg-slate-900 text-amber-500 px-2 py-1 rounded-lg font-medium text-sm flex items-center shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {avgRating.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{car.brand} {car.model}</h3>
                      <div className="flex flex-wrap items-center text-sm text-slate-600 dark:text-slate-400 mb-4 gap-2">
                        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">{car.type}</span>
                        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">{car.seatingCapacity} Seats</span>
                        <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full">{car.transmission}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {car.carDescription}
                      </p>
                      <Link href={`/cars/${car.id}`} className="text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/cars"
              className="px-6 py-3 bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium rounded-lg transition-colors inline-flex items-center"
            >
              <span>View All Cars</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Hit the Road?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Rent a Ride for their car rental needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              <span>Get Started</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/cars"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all inline-flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <span>Browse Cars</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 00.8-.4l3-4a1 1 0 00.2-.6V8a1 1 0 00-1-1h-3.05A2.5 2.5 0 0010 5.05V5a1 1 0 00-1-1H3zm11.854 7.146a.5.5 0 01.292.708l-1.5 2.5a.5.5 0 01-.854-.516l1.5-2.5a.5.5 0 01.562-.192z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
