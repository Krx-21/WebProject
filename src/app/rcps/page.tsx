'use client'
import { useEffect, useState } from 'react';
import { getAllRcps } from '@/services/rcp.service';
import { RentalCarProvider } from '@/types/rcp';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function RcpsPage() {
  const [rcps, setRcps] = useState<RentalCarProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRcps = async () => {
      try {
        const response = await getAllRcps();
        if (response.success) {
          if (Array.isArray(response.data)) {
            setRcps(response.data);
          } else if (response.data && Array.isArray(response.data.data)) {
            setRcps(response.data.data);
          } else {
            setError('Unexpected data format received from API');
            console.error('Unexpected data format:', response.data);
          }
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="container-base max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 
                dark:from-slate-200 dark:via-slate-300 dark:to-slate-400
                bg-clip-text text-transparent mb-4">
            Our Car Providers
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Explore our network of trusted car providers offering premium vehicles for your rental needs.
          </p>
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
          {rcps && rcps.length > 0 ? (
            rcps.map((rcp) => (
              <Link href={`/rcps/${rcp._id}`} key={rcp._id} className="block">
                <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg
              border border-slate-200 dark:border-slate-700 
              transition-all duration-300 hover:scale-[1.01]
              overflow-hidden">
                  {/* Header */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-slate-50 
                 dark:from-slate-800 dark:to-slate-700 p-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {rcp.name}
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <p className="text-slate-700 dark:text-slate-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {rcp.address}
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {rcp.district}, {rcp.province} {rcp.postalcode}
                      </p>

                      {rcp.tel && (
                        <p className="text-gray-700 dark:text-gray-300 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {rcp.tel}
                        </p>
                      )}

                      <p className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Region: {rcp.region}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 
                dark:bg-indigo-500 dark:hover:bg-indigo-600
                text-white rounded-lg transition-all duration-200
                transform hover:-translate-y-0.5">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl
               border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                No Rental Car Providers
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Please check back later for available providers.
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}