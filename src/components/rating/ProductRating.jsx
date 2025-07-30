import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Star,
  StarHalf,
  User,
  MessageCircle,
  ThumbsUp,
  Calendar,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ratingService } from "../../services/ratingService";

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
  const [comment, setComment] = useState("");
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
      console.error("Error loading ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    const {
      user,
      isAuthenticated,
      isAdmin,
      isShopOwner,
      logout,
      isRegularUser,
    } = useAuth();

    try {
      const response = await ratingService.getUserRating(productId);
      setUserRating(response.data.rating);
      setSelectedRating(response.data.rating.rating);
      setComment(response.data.rating.comment || "");
    } catch (error) {
      // User hasn't rated this product yet
      setUserRating(null);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedRating) {
      alert("يرجى اختيار تقييم");
      return;
    }

    try {
      setSubmitting(true);
      await ratingService.rateProduct(productId, {
        rating: selectedRating,
        comment: comment.trim(),
      });

      // Reload data
      await loadRatings();
      await loadUserRating();
      setShowRatingForm(false);

      alert(userRating ? "تم تحديث التقييم بنجاح!" : "تم إضافة التقييم بنجاح!");
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!confirm("هل تريد حذف تقييمك؟")) return;

    try {
      await ratingService.deleteRating(productId);
      await loadRatings();
      setUserRating(null);
      setSelectedRating(0);
      setComment("");
      alert("تم حذف التقييم بنجاح");
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert("حدث خطأ في حذف التقييم");
    }
  };

  const renderStars = (rating, size = "w-5 h-5", interactive = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${size} text-yellow-400 fill-current ${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
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
            className={`${size} text-gray-300 ${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform hover:text-yellow-400"
                : ""
            }`}
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
            i <= displayRating
              ? "text-yellow-400 fill-current"
              : "text-gray-300 hover:text-yellow-400"
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
          <CardContent className="p-10">
            <div className="flex flex-row items-start gap-8">
              {/* Rating Section - 2/3 */}
              <div className="flex-[2]">
                <div className="flex items-center justify-center gap-4">
                 <div className="text-center">
  <div
    className="font-extrabold text-[#C37C00] leading-tight "
    style={{ fontSize: '3rem' }} // حوالي 112px، أكبر من 8xl
  >
    {stats.averageRating.toFixed(1)}
  </div>
  <div
    className="flex items-center justify-center mb-1"
    style={{ fontSize: '15rem' }} // حوالي 80px
  >
    {renderStars(stats.averageRating)}
  </div>

  
</div>

                </div>

                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 mb-7">
                    <span className="text-sm">{star} ⭐</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-yellow-400 h-4 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            stats.numRatings > 0
                              ? (stats.ratingDistribution[star] /
                                  stats.numRatings) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {stats.ratingDistribution[star]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Image Section - 1/3 */}
              <div className="flex-[1]">
                <img
                  src="data:image/png;base64,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"
                  alt="rating illustration"
                  className="w-full h-auto"
                />
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
              {userRating ? "تعديل تقييمك" : "أضف تقييمك"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showRatingForm && !userRating && (
              <Button
                onClick={() => setShowRatingForm(true)}
                className="bg-[#C37C00] hover:bg-[#A66A00] text-white"
              >
                إضافة تقييم
              </Button>
            )}

            {!showRatingForm && userRating && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {renderStars(userRating.rating)}
                    <span className="font-medium">
                      تقييمك: {userRating.rating}/5
                    </span>
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
                    ) : userRating ? (
                      "تحديث التقييم"
                    ) : (
                      "إضافة التقييم"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRatingForm(false);
                      if (userRating) {
                        setSelectedRating(userRating.rating);
                        setComment(userRating.comment || "");
                      } else {
                        setSelectedRating(0);
                        setComment("");
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
              onClick={() => (window.location.href = "/login")}
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
                <div
                  key={rating._id}
                  className="border-b border-gray-100 pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFF8E6] rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-[#C37C00]" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {rating.userId?.name || "مستخدم"}
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(rating.rating, "w-4 h-4")}
                          <span className="text-sm text-gray-600">
                            {rating.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(rating.createdAt).toLocaleDateString("ar-SA")}
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
