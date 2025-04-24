// Use backend API directly
const BASE_URL = 'https://backend-six-bay-39.vercel.app/api/v1';

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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
      mode: 'cors'
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
    console.log('Sending login request to:', `${BASE_URL}/auth/login`);

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors'
    });

    console.log('Login response status:', response.status);
    const headers: { [key: string]: string } = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Login response headers:', headers);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;

      try {
        const responseText = await response.text();
        console.log('Error response text:', responseText);

        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
            console.error('Login error response:', errorData);
            errorMessage = errorData?.message || errorMessage;
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
          }
        }
      } catch (textError) {
        console.error('Could not read response text:', textError);
      }

      throw new Error(errorMessage);
    }

    let data;
    try {
      const responseText = await response.text();
      console.log('Response text:', responseText);
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse login response');
    }

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

    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    const user = getCurrentUser();
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': user ? `Bearer ${user.token}` : ''
      },
      mode: 'cors'
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