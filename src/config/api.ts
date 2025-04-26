const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-six-bay-39.vercel.app';

export const API_ENDPOINTS = {
  promotions: {
    getAll: `${API_URL}/api/v1/promotions`,
    getOne: (id: string) => `${API_URL}/api/v1/promotions/${id}`,
    create: `${API_URL}/api/v1/promotions`,
    update: (id: string) => `${API_URL}/api/v1/promotions/${id}`,
    delete: (id: string) => `${API_URL}/api/v1/promotions/${id}`,
  },
  images: {
    delete: `${API_URL}/api/v1/images`,
  },
  comments: {
    getAll: (carId: string) => `${API_URL}/api/v1/cars/${carId}/comments/`,
    create: (carId: string) => `${API_URL}/api/v1/cars/${carId}/comments/`,
    update: (carId:string, commentId: string) => `${API_URL}/api/v1/cars/${carId}/comments/${commentId}`,
    delete: (carId:string, commentId: string) => `${API_URL}/api/v1/cars/${carId}/comments/${commentId}`
  },
  cars: {
    getAll: `${API_URL}/api/v1/cars`,
    getOne: (id: string) => `${API_URL}/api/v1/cars/${id}`,
    update: (id: string) => `${API_URL}/api/v1/cars/${id}`,
    delete: (id: string) => `${API_URL}/api/v1/cars/${id}`,
    create: (providerId: string) => `${API_URL}/api/v1/cars/${providerId}`,
  },
  bookings: {
    getAll: `${API_URL}/api/v1/bookings`,
    create: `${API_URL}/api/v1/bookings`,
    getOne: (id: string) => `${API_URL}/api/v1/bookings/${id}`,
    update: (id: string) => `${API_URL}/api/v1/bookings/${id}`,
    delete: (id: string) => `${API_URL}/api/v1/bookings/${id}`,
  },
  rentalCarProviders: {
    getAll: `${API_URL}/api/v1/rentalCarProviders`,
    getOne: (id: string) => `${API_URL}/api/v1/rentalCarProviders/${id}`,
    getPromotions: (providerId: string) => `${API_URL}/api/v1/rentalCarProviders/${providerId}/promotions`,
    getBookings: (ProviderId: string) => `${API_URL}/api/v1/rentalCarProviders/${ProviderId}/bookings`,
    getCars: (providerId: string) => `${API_URL}/api/v1/rentalCarProviders/${providerId}/cars`,

  },
  auth: {
    register: `${API_URL}/api/v1/auth/register`,
    login: `${API_URL}/api/v1/auth/login`,
    getme: `${API_URL}/api/v1/auth/me`,
    logout: `${API_URL}/api/v1/auth/logout`
  },
  payments: {
    verify: (bookingId: string) => `${API_URL}/api/v1/payments/verify/${bookingId}`
  }
};
