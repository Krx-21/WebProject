import axios from 'axios';
import { API_ENDPOINTS } from "@/config/api";

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

    const endpoint = API_ENDPOINTS.auth.getme;
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to fetch user profile'
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

    const endpoint = API_ENDPOINTS.auth.update
    const response = await axios.put(endpoint, 
      userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to update user profile'
    };
  }
};