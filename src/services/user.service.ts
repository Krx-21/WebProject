import axios from 'axios';
import { API_ENDPOINTS } from "@/config/api";

export const getUserProfile = async () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      return {
        success: false,
        error: 'User information is missing. Please log in again.'
      };
    }
    
    let user;
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('user');
      return {
        success: false,
        error: 'There was a problem reading your user information. Please log in again.'
      };
    }
    const token = user.token;
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token is missing. Please log in again.'
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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message:'Unable to fetch your profile. Please try again later.'
    };
    };
  }
};
