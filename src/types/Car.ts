import { Provider } from "./Provider";

export interface Car {
    _id: string,
    brand: string,
    model: string,
    type: string,
    topSpeed: number,
    fuelType: string,
    seatingCapacity: number,
    year: number,
    pricePerDay: number,
    provider: Provider,
    carDescription: string,
    postedDate: string,
    __v: number,
    id: string,
}