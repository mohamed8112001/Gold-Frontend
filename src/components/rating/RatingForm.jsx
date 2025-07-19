import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { rateService } from '../../services/rateService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const RatingForm = ({ shopId, shopName, onSuccess, onCancel, existingRating = null }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    if (rating === 0) {
      toast.error('يرجى اختيار تقييم');
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        rating,
        comment: comment.trim()
      };

      let result;
      if (existingRating) {
        // Update existing rating
        result = await rateService.updateRate(existingRating._id, ratingData);
        toast.success('تم تحديث التقييم بنجاح');
      } else {
        // Create new rating
        result = await rateService.createRate(shopId, ratingData);
        toast.success('تم إضافة التقييم بنجاح');
      }

      if (onSuccess) {
        onSuccess(result.data);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          className={`transition-all duration-200 ${isFilled
              ? 'text-[#C37C00] scale-110'
              : 'text-gray-300 hover:text-[#C37C00]/50'
            }`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star
            className={`w-8 h-8 ${isFilled ? 'fill-current' : ''}`}
          />
        </button>
      );
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-gray-800">
          {existingRating ? 'تحديث التقييم' : 'تقييم المحل'}
        </CardTitle>
        <p className="text-gray-600">{shopName}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">اختر تقييمك</p>
            <div className="flex justify-center gap-1 mb-2">
              {renderStars()}
            </div>
            <p className="text-sm text-gray-500">
              {rating > 0 && (
                <span className="font-semibold text-[#C37C00]">
                  {rating} من 5 نجوم
                </span>
              )}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تعليق (اختياري)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا تجربتك مع هذا المحل..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C37C00] focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 حرف
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الإرسال...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {existingRating ? 'تحديث التقييم' : 'إرسال التقييم'}
                </div>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RatingForm;
