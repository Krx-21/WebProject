'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Car } from '@/types/Car';

export default function CarsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'provider' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [stringAPI, setStringAPI] = useState<string>('');
  const [token, setToken] = useState<string>(API_ENDPOINTS.cars.getAll);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      // router.push('/login');
      return;
    } else if (user.role !== 'admin' && user.role !== 'provider') {
      // router.push('/');
      return;
    }
    setUserRole(user.role);
    setToken(user.token);
  }, [router]);

  useEffect(() => {
    fetchMe();
  }, [token]);  

  useEffect(() => {
    if (stringAPI) {
            fetchCars();
          }
  }, [token, stringAPI]);

  const fetchMe = async () => {
    const me = await fetch(API_ENDPOINTS.auth.getme, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
    });
    if (!me.ok) {
      if (me.status === 401) {
        // router.push('/login');
        return;
      }
      throw new Error('Failed to fetch user data');
    }
    const meData = await me.json();
    if (meData.data.role === 'provider') {
      setStringAPI(API_ENDPOINTS.rentalCarProviders.getCars(meData.data.myRcpId));
    } else {
      setStringAPI(API_ENDPOINTS.cars.getAll);
    }
    // console.log("stringAPI inside fetchMe:", stringAPI);
    // fetchCars();
  };

  const fetchCars = async () => {
    try {
      console.log("stringAPI:", stringAPI);
      const response = await fetch(stringAPI, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // console.log("from fetch cars status 401");
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch cars');
      }
      console.log("response:", response);
      console.log("below is data");
      try {
        const data = await response.json();
        // console.log("data:", data);
        if (data.success) {
          setCars(data.data);
          // console.log("Cars data inside fetch func:", data.data);
        } else {
          // console.log("error side");
          throw new Error(data.message || 'Failed to fetch cars');
        }
      } catch (error) {
        // console.log("stringAPI inside error:", stringAPI);
        console.error("Error parsing JSON:", error);
        throw new Error('Failed to parse response data');
      }
      setLoading(false);
    } catch (err) {
      // console.error('Error fetching cars:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;

    try {
      const user = getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      } else if (user.role !== 'admin' && user.role !== 'provider') {
        router.push('/');
        return;
      }

      const response = await fetch(API_ENDPOINTS.cars.delete(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to delete the car');
      }

      const data = await response.json();
      if (data.success) {
        alert('The car deleted successfully');
        setCars(cars.filter(p => p._id !== id));
      } else {
        throw new Error(data.message || 'Failed to delete the car');
      }
    } catch (err) {
      console.error('Error deleting the car:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete the car');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => fetchCars()}>Retry</Button>
      </div>
    );
  }

  console.log("Cars data after fetch:", cars);

  if (cars.length === 0) {
    return (
      <div><div>Nothing</div><div>No no nothing</div></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="container-base max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800
              dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              Manage Cars
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, and manage your car listings
            </p>
          </div>
          
          <Button 
            onClick={() => router.push('/admin/cars/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5
              rounded-lg shadow-sm hover:shadow-md transition-all duration-200
              flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add New Car
          </Button>
        </div>

        {/* Cars Grid */}
        <div className="grid gap-6">
          {cars.map((car) => (
            <div
              key={car._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg
                border border-gray-200 dark:border-gray-700
                transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {car.brand} {car.model}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Provider: {car.provider.name}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/cars/${car._id}/edit`)}
                      className="px-4 py-2 border-2 border-blue-500 text-blue-600 
                        dark:text-blue-400 dark:border-blue-400 rounded-lg
                        hover:bg-blue-50 dark:hover:bg-blue-900/20
                        transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(car._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white
                        rounded-lg shadow-sm hover:shadow-md
                        transition-all duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</p>
                    <p className="text-gray-900 dark:text-gray-100">{car.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Year</p>
                    <p className="text-gray-900 dark:text-gray-100">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fuel Type</p>
                    <p className="text-gray-900 dark:text-gray-100">{car.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price/Day</p>
                    <p className="text-gray-900 dark:text-gray-100">฿{car.pricePerDay}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2">{car.carDescription}</p>
                </div>
              </div>
            </div>
          ))}

          {cars.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl
              border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">No cars found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}