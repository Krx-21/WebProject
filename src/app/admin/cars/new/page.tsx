'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from "@/types/Car";
import { API_ENDPOINTS } from "@/config/api";
import { Provider } from "@/types/Provider";
import { getCurrentUser } from '@/services/auth.service';
import LoadImage from '@/components/LoadImage';

type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Convertible' | 'Van';
// type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';

interface ValidationErrors {
  brand?: string;
  model?: string;
  topSpeed?: string;
  year?: string;
  pricePerDay?: string;
  seatingCapacity?: string;
  provider?: string;
}

export default function NewCarPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<Omit<Car, '_id' | '__v' | 'id' | 'postedDate'>>({
    brand: '',
    model: '',
    type: 'Sedan',
    topSpeed: 0,
    fuelType: '',
    seatingCapacity: 1,
    year: new Date().getFullYear(),
    pricePerDay: 0,
    provider: provider ? provider : { _id: "", name: "", address: "", district: "", province: "", postalCode: "", tel: "", region: "", user: "", __v: 0, id: "" },
    carDescription: '',
    image: [],
  });
  const user = getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }
  if (user.role !== 'admin' && user.role !== 'provider') {
    router.push('/');
  }  
  // console.log('User:', user);
  useEffect(() => {
    if (user.role === 'provider') {
      fetchMe();
    } else if (user.role === 'admin') {
      fetchProviders();
    }
  }, [user.role, user._id, user.token, router]);

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
      throw new Error('Failed to fetch user data');
    }
    const meData = await me.json();
    if (meData.data.role === 'provider') {
      console.log('Provider:', meData.data);
      // setProvider(meData.data);
      fetchProvider(meData.data.myRcpId);
    }
    // console.log("stringAPI inside fetchMe:", stringAPI);
    // fetchCars();
  };

  const fetchProvider = async (proID: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.rentalCarProviders.getOne(proID), {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch provider');
      }
      const data = await response.json();
      setProvider(data.data);
      setFormData(prev => ({ ...prev, provider: data.data }));
    } catch (err: any) {
      console.error('Error fetching provider:', err);
      setError(err.message);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.rentalCarProviders.getAll);
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      const data = await response.json();
      setProviders(data.data);
      setProvider(data.data[0]);
      if (data.data.length > 0) {
        setFormData(prev => ({ ...prev, provider: data.data[0] }));
      }
    } catch (err: any) {
      console.error('Error fetching providers:', err);
      setError(err.message);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (e.target instanceof HTMLTextAreaElement) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === 'type') {
      setFormData(prev => ({ ...prev, [name]: value as CarType}));
    } else if (type === 'number') {
      const parsedValue = parseInt(value, 10);
      if (isNaN(parsedValue)) {
        return;
      }
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const providerId = e.target.value;
    const selectedProvider = providers.find(p => p.id === providerId);
    if (selectedProvider) {
      setFormData(prev => ({ ...prev, provider: selectedProvider }));
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

    if (!formData.provider._id) {
      errors.provider = 'Provider is required';
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
        console.log('status not ok => Response:', response);
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to create car');
      }

      router.push('/admin/cars');
    } catch (err: any) {
      console.error('Error creating car:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!provider && providers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No Providers Available</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Please add a provider before creating a car.</p>
          <button
            onClick={() => router.push('/admin/providers/new')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Add New Provider
          </button>
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
            Create New Car
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details below to create a new car
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
                  <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200" />
                  {validationErrors.brand && <p className="text-red-500 text-sm">{validationErrors.brand}</p>}
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Model
                  </label>
                  <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200" />
                  {validationErrors.model && <p className="text-red-500 text-sm">{validationErrors.model}</p>}
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
                    className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
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
                <div>
                  <label htmlFor="topSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top Speed
                  </label>
                  <input type="number" id="topSpeed" name="topSpeed" value={formData.topSpeed} onChange={handleChange} className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200" />
                  {validationErrors.topSpeed && <p className="text-red-500 text-sm">{validationErrors.topSpeed}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fuel Type
                  </label>
                  <input
                    type="text"
                    id="fuelType"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="seatingCapacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Seating Capacity
                  </label>
                  <input type="number" id="seatingCapacity" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} min="1" required className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200" />
                  {validationErrors.seatingCapacity && <p className="text-red-500 text-sm">{validationErrors.seatingCapacity}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Year
                  </label>
                  <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} min="1900" max={new Date().getFullYear()} required className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200" />
                  {validationErrors.year && <p className="text-red-500 text-sm">{validationErrors.year}</p>}
                </div>
                <div>
                  <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price Per Day
                  </label>
                  <input type="number" id="pricePerDay" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} min="0" required className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200" />
                  {validationErrors.pricePerDay && <p className="text-red-500 text-sm">{validationErrors.pricePerDay}</p>}
                </div>
              </div>
              {
                provider === null ? (
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Provider
                    </label>
                    <select
                      id="provider"
                      name="provider"
                      value={formData.provider._id}
                      onChange={handleProviderChange}
                      className="mt-1 block w-full rounded-md
  bg-white dark:bg-gray-800 
  border-gray-300 dark:border-gray-600
  text-gray-900 dark:text-gray-100
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200"
                    >
                      {providers.map(provider => (
                        <option key={provider._id} value={provider._id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.provider && <p className="text-red-500 text-sm">{validationErrors.provider}</p>}
                  </div>
                ) : (
                  // <input type="hidden" id="provider" name="provider" value={formData.provider._id} onChange={handleChange} />
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Provider: {formData.provider.name}
                  </label>
                )
              }


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
  placeholder-gray-500 dark:placeholder-gray-400
  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
  dark:focus:ring-blue-400 dark:focus:border-blue-400
  transition-colors duration-200
  resize-none"
                ></textarea>
              </div>
              <LoadImage setFormData={setFormData} formData={formData}/>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Car...' : 'Create Car'}
              </button>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Creating car...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}