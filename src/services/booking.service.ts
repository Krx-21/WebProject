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
        error: `Invalid user data ${error}`
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    if(!bookingData.carId) throw new Error('Failed to create booking');
    const endpoint = API_ENDPOINTS.bookings.bookingthiscar(bookingData.carId);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to create booking');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to create booking'
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

    const endpoint = API_ENDPOINTS.bookings.getAll
    const response = await fetch(endpoint, {
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
      throw new Error('Failed to load bookings.');
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data || []
    };
  } catch (error: any) {

    return {
      success: false,
      error: 'Failed to load bookings.'
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

    const endpoint = API_ENDPOINTS.bookings.getOne(id);
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error('Failed to edit booking');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to edit booking'
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

    const endpoint = API_ENDPOINTS.bookings.getOne(id);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load this booking');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to load this booking'
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

    const endpoint = API_ENDPOINTS.bookings.getOne(id);
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Failed to edit booking status');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to edit booking status'
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

    const endpoint = API_ENDPOINTS.bookings.getOne(id);
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove booking');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to remove booking'
    };
  }
};