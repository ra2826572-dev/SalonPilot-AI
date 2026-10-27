import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Salon } from '../types';

interface AuthContextType {
  user: User | null;
  salon: Salon | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ redirectUrl: string }>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    salonName: string;
    acceptTerms: boolean;
  }) => Promise<{ redirectUrl: string }>;
  logout: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; testResetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('salonpilot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount
  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('salonpilot_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setSalon(data.salon);
          setToken(storedToken);
        } else {
          // Token expired or invalid
          localStorage.removeItem('salonpilot_token');
          setToken(null);
          setUser(null);
          setSalon(null);
        }
      } catch (err) {
        console.error('Session validation error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('salonpilot_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setSalon(data.salon);

      return { redirectUrl: data.redirectUrl || '/dashboard' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    salonName: string;
    acceptTerms: boolean;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Registration failed');
      }

      localStorage.setItem('salonpilot_token', resData.token);
      setToken(resData.token);
      setUser(resData.user);
      setSalon(resData.salon);

      return { redirectUrl: resData.redirectUrl || '/dashboard' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.warn('Logout network error:', err);
    } finally {
      localStorage.removeItem('salonpilot_token');
      setToken(null);
      setUser(null);
      setSalon(null);
    }
  };

  const verifyEmail = async () => {
    if (!token) return;
    const res = await fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      if (user) {
        setUser({ ...user, emailVerified: true });
      }
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Failed to verify email');
    }
  };

  const forgotPassword = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password reset request failed');
    }
    return data;
  };

  const resetPassword = async (resetToken: string, newPassword: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Password reset failed');
    }
  };

  const refreshSession = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSalon(data.salon);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        salon,
        token,
        isLoading,
        login,
        register,
        logout,
        verifyEmail,
        forgotPassword,
        resetPassword,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
