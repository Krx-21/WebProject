'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import { getAllRcps } from '@/services/rcp.service';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Provider {
  _id: string;
  name: string;
  address: string;
  district?: string;
  province?: string;
}

interface PromotionFormProps {
  initialData?: {
    title: string;
    description: string;
    discountPercentage: number;
    maxDiscountAmount: number;
    minPurchaseAmount: number;
    startDate: string;
    endDate: string;
    provider?: string;
    amount?: number;
  };
  promotionId?: string;
  onSuccess?: () => void;
}

export default function PromotionForm({ initialData, promotionId, onSuccess }: PromotionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    discountPercentage: initialData?.discountPercentage || 0,
    maxDiscountAmount: initialData?.maxDiscountAmount || 0,
    minPurchaseAmount: initialData?.minPurchaseAmount || 0,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    provider: initialData?.provider || '',
    amount: initialData?.amount || 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
      setIsAdmin(true);
      fetchProviders();
    }
  }, []);

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await getAllRcps();
      if (response.success && response.data) {
        const providersData = Array.isArray(response.data) ? response.data : [];
        console.log('Providers data:', providersData);
        setProviders(providersData);
      } else {
        console.error('Failed to fetch providers:', response.error);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: date ? date.toISOString() : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = getCurrentUser();
    if (!user || !user.token) {
      setError('User not authenticated');
      return;
    }

    if (user.role === 'admin' && !formData.provider) {
      setError('Please select a provider for this promotion');
      return;
    }

    setLoading(true);

    try {

      const formattedData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        provider: formData.provider || undefined,
        amount: formData.amount
      };

      console.log('Sending promotion data:', formattedData);

      const url = promotionId
        ? API_ENDPOINTS.promotions.update(promotionId)
        : API_ENDPOINTS.promotions.create;

      const response = await fetch(url, {
        method: promotionId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to save promotion');
      }

      if (onSuccess) {
        onSuccess();
      }

      if (!promotionId) {
        router.push('/admin/promotions');
      }

      router.refresh();
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the promotion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'discountPercentage' || name === 'maxDiscountAmount' || name === 'minPurchaseAmount'
        ? parseFloat(value) || 0
        : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-800 dark:text-gray-200 font-medium">
          Title
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                     text-gray-800 dark:text-gray-100 placeholder-gray-500
                     dark:placeholder-gray-400 focus:ring-2 focus:ring-primary
                     dark:focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-800 dark:text-gray-200 font-medium">
          Description
        </Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                     text-gray-800 dark:text-gray-100 placeholder-gray-500
                     dark:placeholder-gray-400 focus:ring-2 focus:ring-primary
                     dark:focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Discount Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountPercentage" className="text-gray-800 dark:text-gray-200 font-medium">
            Discount Percentage (%)
          </Label>
          <Input
            id="discountPercentage"
            name="discountPercentage"
            type="number"
            min="0"
            max="100"
            value={formData.discountPercentage}
            onChange={handleChange}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                       text-gray-800 dark:text-gray-100 placeholder-gray-500
                       dark:placeholder-gray-400 focus:ring-2 focus:ring-primary
                       dark:focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxDiscountAmount" className="text-gray-800 dark:text-gray-200 font-medium">
            Max Discount Amount (฿)
          </Label>
          <Input
            id="maxDiscountAmount"
            name="maxDiscountAmount"
            type="number"
            min="0"
            value={formData.maxDiscountAmount}
            onChange={handleChange}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                       text-gray-800 dark:text-gray-100 placeholder-gray-500
                       dark:placeholder-gray-400 focus:ring-2 focus:ring-primary
                       dark:focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPurchaseAmount" className="text-gray-800 dark:text-gray-200 font-medium">
            Min Purchase Amount (฿)
          </Label>
          <Input
            id="minPurchaseAmount"
            name="minPurchaseAmount"
            type="number"
            min="0"
            value={formData.minPurchaseAmount}
            onChange={handleChange}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                       text-gray-800 dark:text-gray-100 placeholder-gray-500
                       dark:placeholder-gray-400 focus:ring-2 focus:ring-primary
                       dark:focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount" className="text-gray-800 dark:text-gray-200 font-medium">
            Available Quantity
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="1"
            value={formData.amount}
            onChange={handleChange}
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600
                       text-gray-800 dark:text-gray-100 placeholder-gray-500
                       dark:placeholder-gray-400 focus:ring-2 focus:ring-primary
                       dark:focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Provider Selection - Only for Admin */}
      {isAdmin && (
        <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800/30">
          <Label htmlFor="provider" className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Select Provider
          </Label>
          {loadingProviders ? (
            <div className="flex items-center space-x-2 py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-slate-600 dark:text-slate-300">Loading providers...</span>
            </div>
          ) : (
            <>
              <select
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-white dark:bg-gray-800
                         border border-gray-300 dark:border-gray-600
                         text-gray-800 dark:text-gray-100
                         focus:ring-2 focus:ring-primary dark:focus:ring-blue-500
                         hover:border-primary dark:hover:border-blue-400"
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option key={provider._id} value={provider._id}>
                    {provider.name} - {provider.address}
                    {provider.district && `, ${provider.district}`}
                    {provider.province && `, ${provider.province}`}
                  </option>
                ))}
              </select>
              {formData.provider && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Selected Provider ID: {formData.provider}
                </div>
              )}
            </>
          )}
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            As an admin, you can create promotions for specific providers.
          </p>
        </div>
      )}

      {/* Date Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-gray-800 dark:text-gray-200 font-medium">
            Start Date
          </Label>
          <DatePicker
            selected={formData.startDate ? new Date(formData.startDate) : null}
            onChange={(date) => handleDateChange('startDate', date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            className="w-full p-2 rounded-md bg-white dark:bg-gray-800
                     border border-gray-300 dark:border-gray-600
                     text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-primary dark:focus:ring-blue-500
                     hover:border-primary dark:hover:border-blue-400
                     cursor-pointer"
            placeholderText="Select start date"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-gray-800 dark:text-gray-200 font-medium">
            End Date
          </Label>
          <DatePicker
            selected={formData.endDate ? new Date(formData.endDate) : null}
            onChange={(date) => handleDateChange('endDate', date)}
            dateFormat="dd/MM/yyyy"
            minDate={formData.startDate ? new Date(formData.startDate) : new Date()}
            className="w-full p-2 rounded-md bg-white dark:bg-gray-800
                     border border-gray-300 dark:border-gray-600
                     text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-primary dark:focus:ring-blue-500
                     hover:border-primary dark:hover:border-blue-400
                     cursor-pointer"
            placeholderText="Select end date"
            required
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        {/* Cancel Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-2 border-gray-300 dark:border-gray-600
                   text-gray-700 dark:text-gray-300
                   hover:bg-gray-50 dark:hover:bg-gray-700/50
                   transition-all duration-200"
        >
          Cancel
        </Button>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700
                   dark:bg-blue-500 dark:hover:bg-blue-600
                   text-white font-medium shadow-sm
                   hover:shadow-md disabled:opacity-50
                   disabled:cursor-not-allowed
                   transition-all duration-200"
        >
          {loading ? 'Saving...' : promotionId ? 'Update Promotion' : 'Create Promotion'}
        </Button>
      </div>
    </form>
  );
}