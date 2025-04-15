const BASE_URL = 'http://localhost:5000/api/v1';

import { BookingFormData } from '@/types/booking';

// Calculate the total price based on car price per day and booking duration
const calculateTotalPrice = async (carId: string, startDate: string, endDate: string) => {
  try {
    console.log('Calculating price for:', { carId, startDate, endDate });

    // Calculate days manually as a fallback
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    try {
      const response = await fetch(`${BASE_URL}/cars/calculate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId,
          startDate,
          endDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate price');
      }

      const data = await response.json();
      console.log('Price calculation response:', data);
      return data.data.totalPrice;
    } catch (fetchError) {
      console.error('Error fetching price calculation:', fetchError);

      // Fallback: Get car price and calculate manually
      const carResponse = await fetch(`${BASE_URL}/cars/${carId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!carResponse.ok) {
        throw new Error('Failed to get car details');
      }

      const carData = await carResponse.json();
      console.log('Car data for price calculation:', carData);

      // Handle different response formats
      let pricePerDay = 0;
      if (carData.data && typeof carData.data.pricePerDay === 'number') {
        pricePerDay = carData.data.pricePerDay;
      } else if (carData.pricePerDay && typeof carData.pricePerDay === 'number') {
        pricePerDay = carData.pricePerDay;
      }

      const totalPrice = pricePerDay * days;
      console.log(`Calculated price: ${pricePerDay} × ${days} = ${totalPrice}`);
      return totalPrice;
    }
  } catch (error) {
    console.error('Error calculating price:', error);
    return 0; // Return 0 instead of null to avoid further errors
  }
};

export const createBooking = async (carId: string, bookingData: BookingFormData) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Invalid user data'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Calculate total price
    const totalPrice = await calculateTotalPrice(carId, bookingData.start_date, bookingData.end_date);

    if (!totalPrice) {
      return {
        success: false,
        error: 'Failed to calculate total price'
      };
    }

    const bookingPayload = {
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      totalprice: totalPrice
    };

    const response = await fetch(`${BASE_URL}/cars/${carId}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // credentials: 'include',
      body: JSON.stringify(bookingPayload),
    });

    const data = await response.json();
    console.log('Create booking response:', data);

    if (!response.ok) {
      throw new Error(data.message || data.msg || 'Failed to create booking');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Create booking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create booking'
    };
  }
};

export const getUserBookings = async () => {
  try {
    console.log('Fetching user bookings...');

    // Get user data from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('No user found in localStorage');
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Parse user data
    let userData;
    try {
      userData = JSON.parse(userStr);
      console.log('User data parsed successfully');
    } catch (error) {
      console.error('Failed to parse user data:', error);
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Invalid user data'
      };
    }

    // Check for token
    const token = userData.token;
    if (!token) {
      console.log('No token found in user data');
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    console.log('Making API request to fetch bookings...');

    // Use try-catch for the fetch operation specifically
    try {
      const response = await fetch(`${BASE_URL}/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
        // credentials: 'include' removed to avoid CORS issues
      });

      console.log('Received response:', response.status);

      // Handle response status
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Authentication failed (401)');
          return {
            success: false,
            error: 'Authentication required'
          };
        }

        // Try to parse error response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error ${response.status}: Failed to fetch bookings`);
        } catch (jsonError) {
          // If we can't parse the error response, use a generic error
          throw new Error(`Error ${response.status}: Failed to fetch bookings`);
        }
      }

      // Parse successful response
      const data = await response.json();
      console.log('Bookings data received:', data);

      return {
        success: true,
        data: data.data || []
      };
    } catch (fetchError) {
      console.error('Fetch operation failed:', fetchError);

      // Return a more specific error for network issues
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Network error: Could not connect to the server. Please check your internet connection.'
        };
      }

      throw fetchError; // Re-throw to be caught by the outer catch
    }
  } catch (error: any) {
    console.error('Error in getUserBookings:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    };
  }
};

export const updateBooking = async (id: string, bookingData: BookingFormData) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Invalid user data'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Calculate total price
    const totalPrice = await calculateTotalPrice(bookingData.carId, bookingData.start_date, bookingData.end_date);

    if (!totalPrice) {
      return {
        success: false,
        error: 'Failed to calculate total price'
      };
    }

    const bookingPayload = {
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      car: bookingData.carId,
      totalprice: totalPrice
    };

    const response = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // credentials: 'include', // Removing this to avoid CORS issues
      body: JSON.stringify(bookingPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: Failed to update booking`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Update booking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update booking'
    };
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Invalid user data'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // credentials: 'include' // Removing this to avoid CORS issues
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: Failed to delete booking`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Delete booking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete booking'
    };
  }
};