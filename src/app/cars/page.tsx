'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from "@/config/api";
import Link from "next/link";
import { Car } from "@/types/Car";
import CarImageSample from '@/components/CarImageSample';

export default function CarsPage () {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.cars.getAll);
        if (!res.ok) {
          throw new Error("Failed to fetch cars");
        }
        const resultl = await res.json();
        setCars(resultl.data);
      } catch (err: any) {
        console.error("Error fetching cars:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-center">
          <svg className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg max-w-2xl">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="container-base max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 
            dark:from-slate-200 dark:via-slate-300 dark:to-slate-400
            bg-clip-text text-transparent mb-4">
            Available Cars
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Browse our selection of quality rental cars
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car: Car) => (
            <Link href={`/cars/${car.id}`} key={car.id}>
              <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
                border border-gray-200 dark:border-gray-700 
                transition-all duration-300 hover:scale-[1.01]
                overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{car.brand}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">Model: {car.model}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Provider: {car.provider.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Type: {car.type}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Year: {car.year}
                    </p>
                  </div>
                  <CarImageSample images={car.image} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}