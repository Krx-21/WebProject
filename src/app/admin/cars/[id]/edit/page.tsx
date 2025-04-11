'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car } from "@/types/Car";
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service'; 

type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Convertible' | 'Van';
type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';

interface ValidationErrors {
  brand?: string;
  model?: string;
  topSpeed?: string;
  year?: string;
  pricePerDay?: string;
  seatingCapacity?: string;
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  [key: string]: any;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md
          bg-white dark:bg-gray-800 
          border-gray-300 dark:border-gray-600
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400
          hover:border-blue-400 dark:hover:border-blue-500
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          dark:focus:ring-blue-400 dark:focus:border-blue-400
          transition-colors duration-200
          ${error ? 'border-red-500 dark:border-red-500' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const [car, setCar] = useState<Omit<Car, '_id' | '__v' | 'id' | 'postedDate'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Car, '_id' | '__v' | 'id' | 'postedDate'> & { type: CarType; fuelType: FuelType }>({
    brand: '',
    model: '',
    type: 'Sedan',
    topSpeed: 0,
    fuelType: 'Petrol',
    seatingCapacity: 1,
    year: new Date().getFullYear(),
    pricePerDay: 0,
    provider: { _id: "", name: "", address: "", district: "", province: "", postalCode: "", tel: "", region: "", user: "", __v: 0, id: "" },
    carDescription: '',
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
        });
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching car details');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (e.target instanceof HTMLTextAreaElement) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === 'type' || name === 'fuelType') {
      setFormData(prev => ({ ...prev, [name]: value as CarType | FuelType }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
  
    if (formData.year < 1900 || formData.year > new Date().getFullYear()) {
      errors.year = 'Invalid year';
    }
  
    if (formData.pricePerDay <= 0) {
      errors.pricePerDay = 'Price must be greater than 0';
    }
  
    if (formData.seatingCapacity < 1) {
      errors.seatingCapacity = 'Seating capacity must be at least 1';
    }
  
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      const response = await fetch(API_ENDPOINTS.cars.update(carId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update car');
      }

      router.push('/admin/cars');
    } catch (err) {
      console.error('Update error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating the car');
    } finally {
      setLoading(false);
    }
  };

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
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Error Occurred
          </h2>
          <p className="text-red-500 dark:text-red-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Car not found
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
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
                      border border-gray-200 dark:border-gray-700
                      transform transition-all duration-300 hover:shadow-lg">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700
                              bg-clip-text text-transparent">
            Edit Car
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update the car details below
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg
                      border border-gray-200 dark:border-gray-700
                      hover:shadow-xl transition-all duration-200">
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Car Details
            </h2>
          </div>
 
          <div className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-8">
                {/* Brand & Model Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      error={validationErrors.brand}
                      required
                    />
                    <FormInput
                      label="Model"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      error={validationErrors.model}
                      required
                    />
                  </div>
                </div>

                {/* Technical Details Section */}
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Technical Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md
                          bg-white dark:bg-gray-800 
                          border-gray-300 dark:border-gray-600
                          text-gray-900 dark:text-gray-100
                          hover:border-blue-400 dark:hover:border-blue-500
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          dark:focus:ring-blue-400 dark:focus:border-blue-400
                          transition-colors duration-200"
                      >
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Truck">Truck</option>
                        <option value="Convertible">Convertible</option>
                        <option value="Van">Van</option>
                      </select>
                    </div>
                    <FormInput
                      label="Top Speed"
                      name="topSpeed"
                      type="number"
                      value={formData.topSpeed}
                      onChange={handleChange}
                      error={validationErrors.topSpeed}
                    />
                    <div>
                      <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fuel Type
                      </label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md
                          bg-white dark:bg-gray-800 
                          border-gray-300 dark:border-gray-600
                          text-gray-900 dark:text-gray-100
                          hover:border-blue-400 dark:hover:border-blue-500
                          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                          dark:focus:ring-blue-400 dark:focus:border-blue-400
                          transition-colors duration-200"
                      >
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <FormInput
                      label="Seating Capacity"
                      name="seatingCapacity"
                      type="number"
                      value={formData.seatingCapacity}
                      onChange={handleChange}
                      error={validationErrors.seatingCapacity}
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  error={validationErrors.year}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
                <FormInput
                  label="Price Per Day"
                  name="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  error={validationErrors.pricePerDay}
                  min="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provider ID
                </label>
                <input
                  className="mt-1 block w-full border-gray-300 rounded-md 
                    dark:bg-gray-900 dark:text-gray-100
                    hover:border-blue-400 dark:hover:border-blue-500
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    dark:focus:ring-blue-400 dark:focus:border-blue-400
                    transition-colors duration-200"
                  type="text"
                  id="provider"
                  name="provider"
                  value={formData.provider._id}
                  readOnly 
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provider ID cannot be changed here.</p>
              </div>

              <div>
                <label htmlFor="carDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="carDescription"
                  name="carDescription"
                  value={formData.carDescription}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md
                    bg-white dark:bg-gray-800 
                    border-gray-300 dark:border-gray-600
                    text-gray-900 dark:text-gray-100
                    hover:border-blue-400 dark:hover:border-blue-500
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    dark:focus:ring-blue-400 dark:focus:border-blue-400
                    transition-colors duration-200"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-2 
                  bg-blue-600 text-white py-3 rounded-md
                  hover:bg-blue-700 transition duration-200 
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{loading ? 'Updating Car...' : 'Update Car'}</span>
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 
                  border-l-4 border-red-500 rounded-r-lg
                  transform transition-all duration-300 hover:translate-x-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}