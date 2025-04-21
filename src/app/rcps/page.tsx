'use client'
import { useEffect, useState } from 'react';
import { getAllRcps } from '@/services/rcp.service';
import { RentalCarProvider } from '@/types/rcp';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function RcpsPage() {
  const [rcps, setRcps] = useState<RentalCarProvider[]>([]);
  const [filteredRcps, setFilteredRcps] = useState<RentalCarProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  useEffect(() => {
    const fetchRcps = async () => {
      try {
        const response = await getAllRcps();
        if (response.success) {
          let providersData: RentalCarProvider[] = [];
          if (Array.isArray(response.data)) {
            providersData = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            providersData = response.data.data;
          } else {
            setError('Unexpected data format received from API');
            console.error('Unexpected data format:', response.data);
            return;
          }

          setRcps(providersData);
          setFilteredRcps(providersData);
        } else if (response.error) {
          setError(response.error);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRcps();
  }, []);

  useEffect(() => {
    if (!rcps.length) return;

    let results = [...rcps];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(rcp =>
        rcp.name.toLowerCase().includes(term) ||
        rcp.address.toLowerCase().includes(term) ||
        rcp.province.toLowerCase().includes(term) ||
        rcp.district.toLowerCase().includes(term)
      );
    }

    if (selectedRegion) {
      results = results.filter(rcp => rcp.region === selectedRegion);
    }

    setFilteredRcps(results);
  }, [searchTerm, selectedRegion, rcps]);

  const regions = Array.from(new Set(rcps.map(rcp => rcp.region))).sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="animate-pulse text-center">
          <svg className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-teal-500/10 dark:from-indigo-900/20 dark:via-blue-900/20 dark:to-teal-900/20 py-16 md:py-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 dark:from-indigo-400 dark:via-blue-400 dark:to-teal-400 bg-clip-text text-transparent animate-fade-in-up">
              Our Car Providers
            </h1>

            <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 mx-auto mb-8 rounded-full animate-width-expand"></div>

            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Explore our network of trusted car providers offering premium vehicles for your rental needs.
            </p>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/60 dark:border-slate-700/60 p-4 md:p-6 mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            {/* Search Input */}
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  placeholder="Search by name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="w-full md:w-auto">
              <select
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* Reset Filters Button */}
            {(searchTerm || selectedRegion) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRegion('');
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center justify-center md:justify-start"
              >
                <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset Filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Showing {filteredRcps.length} of {rcps.length} providers
            {searchTerm && <span> matching &quot;{searchTerm}&quot;</span>}
            {selectedRegion && <span> in {selectedRegion}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRcps.length > 0 ? (
            filteredRcps.map((rcp, index) => (
              <Link href={`/rcps/${rcp._id}`} key={rcp._id} className="block">
                <div
                  className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl
                    border border-slate-200/60 dark:border-slate-700/60
                    transition-all duration-300 hover:scale-[1.02] hover:border-indigo-200 dark:hover:border-indigo-800/60
                    overflow-hidden h-full flex flex-col animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * (index % 3 + 1)}s` }}
                >
                  {/* Header with decorative elements */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500/10 to-blue-500/10
                    dark:from-indigo-900/20 dark:to-blue-900/20 p-6 overflow-hidden">

                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 dark:bg-blue-500/20 rounded-full -mb-10 -ml-10 group-hover:scale-110 transition-transform duration-500 delay-100"></div>

                    {/* Provider badge */}
                    <div className="absolute top-4 right-4 bg-indigo-600/90 dark:bg-indigo-500/90 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      {rcp.region}
                    </div>

                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {rcp.name}
                      </h2>
                      <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 mt-2 rounded-full group-hover:w-20 transition-all duration-300"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5 flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-0.5">
                          <svg className="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Address</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{rcp.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mt-0.5">
                          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Location</p>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{rcp.district}, {rcp.province} {rcp.postalcode}</p>
                        </div>
                      </div>

                      {rcp.tel && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mt-0.5">
                            <svg className="h-4 w-4 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Contact</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{rcp.tel}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 pt-0 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-full">
                        ID: {rcp._id.substring(0, 8)}...
                      </div>
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700
                        dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-600 dark:hover:to-blue-600
                        text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md
                        transform hover:-translate-y-0.5 text-sm font-medium">
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl
               border border-slate-200/60 dark:border-slate-700/60 shadow-md animate-fade-in-up">
              {rcps.length === 0 ? (
                <>
                  <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    No Rental Car Providers
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    We couldn&apos;t find any car providers at the moment. Please check back later for available providers.
                  </p>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    No Results Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    We couldn&apos;t find any providers matching your search criteria. Try adjusting your filters or search term.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedRegion('');
                    }}
                    className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors duration-200 inline-flex items-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}