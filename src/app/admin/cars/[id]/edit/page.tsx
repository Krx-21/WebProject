'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car } from "@/types/Car";
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service'; 

type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Convertible' | 'Van';
type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';

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
                      border border-gray-200 dark:border-gray-700">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Brand
                  </label>
                  <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Model
                  </label>
                  <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Truck">Truck</option>
                    <option value="Convertible">Convertible</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="topSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top Speed
                  </label>
                  <input type="number" id="topSpeed" name="topSpeed" value={formData.topSpeed} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fuel Type
                  </label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="seatingCapacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seating Capacity
                  </label>
                  <input type="number" id="seatingCapacity" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} min="1" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Year
                  </label>
                  <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} min="1900" max={new Date().getFullYear()} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price Per Day
                  </label>
                  <input type="number" id="pricePerDay" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} min="0" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provider ID
                </label>
                <input
                  type="text"
                  id="provider"
                  name="provider"
                  value={formData.provider._id}
                  readOnly // Or allow editing if needed, and handle accordingly
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 cursor-not-allowed"
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Updating Car...' : 'Update Car'}
              </button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}