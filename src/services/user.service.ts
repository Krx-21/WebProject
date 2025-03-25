import axios from 'axios';

const API_URL = 'https://backend-delta-tawny-40.vercel.app/api/v1';

export const getUserProfile = async () => {
  try {
    // ใช้ token จาก localStorage เพื่อดึงข้อมูลโปรไฟล์
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await axios.get(`${API_URL}/me`, {
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
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found'
      };
    }

    const response = await axios.put(`${API_URL}/users/updatedetails`, userData, {
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