'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Car } from '@/types/Car';

export default function PromotionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'provider' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role === 'admin' || user.role === 'provider') {
      setUserRole(user.role);
      fetchCars();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchCars = async () => {
    try {
      const user = getCurrentUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.cars.getAll, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/json'
        },
        //credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch cars');
      }

      const data = await response.json();
      if (data.success) {
        setCars(data.data);
        console.log("Cars data:", data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch cars');
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
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
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="container-base max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-blue-700 bg-clip-text text-transparent">
            Manage Cars
          </h1>
          <Button 
            onClick={() => router.push('/admin/cars/new')}
            className="btn-primary hover:scale-105 transition-transform duration-200"
          >
            Create New Car
          </Button>
        </div>

        <div className="grid gap-8">
          {cars.map((car: Car) => {
            return (
              <div
                key={car._id}
                className="card-premium group hover:scale-[1.01] transition-all duration-200
                         bg-white dark:bg-gray-800 border border-gray-200 
                         dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl
                         p-6 relative overflow-hidden"
              >
                <p>Brand: {car.brand}</p>
                <p>Model: {car.model}</p>
                <p>Type: {car.type}</p>
                <p>Top Speed: {car.topSpeed}</p>
                <p>Fuel Type: {car.fuelType}</p>
                <p>Seating Capacity: {car.seatingCapacity}</p>
                <p>Year: {car.year}</p>
                <p>Price Per Day: {car.pricePerDay}</p>
                <p>Car Description: {car.carDescription}</p>
                <p>Posted Date: {car.postedDate}</p>
                <p>Provider Name: {car.provider.name}</p>
                
                <div className="flex flex-col lg:flex-row gap-6">
                  

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/cars/${car._id}/edit`)}
                      className="flex-1 lg:flex-none px-6 py-2 border-2 border-blue-500 
                                text-blue-600 dark:text-blue-400 dark:border-blue-400 
                                hover:bg-blue-50 dark:hover:bg-blue-900/20
                                hover:border-blue-600 dark:hover:border-blue-300
                                transition-all duration-200"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(car._id)}
                      className="flex-1 lg:flex-none px-6 py-2 bg-red-500 hover:bg-red-600 
                                dark:bg-red-600/90 dark:hover:bg-red-500 
                                text-white shadow-sm hover:shadow-md 
                                transition-all duration-200"
                    >
                      Delete
                    </Button>
                  </div>
                
                </div>
              </div>
            );
          })}

          {cars.length === 0 && (
            <div className="card-base text-center py-12 bg-white dark:bg-gray-800
                           border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No Cars found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}