'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Promotion, getAllPromotions, getProviderDetails } from '@/services/promotion.service';

function formatDate(date: string) {
  return format(new Date(date), 'MMM dd, yyyy');
}

function getPromotionStatus(startDate: string, endDate: string) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return { status: 'Upcoming' };
  } else if (now > end) {
    return { status: 'Expired' };
  } else {
    return { status: 'Active' };
  }
}

interface PromotionWithProviderName extends Promotion {
  providerName?: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionWithProviderName[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<PromotionWithProviderName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await getAllPromotions();
        if (!response.success) {
          if (response.error === 'Authentication required') {
            setPromotions([]);
            setFilteredPromotions([]);
            setLoading(false);
            return;
          } else {
            throw new Error(response.error || 'Failed to fetch promotions');
          }
        }

        if (!response.data) {
          throw new Error('No promotion data received');
        }

        const promotionPromises = response.data.map(async (promotion) => {
          try {
            let providerName = 'Unknown Provider';

            if (promotion.provider) {
              if (typeof promotion.provider === 'object' && promotion.provider.name) {
                providerName = promotion.provider.name;
              }
              else if (typeof promotion.provider === 'string') {
                try {
                  const providerResponse = await getProviderDetails(promotion.provider);
                  if (providerResponse.success && providerResponse.data) {
                    providerName = providerResponse.data.name || 'Unknown Provider';
                  }
                } catch (err) {
                  console.warn(`Error fetching provider ${promotion.provider}:`, err);
                }
              }
            }

            return {
              ...promotion,
              providerName
            };
          } catch (error) {
            console.error('Error processing promotion:', error);
            return {
              ...promotion,
              providerName: 'Unknown Provider'
            };
          }
        });

        const results = await Promise.allSettled(promotionPromises);
        const promotionsWithProviders = results
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<PromotionWithProviderName>).value);

        setPromotions(promotionsWithProviders);
        setFilteredPromotions(promotionsWithProviders);
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  useEffect(() => {
    if (!promotions.length) return;

    if (activeFilter === 'all') {
      setFilteredPromotions(promotions);
      return;
    }

    const filtered = promotions.filter(promotion => {
      const status = getPromotionStatus(promotion.startDate, promotion.endDate).status.toLowerCase();
      return status === activeFilter;
    });

    setFilteredPromotions(filtered);
  }, [activeFilter, promotions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 dark:text-red-400 bg-white dark:bg-gray-900">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-teal-500/10 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-teal-900/20 py-16 md:py-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent animate-fade-in-up">
              Special Promotions
            </h1>

            <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 mx-auto mb-8 rounded-full animate-width-expand"></div>

            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Discover exclusive deals and discounts to save on your next car rental
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2 animate-fade-in-up animation-delay-300">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full shadow-md transition-all duration-200 ${activeFilter === 'all'
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
          >
            All Promotions
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 rounded-full shadow-md transition-all duration-200 ${activeFilter === 'active'
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-4 py-2 rounded-full shadow-md transition-all duration-200 ${activeFilter === 'upcoming'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
          >
            Upcoming
          </button>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPromotions.map((promotion, index) => {
            const status = getPromotionStatus(promotion.startDate, promotion.endDate);
            return (
              <div
                key={promotion._id}
                className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl
                         border border-slate-200/60 dark:border-slate-700/60
                         transition-all duration-300 hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-800/60
                         overflow-hidden h-full flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (index % 3 + 1)}s` }}
              >
                {/* Header Design with decorative elements */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-500/10 to-blue-500/10
                              dark:from-indigo-900/20 dark:to-blue-900/20 p-6 overflow-hidden">

                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 rounded-full -mb-10 -ml-10 group-hover:scale-110 transition-transform duration-500 delay-100"></div>

                  {/* Status badge */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium flex items-center
                                ${status.status === 'Active'
                                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
                                  : status.status === 'Upcoming'
                                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${status.status === 'Active' ? 'bg-teal-500' : status.status === 'Upcoming' ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
                    {status.status}
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-6 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {(promotion as any).title || (promotion as any).name}
                    </h3>
                    <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 mt-2 mb-3 rounded-full group-hover:w-20 transition-all duration-300"></div>
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                      {(promotion as any).description || 'No description available'}
                    </p>
                  </div>
                </div>

                {/* Details Design */}
                <div className="p-6 space-y-5 flex-grow">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-900/10
                                 rounded-lg border border-indigo-100 dark:border-indigo-800/20 group-hover:border-indigo-200 dark:group-hover:border-indigo-700/30 transition-colors duration-300">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Discount</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {promotion.discountPercentage}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-900/10
                                 rounded-lg border border-teal-100 dark:border-teal-800/20 group-hover:border-teal-200 dark:group-hover:border-teal-700/30 transition-colors duration-300">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Max Savings</p>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        ฿{promotion.maxDiscountAmount}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Provider</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{promotion.providerName}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mt-0.5">
                        <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9a2 2 0 10-4 0v5a2 2 0 104 0V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Minimum Purchase</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">฿{promotion.minPurchaseAmount}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                        <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Valid Period</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            );
          })}
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl
                         border border-slate-200/60 dark:border-slate-700/60 shadow-md animate-fade-in-up">
            <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No Active Promotions
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              We don&apos;t have any active promotions at the moment. Please check back later for new deals and special offers.
            </p>
            <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium inline-flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Page
            </button>
          </div>
        ) : filteredPromotions.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl
                         border border-slate-200/60 dark:border-slate-700/60 shadow-md animate-fade-in-up">
            <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18M10.5 10.5l.01 0M15.5 10.5l.01 0M12 17c-2.397 0-4.794-.773-6.795-2.296" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No {activeFilter === 'active' ? 'Active' : activeFilter === 'upcoming' ? 'Upcoming' : ''} Promotions Found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
              We couldn&apos;t find any {activeFilter === 'active' ? 'active' : activeFilter === 'upcoming' ? 'upcoming' : ''} promotions at the moment.
            </p>
            <button
              onClick={() => setActiveFilter('all')}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-medium inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Show All Promotions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}