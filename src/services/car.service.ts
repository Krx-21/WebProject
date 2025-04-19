import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "./auth.service";
import { Car } from "@/types/Car";

export const getCarsByProvider = async (providerId: string): Promise<{ success: boolean; data?: Car[]; error?: string }> => {
  try {
    if (!providerId) {
      return {
        success: false,
        error: 'Provider ID is required'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(API_ENDPOINTS.rentalCarProviders.getCars(providerId), {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to fetch cars'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error fetching cars:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch cars'
    };
  }
};

export const getCarById = async (carId: string): Promise<{ success: boolean; data?: Car; error?: string }> => {
  try {
    if (!carId) {
      return {
        success: false,
        error: 'Car ID is required'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(API_ENDPOINTS.cars.getOne(carId), {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to fetch car'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error fetching car:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch car'
    };
  }
};
