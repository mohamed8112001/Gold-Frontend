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
      console.log('🔄 Initializing authentication...');
      const token = authService.getToken();
      const userData = authService.getCurrentUser();

      console.log('🔍 Auth check:', { hasToken: !!token, hasUserData: !!userData });

      if (token && userData) {
        console.log('✅ User authenticated:', userData.name);
        setUser(userData);
        setIsAuthenticated(true);
      } else if (token && !userData) {
        // إذا كان هناك توكن لكن لا توجد بيانات مستخدم، جرب تحديث البيانات
        console.log('🔄 Token found but no user data, refreshing...');
        try {
          await authService.refreshToken();
          const refreshedUserData = authService.getCurrentUser();
          if (refreshedUserData) {
            setUser(refreshedUserData);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('❌ No authentication found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
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

  const googleLogin = async (credentialResponse) => {
    try {
      setIsLoading(true);
      // Pass the Google ID token (credential) to authService.googleAuth
      const response = await authService.googleAuth(credentialResponse.credential);
      
      // Assuming authService.googleAuth returns { user, isNewUser }
      const { user: googleUser, isNewUser } = response;
      
      setUser(googleUser);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleRegister = async (credentialResponse,userType) => {
    try {
      setIsLoading(true);
      // Pass the Google ID token (credential) to authService.googleAuth
      const response = await authService.googleAuth(credentialResponse.credential, userType);
      
      // Assuming authService.googleAuth returns { user, isNewUser }
      const { user: googleUser, isNewUser } = response;
      
      setUser(googleUser);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Google auth error:', error);
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

  // دالة لإعادة تحميل بيانات المستخدم
  const reloadUser = () => {
    console.log('🔄 Reloading user data...');
    const token = authService.getToken();
    const userData = authService.getCurrentUser();

    if (token && userData) {
      console.log('✅ User data reloaded:', userData.name);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } else {
      console.log('❌ No user data found during reload');
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

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
    reloadUser,
    googleLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };