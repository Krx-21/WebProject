import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "./auth.service";
import { Car } from "@/types/Car";

export const getCarsByProvider = async (providerId: string): Promise<{ success: boolean; data?: Car[]; error?: string }> => {
  try {
    if (!providerId) {
      return {
        success: false,
        error: 'Please provide a valid provider ID.'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You need to be logged in to view the available cars.'
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
      throw new Error('We couldn’t load the cars at the moment. Please try again later.');
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: 'There was an issue fetching the cars. Please try again.'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while fetching the cars. Please try again later.'
    };
  }
};

export const getCarById = async (carId: string): Promise<{ success: boolean; data?: Car; error?: string }> => {
  try {
    if (!carId) {
      return {
        success: false,
        error: 'Please provide a valid car ID.'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You need to be logged in to view car details.'
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
      throw new Error('We couldn’t load the car details at the moment. Please try again later.');
    }

    const data = await response.json();
    
    if (!data.success) {
      return {
        success: false,
        error: 'There was an issue fetching the car details. Please try again.'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message: 'An error occurred while fetching the car details. Please try again later.'
    };
  }
};
