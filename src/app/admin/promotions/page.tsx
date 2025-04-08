'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Promotion } from '@/types/promotion';

export default function PromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'provider' | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'admin' || user.role === 'provider') {
      setUserRole(user.role);
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

      const response = await fetch(API_ENDPOINTS.promotions.getAll, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        //credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch promotions');
      }

      const data = await response.json();
      if (data.success) {
        setPromotions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch promotions');
      }
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Promotions</h1>
        <Button onClick={() => router.push('/admin/promotions/new')}>
          Create New Promotion
        </Button>
      </div>

      <div className="grid gap-6">
        {promotions.map((promotion) => {
          const status = getPromotionStatus(promotion.startDate, promotion.endDate);
          return (
            <div
              key={promotion._id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{promotion.title}</h2>
                  <p className="text-gray-600 mb-4">{promotion.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Discount</p>
                      <p className="font-medium">{promotion.discountPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max Discount</p>
                      <p className="font-medium">${promotion.maxDiscountAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Min Purchase</p>
                      <p className="font-medium">${promotion.minPurchaseAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className={`font-medium ${status.color}`}>
                        {status.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Valid from {formatDate(promotion.startDate)} to {formatDate(promotion.endDate)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/promotions/${promotion._id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(promotion._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}