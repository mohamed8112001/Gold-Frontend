import React, { createContext, useContext, useState } from 'react';
import { mockProducts as initialProducts } from '../data/products';

const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);

  // إضافة منتج جديد
  const addProduct = (productData) => {
    const newProduct = {
      id: Date.now(),
      ...productData,
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    return newProduct;
  };

  // تحديث منتج موجود
  const updateProduct = (productId, updatedData) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { ...product, ...updatedData }
          : product
      )
    );
  };

  // حذف منتج
  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
  };

  // الحصول على منتجات محل معين
  const getProductsByStoreId = (storeId) => {
    return products.filter(product => product.storeId === storeId);
  };

  // الحصول على منتج بواسطة ID
  const getProductById = (productId) => {
    return products.find(product => product.id === productId);
  };

  const value = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductsByStoreId,
    getProductById
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

