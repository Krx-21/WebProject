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
          //credentials: 'include',
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

  if (!promotion) {
    return <div className="flex justify-center items-center min-h-screen">Promotion not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Promotion</h1>
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
  );
} 