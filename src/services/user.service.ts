import { API_ENDPOINTS } from "@/config/api";
import { getCurrentUser } from "./auth.service";

/**
 * Interface for user profile data returned from the API
 */
export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  telephoneNumber?: string;
  createdAt?: string;
}

/**
 * Interface for user profile update data
 */
export interface UserProfileUpdateData {
  name?: string;
  email?: string;
  telephoneNumber?: string;
}

/**
 * Interface for password change data
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Get the current user's profile
 *
 * @returns Promise with user profile data or error
 */
export const getUserProfile = async (): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    // Try to get from cache first
    try {
      const cachedProfile = sessionStorage.getItem('user_profile');
      if (cachedProfile) {
        const parsedProfile = JSON.parse(cachedProfile);
        const cacheAge = Date.now() - parsedProfile.timestamp;

        // Only use cache if it's less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          console.log('Retrieved user profile from cache');
          return {
            success: true,
            data: parsedProfile.data
          };
        }
      }
    } catch (cacheError) {
      console.warn('Failed to retrieve cached user profile:', cacheError);
    }

    const response = await fetch(API_ENDPOINTS.auth.getme, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        // Clear the stored user data as the token is likely invalid
        localStorage.removeItem('user');
        return {
          success: false,
          error: 'Your session has expired. Please log in again.'
        };
      }

      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to fetch user profile'
      };
    }

    // Cache the user profile data
    try {
      sessionStorage.setItem('user_profile', JSON.stringify({
        data: data.data,
        timestamp: Date.now()
      }));
    } catch (cacheError) {
      console.warn('Failed to cache user profile:', cacheError);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch user profile'
    };
  }
};

/**
 * Update the current user's profile
 *
 * @param userData - The user profile data to update
 * @returns Promise with updated user profile data or error
 */
export const updateUserProfile = async (userData: UserProfileUpdateData): Promise<{ success: boolean; data?: UserProfile; error?: string }> => {
  try {
    // Validate user data
    const validationErrors = validateUserProfileData(userData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(', ')}`
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_ENDPOINTS.auth.getme.replace('/me', '/updatedetails')}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        // Clear the stored user data as the token is likely invalid
        localStorage.removeItem('user');
        return {
          success: false,
          error: 'Your session has expired. Please log in again.'
        };
      }

      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to update user profile'
      };
    }

    // Update the stored user data with the new information
    const updatedUser = {
      ...user,
      ...data.data
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Clear the cached profile to ensure fresh data on next fetch
    try {
      sessionStorage.removeItem('user_profile');
    } catch (cacheError) {
      console.warn('Failed to clear cached user profile:', cacheError);
    }

    return {
      success: true,
      data: data.data
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user profile'
    };
  }
};

/**
 * Validates user profile data and returns an array of validation errors
 *
 * @param userData - The user profile data to validate
 * @returns Array of validation error messages (empty if valid)
 */
const validateUserProfileData = (userData: UserProfileUpdateData): string[] => {
  const errors: string[] = [];

  if (userData.name !== undefined) {
    if (userData.name.trim() === '') {
      errors.push('Name cannot be empty');
    } else if (userData.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (userData.name.length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }
  }

  if (userData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userData.email.trim() === '') {
      errors.push('Email cannot be empty');
    } else if (!emailRegex.test(userData.email)) {
      errors.push('Email format is invalid');
    }
  }

  if (userData.telephoneNumber !== undefined) {
    const phoneRegex = /^\d{10,15}$/;
    if (userData.telephoneNumber.trim() !== '' && !phoneRegex.test(userData.telephoneNumber.replace(/\D/g, ''))) {
      errors.push('Telephone number must contain 10-15 digits');
    }
  }

  return errors;
};

/**
 * Change the current user's password
 *
 * @param currentPassword - The user's current password
 * @param newPassword - The new password to set
 * @returns Promise with success message or error
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    // Validate password data
    const validationErrors = validatePasswordData(currentPassword, newPassword);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation errors: ${validationErrors.join(', ')}`
      };
    }

    const user = getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }

    const response = await fetch(`${API_ENDPOINTS.auth.getme.replace('/me', '/updatepassword')}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 401) {
        // This could be due to incorrect current password
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the original error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Failed to change password'
      };
    }

    // If the password was changed successfully, update the token in localStorage
    if (data.token) {
      const updatedUser = {
        ...user,
        token: data.token
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return {
      success: true,
      message: data.message || 'Password changed successfully'
    };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: error.message || 'Failed to change password'
    };
  }
};

/**
 * Validates password data and returns an array of validation errors
 *
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @returns Array of validation error messages (empty if valid)
 */
const validatePasswordData = (currentPassword: string, newPassword: string): string[] => {
  const errors: string[] = [];

  if (!currentPassword || currentPassword.trim() === '') {
    errors.push('Current password is required');
  }

  if (!newPassword || newPassword.trim() === '') {
    errors.push('New password is required');
  } else {
    // Password strength validation
    if (newPassword.length < 8) {
      errors.push('New password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(newPassword)) {
      errors.push('New password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(newPassword)) {
      errors.push('New password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(newPassword)) {
      errors.push('New password must contain at least one number');
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      errors.push('New password must contain at least one special character');
    }
  }

  if (currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  return errors;
};