'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_ENDPOINTS } from "@/config/api";
import { Car } from "@/types/Car";
import CarCard from '@/components/CarCard';
import CarFilters from '@/components/CarFilters';
import EmptyState from '@/components/EmptyState';

export default function CarsPage() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.cars.getAll);
        if (!res.ok) {
          throw new Error("Failed to fetch cars");
        }
        const result = await res.json();
        setAllCars(result.data);
        setFilteredCars(result.data);
      } catch (err: any) {
        console.error("Error fetching cars:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleFilterChange = useCallback((filtered: Car[]) => {
    setFilteredCars(filtered);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (previousSearchRef.current && previousSearchRef.current !== '') {
        setFilteredCars(allCars);
      }
      previousSearchRef.current = '';
      return;
    }

    previousSearchRef.current = searchQuery;

    const query = searchQuery.toLowerCase().trim();
    const searchFiltered = allCars.filter(car => {
      return (
        car.brand.toLowerCase().includes(query) ||
        car.model.toLowerCase().includes(query) ||
        car.provider.name.toLowerCase().includes(query) ||
        car.type.toLowerCase().includes(query) ||
        car.carDescription.toLowerCase().includes(query)
      );
    });

    setFilteredCars(searchFiltered);
  }, [searchQuery, allCars]);

  const previousSearchRef = useRef<string>('');

  useEffect(() => {
    const sortCars = () => {
      const sortedCars = [...filteredCars];

      switch (sortOption) {
        case 'newest':
          sortedCars.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
          break;
        case 'oldest':
          sortedCars.sort((a, b) => new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime());
          break;
        case 'price-low':
          sortedCars.sort((a, b) => a.pricePerDay - b.pricePerDay);
          break;
        case 'price-high':
          sortedCars.sort((a, b) => b.pricePerDay - a.pricePerDay);
          break;
        default:
          break;
      }

      if (JSON.stringify(sortedCars) !== JSON.stringify(filteredCars)) {
        setFilteredCars(sortedCars);
      }
    };

    sortCars();

  }, [sortOption, filteredCars]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Available Cars
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Browse our selection of quality rental cars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md h-[400px] animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
                <div className="p-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  </div>
                  <div className="mt-6 h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent mb-4">
              Available Cars
            </h1>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Error Loading Cars</h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
      <div className="container max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Available Cars
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Browse our selection of quality rental cars for your next journey
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by brand, model, or provider..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        {allCars.length > 0 && (
          <CarFilters cars={allCars} onFilterChange={handleFilterChange} />
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredCars.length}</span> of {allCars.length} cars
          </p>
        </div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car: Car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <EmptyState resetFilters={() => {
            setSearchQuery('');
            setFilteredCars(allCars);
          }} />
        )}
      </div>
    </div>
  );
}