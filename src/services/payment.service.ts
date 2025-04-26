import { API_ENDPOINTS } from "@/config/api";

export const verifyPayment = async (bookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!bookingId) {
      return {
        success: false,
        error: 'Booking ID is required'
      };
    }

    const endpoint = API_ENDPOINTS.payments.verify(bookingId);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'Failed to verify payment'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to verify payment'
    };
  }
};
