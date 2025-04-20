'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car } from "@/types/Car";
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import ImageUploader from '@/components/ImageUploader';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Convertible' | 'Van' | 'Coupe' | 'Wagon' | 'Minivan';
type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'Plug-in Hybrid' | 'Natural Gas' | 'Hydrogen';

const CAR_TYPES: CarType[] = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van', 'Coupe', 'Wagon', 'Minivan'];
const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'Natural Gas', 'Hydrogen'];

interface ValidationErrors {
  brand?: string;
  model?: string;
  topSpeed?: string;
  year?: string;
  pricePerDay?: string;
  seatingCapacity?: string;
  image?: string;
  fuelType?: string;
  carDescription?: string;
}



export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const [car, setCar] = useState<Omit<Car, '_id' | '__v' | 'id' | 'postedDate'> | null>(null);
  const [initailImages, setInitialImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Car, '_id' | '__v' | 'id' | 'postedDate'>>({
    brand: '',
    model: '',
    type: 'Sedan',
    topSpeed: 0,
    fuelType: '',
    seatingCapacity: 1,
    year: new Date().getFullYear(),
    pricePerDay: 0,
    provider: { _id: "", name: "", address: "", district: "", province: "", postalCode: "", tel: "", region: "", user: "", __v: 0, id: "" },
    carDescription: '',
    image: [],
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.cars.getOne(carId), {
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
        if (!data.success || !data.data) {
          throw new Error(data.message || 'Failed to fetch car details');
        }

        setCar(data.data);
        setFormData({
          brand: data.data.brand,
          model: data.data.model,
          type: data.data.type,
          topSpeed: data.data.topSpeed,
          fuelType: data.data.fuelType,
          seatingCapacity: data.data.seatingCapacity,
          year: data.data.year,
          pricePerDay: data.data.pricePerDay,
          provider: data.data.provider,
          carDescription: data.data.carDescription,
          image: data.data.image,
        });
        setInitialImages(data.data.image);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  const deleteImageFromDataBase = async () => {
    if (initailImages.length === 0 || initailImages.length <= formData.image.length) {
      return;
    }

    const idsToDelete = initailImages.filter(id => !formData.image.includes(id));
    if (idsToDelete.length === 0) {
      return;
    }

    console.log("Deleting images:", idsToDelete);

    try {
      const user = getCurrentUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const response = await fetch(API_ENDPOINTS.images.delete, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ ids: idsToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Failed to delete images: ${errorData?.message || response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log('Images deleted successfully:', data);
    } catch (err) {
      console.error('Error deleting images:', err);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (e.target instanceof HTMLTextAreaElement) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === 'type') {
      setFormData(prev => ({ ...prev, [name]: value as CarType}));
    } else if (name === 'fuelType') {
      setFormData(prev => ({ ...prev, [name]: value as FuelType}));
    } else if (type === 'number') {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        return;
      }
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.brand.trim()) {
      errors.brand = 'Brand is required';
    }

    if (!formData.model.trim()) {
      errors.model = 'Model is required';
    }

    if (formData.topSpeed <= 0) {
      errors.topSpeed = 'Top speed must be greater than 0';
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      errors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }

    if (formData.pricePerDay <= 0) {
      errors.pricePerDay = 'Price must be greater than 0';
    }

    if (formData.seatingCapacity < 1 || formData.seatingCapacity > 50) {
      errors.seatingCapacity = 'Seating capacity must be between 1 and 50';
    }

    if (formData.image.length === 0) {
      errors.image = 'At least one image is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorElement = document.querySelector('.text-red-500');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    setError(null);

    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    } if (user.role !== 'admin' && user.role !== 'provider') {
      router.push('/');
      return;
    }
    try {
      console.log('Submitting car update for ID:', carId);

      const logData = { ...formData };
      if (logData.image && logData.image.length > 0) {
        logData.image = [`${logData.image.length} images`];
      }
      console.log('Form data being submitted:', logData);

      const response = await fetch(API_ENDPOINTS.cars.update(carId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response from server:', text.substring(0, 500));
        throw new Error(`Server returned non-JSON response with status ${response.status}`);
      }

      const data = await response.json().catch(e => {
        console.error('Error parsing response JSON:', e);
        return null;
      });

      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data?.message || `HTTP error! status: ${response.status}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Failed to update car - No success response from server');
      }

      console.log('Car updated successfully!');
      await deleteImageFromDataBase();

      alert('Car updated successfully!');
      router.push('/admin/cars');
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the car');

      const errorElement = document.querySelector('.text-red-500');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 relative">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-200 dark:border-indigo-900/30 opacity-25"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Loading Car Details</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Please wait while we fetch the car information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
          <div className="text-center mb-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Error Occurred
            </h2>
            <p className="text-red-500 dark:text-red-400">
              {error}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Go Back
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
          <div className="text-center mb-6">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Car Not Found
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              We couldn&apos;t find the car you&apos;re looking for.
            </p>
          </div>
          <Button
            onClick={() => router.push('/admin/cars')}
            className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white"
          >
            Back to Cars
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 px-4 py-8">
      <div className="container max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Edit Car
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Update the details for this car listing
            </p>
          </div>

          <Link href="/admin/cars" className="flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cars
          </Link>
        </div>

        {/* Form Section */}
        <Card className="shadow-xl border-slate-200 dark:border-slate-700 overflow-hidden">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
              Car Details
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Edit the information about the car
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form id="car-form" className="space-y-6" onSubmit={handleSubmit}>
              {/* Brand and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-slate-700 dark:text-slate-300">
                    Brand
                  </Label>
                  <Input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g. Toyota, Honda, BMW"
                    className="border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {validationErrors.brand && (
                    <p className="text-red-500 text-sm">{validationErrors.brand}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-slate-700 dark:text-slate-300">
                    Model
                  </Label>
                  <Input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. Camry, Civic, X5"
                    className="border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {validationErrors.model && (
                    <p className="text-red-500 text-sm">{validationErrors.model}</p>
                  )}
                </div>
              </div>

              {/* Type and Top Speed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-slate-700 dark:text-slate-300">
                    Car Type
                  </Label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors duration-200"
                  >
                    {CAR_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topSpeed" className="text-slate-700 dark:text-slate-300">
                    Top Speed (km/h)
                  </Label>
                  <Input
                    type="number"
                    id="topSpeed"
                    name="topSpeed"
                    value={formData.topSpeed}
                    onChange={handleChange}
                    min="0"
                    max="500"
                    className="border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {validationErrors.topSpeed && (
                    <p className="text-red-500 text-sm">{validationErrors.topSpeed}</p>
                  )}
                </div>
              </div>

              {/* Fuel Type and Seating Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fuelType" className="text-slate-700 dark:text-slate-300">
                    Fuel Type
                  </Label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors duration-200"
                  >
                    {FUEL_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {validationErrors.fuelType && (
                    <p className="text-red-500 text-sm">{validationErrors.fuelType}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seatingCapacity" className="text-slate-700 dark:text-slate-300">
                    Seating Capacity
                  </Label>
                  <Input
                    type="number"
                    id="seatingCapacity"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {validationErrors.seatingCapacity && (
                    <p className="text-red-500 text-sm">{validationErrors.seatingCapacity}</p>
                  )}
                </div>
              </div>

              {/* Year and Price Per Day */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-slate-700 dark:text-slate-300">
                    Year of Manufacture
                  </Label>
                  <Input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                  {validationErrors.year && (
                    <p className="text-red-500 text-sm">{validationErrors.year}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerDay" className="text-slate-700 dark:text-slate-300">
                    Price Per Day (฿)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">฿</span>
                    <Input
                      type="number"
                      id="pricePerDay"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      min="0"
                      className="pl-7 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>
                  {validationErrors.pricePerDay && (
                    <p className="text-red-500 text-sm">{validationErrors.pricePerDay}</p>
                  )}
                </div>
              </div>

              {/* Provider Information */}
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-slate-700 dark:text-slate-300">
                  Car Rental Provider
                </Label>
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formData.provider.name}
                    </span>
                  </div>
                  {formData.provider.address && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 ml-7">
                      {formData.provider.address}
                      {formData.provider.district && `, ${formData.provider.district}`}
                      {formData.provider.province && `, ${formData.provider.province}`}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Provider information cannot be changed here.</p>
              </div>

              {/* Car Description */}
              <div className="space-y-2">
                <Label htmlFor="carDescription" className="text-slate-700 dark:text-slate-300">
                  Car Description
                </Label>
                <Textarea
                  id="carDescription"
                  name="carDescription"
                  value={formData.carDescription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the car's features, condition, and any special notes..."
                  className="resize-none border-slate-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
                {validationErrors.carDescription && (
                  <p className="text-red-500 text-sm">{validationErrors.carDescription}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <ImageUploader setFormData={setFormData} formData={formData}/>
                {validationErrors.image && (
                  <p className="text-red-500 text-sm mt-2">{validationErrors.image}</p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className={`w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Car...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Update Car
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="border-t border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-6 py-4">
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/cars')}
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="car-form"
                disabled={submitting}
                className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white"
              >
                {submitting ? 'Updating Car...' : 'Update Car'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 relative">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-200 dark:border-indigo-900/30 opacity-25"></div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Updating Car</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Please wait while we process your information...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}