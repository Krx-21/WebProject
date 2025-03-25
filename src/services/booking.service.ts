const BASE_URL = 'https://backend-delta-tawny-40.vercel.app/api/v1';

interface BookingData {
  date: string;
  providerId: string;
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

    const response = await fetch(`${BASE_URL}/rentalCarProviders/${rcpId}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
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

    const response = await fetch(`${BASE_URL}/bookings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
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
    console.log('Bookings data:', data);

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

    const response = await fetch(`${BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
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
      credentials: 'include'
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