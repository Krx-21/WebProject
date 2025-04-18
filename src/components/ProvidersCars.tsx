'use client';
import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "@/services/auth.service";
import { useEffect, useState } from "react";
import { Car } from "@/types/Car";
import Link from "next/link";
import CarImageSample from "./CarImageSample";

export default function ProvidersCars({ providerId }: { providerId: string }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cars, setCars] = useState<Car[]>([]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const user = getCurrentUser();
                if (!user) {
                    return;
                }

                const response = await fetch(API_ENDPOINTS.rentalCarProviders.getCars(providerId), {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Accept': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cars');
                }

                const data = await response.json();
                if (data.success) {
                    setCars(data.data);
                    console.log("Cars data:", data.data);
                } else {
                    setError(data.message);
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="card-base mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 
                dark:from-slate-200 dark:via-slate-300 dark:to-slate-400
                bg-clip-text text-transparent mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                Available Cars
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                    <Link href={`/cars/${car.id}`} key={car.id}>
                        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg
                            border border-gray-200 dark:border-gray-700 
                            transition-all duration-300 hover:scale-[1.02]
                            overflow-hidden">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {car.brand} {car.model}
                                </h3>
                                <div className="space-y-2">
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Type: {car.type}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Year: {car.year}
                                    </p>
                                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                                        ฿{car.pricePerDay}/day
                                    </p>
                                </div>
                                    <CarImageSample images={car.image} />
                                <div className="mt-4 flex justify-end">
                                    <span className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400
                                        group-hover:translate-x-1 transition-transform duration-200">
                                        View Details
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {cars.length === 0 && (
                <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-blue-50/50 
                    dark:from-gray-800 dark:to-blue-900/20 rounded-lg
                    border border-gray-200 dark:border-gray-700
                    backdrop-blur-md">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                        No Cars Available
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        This provider currently has no cars listed.
                    </p>
                </div>
            )}
        </div>
    );
}