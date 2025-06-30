import React, { createContext, useContext, useState } from 'react';
import { mockStores } from '../data/stores';

const StoresContext = createContext();

export const useStores = () => {
  const context = useContext(StoresContext);
  if (!context) {
    throw new Error('useStores must be used within a StoresProvider');
  }
  return context;
};

export const StoresProvider = ({ children }) => {
  const [stores, setStores] = useState(mockStores);

  // إضافة محل جديد
  const addStore = (storeData) => {
    const newStore = {
      id: Date.now(),
      ...storeData,
      rating: 0,
      reviewsCount: 0,
      createdAt: new Date().toISOString()
    };
    setStores(prev => [...prev, newStore]);
    return newStore;
  };

  // تحديث محل موجود
  const updateStore = (storeId, updatedData) => {
    setStores(prev => 
      prev.map(store => 
        store.id === storeId 
          ? { ...store, ...updatedData }
          : store
      )
    );
  };

  // حذف محل
  const deleteStore = (storeId) => {
    setStores(prev => prev.filter(store => store.id !== storeId));
  };

  // الحصول على محل بواسطة ID
  const getStoreById = (storeId) => {
    return stores.find(store => store.id === storeId);
  };

  // الحصول على محلات صاحب محل معين
  const getStoresByOwnerId = (ownerId) => {
    return stores.filter(store => store.ownerId === ownerId);
  };

  // البحث في المحلات
  const searchStores = (query) => {
    if (!query) return stores;
    
    return stores.filter(store => 
      store.name.toLowerCase().includes(query.toLowerCase()) ||
      store.description.toLowerCase().includes(query.toLowerCase()) ||
      store.location.toLowerCase().includes(query.toLowerCase()) ||
      store.specialties.some(specialty => 
        specialty.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const value = {
    stores,
    addStore,
    updateStore,
    deleteStore,
    getStoreById,
    getStoresByOwnerId,
    searchStores
  };

  return (
    <StoresContext.Provider value={value}>
      {children}
    </StoresContext.Provider>
  );
};

