import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "./auth.service";
import { Car } from "@/types/Car";

/**
 * Interface for car data used in create and update operations
 */
export interface CarData {
  brand: string;
  model: string;
  type: string;
  topSpeed: number;
  fuelType: string;
  seatingCapacity: number;
  year: number;
  pricePerDay: number;
  carDescription: string;
  image: string[];
  transmission?: string;
}

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Interface for car filtering parameters
 */
export interface CarFilterParams {
  brand?: string;
  model?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  minSeats?: number;
  sort?: string; // e.g. "pricePerDay:asc" or "year:desc"
}

/**
 * Interface for paginated response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
  data?: T[];
  error?: string;
}

/**
 * Get cars by provider with optional pagination and filtering
 *
 * @param providerId - The ID of the provider
 * @param paginationParams - Optional pagination parameters
 * @param filterParams - Optional filtering parameters
 * @returns Promise with cars data or error
 */
export const getCarsByProvider = async (
  providerId: string,
  paginationParams?: PaginationParams,
  filterParams?: CarFilterParams
): Promise<PaginatedResponse<Car>> => {
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

    const queryParams = new URLSearchParams();

    if (paginationParams) {
      if (paginationParams.page) queryParams.append('page', paginationParams.page.toString());
      if (paginationParams.limit) queryParams.append('limit', paginationParams.limit.toString());
    }

    if (filterParams) {
      if (filterParams.brand) queryParams.append('brand', filterParams.brand);
      if (filterParams.model) queryParams.append('model', filterParams.model);
      if (filterParams.type) queryParams.append('type', filterParams.type);
      if (filterParams.fuelType) queryParams.append('fuelType', filterParams.fuelType);

      if (filterParams.minPrice) queryParams.append('pricePerDay[gte]', filterParams.minPrice.toString());
      if (filterParams.maxPrice) queryParams.append('pricePerDay[lte]', filterParams.maxPrice.toString());
      if (filterParams.minYear) queryParams.append('year[gte]', filterParams.minYear.toString());
      if (filterParams.maxYear) queryParams.append('year[lte]', filterParams.maxYear.toString());
      if (filterParams.minSeats) queryParams.append('seatingCapacity[gte]', filterParams.minSeats.toString());

      if (filterParams.sort) queryParams.append('sort', filterParams.sort);
    }

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.rentalCarProviders.getCars(providerId)}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
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
      data: data.data,
      count: data.count,
      pagination: data.pagination
    };
  } catch (error: any) {
    console.error('Error fetching cars:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch cars'
    };
  }
};

/**
 * Get a car by its ID
 *
 * @param carId - The ID of the car to retrieve
 * @returns Promise with car data or error
 */
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
      if (response.status === 404) {
        return {
          success: false,
          error: 'Car not found'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to access this car'
        };
      }

      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to fetch car'
      };
    }

    try {
      sessionStorage.setItem(`car_${carId}`, JSON.stringify(data.data));
    } catch (cacheError) {
      console.warn('Failed to cache car data:', cacheError);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error fetching car:', error);

    try {
      const cachedData = sessionStorage.getItem(`car_${carId}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('Retrieved car data from cache');
        return {
          success: true,
          data: parsedData,
          error: 'Using cached data. ' + error.message
        };
      }
    } catch (cacheError) {
      console.warn('Failed to retrieve cached car data:', cacheError);
    }

    return {
      success: false,
      error: error.message || 'Failed to fetch car'
    };
  }
};

/**
 * Create a new car for a provider
 *
 * @param providerId - The ID of the provider who owns the car
 * @param carData - The car data to create
 * @returns Promise with created car data or error
 */
export const createCar = async (providerId: string, carData: CarData): Promise<{ success: boolean; data?: Car; error?: string }> => {
  try {
    if (!providerId) {
      return {
        success: false,
        error: 'Provider ID is required'
      };
    }

    const validationErrors = validateCarData(carData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(', ')}`
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    if (user.role !== 'admin' && user.role !== 'provider') {
      return {
        success: false,
        error: 'You are not authorized to create cars'
      };
    }

    const response = await fetch(API_ENDPOINTS.cars.create(providerId), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(carData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to create car'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error creating car:', error);
    return {
      success: false,
      error: error.message || 'Failed to create car'
    };
  }
};

/**
 * Validates car data and returns an array of validation errors
 *
 * @param carData - The car data to validate
 * @returns Array of validation error messages (empty if valid)
 */
const validateCarData = (carData: CarData): string[] => {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (!carData.brand || carData.brand.trim() === '') {
    errors.push('Brand is required');
  }

  if (!carData.model || carData.model.trim() === '') {
    errors.push('Model is required');
  }

  const validCarTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van', 'MPV'];
  if (!carData.type || !validCarTypes.includes(carData.type)) {
    errors.push(`Type must be one of: ${validCarTypes.join(', ')}`);
  }

  if (!carData.topSpeed || carData.topSpeed <= 0) {
    errors.push('Top speed must be a positive number');
  }

  if (!carData.fuelType || carData.fuelType.trim() === '') {
    errors.push('Fuel type is required');
  }

  if (!carData.seatingCapacity || carData.seatingCapacity < 1) {
    errors.push('Seating capacity must be at least 1');
  }

  if (!carData.year || carData.year < 1886 || carData.year > currentYear) {
    errors.push(`Year must be between 1886 and ${currentYear}`);
  }

  if (!carData.pricePerDay || carData.pricePerDay <= 0) {
    errors.push('Price per day must be a positive number');
  }

  if (!carData.image || !Array.isArray(carData.image) || carData.image.length === 0) {
    errors.push('At least one image is required');
  }

  return errors;
};

/**
 * Update an existing car
 *
 * @param carId - The ID of the car to update
 * @param carData - The car data to update (partial)
 * @returns Promise with updated car data or error
 */
export const updateCar = async (carId: string, carData: Partial<CarData>): Promise<{ success: boolean; data?: Car; error?: string }> => {
  try {
    if (!carId) {
      return {
        success: false,
        error: 'Car ID is required'
      };
    }

    if (Object.keys(carData).length > 0) {
      const validationErrors = validatePartialCarData(carData);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Validation errors: ${validationErrors.join(', ')}`
        };
      }
    } else {
      return {
        success: false,
        error: 'No data provided for update'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    if (user.role !== 'admin' && user.role !== 'provider') {
      return {
        success: false,
        error: 'You are not authorized to update cars'
      };
    }

    const response = await fetch(API_ENDPOINTS.cars.update(carId), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(carData)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Car not found'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to update this car'
        };
      }

      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to update car'
      };
    }

    try {
      sessionStorage.setItem(`car_${carId}`, JSON.stringify(data.data));
    } catch (cacheError) {
      console.warn('Failed to update cached car data:', cacheError);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error updating car:', error);
    return {
      success: false,
      error: error.message || 'Failed to update car'
    };
  }
};

/**
 * Validates partial car data for updates and returns an array of validation errors
 *
 * @param carData - The partial car data to validate
 * @returns Array of validation error messages (empty if valid)
 */
const validatePartialCarData = (carData: Partial<CarData>): string[] => {
  const errors: string[] = [];
  const currentYear = new Date().getFullYear();

  if (carData.brand !== undefined && carData.brand.trim() === '') {
    errors.push('Brand cannot be empty');
  }

  if (carData.model !== undefined && carData.model.trim() === '') {
    errors.push('Model cannot be empty');
  }

  if (carData.type !== undefined) {
    const validCarTypes = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Convertible', 'Van', 'MPV'];
    if (!validCarTypes.includes(carData.type)) {
      errors.push(`Type must be one of: ${validCarTypes.join(', ')}`);
    }
  }

  if (carData.topSpeed !== undefined && carData.topSpeed <= 0) {
    errors.push('Top speed must be a positive number');
  }

  if (carData.fuelType !== undefined && carData.fuelType.trim() === '') {
    errors.push('Fuel type cannot be empty');
  }

  if (carData.seatingCapacity !== undefined && carData.seatingCapacity < 1) {
    errors.push('Seating capacity must be at least 1');
  }

  if (carData.year !== undefined && (carData.year < 1886 || carData.year > currentYear)) {
    errors.push(`Year must be between 1886 and ${currentYear}`);
  }

  if (carData.pricePerDay !== undefined && carData.pricePerDay <= 0) {
    errors.push('Price per day must be a positive number');
  }

  if (carData.image !== undefined && (!Array.isArray(carData.image) || carData.image.length === 0)) {
    errors.push('At least one image is required');
  }

  return errors;
};

/**
 * Delete a car by its ID
 *
 * @param carId - The ID of the car to delete
 * @returns Promise with success message or error
 */
export const deleteCar = async (carId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
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

    if (user.role !== 'admin' && user.role !== 'provider') {
      return {
        success: false,
        error: 'You are not authorized to delete cars'
      };
    }

    const carResponse = await getCarById(carId);
    if (!carResponse.success) {
      return {
        success: false,
        error: carResponse.error || 'Failed to verify car before deletion'
      };
    }

    if (user.role === 'provider' && carResponse.data?.provider?._id !== user._id) {
      return {
        success: false,
        error: 'You can only delete cars that belong to your provider account'
      };
    }

    const response = await fetch(API_ENDPOINTS.cars.delete(carId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: 'Car not found'
        };
      } else if (response.status === 403) {
        return {
          success: false,
          error: 'You do not have permission to delete this car'
        };
      }

      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to delete car'
      };
    }

    try {
      sessionStorage.removeItem(`car_${carId}`);
    } catch (cacheError) {
      console.warn('Failed to remove car from cache:', cacheError);
    }

    return {
      success: true,
      message: data.message || 'Car deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting car:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete car'
    };
  }
};
