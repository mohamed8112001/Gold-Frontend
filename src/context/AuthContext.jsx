import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser, getUserById } from '../data/users';

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

  useEffect(() => {
    // التحقق من وجود مستخدم مسجل في localStorage
    const savedUser = localStorage.getItem('dibla_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('dibla_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const authenticatedUser = authenticateUser(email, password);
      if (authenticatedUser) {
        // إزالة كلمة المرور من البيانات المحفوظة
        const { password: _, ...userWithoutPassword } = authenticatedUser;
        setUser(userWithoutPassword);
        localStorage.setItem('dibla_user', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, error: 'بيانات الدخول غير صحيحة' };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const register = async (userData, storeData = null) => {
    try {
      // في التطبيق الحقيقي، سيتم إرسال البيانات إلى الخادم
      // هنا سنقوم بمحاكاة التسجيل
      const newUser = {
        id: Date.now(), // معرف مؤقت
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      // إذا كان المستخدم صاحب محل وتم تمرير بيانات المحل
      if (userData.userType === 'store-owner' && storeData) {
        // سيتم إنشاء المحل في StoreOwnerDashboard أو في component منفصل
        // هنا نحفظ فقط معرف المستخدم
        newUser.storeData = storeData;
      }
      
      // إزالة كلمة المرور من البيانات المحفوظة
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('dibla_user', JSON.stringify(userWithoutPassword));
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء إنشاء الحساب' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dibla_user');
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isStoreOwner: user?.userType === 'store-owner',
    isRegularUser: user?.userType === 'user'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

