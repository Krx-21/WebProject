import { API_ENDPOINTS } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from "next/link";

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

export default async function CarsPage () {
  const res = await fetch(API_ENDPOINTS.cars.getAll);
  if (!res.ok) {
    throw new Error("Failed to fetch cars");
  }
  const resultl = await res.json();
  const data = await resultl.data;
  console.log("Cars data:", data);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cars</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((car: CarProps) => (
          
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