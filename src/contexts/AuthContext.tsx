import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  mfaEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // Check for demo mode on mount
  useEffect(() => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    if (isDemoMode) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse stored user:', error);
        }
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Demo mode: Allow login with test credentials (always check first for demo)
    const demoUsers: Record<string, { password: string; user: User }> = {
      'admin@bellaprep.com': {
        password: 'admin123',
        user: {
          id: 'demo-admin-1',
          email: 'admin@bellaprep.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          mfaEnabled: false,
        },
      },
      'admin@demo.com': {
        password: 'Demo123!',
        user: {
          id: 'demo-admin-2',
          email: 'admin@demo.com',
          firstName: 'Lender',
          lastName: 'Admin',
          role: 'LENDER_ADMIN',
          mfaEnabled: false,
        },
      },
    };

    const demoUser = demoUsers[email];
    if (demoUser && demoUser.password === password) {
      setUser(demoUser.user);
      localStorage.setItem('user', JSON.stringify(demoUser.user));
      localStorage.setItem('demo_mode', 'true');
      return;
    }

    // If demo credentials don't match, check if we should try API or throw error
    // Try real API login only if email is not a demo user
    if (!demoUser) {
      try {
        const response = await authApi.login({ email, password });
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: response.user.role,
          mfaEnabled: false,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('demo_mode');
        return;
      } catch (error: any) {
        // If API is not available, check if it's a network error
        const isNetworkError = error?.message?.includes('Failed to fetch') || 
                              error?.message?.includes('NetworkError') ||
                              error?.message?.includes('fetch') ||
                              error?.message?.includes('Network request failed') ||
                              error?.name === 'TypeError';
        
        if (isNetworkError) {
          // API unavailable and not a demo user - show error
          throw new Error('Invalid email or password');
        }
        
        console.error('Login failed:', error);
        throw error;
      }
    } else {
      // Demo user email but wrong password
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    try {
      authApi.logout();
    } catch (error) {
      // Ignore errors in demo mode
    }
    setUser(null);
    localStorage.removeItem('demo_mode');
  };

  const register = async (data: any) => {
    try {
      const response = await authApi.register(data);
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role,
        mfaEnabled: false,
      };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
