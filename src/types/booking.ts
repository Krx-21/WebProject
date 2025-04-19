export interface Booking {
    _id: string;
    start_date: string;
    end_date: string;
    user?: string;
    providerId?: string;
    carId?: string;
    promoId?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    rentalCarProvider?: {
        _id: string;
        name: string;
        address: string;
        province?: string;
        district?: string;
    };
    car?: {
        _id: string;
        brand: string;
        model: string;
        type: string;
        pricePerDay: number;
        provider?: string | {
            _id: string;
            name: string;
            address: string;
            province?: string;
            district?: string;
            user?: string;
        };
    };
    totalprice?: number;
    createdAt?: string;
}