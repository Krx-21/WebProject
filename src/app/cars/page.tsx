'use client';

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";
import { Car } from "@/types/Car";

export default function CarsPage () {
  const [cars, setCars] = useState<Car[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'provider' | 'user' | null>(null);
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
    return <div>Loading cars...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cars</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car: Car) => (
          <Link href={`/cars/${car.id}`} key={car.id}>
            <Card key={car.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">
                  <p>Brand: {car.brand}</p>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Model: {car.model}</p>
                <p>Provider: {car.provider.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}