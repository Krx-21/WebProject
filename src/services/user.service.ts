import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

export const getUserProfile = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'No user data found'
      };
    }
    
    const user = JSON.parse(userStr);
    const token = user.token;
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user profile'
    };
  }
};

export const updateUserProfile = async (userData: any) => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'No user data found'
      };
    }
    
    const user = JSON.parse(userStr);
    const token = user.token;
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await axios.put(`${API_URL}/auth/updatedetails`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user profile'
    };
  }
};