'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PromotionForm from '@/components/PromotionForm';
import { Promotion } from '@/types/promotion';
import { API_ENDPOINTS } from '@/config/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function EditPromotionPage() {
  const params = useParams();
  const router = useRouter();
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
        <div className="container-base max-w-4xl mx-auto">
          {/* Header Section - Skeleton */}
          <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm
                        border border-gray-200 dark:border-gray-700">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
          </div>

          {/* Form Section - Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg
                        border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>

            <div className="p-6 space-y-6">
              {/* Form fields skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                </div>
              ))}

              {/* Buttons skeleton */}
              <div className="flex justify-end space-x-4 pt-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
        <div className="container-base max-w-4xl mx-auto">
          <Card className="border-red-200 dark:border-red-800/30 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-red-700 dark:text-red-400">Error Occurred</CardTitle>
              <CardDescription className="text-red-600 dark:text-red-300">
                There was a problem loading the promotion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/promotions')}
              >
                Back to Promotions
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Retry
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
        <div className="container-base max-w-4xl mx-auto">
          <Card className="border-amber-200 dark:border-amber-800/30 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl text-amber-700 dark:text-amber-400">Promotion Not Found</CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-300">
                The promotion you're looking for could not be found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-amber-500 dark:text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => router.push('/admin/promotions')}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Back to Promotions
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-4 py-8">
      <div className="container-base max-w-4xl mx-auto">
        <nav className="flex mb-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Dashboard
          </Link>
          <span className="mx-2">›</span>
          <Link href="/admin/promotions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Promotions
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">Edit</span>
        </nav>

        {updateSuccess && (
          <Alert variant="success" className="mb-6 animate-fadeIn">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              The promotion has been updated successfully.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-8 border-blue-100 dark:border-blue-900/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              Edit Promotion
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
              Update the promotion details below
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Promotion Details
            </CardTitle>
            <CardDescription>
              ID: {promotion._id}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <PromotionForm
              initialData={{
                title: promotion.title,
                description: promotion.description,
                discountPercentage: promotion.discountPercentage,
                maxDiscountAmount: promotion.maxDiscountAmount,
                minPurchaseAmount: promotion.minPurchaseAmount,
                startDate: promotion.startDate,
                endDate: promotion.endDate,
                provider: promotion.provider && typeof promotion.provider === 'object'
                  ? promotion.provider._id
                  : promotion.provider,
                amount: promotion.amount
              }}
              promotionId={promotion._id}
              onSuccess={() => setUpdateSuccess(true)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}