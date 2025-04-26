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

export const getAllPromotions = async (): Promise<{ success: boolean; data?: Promotion[]; error?: string }> => {
  try {
    const endpoint = API_ENDPOINTS.promotions.getAll
    const response = await fetch(endpoint, {
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

    return {
      success: true,
      data: data.data
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
