const BASE_URL = 'https://backend-six-bay-39.vercel.app/api/v1';

export const getAllRcps = async () => {
  try {
    const response = await fetch(`${BASE_URL}/rentalCarProviders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data || data
    };
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
    const response = await fetch(`${BASE_URL}/rentalCarProviders/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();

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
      credentials: 'include',
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
      credentials: 'include',
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

export const getMyRcp = async () => {
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

    const meResponse = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!meResponse.ok) {
      throw new Error(`Failed to get user data: ${meResponse.status}`);
    }

    const meData = await meResponse.json();
    console.log('Current user data from API:', meData);

    if (!meData.data.myRcpId) {
      console.log('User has no myRcpId');
      return {
        success: true,
        data: []
      };
    }

    const response = await fetch(`${BASE_URL}/rentalCarProviders/${meData.data.myRcpId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Provider not found with ID:', meData.data.myRcpId);
        return {
          success: true,
          data: []
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('My RCP data from API:', data);

    if (data.success && data.data) {
      return {
        success: true,
        data: [data.data]
      };
    } else if (data.success) {
      return {
        success: true,
        data: [data]
      };
    } else {
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching my RCP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data'
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
      credentials: 'include'
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