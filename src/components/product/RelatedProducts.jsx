import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Star, 
  Heart, 
  Eye, 
  ShoppingCart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { productService } from '../../services/productService';

const RelatedProducts = ({ currentProduct, limit = 4 }) => {
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProduct) {
      loadRelatedProducts();
    }
  }, [currentProduct]);

  const loadRelatedProducts = async () => {
    try {
      setLoading(true);
      
      // Try to get products from the same category or shop
      const response = await productService.getAllProducts({
        category: currentProduct.category,
        limit: limit + 1 // Get one extra to exclude current product
      });
      
      let products = response.data || response || [];
      
      // Filter out the current product
      products = products.filter(product => product._id !== currentProduct._id);
      
      // Take only the required number
      products = products.slice(0, limit);
      
      // If not enough products from same category, get random products
      if (products.length < limit) {
        const additionalResponse = await productService.getAllProducts({
          limit: limit * 2
        });
        
        const additionalProducts = (additionalResponse.data || additionalResponse || [])
          .filter(product => 
            product._id !== currentProduct._id && 
            !products.find(p => p._id === product._id)
          )
          .slice(0, limit - products.length);
        
        products = [...products, ...additionalProducts];
      }
      
      setRelatedProducts(products);
    } catch (error) {
      console.error('Error loading related products:', error);
      setRelatedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    // Scroll to top when navigating to new product
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price) => {
    if (!price) return 'السعر غير محدد';
    return `${parseFloat(price).toLocaleString()} ر.س`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl border border-[#FFF0CC] p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C37C00] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المنتجات المشابهة...</p>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-[#FFF0CC] p-8 hover:shadow-2xl transition-all duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#8A5700] mb-2 flex items-center justify-center">
          <Sparkles className="w-8 h-8 mr-3 text-[#C37C00]" />
          منتجات مشابهة
          <Sparkles className="w-8 h-8 ml-3 text-[#C37C00]" />
        </h2>
        <p className="text-gray-600">اكتشف المزيد من المنتجات الرائعة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product, index) => (
          <Card 
            key={product._id} 
            className="group cursor-pointer hover:shadow-xl transition-all duration-500 border-[#FFF0CC] hover:border-[#C37C00] overflow-hidden"
            onClick={() => handleProductClick(product._id)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="relative overflow-hidden">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] flex items-center justify-center">
                {product.logoUrl || (product.images && product.images[0]) ? (
                  <img
                    src={product.logoUrl || product.images[0]}
                    alt={product.title || product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=60';
                    }}
                  />
                ) : (
                  <div className="text-6xl text-[#C37C00] opacity-50">💎</div>
                )}
              </div>

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-white/90 text-[#8A5700] hover:bg-white rounded-full p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to favorites logic
                    }}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-white/90 text-[#8A5700] hover:bg-white rounded-full p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product._id);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isAvailable && (
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                    متوفر
                  </Badge>
                )}
                {product.averageRating > 4 && (
                  <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    {product.averageRating.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Product Title */}
                <h3 className="font-bold text-[#8A5700] text-sm line-clamp-2 group-hover:text-[#C37C00] transition-colors">
                  {product.title || product.name}
                </h3>

                {/* Product Details */}
                <div className="space-y-2 text-xs text-gray-600">
                  {product.karat && (
                    <div className="flex items-center justify-between">
                      <span>العيار:</span>
                      <span className="font-medium text-[#8A5700]">{product.karat}K</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex items-center justify-between">
                      <span>الوزن:</span>
                      <span className="font-medium text-[#8A5700]">
                        {parseFloat(product.weight?.$numberDecimal || product.weight).toFixed(1)}g
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-lg font-bold text-[#C37C00]">
                  {formatPrice(product.price?.$numberDecimal || product.price)}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white text-xs py-2 rounded-xl transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product._id);
                  }}
                >
                  عرض التفاصيل
                  <ArrowRight className="w-3 h-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Button
          variant="outline"
          className="border-[#C37C00] text-[#C37C00] hover:bg-[#C37C00] hover:text-white transition-all duration-300 rounded-xl px-8 py-3 font-medium"
          onClick={() => navigate('/products')}
        >
          عرض جميع المنتجات
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default RelatedProducts;
