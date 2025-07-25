import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'w-5 h-5', 
  interactive = false, 
  onRatingChange = null,
  showHalf = true,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const renderStar = (starIndex) => {
    const starValue = starIndex + 1;
    const displayRating = interactive ? (hoverRating || rating) : rating;
    const isFilled = starValue <= Math.floor(displayRating);
    const isHalf = showHalf && starValue === Math.floor(displayRating) + 1 && displayRating % 1 !== 0;

    if (isHalf && !interactive) {
      return (
        <StarHalf
          key={starIndex}
          className={`${size} text-yellow-400 fill-current ${className}`}
        />
      );
    }

    return (
      <Star
        key={starIndex}
        className={`${size} transition-all duration-200 ${
          isFilled 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        } ${
          interactive 
            ? 'cursor-pointer hover:scale-110 hover:text-yellow-400' 
            : ''
        } ${className}`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        onMouseLeave={handleMouseLeave}
      />
    );
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </div>
  );
};

// Simple display component for showing ratings
export const RatingDisplay = ({ rating, maxRating = 5, showValue = true, size = 'w-4 h-4' }) => {
  return (
    <div className="flex items-center gap-2">
      <StarRating 
        rating={rating} 
        maxRating={maxRating} 
        size={size} 
        interactive={false}
        showHalf={true}
      />
      {showValue && (
        <span className="text-sm text-gray-600">
          {Number(rating).toFixed(1)}/{maxRating}
        </span>
      )}
    </div>
  );
};

// Interactive rating component for forms
export const InteractiveRating = ({ 
  value = 0, 
  onChange, 
  maxRating = 5, 
  size = 'w-8 h-8',
  required = false,
  label = 'التقييم'
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <StarRating
          rating={value}
          maxRating={maxRating}
          size={size}
          interactive={true}
          onRatingChange={onChange}
          showHalf={false}
        />
        {value > 0 && (
          <span className="text-sm text-gray-600 mr-2">
            {value}/{maxRating}
          </span>
        )}
      </div>
    </div>
  );
};

export default StarRating;
