const BASE_URL = 'http://localhost:5000/api/v1';

export const getAllRcps = async () => {
  try {
    console.log('Fetching all rental car providers...');

    try {
      const response = await fetch(`${BASE_URL}/rentalCarProviders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);

      return {
        success: true,
        data: data.data || data
      };
    } catch (fetchError) {
      console.error('Fetch error in getAllRcps:', fetchError);

      // Return a more specific error for network issues
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Network error: Could not connect to the server. Please check your internet connection.'
        };
      }

      throw fetchError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error('Error fetching RCPs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data'
    };
  }
};

export const getRcpById = async (id: string) => {
  try {
    console.log('Fetching RCP with ID:', id); // Debug log

    const response = await fetch(`${BASE_URL}/rentalCarProviders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    console.log('Raw response data:', rawData); // Debug log

    if (!rawData) {
      throw new Error('Empty response received');
    }

    return {
      success: true,
      data: rawData.data || rawData
    };
  } catch (error) {
    console.error('Error fetching RCP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data'
    };
  }
};

export const createRcp = async (rcpData: any) => {
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

    const response = await fetch(`${BASE_URL}/rentalCarProviders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // credentials: 'include', // Removing this to avoid CORS issues
      body: JSON.stringify(rcpData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.msg || `Error ${response.status}: Failed to create provider`);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Create provider error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create provider'
    };
  }
};

export const updateRcp = async (id: string, rcpData: any) => {
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

    const response = await fetch(`${BASE_URL}/rentalCarProviders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // credentials: 'include', // Removing this to avoid CORS issues
      body: JSON.stringify(rcpData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.msg || `Error ${response.status}: Failed to update provider`);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Update provider error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update provider'
    };
  }
};

export const deleteRcp = async (id: string) => {
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

    const response = await fetch(`${BASE_URL}/rentalCarProviders/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // credentials: 'include' // Removing this to avoid CORS issues
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error ${response.status}: Failed to delete provider`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Delete provider error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete provider'
    };
  }
};