import { Provider } from "./Provider";

export interface Comment {
    _id: string,
    user: {
        _id: string,
        name: string,
        image?: string
    },
    car: string,
    comment: string,
    rating: number,
    createdAt: string
}

export interface Car {
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
    image: string[],
    postedDate: string,
    _id: string,
    __v: number,
    id: string,
    comments?: Comment[],
    transmission?: string
}