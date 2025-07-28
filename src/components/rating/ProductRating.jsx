import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Star, 
  StarHalf, 
  User, 
  MessageCircle, 
  ThumbsUp,
  Calendar,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../../services/ratingService';

const ProductRating = ({ productId, showForm = true }) => {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [userRating, setUserRating] = useState(null);
    const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } =
      useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  // Form state
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (productId) {
      loadRatings();
      if (user) {
        loadUserRating();
      }
    }
  }, [productId, user]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingService.getProductRatings(productId);
      setRatings(response.data.ratings || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
      const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } =    useAuth();
      

    try {
      const response = await ratingService.getUserRating(productId);
      setUserRating(response.data.rating);
      setSelectedRating(response.data.rating.rating);
      setComment(response.data.rating.comment || '');
    } catch (error) {
      // User hasn't rated this product yet
      setUserRating(null);
    }
  };

  const handleSubmitRating = async () => {
    
    if (!selectedRating) {
      alert('يرجى اختيار تقييم');
      return;
    }

    try {
      setSubmitting(true);
      await ratingService.rateProduct(productId, {
        rating: selectedRating,
        comment: comment.trim()
      });

      // Reload data
      await loadRatings();
      await loadUserRating();
      setShowRatingForm(false);
      
      alert(userRating ? 'تم تحديث التقييم بنجاح!' : 'تم إضافة التقييم بنجاح!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('حدث خطأ في إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!confirm('هل تريد حذف تقييمك؟')) return;

    try {
      await ratingService.deleteRating(productId);
      await loadRatings();
      setUserRating(null);
      setSelectedRating(0);
      setComment('');
      alert('تم حذف التقييم بنجاح');
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('حدث خطأ في حذف التقييم');
    }
  };

  const renderStars = (rating, size = 'w-5 h-5', interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star 
            key={i} 
            className={`${size} text-yellow-400 fill-current ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={interactive ? () => setSelectedRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalf 
            key={i} 
            className={`${size} text-yellow-400 fill-current`}
          />
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            className={`${size} text-gray-300 ${interactive ? 'cursor-pointer hover:scale-110 transition-transform hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setSelectedRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
          />
        );
      }
    }
    return stars;
  };

  const renderInteractiveStars = () => {
    const stars = [];
    const displayRating = hoverRating || selectedRating;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-8 h-8 cursor-pointer transition-all duration-200 hover:scale-110 ${
            i <= displayRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-400'
          }`}
          onClick={() => setSelectedRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#C37C00]" />
        <span className="mr-2 text-gray-600">جاري تحميل التقييمات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      {stats && (
        <Card className="bg-gradient-to-r from-[#FFF8E6] to-white border-[#FFF0CC]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#C37C00]">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center mb-1">
                    {renderStars(stats.averageRating)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.numRatings} تقييم
                  </div>
                </div>
              </div>
              
              {/* Rating Distribution */}
              <div className="flex-1 max-w-md">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-sm w-8">{star} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stats.numRatings > 0 ? (stats.ratingDistribution[star] / stats.numRatings) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {stats.ratingDistribution[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Rating Form */}
      {showForm && user && !isShopOwner && !isAdmin && (
        <Card className="border-[#C37C00]">
          <CardHeader>
            <CardTitle className="text-[#8A5700] flex items-center gap-2">
              <Star className="w-5 h-5" />
              {userRating ? 'تعديل تقييمك' : 'أضف تقييمك'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showRatingForm && !userRating &&    (
              <Button
                onClick={() => setShowRatingForm(true)}
                className="bg-[#C37C00] hover:bg-[#A66A00] text-white"
              >
                إضافة تقييم
              </Button>
            )}

            {!showRatingForm && userRating &&  (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {renderStars(userRating.rating)}
                    <span className="font-medium">تقييمك: {userRating.rating}/5</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowRatingForm(true)}
                      variant="outline"
                      size="sm"
                      className="border-[#C37C00] text-[#C37C00]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      تعديل
                    </Button>
                    <Button
                      onClick={handleDeleteRating}
                      variant="outline"
                      size="sm"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      حذف
                    </Button>
                  </div>
                </div>
                {userRating.comment && (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{userRating.comment}"
                  </p>
                )}
              </div>
            )}

            {showRatingForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التقييم *
                  </label>
                  <div className="flex items-center gap-1">
                    {renderInteractiveStars()}
                    <span className="mr-2 text-sm text-gray-600">
                      {selectedRating > 0 && `${selectedRating}/5`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التعليق (اختياري)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="شاركنا رأيك في المنتج..."
                    className="resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 حرف
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitRating}
                    disabled={submitting || !selectedRating}
                    className="bg-[#C37C00] hover:bg-[#A66A00] text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      userRating ? 'تحديث التقييم' : 'إضافة التقييم'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRatingForm(false);
                      if (userRating) {
                        setSelectedRating(userRating.rating);
                        setComment(userRating.comment || '');
                      } else {
                        setSelectedRating(0);
                        setComment('');
                      }
                    }}
                    variant="outline"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Login prompt for non-authenticated users */}
      {showForm && !user && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="text-center py-6">
            <div className="text-amber-600 text-4xl mb-3">🔐</div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">
              تسجيل الدخول مطلوب
            </h3>
            <p className="text-amber-700 mb-4">
              يرجى تسجيل الدخول لإضافة تقييمك للمنتج
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-[#C37C00] hover:bg-[#A66A00] text-white"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#8A5700] flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            التقييمات ({ratings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>لا توجد تقييمات بعد</p>
              <p className="text-sm">كن أول من يقيم هذا المنتج!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFF8E6] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#C37C00]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {rating.userId?.name || 'مستخدم'}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(rating.rating, 'w-4 h-4')}
                          <span className="text-sm text-gray-600">
                            {rating.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(rating.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  
                  {rating.comment && (
                    <p className="text-gray-700 mt-2 pr-13">
                      "{rating.comment}"
                    </p>
                  )}
                  
                  {rating.isVerifiedPurchase && (
                    <Badge variant="secondary" className="mt-2">
                      ✓ عملية شراء مؤكدة
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductRating;
