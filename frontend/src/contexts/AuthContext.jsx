import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser().finally(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.token) {
        localStorage.setItem('cc_token', res.data.token);
      }
      setUser(res.data.user);
      addToast(`Welcome back, ${res.data.user.name}!`, 'success');
      return res.data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data?.token) {
        localStorage.setItem('cc_token', res.data.token);
      }
      setUser(res.data.user);
      addToast('Registration successful! Welcome to Campus Crew.', 'success');
      return res.data.user;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue client logout even if backend failed
    } finally {
      localStorage.removeItem('cc_token');
      setUser(null);
      addToast('You have been logged out.', 'info');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.patch('/auth/profile', data);
      setUser((prev) => ({ ...prev, ...res.data }));
      addToast('Profile updated successfully!', 'success');
      return res.data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isCoordinator = user?.role === 'COORDINATOR' || user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAdmin,
        isCoordinator,
        isStudent,
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
