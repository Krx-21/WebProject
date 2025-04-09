'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from "@/types/Car";
import { API_ENDPOINTS } from "@/config/api";
import { Provider } from "@/types/Provider";
import { getCurrentUser } from '@/services/auth.service';

type CarType = 'Sedan' | 'SUV' | 'Hatchback' | 'Truck' | 'Convertible' | 'Van';
type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';

export default function NewCarPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
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
    provider: provider? provider : { _id: "", name: "", address: "", district: "", province: "", postalCode: "", tel: "", region: "", user: "", __v: 0, id: "" },
    carDescription: '',
  });
  const user = getCurrentUser();
  if (!user) {
    router.push('/login');
    return;
  }
  
  // ตอนนี้ provider ไม่สามารถสร้าง car ของตัวเองได้เพราะ role ที่เป็น provider ยังไม่ได้อยู่ใน provider list
  // provider จะ get ข้อมูลของตัวเองไม่ได้ (บัญชี id ของ provider ที่เป็น model กับ user id มันคนละอันกัน)
  // provider จะต้องสร้าง car ผ่าน admin เท่านั้น

  // if (user.role === 'provider') {
  //   useEffect(() => {
  //           const fetchProvider = async () => {
  //             try {
  //               const response = await fetch(API_ENDPOINTS.rentalCarProviders.getOne(user._id), {
  //                 method: 'GET',
  //                 headers: {
  //                   'Content-Type': 'application/json',
  //                 }
  //               });
  //               
  //               if (!response.ok) {
  //                 throw new Error(`Failed to fetch provider id ${user._id}`);
  //               }
  //               const data = await response.json();
                
  //               setProvider(data.data);
  //               setFormData(prev => ({ ...prev, provider: data.data }));
  //             } catch (err: any) {
  //               console.error('Error fetching provider:', err);
  //               setError(err.message);
  //             }
  //           };
      
  //           fetchProvider();
  //         }, []);
  // } else if (user.role === 'admin') {
  //   useEffect(() => {
  //     const fetchProviders = async () => {
  //       try {
  //         const response = await fetch(API_ENDPOINTS.rentalCarProviders.getAll);
  //         if (!response.ok) {
  //           throw new Error('Failed to fetch providers');
  //         }
  //         const data = await response.json();
  //         setProviders(data.data);
  //         if (data.data.length > 0) {
  //           setFormData(prev => ({ ...prev, provider: data.data[0] }));
  //         }
  //       } catch (err: any) {
  //         console.error('Error fetching providers:', err);
  //         setError(err.message);
  //       }
  //     };
  
  //     fetchProviders();
  //   }, []);
  //   if (providers.length === 0) {
  //     return <div>No providers available</div>;
  //   }
  // } else {
  //   router.push('/login');
  // }

  if (user.role !== 'admin') {
    router.push('/');
  }
    useEffect(() => {
      const fetchProviders = async () => {
        try {
          const response = await fetch(API_ENDPOINTS.rentalCarProviders.getAll);
          if (!response.ok) {
            throw new Error('Failed to fetch providers');
          }
          const data = await response.json();
          setProviders(data.data);
          if (data.data.length > 0) {
            setFormData(prev => ({ ...prev, provider: data.data[0] }));
          }
        } catch (err: any) {
          console.error('Error fetching providers:', err);
          setError(err.message);
        }
      };
  
      fetchProviders();
    }, []);


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

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const providerId = e.target.value;
    const selectedProvider = providers.find(p => p.id === providerId);
    if (selectedProvider) {
      setFormData(prev => ({ ...prev, provider: selectedProvider }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const providerId = formData.provider._id;
    try {
      const response = await fetch(API_ENDPOINTS.cars.create(providerId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
          // Include any authorization headers if needed
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to create car');
      }

      router.push('/cars');
    } catch (err: any) {
      console.error('Error creating car:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
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
              {
                user.role === 'admin' && (
<div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Provider
                </label>
                <select
                  id="provider"
                  name="provider"
                  value={formData.provider._id}
                  onChange={handleProviderChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100"
                >
                  {providers.map(provider => (
                    <option key={provider._id} value={provider._id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100"
                ></textarea>
              </div>

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
    </div>
  );
}