import { Provider } from "./Provider";

export interface Car {
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
    image: string[],
    postedDate: string,
    _id: string,
    __v: number,
    id: string,
}