import { API_ENDPOINTS } from "@/config/api";

interface CarDetails {
    _id: string,
    brand: string,
    model: string,
    type: string,
    topSpeed: number,
    fuelType: string,
    seatingCapacity: number,
    year: number,
    pricePerDay: number,
    provider: string,
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
        {data.map((car: CarDetails) => (
          <div key={car.id} className="border p-4 rounded-md shadow-md">
            <h2 className="text-xl font-semibold">{car.model}</h2>
            <p>{car.carDescription}</p>
          </div>
        ))}
      </div>
    </div>
  );
}