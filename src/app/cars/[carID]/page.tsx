'use client';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { useParams } from 'next/navigation';

interface ProviderProps {
  _id: string,
  name: string,
  address: string,
  district: string,
  province: string,
  postalCode: string,
  tel: string,
  region: string,
  user: string,
  __v: number,
  id: string,
}

interface CarProps {
  _id: string,
  brand: string,
  model: string,
  type: string,
  topSpeed: number,
  fuelType: string,
  seatingCapacity: number,
  year: number,
  pricePerDay: number,
  provider: ProviderProps,
  carDescription: string,
  postedDate: string,
  __v: number,
  id: string,
}

export default function CarsProviderPage() {
  const params = useParams();
  const carID = params.carID;
  const [carDetails, setCarDetails] = useState<CarProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCar = async () => {
      if (typeof carID === 'string') {
        try {
          const response = await fetch(API_ENDPOINTS.cars.getOne(carID),
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          if (!response.ok) {
            throw new Error('Failed to fetch car details');
          }
          const data = await response.json();
          console.log("Car data:", data);
          setCarDetails(data.data);
          setLoading(false);
        } catch (error: any) {
          console.error('Error fetching car:', error);
          setError(error.message || 'An unexpected error occurred');
          setLoading(false);
        }
      } else {
        console.warn('carID is not a string or is undefined');
        setError('Invalid car ID');
        setLoading(false);
      }
    };
    fetchCar();
  }, [carID]);

  if (loading) {
    return <div>Loading car details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main>
      <div>Details</div>
      <div>Details</div>
      {carDetails && (
        <>
          <p>Brand: {carDetails.brand}</p>
          <p>Model: {carDetails.model}</p>
          <p>Type: {carDetails.type}</p>
          <p>Top Speed: {carDetails.topSpeed}</p>
          <p>Fuel Type: {carDetails.fuelType}</p>
          <p>Seating Capacity: {carDetails.seatingCapacity}</p>
          <p>Year: {carDetails.year}</p>
          <p>Price Per Day: {carDetails.pricePerDay}</p>
          <p>Car Description: {carDetails.carDescription}</p>
          <p>Posted Date: {carDetails.postedDate}</p>
          <h1>Provider</h1>
          <p>Name: {carDetails.provider.name}</p>
          <p>Address: {carDetails.provider.address}</p>
          <p>District: {carDetails.provider.district}</p>
          <p>Province: {carDetails.provider.province}</p>
          <p>Postal Code: {carDetails.provider.postalCode}</p>
          <p>Phone: {carDetails.provider.tel}</p>
          <p>Region: {carDetails.provider.region}</p>
          {/* You can add more details here based on your CarProps interface */}
        </>
      )}
    </main>
  );
}