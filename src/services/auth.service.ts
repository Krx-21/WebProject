import { API_ENDPOINTS } from "@/config/api";
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

    const endpoint = API_ENDPOINTS.auth.register
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
      mode: 'cors'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Oops! Something went wrong. Please try again later.');
    }

    if (!data.success) {
      throw new Error('We couldn’t complete your registration. Please try again.');
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: 'Oops! Something went wrong. Please try again later.',
    };
  }
};

export const login = async (credentials: LoginCredentials) => {
  try {

    const endpoint = API_ENDPOINTS.auth.login
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
      mode: 'cors'
    });

    const headers: { [key: string]: string } = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });


    if (!response.ok) {
      throw new Error(`Incorrect Email or Password. Please try again.`);
    }

    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('Failed to parse login response');
    }


    if (!data.success) {
      throw new Error('Login failed');
    }

    const userData = {
      ...data.data,
      token: data.token
    };

    if (data.role) {
      userData.role = data.role;
    } else if (data.data?.role) {
      userData.role = data.data.role;
    }

    localStorage.setItem('user', JSON.stringify(userData));

    return {
      success: true,
      data: userData
    };
  } catch (error) {
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
    return null;
  }
};

export const logout = async () => {
  try {
    const user = getCurrentUser();
    const endpoint = API_ENDPOINTS.auth.logout
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': user ? `Bearer ${user.token}` : ''
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Oops! Something went wrong. Please try again later.`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to logout');
    }

    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    localStorage.removeItem('user');
    throw error;
  }
};

export const isAuthenticated = () => {
  const user = getCurrentUser();
  return !!user; //user ? true : false;
};