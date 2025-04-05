const BASE_URL = process.env.NODE_ENV === 'development' 
  ? '/api/v1' 
  : 'https://backend-delta-tawny-40.vercel.app/api/v1';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  telephoneNumber: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
  message?: string;
}

export const register = async (userData: RegisterData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message || 'Failed to register'
    };
  }
};

export const login = async (credentials: LoginCredentials) => {
  try {
    console.log('Sending login request:', credentials);
    
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors'
    });

    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Login error response:', errorData);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Login API response:', data);

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const userData = {
      ...data.data,
      token: data.token
    };

    if (data.role) {
      userData.role = data.role;
      console.log('Found role in data.role:', data.role);
    } else if (data.data?.role) {
      userData.role = data.data.role;
      console.log('Found role in data.data.role:', data.data.role);
    } else {
      console.error('No role found in API response!', data);
    }

    console.log('Final user data with role:', userData);
    localStorage.setItem('user', JSON.stringify(userData));

    return {
      success: true,
      data: userData
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during login'
    };
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    console.log("Raw user data from localStorage:", userStr);
    
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    console.log("Parsed user data:", user);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to logout');
    }
    
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('user');
    throw error;
  }
};

export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user;
};