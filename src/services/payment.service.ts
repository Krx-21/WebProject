import { API_ENDPOINTS } from "@/config/api";

export const verifyPayment = async (bookingId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    if (!bookingId) {
      return {
        success: false,
        error: 'Please provide a valid booking ID.'
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
      throw new Error('We couldn’t verify the payment. Please try again later.');
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: 'We couldn’t verify the payment. Please check your payment details and try again.'
      };
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'Something went wrong while verifying the payment. Please try again later.'
    };
  }
};
