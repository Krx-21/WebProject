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
        error: 'Please log in to make a booking.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Your session has expired. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'You need to be logged in to make a booking. Please log in and try again.'
      };
    }
    if(!bookingData.carId) throw new Error('Please select a car to book.');
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
      throw new Error('There was an issue completing your booking. Please try again later.');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Something went wrong while processing your booking. Please try again.' 
    };
  }
};

export const getUserBookings = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Please log in to view your bookings.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Your session is no longer valid. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'You need to be logged in to view your bookings. Please log in and try again.'
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to retrieve your bookings. Please try again later.');
    }

    return {
      success: true,
      data: data.data || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message :'There was an issue loading your bookings. Please try again.'
    };
  }
};

export const updateBooking = async (id: string, bookingData: BookingData) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Please log in to update your bookings.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Your session has expired. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'You need to be logged in to update your booking. Please log in and try again.'
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error('Failed to update your booking. Please try again.');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message :'Something went wrong while updating your booking. Please try again.'
    };
  }
};

export const getBooking = async (id: string) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Please log in to view your bookings.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Your session is no longer valid. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Please log in to view your booking.'
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
      throw new Error('Failed to load the booking. Please try again later.');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Something went wrong while fetching your booking details. Please try again.'
    };
  }
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'processing' | 'completed' | 'failed') => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Please log in to update your booking status.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Your session is no longer valid. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'You need to be logged in to update the booking status. Please log in and try again.'
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
      throw new Error('Failed to update booking status. Please try again.');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message :'There was an issue updating the booking status. Please try again.'
    };
  }
};

export const deleteBooking = async (id: string) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Please log in to delete your booking.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Your session is no longer valid. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'You need to be logged in to delete a booking. Please log in and try again.'
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
      throw new Error('Failed to delete your booking. Please try again.');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message :'An error occurred while trying to delete your booking. Please try again.'
    };
  }
};