'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PromotionForm from '@/components/PromotionForm';
import { Promotion } from '@/types/promotion';
import { API_ENDPOINTS } from '@/config/api';

export default function EditPromotionPage() {
  const params = useParams();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.promotions.getOne(params.id as string), {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch promotion');
        }
        
        setPromotion(data.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching promotion');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full
                      border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Error Occurred
          </h2>
          <p className="text-red-500 dark:text-red-400 mb-6">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-blue-600 
                     dark:hover:bg-blue-700 text-white rounded-lg transition-colors 
                     duration-200 font-medium shadow-sm hover:shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg
                      border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Promotion not found
            </p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 
                       dark:text-gray-300 rounded-lg hover:bg-gray-200 
                       dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="container-base max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
                      border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 
                       bg-clip-text text-transparent">
            Edit Promotion
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update the promotion details below
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                      border border-gray-200 dark:border-gray-700
                      hover:shadow-xl transition-all duration-200">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Promotion Details
            </h2>
          </div>
          
          <div className="p-6">
            <PromotionForm
              initialData={{
                title: promotion.title,
                description: promotion.description,
                discountPercentage: promotion.discountPercentage,
                maxDiscountAmount: promotion.maxDiscountAmount,
                minPurchaseAmount: promotion.minPurchaseAmount,
                startDate: promotion.startDate,
                endDate: promotion.endDate,
              }}
              promotionId={promotion._id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}