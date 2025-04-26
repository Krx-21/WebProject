'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { API_ENDPOINTS } from '@/config/api';
import { getCurrentUser } from '@/services/auth.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Car } from '@/types/Car';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function CarsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [stringAPI, setStringAPI] = useState<string>('');
  const [token, setToken] = useState<string>(API_ENDPOINTS.cars.getAll);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [filterFuel, setFilterFuel] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [stats, setStats] = useState({
    totalCars: 0,
    totalBookings: 0,
    carTypes: {} as Record<string, number>,
    fuelTypes: {} as Record<string, number>
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      return;
    } else if (user.role !== 'admin' && user.role !== 'provider') {
      return;
    }
    setToken(user.token);
  }, [router]);

  const applyFiltersAndSort = () => {
    let result = [...cars];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(car =>
        car.brand.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term) ||
        car.carDescription.toLowerCase().includes(term) ||
        car.provider.name.toLowerCase().includes(term)
      );
    }

    if (filterType !== 'all') {
      result = result.filter(car => car.type.toLowerCase() === filterType.toLowerCase());
    }

    if (filterFuel !== 'all') {
      result = result.filter(car => car.fuelType.toLowerCase() === filterFuel.toLowerCase());
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.postedDate || '').getTime() - new Date(a.postedDate || '').getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.postedDate || '').getTime() - new Date(b.postedDate || '').getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case 'price-high':
        result.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case 'alphabetical':
        result.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
        break;
    }

    setFilteredCars(result);
  };

  const calculateStats = async () => {
    const carTypes: Record<string, number> = {};
    cars.forEach(car => {
      carTypes[car.type] = (carTypes[car.type] || 0) + 1;
    });

    const fuelTypes: Record<string, number> = {};
    cars.forEach(car => {
      fuelTypes[car.fuelType] = (fuelTypes[car.fuelType] || 0) + 1;
    });

    let totalBookings = 0;
    try {
      const user = getCurrentUser();
      if (user) {
        const response = await fetch(API_ENDPOINTS.bookings.getAll, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Accept': 'application/json'
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            totalBookings = data.data.length;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }

    setStats({
      totalCars: cars.length,
      totalBookings,
      carTypes,
      fuelTypes
    });
  };

  const fetchCars = useCallback(async () => {
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
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch cars');
      }
      console.log("response:", response);
      console.log("below is data");
      try {
        const data = await response.json();
        if (data.success) {
          setCars(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch cars');
        }
      } catch (err) {
        console.error("Error parsing JSON:", err);
        throw new Error('Failed to parse response data');
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [token, stringAPI, router]);

  useEffect(() => {
    if (token) {
      const fetchMe = async () => {
        try {
          const me = await fetch(API_ENDPOINTS.auth.getme, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
          });
          if (!me.ok) {
            if (me.status === 401) {
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
        } catch (error) {
          console.error('Error in fetchMe:', error);
        }
      };

      fetchMe();
    }
  }, [token]);

  useEffect(() => {
    if (stringAPI) {
      fetchCars();
    }
  }, [token, stringAPI, fetchCars]);

  useEffect(() => {
    if (stringAPI) {
          fetchCars();
          }
  }, [token, stringAPI, fetchCars]);

  useEffect(() => {
    if (cars.length > 0) {
      applyFiltersAndSort();
      const fetchStats = async () => {
        await calculateStats();
      };
      fetchStats();
    } else {
      setFilteredCars([]);
    }
  }, [cars, searchTerm, sortBy, filterType, filterFuel]);

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

  if (cars.length === 0 && !loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
        <div className="container max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600
                dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                Manage Cars
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Add, edit, and manage your car listings
              </p>
            </div>

            <Button
              onClick={() => router.push('/admin/cars/new')}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5
                rounded-lg shadow-md hover:shadow-lg transition-all duration-200
                flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add New Car
            </Button>
          </div>

          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-md
            border border-slate-200 dark:border-slate-700">
            <div className="max-w-md mx-auto px-6">
              <svg className="mx-auto h-24 w-24 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">No Cars Available</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                You haven&apos;t added any cars yet. Get started by adding your first car listing.
              </p>
              <Button
                onClick={() => router.push('/admin/cars/new')}
                className="mt-8 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5
                  rounded-lg shadow-md hover:shadow-lg transition-all duration-200
                  flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Your First Car
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <div className="container max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600
              dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
              Manage Cars
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Add, edit, and manage your car listings
            </p>
          </div>

          <Button
            onClick={() => router.push('/admin/cars/new')}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-2.5
              rounded-lg shadow-md hover:shadow-lg transition-all duration-200
              flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add New Car
          </Button>
        </div>

        {/* Dashboard Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cars</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalCars}</h3>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Bookings</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalBookings || 0}</h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Car Types</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{Object.keys(stats.carTypes).length}</h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.carTypes).slice(0, 3).map(([type, count]) => (
                  <span key={type} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300">
                    {type} ({count})
                  </span>
                ))}
                {Object.keys(stats.carTypes).length > 3 && (
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300">
                    +{Object.keys(stats.carTypes).length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="w-full md:w-1/3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  type="text"
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alphabetical">Alphabetical</option>
              </Select>

              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                {Object.keys(stats.carTypes).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <Select
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-lg text-sm"
              >
                <option value="all">All Fuel Types</option>
                {Object.keys(stats.fuelTypes).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>

              <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <p>Showing <span className="font-medium text-slate-700 dark:text-slate-300">{filteredCars.length}</span> of <span className="font-medium text-slate-700 dark:text-slate-300">{cars.length}</span> cars</p>
            {searchTerm && <p>Search results for: <span className="font-medium text-slate-700 dark:text-slate-300">&quot;{searchTerm}&quot;</span></p>}
          </div>
        </div>

        {/* Cars Display - Grid or List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <Card
                key={car._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg
                  border border-slate-200 dark:border-slate-700
                  transition-all duration-200 hover:scale-[1.01] overflow-hidden"
              >
                {car.image && car.image.length > 0 ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={car.image[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      width={300}
                      height={200}
                    />
                    <div className="absolute top-0 right-0 p-2">
                      <Badge className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-black font-bold text-xs">
                        {car.type}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 w-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-16 h-16 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {car.brand} {car.model}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                        {car.provider.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30">
                        ฿{car.pricePerDay.toLocaleString()}/day
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Year</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{car.year}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fuel Type</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{car.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Seating</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{car.seatingCapacity} seats</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Speed</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{car.topSpeed} km/h</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{car.carDescription || 'No description available'}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/cars/${car._id}/edit`)}
                    className="px-3 py-1.5 text-sm border border-indigo-500 text-indigo-600
                      dark:text-indigo-400 dark:border-indigo-400 rounded-lg
                      hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                      transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(car._id)}
                    className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white
                      rounded-lg shadow-sm hover:shadow-md
                      transition-all duration-200"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCars.map((car) => (
              <div
                key={car._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg
                  border border-slate-200 dark:border-slate-700
                  transition-all duration-200 hover:translate-x-1 p-4"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Car Image or Placeholder */}
                  <div className="w-full md:w-48 h-32 flex-shrink-0">
                    {car.image && car.image.length > 0 ? (
                      <div className="relative h-full w-full rounded-lg overflow-hidden">
                        <Image
                          src={car.image[0]}
                          alt={`${car.brand} ${car.model}`}
                          className="w-full h-full object-cover"
                          width={192}
                          height={128}
                        />
                        <div className="absolute top-0 right-0 p-2">
                          <Badge className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-bold text-xs">
                            {car.type}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {car.brand} {car.model}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Provider: {car.provider.name}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30">
                        ฿{car.pricePerDay.toLocaleString()}/day
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Year</p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{car.year}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Fuel Type</p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{car.fuelType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Seating</p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{car.seatingCapacity} seats</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Top Speed</p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{car.topSpeed} km/h</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Description</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{car.carDescription || 'No description available'}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col justify-end gap-2 mt-4 md:mt-0">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/admin/cars/${car._id}/edit`)}
                      className="px-3 py-1.5 text-sm border border-indigo-500 text-indigo-600
                        dark:text-indigo-400 dark:border-indigo-400 rounded-lg
                        hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                        transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(car._id)}
                      className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white
                        rounded-lg shadow-sm hover:shadow-md
                        transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCars.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl
            border border-slate-200 dark:border-slate-700">
            <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No cars found</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {searchTerm ? `No results for &quot;${searchTerm}&quot;` : 'Try adding a new car or adjusting your filters'}
            </p>
            <Button
              onClick={() => router.push('/admin/cars/new')}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5
                rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                flex items-center gap-2 mx-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add New Car
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}