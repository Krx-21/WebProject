import { API_ENDPOINTS } from '@/config/api';

interface BookingData {
  start_date: string;
  end_date: string;
  providerId: string;
  carId?: string;
  promoId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export const createBooking = async (rcpId: string, bookingData: BookingData) => {
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

    const endpoint = bookingData.carId
      ? `${API_ENDPOINTS.cars.getOne(bookingData.carId)}/bookings`
      : `${API_ENDPOINTS.rentalCarProviders.getOne(rcpId)}/bookings`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
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

    const response = await fetch(API_ENDPOINTS.bookings.getAll, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: Failed to fetch bookings`);
    }

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      console.log('First booking structure:', JSON.stringify(data.data[0], null, 2));
    } else {
      console.log('No bookings found or empty data array');
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    };
  }
};

export const updateBooking = async (id: string, bookingData: BookingData) => {
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

    const response = await fetch(API_ENDPOINTS.bookings.getOne(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
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

export const getBooking = async (id: string) => {
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

    const response = await fetch(API_ENDPOINTS.bookings.getOne(id), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: Failed to fetch booking`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Get booking error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch booking'
    };
  }
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'processing' | 'completed' | 'failed') => {
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

    const bookingData = { status };

    const response = await fetch(API_ENDPOINTS.bookings.getOne(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: Failed to update booking status`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Update booking status error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update booking status'
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

    const response = await fetch(API_ENDPOINTS.bookings.getOne(id), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
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