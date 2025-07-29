import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { rateService } from '../../services/rateService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import RatingForm from './RatingForm';

const RatingDisplay = ({ shopId, shopName, onRatingsUpdate }) => {
  const { user , isShopOwner ,isAdmin } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [userRating, setUserRating] = useState(null);

  useEffect(() => {
    console.log('RatingDisplay: useEffect triggered with shopId:', shopId);
    if (shopId) {
      fetchRatings();
    } else {
      console.log('RatingDisplay: No shopId provided, skipping fetch');
    }
  }, [shopId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      console.log('RatingDisplay: Fetching ratings for shopId:', shopId);
      console.log('RatingDisplay: User token:', localStorage.getItem('token'));
      const response = await rateService.getAllRates({ shopId });

      // Handle different response structures
      const ratingsData = response.data || response || [];
      const ratingsArray = Array.isArray(ratingsData) ? ratingsData : [];
      setRatings(ratingsArray);

      // Update parent component with ratings count
      if (onRatingsUpdate) {
        onRatingsUpdate(ratingsArray.length);
      }

      // Find user's existing rating
      if (user && Array.isArray(ratingsData)) {
        const existingRating = ratingsData.find(rating => rating.user?._id === user.id);
        setUserRating(existingRating || null);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('فشل في تحميل التقييمات');
      setRatings([]); // Set empty array on error

      // Update parent component with 0 count on error
      if (onRatingsUpdate) {
        onRatingsUpdate(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSuccess = (newRating) => {
    setShowRatingForm(false);
    setEditingRating(null);
    fetchRatings(); // Refresh ratings
  };

  const handleEditRating = (rating) => {
    setEditingRating(rating);
    setShowRatingForm(true);
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return;
    }

    try {
      await rateService.deleteRate(ratingId);
      toast.success('تم حذف التقييم بنجاح');
      fetchRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('فشل في حذف التقييم');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${index < rating
          ? 'fill-[#C37C00] text-[#C37C00]'
          : 'text-gray-300'
          }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <RatingForm
            shopId={shopId}
            shopName={shopName}
            existingRating={editingRating}
            onSuccess={handleRatingSuccess}
            onCancel={() => {
              setShowRatingForm(false);
              setEditingRating(null);
            }}
          />
        </div>
      )}

      {/* Add Rating Button */}
      {user && !userRating && !isShopOwner && !isAdmin && (
        <div className="text-center">
          <Button
            onClick={() => setShowRatingForm(true)}
            className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white"
          >
            <Star className="w-4 h-4 mr-2" />
            إضافة تقييم
          </Button>
        </div>
      )}

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد تقييمات بعد</p>
              <p className="text-sm text-gray-500 mt-2">
                كن أول من يقيم هذا المحل
              </p>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating._id} className="hover: transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#C37C00] to-[#A66A00] rounded-full flex items-center justify-center text-white font-semibold">
                    <User className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    {/* User Info and Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {rating.user?.name || 'مستخدم'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {renderStars(rating.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {rating.rating}/5
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons for User's Own Rating */}
                      {user && rating.user._id === user.id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRating(rating)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRating(rating._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Comment */}
                    {rating.comment && (
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {rating.comment}
                      </p>
                    )}

                    {/* Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(rating.createdAt)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingDisplay;
