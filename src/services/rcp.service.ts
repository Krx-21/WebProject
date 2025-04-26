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
      throw new Error(`Unable to fetch rental car providers. (Status: ${response.status})`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data || data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Something went wrong while loading the providers. Please try again.'
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
      throw new Error('Unable to retrieve provider details.');
    }

    const rawData = await response.json();

    if (!rawData) {
      throw new Error('Received an empty response from the server.');
    }

    return {
      success: true,
      data: rawData.data || rawData
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'Could not load provider details. Please try again later.'
    };
  }
};

export const createRcp = async (rcpData: any) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'You need to be logged in to create a provider.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Invalid login session. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found. Please log in again.'
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
      throw new Error('Could not create the provider. Please try again.');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'Failed to create the provider. Please check your information and try again.'
    };
  }
};

export const updateRcp = async (id: string, rcpData: any) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'You must be logged in to update a provider.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Session expired. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is missing. Please log in again.'
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
      throw new Error('Unable to update provider. Please try again.');
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to update provider. Please try again later.'
    };
  }
};

export const getMyRcp = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'You need to be logged in to access your provider.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Invalid session. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication token not found. Please log in again.'
      };
    }

    const endpoint1 = API_ENDPOINTS.auth.getme;
    const meResponse = await fetch(endpoint1, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!meResponse.ok) {
      throw new Error(`Unable to fetch user profile.`);
    }

    const meData = await meResponse.json();

    if (!meData.data.myRcpId) {
      return {
        success: true,
        data: []
      };
    }

    const endpoint2 = API_ENDPOINTS.rentalCarProviders.getOne(meData.data.myRcpId);
    const response = await fetch(endpoint2, {
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
      throw new Error('Failed to fetch your provider details.');
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
      error: error instanceof Error ? error.message:'Could not load your provider information. Please try again later.'
    };
  }
};

export const deleteRcp = async (id: string) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'Please log in to delete a provider.'
      };
    }

    let userData;
    try {
      userData = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'Session expired. Please log in again.'
      };
    }

    const token = userData.token;
    if (!token) {
      return {
        success: false,
        error: 'Authentication token missing. Please log in again.'
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
      throw new Error('Unable to delete the provider. Please try again.');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'Failed to delete the provider. Please try again later.'
    };
  }
};