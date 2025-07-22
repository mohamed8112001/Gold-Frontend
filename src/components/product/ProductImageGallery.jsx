import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const ProductImageGallery = ({ product, mainImage, setMainImage, selectedImage, setSelectedImage }) => {
  // Create array of all images (logoUrl + additional images)
  const allImages = [];
  
  // Add logoUrl as first image if it exists
  if (product.logoUrl) {
    allImages.push(product.logoUrl);
  }
  
  // Add additional images
  if (product.images && Array.isArray(product.images)) {
    allImages.push(...product.images);
  }

  // Default fallback image
  const defaultImage = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&crop=center&auto=format&q=80';

  // Use default if no images available
  const imagesToShow = allImages.length > 0 ? allImages : [defaultImage];

  const getImageUrl = (imageName) => {
    if (!imageName) return defaultImage;
    
    // If it's already a full URL, return as is
    if (imageName.startsWith('http')) {
      return imageName;
    }
    
    // Otherwise, construct the API URL
    return `${import.meta.env.VITE_API_BASE_URL}/product-image/${imageName}`;
  };

  const changeImage = (index) => {
    if (index >= 0 && index < imagesToShow.length) {
      setSelectedImage(index);
      setMainImage(imagesToShow[index]);
    }
  };

  const nextImage = () => {
    const nextIndex = (selectedImage + 1) % imagesToShow.length;
    changeImage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = selectedImage === 0 ? imagesToShow.length - 1 : selectedImage - 1;
    changeImage(prevIndex);
  };

  // Set initial image when component mounts
  useEffect(() => {
    if (imagesToShow.length > 0 && !mainImage) {
      setMainImage(imagesToShow[0]);
      setSelectedImage(0);
    }
  }, [product]);

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="relative group">
        <div className="aspect-square bg-white rounded-3xl overflow-hidden  border border-gray-100">
          <img
            src={getImageUrl(mainImage)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              e.target.src = defaultImage;
            }}
          />
          
          {/* Image Navigation - Only show if multiple images */}
          {imagesToShow.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3  opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3  opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Button */}
          <button className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-3  opacity-0 group-hover:opacity-100 transition-all duration-300">
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Discount Badge */}
          {product.discount && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm ">
              -{product.discount}%
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {imagesToShow.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {imagesToShow.map((image, index) => (
            <button
              key={index}
              onClick={() => changeImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                selectedImage === index 
                  ? 'border-yellow-500  scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultImage;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {imagesToShow.length > 1 && (
        <div className="text-center text-sm text-gray-500">
          {selectedImage + 1} of {imagesToShow.length}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;