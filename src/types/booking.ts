export interface Booking {
    _id: string;
    date: string;
    user?: string;
    providerId?: string;
    rentalCarProvider?: {
        _id: string;
        name: string;
        address: string;
        province?: string;
        district?: string;
    };
    createdAt?: string;
}