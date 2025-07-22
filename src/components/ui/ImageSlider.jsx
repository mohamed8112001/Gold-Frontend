import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageSlider = ({ images = [], autoSlide = true, slideInterval = 4000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, slideInterval, images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return null;
  }

  // Define slide colors and icons - Golden Brown & Beige Theme
  const slideData = [
    { color: '#A37F41', icon: '💍' }, // Golden brown
    { color: '#C5A56D', icon: '💎' }, // Light golden
    { color: '#8A6C37', icon: '✨' }, // Dark golden
    { color: '#D3BB92', icon: '🎁' }  // Beige
  ];

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-xl ">
      {/* Images */}
      <div
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {images.map((image, index) => {
          const slide = slideData[index] || slideData[0];

          return (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              {/* Background */}
              <div
                className="w-full h-full flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: slide.color,
                  backgroundImage: `linear-gradient(135deg, ${slide.color} 0%, ${slide.color}cc 100%)`
                }}
              >
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                  <div className="absolute top-32 right-16 w-16 h-16 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute bottom-32 right-32 w-24 h-24 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <div className="text-white text-6xl animate-bounce">{slide.icon}</div>
              </div>

              {/* Overlay with content */}
              {image.content && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 flex items-center justify-center">
                  <div className="text-center text-white px-4 max-w-4xl">
                    {image.content.title && (
                      <h3 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-">
                        {image.content.title}
                      </h3>
                    )}
                    {image.content.subtitle && (
                      <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 drop- opacity-90 px-2">
                        {image.content.subtitle}
                      </p>
                    )}
                    {image.content.button && (
                      <button
                        onClick={image.content.button.onClick}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 sm:px-8 py-2 sm:py-4 rounded-full font-bold text-sm sm:text-lg transition-all duration-300 transform hover:scale-105  hover:"
                      >
                        {image.content.button.text}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all duration-300  hover: hover:scale-110 backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 transition-all duration-300  hover: hover:scale-110 backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 backdrop-blur-sm ${index === currentSlide
                  ? 'bg-yellow-500 scale-125 '
                  : 'bg-white/70 hover:bg-white/90 hover:scale-110'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
