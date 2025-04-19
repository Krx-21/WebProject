'use client';

import { useState, useEffect } from 'react';
import { Car } from '@/types/Car';

interface CarFiltersProps {
  cars: Car[];
  onFilterChange: (filteredCars: Car[]) => void;
}

export default function CarFilters({ cars, onFilterChange }: CarFiltersProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);

  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState<number>(10000);

  useEffect(() => {
    if (cars.length > 0) {
      const uniqueBrands = Array.from(new Set(cars.map(car => car.brand)));
      setBrands(uniqueBrands.sort());

      const uniqueTypes = Array.from(new Set(cars.map(car => car.type)));
      setTypes(uniqueTypes.sort());

      const uniqueProviders = Array.from(new Set(cars.map(car => car.provider.name)));
      setProviders(uniqueProviders.sort());

      const highestPrice = Math.max(...cars.map(car => car.pricePerDay));
      setMaxPrice(highestPrice);
      setPriceRange([0, highestPrice]);
    }
  }, [cars]);

  useEffect(() => {
    const applyFilters = () => {
      let filteredCars = [...cars];

      if (selectedBrand) {
        filteredCars = filteredCars.filter(car => car.brand === selectedBrand);
      }

      if (selectedType) {
        filteredCars = filteredCars.filter(car => car.type === selectedType);
      }

      if (selectedProvider) {
        filteredCars = filteredCars.filter(car => car.provider.name === selectedProvider);
      }

      filteredCars = filteredCars.filter(
        car => car.pricePerDay >= priceRange[0] && car.pricePerDay <= priceRange[1]
      );

      onFilterChange(filteredCars);
    };

    applyFilters();

  }, [selectedBrand, selectedType, selectedProvider, priceRange, cars]);

  const resetFilters = () => {
    setSelectedBrand('');
    setSelectedType('');
    setSelectedProvider('');
    setPriceRange([0, maxPrice]);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-6 border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 md:mb-0">
          Filter Cars
        </h2>
        <button
          onClick={resetFilters}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Brand Filter */}
        <div>
          <label htmlFor="brand-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Brand
          </label>
          <select
            id="brand-filter"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Car Type
          </label>
          <select
            id="type-filter"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Provider Filter */}
        <div>
          <label htmlFor="provider-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Provider
          </label>
          <select
            id="provider-filter"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value="">All Providers</option>
            {providers.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <div className="flex justify-between mb-1">
            <label htmlFor="price-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Price Range
            </label>
          </div>

          {/* Price Range Inputs */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">฿</span>
              <input
                type="number"
                min={0}
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => {
                  const minValue = Math.max(0, parseInt(e.target.value) || 0);
                  if (minValue <= priceRange[1]) {
                    setPriceRange([minValue, priceRange[1]]);
                  }
                }}
                className="w-full pl-6 pr-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Min"
              />
            </div>

            <span className="text-slate-500">-</span>

            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500">฿</span>
              <input
                type="number"
                min={priceRange[0]}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => {
                  const maxValue = Math.min(maxPrice, parseInt(e.target.value) || 0);
                  if (maxValue >= priceRange[0]) {
                    setPriceRange([priceRange[0], maxValue]);
                  }
                }}
                className="w-full pl-6 pr-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="flex space-x-2">
            <input
              type="range"
              id="price-min"
              min={0}
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => {
                const minValue = parseInt(e.target.value);
                if (minValue <= priceRange[1]) {
                  setPriceRange([minValue, priceRange[1]]);
                }
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <input
              type="range"
              id="price-max"
              min={0}
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => {
                const maxValue = parseInt(e.target.value);
                if (maxValue >= priceRange[0]) {
                  setPriceRange([priceRange[0], maxValue]);
                }
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Price Range Labels */}
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">฿0</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">฿{maxPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
