import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

export const useShopNotifications = (onShopApproved, onShopRejected) => {
  const { user, isShopOwner } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !isShopOwner) return;

    // إنشاء اتصال WebSocket
    const token = localStorage.getItem('dibla_token');
    if (!token) return;

    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5010', {
      query: {
        token: token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // الاستماع لإشعارات الموافقة
    socket.on('shopApproved', (data) => {
      console.log('Shop approved notification received:', data);
      
      // عرض إشعار للمستخدم
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('تم الموافقة على متجرك!', {
          body: data.message,
          icon: '/favicon.ico'
        });
      }
      
      // استدعاء callback function
      if (onShopApproved) {
        onShopApproved(data);
      }
      
      // عرض alert كبديل
      alert(`🎉 ${data.message}`);
    });

    // الاستماع لإشعارات الرفض
    socket.on('shopRejected', (data) => {
      console.log('Shop rejected notification received:', data);
      
      // عرض إشعار للمستخدم
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('تم رفض طلب تفعيل متجرك', {
          body: data.message,
          icon: '/favicon.ico'
        });
      }
      
      // استدعاء callback function
      if (onShopRejected) {
        onShopRejected(data);
      }
      
      // عرض alert كبديل
      alert(`❌ ${data.message}\nالسبب: ${data.reason}`);
    });

    // طلب إذن الإشعارات
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // تنظيف الاتصال عند إلغاء التحميل
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, isShopOwner, onShopApproved, onShopRejected]);

  return socketRef.current;
};
