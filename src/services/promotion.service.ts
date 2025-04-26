import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "./auth.service";

/**
 * Interface for promotion data returned from the API
 */
export interface Promotion {
  _id: string;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  amount: number;
  provider
  ?: 
  // string | 
  {
    _id: string;
    name: string;
    address?: string;
    district?: string;
    province?: string;
  };
  createdAt?: string;
}

/**
 * Interface for promotion data used in create and update operations
 */
export interface PromotionData {
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscountAmount: number;
  minPurchaseAmount: number;
  startDate: string;
  endDate: string;
  amount: number;
  provider?: string;
}

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Interface for promotion filtering parameters
 */
export interface PromotionFilterParams {
  title?: string;
  minDiscount?: number;
  maxDiscount?: number;
  active?: boolean; // If true, only returns promotions that are currently active
  providerId?: string;
  sort?: string; // e.g. "discountPercentage:desc" or "startDate:asc"
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

export interface PriceCalculationResult {
  carId: string;
  numberOfDays: number;
  pricePerDay: number;
  basePrice: number;
  finalPrice: number;
  discount?: number;
  promoId?: string;
  promoName?: string;
  promoDiscountPercentage?: number;
}

export const getProviderDetails = async (providerId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!providerId) {
      return {
        success: false,
        error: 'Please provide a valid provider ID.'
      };
    }

    try {
      const endpoint = API_ENDPOINTS.rentalCarProviders.getOne(providerId);
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'We couldn’t retrieve the provider details. Please try again later.'
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: 'We couldn’t retrieve the provider details. Please check the provider ID and try again.'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message:'There was an issue while fetching provider details. Please try again later.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'There was an issue while fetching provider details. Please try again later.'
    };
  }
};

/**
 * Get all promotions with optional pagination and filtering
 *
 * @param paginationParams - Optional pagination parameters
 * @param filterParams - Optional filtering parameters
 * @returns Promise with promotions data or error
 */
export const getAllPromotions = async (
  paginationParams?: PaginationParams,
  filterParams?: PromotionFilterParams
): Promise<PaginatedResponse<Promotion>> => {
  try {
    const queryParams = new URLSearchParams();

    if (paginationParams) {
      if (paginationParams.page) queryParams.append('page', paginationParams.page.toString());
      if (paginationParams.limit) queryParams.append('limit', paginationParams.limit.toString());
    }

    if (filterParams) {
      if (filterParams.title) queryParams.append('title', filterParams.title);
      if (filterParams.providerId) queryParams.append('provider', filterParams.providerId);

      if (filterParams.minDiscount) queryParams.append('discountPercentage[gte]', filterParams.minDiscount.toString());
      if (filterParams.maxDiscount) queryParams.append('discountPercentage[lte]', filterParams.maxDiscount.toString());

      if (filterParams.active) {
        const now = new Date().toISOString();
        queryParams.append('startDate[lte]', now);
        queryParams.append('endDate[gte]', now);
      }

      if (filterParams.sort) queryParams.append('sort', filterParams.sort);
    }

    const queryString = queryParams.toString();
    const url = `${API_ENDPOINTS.promotions.getAll}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('We couldn’t retrieve the promotions at the moment. Please try again later.');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'We couldn’t retrieve the promotions at the moment. Please try again later.'
      };
    }

    try {
      const cacheKey = `promotions_${JSON.stringify({paginationParams, filterParams})}`;
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: data.data,
        count: data.count,
        pagination: data.pagination,
        timestamp: Date.now()
      }));
    } catch (cacheError) {
      console.warn('Failed to cache promotions data:', cacheError);
    }

    return {
      success: true,
      data: data.data,
      count: data.count,
      pagination: data.pagination
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'We couldn’t retrieve the promotions at the moment. Please try again later.'
    };
  }
};

export const getPromotionsByProvider = async (providerId: string): Promise<{ success: boolean; data?: Promotion[]; error?: string }> => {
  try {
    if (!providerId) {
      return {
        success: false,
        error: 'Please provide a valid provider ID.'
      };
    }

    const response = await fetch(API_ENDPOINTS.rentalCarProviders.getPromotions(providerId), {
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('There was an issue retrieving the promotions for this provider. Please try again later.');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'There was an issue retrieving the promotions for this provider. Please try again later.'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message: 'There was an issue retrieving the promotions for this provider. Please try again later.'
    };
  }
};

export const calculatePrice = async (
  carId: string,
  numberOfDays: number,
  promoId?: string
): Promise<{ success: boolean; data?: PriceCalculationResult; error?: string }> => {
  try {
    if (!carId || !numberOfDays) {
      return {
        success: false,
        error: 'Please provide both the car ID and the number of days.'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'You need to be logged in to calculate the price.'
      };
    }

    const requestBody: any = {
      carId,
      numberOfDays
    };

    if (promoId) {
      requestBody.promoId = promoId;
    }

    const endpoint = API_ENDPOINTS.cars.calPrice;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('We couldn’t calculate the price. Please try again later.');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'We couldn’t calculate the price. Please check the details and try again.'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'We encountered an issue while calculating the price. Please try again later.'
    };
  }
};

export const getPromotionById = async (promotionId: string): Promise<{ success: boolean; data?: Promotion; error?: string }> => {
  try {
    if (!promotionId) {
      return {
        success: false,
        error: 'Promotion ID is required'
      };
    }

    const response = await fetch(API_ENDPOINTS.promotions.getOne(promotionId), {
      headers: {
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
        error: data.message || 'Failed to fetch promotion'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error fetching promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch promotion'
    };
  }
};

/**
 * Create a new promotion
 *
 * @param promotionData - The promotion data to create
 * @returns Promise with created promotion data or error
 */
export const createPromotion = async (promotionData: PromotionData): Promise<{ success: boolean; data?: Promotion; error?: string }> => {
  try {
    const validationErrors = validatePromotionData(promotionData);
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
        error: 'You are not authorized to create promotions'
      };
    }

    if (user.role === 'provider' && promotionData.provider && promotionData.provider !== user._id) {
      return {
        success: false,
        error: 'You can only create promotions for your own provider account'
      };
    }

    if (user.role === 'provider' && !promotionData.provider) {
      promotionData.provider = user._id;
    }

    const response = await fetch(API_ENDPOINTS.promotions.create, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(promotionData)
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
        error: data.message || 'Failed to create promotion'
      };
    }

    try {
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('promotions_')) {
          keys.push(key);
        }
      }
      keys.forEach(key => sessionStorage.removeItem(key));
    } catch (cacheError) {
      console.warn('Failed to clear cached promotions data:', cacheError);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to create promotion'
    };
  }
};

/**
 * Validates promotion data and returns an array of validation errors
 *
 * @param promotionData - The promotion data to validate
 * @returns Array of validation error messages (empty if valid)
 */
const validatePromotionData = (promotionData: PromotionData): string[] => {
  const errors: string[] = [];

  if (!promotionData.title || promotionData.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!promotionData.description || promotionData.description.trim() === '') {
    errors.push('Description is required');
  }

  if (promotionData.discountPercentage === undefined ||
      promotionData.discountPercentage < 0 ||
      promotionData.discountPercentage > 100) {
    errors.push('Discount percentage must be between 0 and 100');
  }

  if (promotionData.maxDiscountAmount === undefined || promotionData.maxDiscountAmount < 0) {
    errors.push('Maximum discount amount must be a non-negative number');
  }

  if (promotionData.minPurchaseAmount === undefined || promotionData.minPurchaseAmount < 0) {
    errors.push('Minimum purchase amount must be a non-negative number');
  }

  if (!promotionData.startDate) {
    errors.push('Start date is required');
  }

  if (!promotionData.endDate) {
    errors.push('End date is required');
  }

  if (promotionData.startDate && promotionData.endDate) {
    const startDate = new Date(promotionData.startDate);
    const endDate = new Date(promotionData.endDate);

    if (isNaN(startDate.getTime())) {
      errors.push('Start date is invalid');
    }

    if (isNaN(endDate.getTime())) {
      errors.push('End date is invalid');
    }

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
      errors.push('Start date must be before end date');
    }
  }

  if (promotionData.amount === undefined || promotionData.amount < 0) {
    errors.push('Amount must be a non-negative number');
  }

  return errors;
};

export const updatePromotion = async (promotionId: string, promotionData: Partial<PromotionData>): Promise<{ success: boolean; data?: Promotion; error?: string }> => {
  try {
    if (!promotionId) {
      return {
        success: false,
        error: 'Promotion ID is required'
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
        error: 'You are not authorized to update promotions'
      };
    }

    const response = await fetch(API_ENDPOINTS.promotions.update(promotionId), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(promotionData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to update promotion'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error updating promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to update promotion'
    };
  }
};

export const deletePromotion = async (promotionId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    if (!promotionId) {
      return {
        success: false,
        error: 'Promotion ID is required'
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
        error: 'You are not authorized to delete promotions'
      };
    }

    const response = await fetch(API_ENDPOINTS.promotions.delete(promotionId), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to delete promotion'
      };
    }

    return {
      success: true,
      message: data.message || 'Promotion deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting promotion:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete promotion'
    };
  }
};

export const applyPromotion = async (carId: string, numberOfDays: number, promoId: string): Promise<{ success: boolean; data?: PriceCalculationResult; error?: string }> => {
  if (!promoId) {
    return {
      success: false,
      error: 'Promotion ID is required'
    };
  }

  return calculatePrice(carId, numberOfDays, promoId);
};
