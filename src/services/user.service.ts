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
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message: 'Failed to fetch user profile'
    };
  }
};
