'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { API_ENDPOINTS } from '@/config/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Promotion } from '@/types/promotion';

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

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.promotions.getAll);
        if (!response.ok) {
          throw new Error('Failed to fetch promotions');
        }
        const data = await response.json();
        setPromotions(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="container-base max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 
                       dark:from-slate-200 dark:via-slate-300 dark:to-slate-400
                       bg-clip-text text-transparent mb-4">
            Current Promotions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover our latest deals and special offers
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => {
            const status = getPromotionStatus(promotion.startDate, promotion.endDate);
            return (
              <div
                key={promotion._id}
                className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg
                         border border-slate-200 dark:border-slate-700 
                         transition-all duration-300 hover:scale-[1.01]
                         overflow-hidden"
              >
                {/* Header Design */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-slate-50 
                              dark:from-slate-800 dark:to-slate-700 p-6">
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium
                                ${status.status === 'Active' 
                                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400' 
                                  : status.status === 'Upcoming'
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                    {status.status}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8">
                    {promotion.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {promotion.description}
                  </p>
                </div>

                {/* Details Design */}
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-indigo-50/50 dark:bg-indigo-900/10 
                                 rounded-lg border border-indigo-100 dark:border-indigo-800/20">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Discount</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {promotion.discountPercentage}%
                      </p>
                    </div>
                    <div className="text-center p-4 bg-teal-50/50 dark:bg-teal-900/10 
                                 rounded-lg border border-teal-100 dark:border-teal-800/20">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Max Savings</p>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        ${promotion.maxDiscountAmount}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Minimum purchase: ${promotion.minPurchaseAmount}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Valid from {formatDate(promotion.startDate)} to {formatDate(promotion.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl
                         border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              No Active Promotions
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Check back later for new deals and offers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}