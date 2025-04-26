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

    const endpoint = API_ENDPOINTS.rentalCarProviders.getCars(providerId)
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load cars');
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: 'Failed to load cars'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to load cars'
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

    const endpoint = API_ENDPOINTS.cars.getOne(carId)
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load this car');
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: 'Failed to load this car'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to load this car'
    };
  }
};
