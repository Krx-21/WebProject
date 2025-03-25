'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  login: (credentials: any) => Promise<any>;
  register: (userData: any) => Promise<any>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log("Loaded user from localStorage:", parsedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Error checking authentication:', err);
        setError('Authentication check failed');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Saving user to localStorage:", user); 
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (credentials: any) => {
    try {
      setError(null);
      const response = await apiLogin(credentials);
      
      if (response.success) {
        console.log("Login successful, response data:", response.data); 
        setUser(response.data);
        return { success: true };
      } else {
        setError(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      const response = await apiRegister(userData);
      
      if (response.success) {
        return { success: true };
      } else {
        setError(response.error || 'Registration failed');
        return { success: false, error: response.error };
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to register';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    try {
      apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, error }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}