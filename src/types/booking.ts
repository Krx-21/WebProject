import { Car } from './Car';

export interface Booking {
    _id: string;
    start_date: string;
    end_date: string;
    user?: string;
    car?: string | Car;
    totalprice: number;
    createdAt?: string;
}

export interface BookingFormData {
    start_date: string;
    end_date: string;
    carId: string;
}