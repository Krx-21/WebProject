import { API_ENDPOINTS } from "@/config/api";

export const getAllRcps = async () => {
  try {
    const endpoint = API_ENDPOINTS.rentalCarProviders.getAll;
    const response = await fetch(endpoint, {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data'
    };
  }
};

export const getRcpById = async (id: string) => {
  try {
    const endpoint = API_ENDPOINTS.rentalCarProviders.getOne(id);
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
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
    return {
      success: false,
      error: 'Failed to fetch data'
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

    const endpoint = API_ENDPOINTS.rentalCarProviders.create;
    const response = await fetch(endpoint, {
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

    const endpoint = API_ENDPOINTS.rentalCarProviders.update(id);
    const response = await fetch(endpoint, {
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
      throw new Error('Failed to update provider');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to update provider'
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

    if (!meData.data.myRcpId) {
      return {
        success: true,
        data: []
      };
    }

    const endpoint = API_ENDPOINTS.rentalCarProviders.getOne(meData.data.myRcpId);
    const response = await fetch(endpoint, {
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
        return {
          success: true,
          data: []
        };
      }
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();

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
    return {
      success: false,
      error: 
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

    const endpoint = API_ENDPOINTS.rentalCarProviders.delete(id);
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete provider');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to delete provider'
    };
  }
};