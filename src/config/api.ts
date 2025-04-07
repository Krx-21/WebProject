const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  promotions: {
    getAll: `${API_URL}/api/v1/promotions`,
    getOne: (id: string) => `${API_URL}/api/v1/promotions/${id}`,
    create: `${API_URL}/api/v1/promotions`,
    update: (id: string) => `${API_URL}/api/v1/promotions/${id}`,
    delete: (id: string) => `${API_URL}/api/v1/promotions/${id}`,
  },
  // Add other API endpoints here as needed
  cars: {
    getAll: `${API_URL}/api/v1/cars`,
  }
}; 