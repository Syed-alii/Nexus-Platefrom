import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'business_nexus_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkCompletion = (data: any, role: UserRole) => {
    // Backend returns { profile: { ... } } or a flattened object depending on endpoint
    const profile = data.profile || data;
    if (!profile) return false;
    
    if (role === 'entrepreneur') {
      return !!(profile.startupName && profile.industry);
    } else {
      // Check for investment interests or stages
      const interests = profile.investmentInterests || profile.investmentFocus;
      const stages = profile.investmentStage;
      return !!((interests && interests.length > 0) || (stages && stages.length > 0));
    }
  };

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (token && storedUser) {
        try {
          const [userRes, profileRes] = await Promise.all([
            api.get('/auth/me'),
            api.get('/profile/me')
          ]);
          
          setUser(userRes.data.user);
          setIsProfileComplete(checkCompletion(profileRes.data, userRes.data.user.role));
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userRes.data.user));
        } catch (error) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.user.role !== role) {
        throw new Error(`Invalid role selected. You are registered as ${response.data.user.role}.`);
      }

      const { token, user: loggedInUser } = response.data;
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      // Fetch profile to check completion
      const profileRes = await api.get('/profile/me');
      
      setUser(loggedInUser);
      setIsProfileComplete(checkCompletion(profileRes.data, loggedInUser.role));
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      
      toast.success('Successfully logged in!');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user: newUser } = response.data;
      
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      setUser(newUser);
      setIsProfileComplete(false); // New users always have incomplete profiles
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setIsProfileComplete(false);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Reset instructions sent to your email.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await api.put(`/auth/reset-password/${token}`, { password: newPassword });
      toast.success('Password reset successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
      throw error;
    }
  };

  const updateProfile = async (userId: string, updates: any): Promise<void> => {
    try {
      const response = await api.put('/profile', updates);
      setIsProfileComplete(checkCompletion(response.data.profile, user!.role));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isProfileComplete,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
