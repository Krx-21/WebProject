import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "./auth.service";

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
  provider?: string | {
    _id: string;
    name: string;
    address?: string;
    district?: string;
    province?: string;
  };
  createdAt?: string;
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
        error: 'Provider ID is required'
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
          error: 'Failed to fetch provider details'
        };
      }

      const data = await response.json();

      if (!data.success) {
        return {
          success: false,
          error: 'Failed to fetch provider details'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Failed to fetch provider details'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to fetch provider details'
    };
  }
};

export const getAllPromotions = async (): Promise<{ success: boolean; data?: Promotion[]; error?: string }> => {
  try {
    const endpoint = API_ENDPOINTS.promotions.getAll
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch promotions');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'Failed to fetch promotions'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch promotions'
    };
  }
};

export const getPromotionsByProvider = async (providerId: string): Promise<{ success: boolean; data?: Promotion[]; error?: string }> => {
  try {
    if (!providerId) {
      return {
        success: false,
        error: 'Provider ID is required'
      };
    }

    const response = await fetch(API_ENDPOINTS.rentalCarProviders.getPromotions(providerId), {
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
        error: data.message || 'Failed to fetch promotions'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to fetch promotions'
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
        error: 'Car ID and number of days are required'
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
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
      throw new Error('Failed to calculate price');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'Failed to calculate price'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to calculate price'
    };
  }
};
