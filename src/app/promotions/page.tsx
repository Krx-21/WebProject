'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_ENDPOINTS } from '@/config/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Promotion } from '@/types/promotion';

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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Available Promotions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <Card key={promotion._id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow dark:border-gray-700 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{promotion.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{promotion.description}</p>
                <div className="space-y-2">
                  <p className="text-green-600 dark:text-green-400 font-semibold">
                    {promotion.discountPercentage}% Discount
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Max Discount: ${promotion.maxDiscountAmount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Min Purchase: ${promotion.minPurchaseAmount}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>Valid from: {format(new Date(promotion.startDate), 'MMM dd, yyyy')}</p>
                    <p>Valid until: {format(new Date(promotion.endDate), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}