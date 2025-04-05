'use client';

import { useEffect, useState } from 'react';
import { Promotion } from '@/types/promotion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { API_ENDPOINTS } from '@/config/api';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/services/auth.service';

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.promotions.getAll, {
          credentials: 'include',
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
          throw new Error(data.message || 'Failed to fetch promotions');
        }
        
        setPromotions(data.data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      const user = getCurrentUser();
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.promotions.delete(id), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete promotion');
      }

      setPromotions(promotions.filter(promotion => promotion._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete promotion');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <p className="text-lg mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promotion) => (
          <Card key={promotion._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{promotion.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{promotion.description}</p>
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">
                  {promotion.discountPercentage}% Discount
                </p>
                <p className="text-sm text-gray-500">
                  Max Discount: ${promotion.maxDiscountAmount}
                </p>
                <p className="text-sm text-gray-500">
                  Min Purchase: ${promotion.minPurchaseAmount}
                </p>
                <div className="text-sm text-gray-500">
                  <p>Valid from: {format(new Date(promotion.startDate), 'MMM dd, yyyy')}</p>
                  <p>Valid until: {format(new Date(promotion.endDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 