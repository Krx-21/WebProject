'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from "@/types/Car";
import { API_ENDPOINTS } from "@/config/api";
import { Provider } from "@/types/Provider";
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
  provider?: string;
  image?: string;
  fuelType?: string;
  carDescription?: string;
}

export default function NewCarPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<Omit<Car, '_id' | '__v' | 'id' | 'postedDate'>>({
    brand: '',
    model: '',
    type: 'Sedan',
    topSpeed: 180,
    fuelType: 'Petrol',
    seatingCapacity: 5,
    year: new Date().getFullYear(),
    pricePerDay: 1000,
    provider: provider ? provider : { _id: "", name: "", address: "", district: "", province: "", postalCode: "", tel: "", region: "", user: "", __v: 0, id: "" },
    carDescription: '',
    image: [],
  });
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'provider') {
      router.push('/');
      return;
    }

    if (user.role === 'provider') {
      fetchMe();
    } else if (user.role === 'admin') {
      fetchProviders();
    }
  }, [router]);
  const fetchMe = async () => {
    const me = await fetch(API_ENDPOINTS.auth.getme, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`,
      },
    });
    if (!me.ok) {
      if (me.status === 401) {
        router.push('/login');
        return;
      }

      const contentType = me.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await me.json();
          throw new Error(errorData?.message || 'Failed to fetch user data');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
          throw new Error(`Server error: ${me.status} ${me.statusText}`);
        }
      } else {
        throw new Error(`Failed to fetch user data: ${me.status} ${me.statusText}`);
      }
    }

    // Check if the response is JSON before trying to parse it
    const contentType = me.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response format from server');
    }

    const meData = await me.json();
    if (meData.data.role === 'provider') {
      console.log('Provider:', meData.data);
      // setProvider(meData.data);
      fetchProvider(meData.data.myRcpId);
    }
  };

  // The useEffect for fetching data has been moved above



  const fetchProvider = async (proID: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.rentalCarProviders.getOne(proID), {
        method: 'GET',
      });
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData?.message || 'Failed to fetch provider');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        } else {
          throw new Error(`Failed to fetch provider: ${response.status} ${response.statusText}`);
        }
      }

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      setProvider(data.data);
      setFormData(prev => ({ ...prev, provider: data.data }));
    } catch (err) {
      console.error('Error fetching provider:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };                

  const fetchProviders = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.rentalCarProviders.getAll);
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData?.message || 'Failed to fetch providers');
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        } else {
          throw new Error(`Failed to fetch providers: ${response.status} ${response.statusText}`);
        }
      }

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      setProviders(data.data);
      setProvider(data.data[0]);
      if (data.data.length > 0) {
        setFormData(prev => ({ ...prev, provider: data.data[0] }));
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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

  const handleProviderChange = (providerId: string) => {
    const selectedProvider = providers.find(p => p._id === providerId);
    if (selectedProvider) {
      setFormData(prev => ({ ...prev, provider: selectedProvider }));

      if (validationErrors.provider) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.provider;
          return newErrors;
        });
      }
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

    if (!formData.provider._id) {
      errors.provider = 'Provider is required';
    }

    if (formData.image.length === 0) {
      errors.image = 'At least one image is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const providerId = formData.provider._id;
    try {
      const response = await fetch(API_ENDPOINTS.cars.create(providerId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        console.log("car images:", formData.image);
        console.log('status not ok => Response:', response);

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData?.message || 'Failed to create car');
          } catch (_jsonError) {
            console.error('Error parsing JSON response:', _jsonError);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
          }
        } else {
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      router.push('/admin/cars');
    } catch (err) {
      console.error('Error creating car:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!provider && providers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg className="h-8 w-8 text-amber-600 dark:text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">No Providers Available</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              You need to add a provider before you can create a car listing.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center pb-6 pt-2">
            <Button
              onClick={() => router.push('/admin/providers/new')}
              className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Provider
            </Button>
          </CardFooter>
        </Card>
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
              Create New Car
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Fill in the details below to create a new car listing
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
              Enter the information about the car you want to list
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
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-slate-700 dark:text-slate-300">
                  Car Rental Provider
                </Label>

                {providers.length > 0 ? (
                  <div>
                    <select
                      id="provider"
                      name="provider"
                      value={formData.provider._id}
                      onChange={(e) => handleProviderChange(e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors duration-200"
                    >
                      {providers.map(provider => (
                        <option key={provider._id} value={provider._id}>
                          {provider.name} - {provider.address}
                          {provider.district && `, ${provider.district}`}
                          {provider.province && `, ${provider.province}`}
                        </option>
                      ))}
                    </select>
                    {validationErrors.provider && (
                      <p className="text-red-500 text-sm">{validationErrors.provider}</p>
                    )}
                  </div>
                ) : (
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
                )}
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
              {errorMessage && (
                <Alert variant="destructive" className="mt-4">
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Car...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Car
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
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white"
              >
                {loading ? 'Creating Car...' : 'Create Car'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 relative">
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-200 dark:border-indigo-900/30 opacity-25"></div>
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-600 dark:border-t-indigo-400 animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Creating Car</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Please wait while we process your information...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}