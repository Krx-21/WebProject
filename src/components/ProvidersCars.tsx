'use client';
import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "@/services/auth.service";
import { useEffect, useState } from "react";
import { Car } from "@/types/Car";
import Link from "next/link";

export default function ProvidersCars({providerId}: { providerId: string }) {
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
    if (cars.length == 0) {
        return (
            <div>NO Car Found</div>
        );
    } else {
        return (
            <div className="flex flex-col gap-4">
                {cars.map((car: Car) => (
                    <Link href={`/cars/${car.id}`} key={car.id}>
                    <div key={car._id} className="p-4 border rounded-md shadow-md">
                        <h3 className="text-lg font-semibold">{car.brand}</h3>
                        <p>{car.model}</p>
                        <p>Fuel Type: {car.fuelType}</p>
                    </div>
                    </Link>
                ))}
            </div>
        );
    }
    
}