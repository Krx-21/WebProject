'use client';

import { Car } from "@/types/Car";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const formattedPrice = new Intl.NumberFormat('th-TH').format(car.pricePerDay);
  
  return (
    <Link href={`/cars/${car.id}`}>
      <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-slate-200 dark:border-slate-700">
        {/* Car Image */}
        <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
          {car.image && car.image.length > 0 && !imageError ? (
            <Image
              src={car.image[0]}
              alt={`${car.brand} ${car.model}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7h-8a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2zm0 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m2 4h.01M17 12h.01" />
                </svg>
                <span className="text-sm">No Image</span>
              </div>
            </div>
          )}
          
          {/* Price Tag */}
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-lg font-medium">
            ฿{formattedPrice}/day
          </div>
          
          {/* Car Type Badge */}
          <div className="absolute bottom-2 left-2">
            <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs px-2 py-1 rounded-full shadow-sm">
              {car.type}
            </span>
          </div>
        </div>
        
        {/* Car Details */}
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {car.brand} {car.model}
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
              {car.year}
            </span>
          </div>
          
          <div className="space-y-2 mb-3 flex-grow">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {car.provider.name}
            </div>
            
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {car.fuelType}
            </div>
            
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {car.seatingCapacity} seats
            </div>
          </div>
          
          {/* View Details Button */}
          <div className="mt-auto">
            <button className="w-full bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white py-2 rounded-lg transition-colors duration-300 flex items-center justify-center">
              <span>View Details</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
