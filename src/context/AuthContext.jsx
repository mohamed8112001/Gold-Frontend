import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      const userData = authService.getCurrentUser();



      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);


        // Verify token is still valid (optional - remove if causing issues)
        // try {
        //   await authService.refreshToken();
        // } catch (error) {
        //   // Token is invalid, clear auth state
        //   await logout();
        // }
      } else {
        // No token or user data, but don't redirect automatically

        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Don't logout automatically on initialization error
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      const userData = authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);
      const userDataFromStorage = authService.getCurrentUser();
      setUser(userDataFromStorage);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = () => {
    authService.googleLogin();
  };

  const handleGoogleCallback = async () => {
    try {
      setIsLoading(true);
      const response = await authService.handleGoogleCallback();
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // Update role checks to match backend user model
  const isShopOwner = user?.role === 'seller';
  const isRegularUser = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isShopOwner,
    isRegularUser,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    googleLogin,
    handleGoogleCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };