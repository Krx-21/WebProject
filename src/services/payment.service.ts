import { API_ENDPOINTS } from "@/config/api";

export const verifyPayment = async (bookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!bookingId) {
      return {
        success: false,
        error: 'Booking ID is required'
      };
    }

    const response = await fetch(`${API_ENDPOINTS.payments.verify(bookingId)}`, {
      method: 'GET',
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
        error: data.message || 'Failed to verify payment'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment'
    };
  }
};
