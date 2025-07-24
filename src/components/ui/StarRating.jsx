import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  reviewCount = 0, 
  size = 'md', 
  showText = true, 
  showCount = true,
  className = '',
  starClassName = '',
  textClassName = '',
  countClassName = ''
}) => {
  // Ensure rating is a valid number between 0 and 5
  const validRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const validReviewCount = Number(reviewCount) || 0;

  // Size configurations
  const sizeConfig = {
    sm: {
      star: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1'
    },
    md: {
      star: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      star: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2'
    },
    xl: {
      star: 'w-6 h-6',
      text: 'text-lg',
      gap: 'gap-3'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      {/* Stars */}
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < Math.floor(validRating);
          const isHalfFilled = index === Math.floor(validRating) && validRating % 1 >= 0.5;
          
          return (
            <div key={index} className="relative">
              <Star
                className={`${config.star} ${
                  isFilled 
                    ? 'fill-[#C37C00] text-[#C37C00]' 
                    : 'text-gray-300'
                } ${starClassName}`}
              />
              {/* Half star overlay */}
              {isHalfFilled && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Star
                    className={`${config.star} fill-[#C37C00] text-[#C37C00] ${starClassName}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rating Text */}
      {showText && (
        <span className={`font-semibold text-gray-800 ${config.text} ${textClassName}`}>
          {validRating.toFixed(1)}
        </span>
      )}

      {/* Review Count */}
      {showCount && validReviewCount > 0 && (
        <span className={`text-gray-600 ${config.text} ${countClassName}`}>
          ({validReviewCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;
