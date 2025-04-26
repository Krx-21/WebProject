'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Promotion, getAllPromotions, getProviderDetails } from '@/services/promotion.service';

interface PromotionWithProviderName extends Promotion {
  providerName?: string;
}

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PromotionWithProviderName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'admin' || user.role === 'provider') {
      fetchPromotions();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchPromotions = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const response = await getAllPromotions();
      if (!response.success || !response.data) {
        if (response.error === 'Authentication required') {
          router.push('/login');
          return;
        }
        throw new Error(response.error || 'Failed to fetch promotions');
      }

      const promotionsWithProviders = await Promise.all(
        response.data.map(async (promotion) => {
          let providerName = 'Unknown Provider';

          if (promotion.provider) {
            if (typeof promotion.provider === 'object' && promotion.provider.name) {
              providerName = promotion.provider.name;
            }
            else if (typeof promotion.provider === 'string') {
              const providerResponse = await getProviderDetails(promotion.provider);
              if (providerResponse.success && providerResponse.data) {
                providerName = providerResponse.data.name || 'Unknown Provider';
              }
            }
          }

          return {
            ...promotion,
            providerName
          };
        })
      );

      setPromotions(promotionsWithProviders);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const user = getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.promotions.delete(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to delete promotion');
      }

      const data = await response.json();
      if (data.success) {
        alert('Promotion deleted successfully');
        setPromotions(promotions.filter(p => p._id !== id));
      } else {
        throw new Error(data.message || 'Failed to delete promotion');
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete promotion');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPromotionStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return { status: 'Upcoming', color: 'text-blue-600' };
    } else if (now > end) {
      return { status: 'Expired', color: 'text-red-600' };
    } else {
      return { status: 'Active', color: 'text-green-600' };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchPromotions()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="container-base max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-blue-700 bg-clip-text text-transparent">
            Manage Promotions
          </h1>
          <Button
            onClick={() => router.push('/admin/promotions/new')}
            className="btn-primary hover:scale-105 transition-transform duration-200"
          >
            Create New Promotion
          </Button>
        </div>

        <div className="grid gap-8">
          {promotions.map((promotion) => {
            const status = getPromotionStatus(promotion.startDate, promotion.endDate);
            return (
              <div
                key={promotion._id}
                className="card-premium group hover:scale-[1.01] transition-all duration-200
                         bg-white dark:bg-gray-800 border border-gray-200
                         dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl
                         p-6 relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium
                              ${status.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                                status.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                  {status.status}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="space-y-6 flex-1">
                    {/* Title and Description */}
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {promotion.title || 'Unnamed Promotion'}
                      </h2>
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-pink-600 dark:text-pink-400 mr-2">Provider:</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md">
                          {promotion.providerName}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {promotion.description}
                      </p>
                    </div>

                    {/* Promotion Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50
                                  dark:from-blue-900/20 dark:to-blue-800/20
                                  p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Discount
                        </p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {promotion.discountPercentage}%
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50
                                  dark:from-green-900/20 dark:to-green-800/20
                                  p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Max Discount
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${promotion.maxDiscountAmount}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50
                                  dark:from-purple-900/20 dark:to-purple-800/20
                                  p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Min Purchase
                        </p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          ${promotion.minPurchaseAmount}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50
                                  dark:from-gray-900/20 dark:to-gray-800/20
                                  p-4 rounded-lg backdrop-blur-sm">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Valid Period
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200" >
                          {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3 justify-end">
                    <Button
                      variant="outline"
                      data-testid={`edit-btn-${promotion._id}`}
                      onClick={() => router.push(`/admin/promotions/${promotion._id}/edit`)}
                      className="flex-1 lg:flex-none px-6 py-2 border-2 border-blue-500
                                text-blue-600 dark:text-blue-400 dark:border-blue-400
                                hover:bg-blue-50 dark:hover:bg-blue-900/20
                                hover:border-blue-600 dark:hover:border-blue-300
                                transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      data-testid={`delete-btn-${promotion._id}`}
                      onClick={() => handleDelete(promotion._id)}
                      className="flex-1 lg:flex-none px-6 py-2 bg-red-500 hover:bg-red-600
                                dark:bg-red-600/90 dark:hover:bg-red-500
                                text-white shadow-sm hover:shadow-md
                                transition-all duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {promotions.length === 0 && (
            <div className="card-base text-center py-12 bg-white dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No promotions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}