import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Search,
  Grid,
  List,
  Heart,
  Star,
  ShoppingBag,
  Eye,
  SlidersHorizontal,
  X,
  Menu,
} from "lucide-react";

import { productService } from "../../services/productService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES, PRODUCT_CATEGORIES } from "../../utils/constants.js";
import { translateProductCategory } from "../../lib/utils.js";
import { useTranslation } from "react-i18next";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const ProductList = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isShopOwner, logout, isRegularUser } =
    useAuth();
  const { t } = useTranslation();

  // دالة ترجمة فئات المنتجات إلى العربية
  const getDisplayCategory = (category) => {
    const categoryMap = {
      rings: "خواتم",
      necklaces: "عقود",
      bracelets: "أساور",
      earrings: "أقراط",
      pendants: "تعليقات",
      chains: "سلاسل",
      watches: "ساعات",
      anklets: "خلاخيل",
      brooches: "دبابيس",
      cufflinks: "أزرار أكمام",
      gold: "ذهب",
      silver: "فضة",
      diamond: "ألماس",
      pearl: "لؤلؤ",
      gemstone: "أحجار كريمة",
      platinum: "بلاتين",
      wedding_rings: "خواتم زفاف",
      engagement_rings: "خواتم خطوبة",
      statement_necklaces: "عقود بيان",
      delicate_bracelets: "أساور رقيقة",
      stud_earrings: "أقراط صغيرة",
      hoop_earrings: "أقراط دائرية",
      jewelry: "مجوهرات",
      accessories: "اكسسوارات",
      other: "أخرى",
    };

    // أولاً جرب الخريطة المخصصة
    const arabicCategory = categoryMap[category?.toLowerCase()];
    if (arabicCategory) {
      console.log(`arabicCategory: ${arabicCategory}`);
      return arabicCategory;
    }

    // إذا كانت بالعربية بالفعل، أرجعها
    if (category && /[\u0600-\u06FF]/.test(category)) {
      console.log(`category: ${category}`);
      return category;
    }

    // كحل أخير، استخدم translateProductCategory
    try {
      return translateProductCategory(category, t);
    } catch (error) {
      return category || "مجوهرات";
    }
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    rating: "",
    sortBy: "recommended",
  });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [userBehavior, setUserBehavior] = useState({
    hasSearched: false,
    hasFiltered: false,
    viewedProducts: [],
    favoriteCategories: [],
    lastActivity: null,
  });
  const [displayMode, setDisplayMode] = useState("initial"); // initial, searching, filtered, browsing

  useEffect(() => {
    loadProducts();
  }, [searchQuery, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadRelatedProducts();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track user behavior
  useEffect(() => {
    const hasSearched = searchQuery.length > 0;
    const hasFiltered =
      filters.category || filters.rating || filters.sortBy !== "recommended";

    setUserBehavior((prev) => ({
      ...prev,
      hasSearched,
      hasFiltered,
      lastActivity: new Date(),
    }));

    // Update display mode based on user behavior
    if (hasSearched) {
      setDisplayMode("searching");
    } else if (hasFiltered) {
      setDisplayMode("filtered");
    } else if (filteredProducts.length > 0) {
      setDisplayMode("browsing");
    } else {
      setDisplayMode("initial");
    }
  }, [searchQuery, filters, filteredProducts.length]);

  const trackProductView = (productId) => {
    setUserBehavior((prev) => {
      const newBehavior = {
        ...prev,
        viewedProducts: [...new Set([...prev.viewedProducts, productId])],
        lastActivity: new Date(),
      };

      // Save to localStorage
      localStorage.setItem("userBehavior", JSON.stringify(newBehavior));
      return newBehavior;
    });
  };

  // Generate personalized message based on user behavior
  const getPersonalizedMessage = () => {
    const viewedCount = userBehavior.viewedProducts.length;
    // const hasSearched = userBehavior.hasSearched;
    // const hasFiltered = userBehavior.hasFiltered;
    // const isFirstTime = viewedCount === 0 && !hasSearched && !hasFiltered;

    return {
      text: `لقد شاهدت ${viewedCount} منتج`,
      icon: "",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    };
  };

  // Generate motivational message based on results and behavior
  const getMotivationalMessage = () => {
    const viewedCount = userBehavior.viewedProducts.length;
    const resultsCount = filteredProducts.length;

    if (searchQuery && resultsCount === 0) {
      return `🔍 ${t("products.no_results_found")}`;
    }

    if (filters.category && resultsCount === 0) {
      return `🎯 ${t("products.no_products_in_category")}`;
    }

    if (resultsCount === 0) {
      return `🌟 ${t("products.start_exploring")}`;
    }

    if (viewedCount === 0 && resultsCount > 0) {
      return "✨ الكثير من القطع الجميلة لاكتشافها! ابدأ التصفح الآن.";
    }

    if (viewedCount > 0 && viewedCount < 5) {
      return "👀 بداية رائعة! استمر في الاستكشاف للعثور على قطعتك المثالية.";
    }

    if (viewedCount >= 5 && viewedCount < 15) {
      return "🎯 أنت حقاً منغمس في التسوق! هل وجدت شيئاً تحبه؟";
    }

    if (viewedCount >= 15) {
      return "💎 أنت عاشق حقيقي للمجوهرات! ذوقك لا تشوبه شائبة.";
    }

    return "🛍️ تسوق سعيد! خذ وقتك للعثور على القطعة المثالية.";
  };

  // Load user behavior from localStorage on mount
  useEffect(() => {
    const savedBehavior = localStorage.getItem("userBehavior");
    if (savedBehavior) {
      try {
        const parsed = JSON.parse(savedBehavior);
        setUserBehavior((prev) => ({
          ...prev,
          ...parsed,
          lastActivity: parsed.lastActivity
            ? new Date(parsed.lastActivity)
            : null,
        }));
      } catch (error) {
        console.error("Failed to parse saved user behavior:", error);
      }
    }
  }, []);

  const getDisplayMessage = () => {
    switch (displayMode) {
      case "searching":
        return {
          title: `${t("products.search_results")} "${searchQuery}"`,
          subtitle: t("products.found_products", {
            count: filteredProducts.length,
          }),
          icon: "🔍",
        };
      case "filtered":
        return {
          title: "المنتجات المفلترة",
          subtitle: `عرض ${filteredProducts.length} منتج بناءً على تفضيلاتك`,
          icon: " ",
        };
      case "browsing":
        return {
          title: "تصفح المنتجات",
          subtitle: `اكتشف ${filteredProducts.length} منتج رائع`,
          icon: "",
        };
      default:
        return {
          title: "معرض المنتجات",
          subtitle: "اكتشف أجود قطع المجوهرات والذهب من أفضل المتاجر",
          icon: "",
        };
    }
  };

  const getSuggestionMessage = () => {
    if (displayMode === "searching" && filteredProducts.length === 0) {
      return {
        title: t("products.no_products_found"),
        message: t("products.try_different_search"),
        action: t("products.clear_search"),
        actionFn: () => {
          setSearchQuery("");
          setSearchParams({});
        },
      };
    }

    if (displayMode === "filtered" && filteredProducts.length === 0) {
      return {
        title: t("لا توجد منتجات تطابق الفلاتر"),
        // message: t('products.try_remove_filters'),
        action: t("ازالة جميع الفلاتر "),
        actionFn: clearFilters,
      };
    }

    if (userBehavior.viewedProducts.length > 3) {
      return {
        title: "بناءً على تصفحك",
        message: "يبدو أنك مهتم بالمجوهرات! تحقق من مجموعاتنا المميزة",
        action: "عرض المجموعات",
        actionFn: () => navigate("/collections"),
      };
    }

    return null;
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      console.log(`baseUrl: ${baseUrl}`);
      // Build query parameters for backend filtering
      const queryParams = new URLSearchParams();

      if (searchQuery) queryParams.append("search", searchQuery);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);

      const url = `${baseUrl}/product${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : "",
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      const data = result.data || result;

      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch(`${baseUrl}/product/related?limit=6`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.status === "success") {
        setRelatedProducts(data.data);
      }
    } catch (error) {
      console.error("Error loading related products:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Enhanced search filter
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const description = (product.description || "").toLowerCase();
        const category = (product.category || "").toLowerCase();
        const shopName = (product.shopName || "").toLowerCase();

        return (
          name.includes(searchTerm) ||
          description.includes(searchTerm) ||
          category.includes(searchTerm) ||
          shopName.includes(searchTerm)
        );
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(
        (product) =>
          product.design_type === filters.category ||
          product.category === filters.category
      );
    }

    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(
        (product) => (product.rating || 0) >= minRating
      );
    }

    // Sort
    switch (filters.sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        filtered.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("🔍 Search triggered with query:", searchQuery);

    // Update URL parameters
    setSearchParams((prev) => {
      if (searchQuery && searchQuery.trim()) {
        prev.set("search", searchQuery.trim());
      } else {
        prev.delete("search");
      }
      return prev;
    });

    // Force re-apply filters immediately
    applyFilters();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (key === "category") {
      setSearchParams((prev) => {
        if (value) {
          prev.set("category", value);
        } else {
          prev.delete("category");
        }
        return prev;
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      rating: "",
      sortBy: "recommended",
    });
    setSearchQuery("");
    setSearchParams({});
  };

  const handleAddToFavorites = async (productId) => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      await productService.addToFavorites(productId);
      // Update local state to show favorited
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, isFavorited: true } : product
        )
      );
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const ProductCard = ({ product, isListView = false }) => {
    const productId = product.id || product._id;

    // Helper function to safely extract price
    const extractPrice = (priceData) => {
      if (typeof priceData === "number") return priceData;
      if (
        priceData &&
        typeof priceData === "object" &&
        priceData.$numberDecimal
      ) {
        return parseFloat(priceData.$numberDecimal);
      }
      if (typeof priceData === "string") return parseFloat(priceData);
      return 0;
    };

    // Helper function to format price
    const formatPrice = (price) => {
      if (price && price > 0) {
        return price.toLocaleString("ar-EG", {
          style: "currency",
          currency: "EGP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      }
      return "السعر غير محدد";
    };
const handleAddToFavorites = async (productId) => {
        if (!user) {
            alert('Please login first to add product to favorites');
            navigate(ROUTES.LOGIN);
            return;
        }

        try {
            await productService.addToFavorites(productId);
            setProducts(prev => prev.map(product => {
                const currentProductId = product.id || product._id;
                return currentProductId === productId
                    ? { ...product, isFavorited: true }
                    : product;
            }));
            alert('Product added to favorites successfully!');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Error adding product to favorites');
        }
    };

    // Safe data extraction
    const safeProduct = {
      name: product.name || product.title || "منتج بدون اسم",
      description: product.description || "لا يوجد وصف متاح",
      image:
        product.image ||
        product.imageUrl ||
        product.images?.[0] ||
        product.images_urls?.[0] ||
        "/api/placeholder/300/300",
      rating: typeof product.rating === "number" ? product.rating : 4.5,
      reviewCount: product.reviewCount || product.reviews?.length || 0,
      shopName: product.shopName || product.shop?.name || "متجر غير معروف",
      shopId: product.shopId || product.shop?.id || product.shop?._id,
      isFavorited: product.isFavorited || false,
      category: product.category || product.design_type || "أخرى",
      design_type: product.design_type || product.category || "أخرى",
      price: extractPrice(product.price),
      formattedPrice: formatPrice(extractPrice(product.price)),
    };

    return (
      <Card
        className={`shadow-md border-2 border-[#C37C00]/20 ${
          isListView
            ? "flex flex-col sm:flex-row h-auto"
            : "flex flex-col h-full"
        } bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#C37C00]/30 transition-all duration-300`}
        onClick={async () => {
          try {
            // Track product view locally
            trackProductView(productId);

            // Track the click (interest)
            if (user) {
              await fetch(`${baseUrl}/product/track`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ productId }),
              });
            }
          } catch (error) {
            console.error("Failed to track product click:", error);
          } finally {
            // Navigate to product details
            navigate(ROUTES.PRODUCT_DETAILS(productId));
          }
        }}
      >
        {/* Image container */}
        <div
          className={`relative overflow-hidden ${
            isListView ? "w-full sm:w-60 flex-shrink-0" : "w-full"
          }`}
        >
          <div
            className={`relative ${
              isListView ? "h-72 sm:h-full" : "h-72 sm:h-80 lg:h-96"
            } overflow-hidden`}
          >
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${
                safeProduct.image
              }`}
              alt={safeProduct.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 sm:group-hover:scale-125 transition-transform duration-1000 ease-out"
              loading="lazy"
              style={{
                imageRendering: "crisp-edges",
                objectFit: "cover",
                objectPosition: "center",
                backfaceVisibility: "hidden",
              }}
              onError={(e) => {
                console.log("Product image failed to load:", e.target.src);
                e.target.style.display = "none";
                const fallback =
                  e.target.parentElement.querySelector(".fallback-image");
                if (fallback) {
                  fallback.style.display = "flex";
                }
              }}

              
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
                                {!isShopOwner && (<Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-9 h-9 p-0  opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToFavorites(productId);
                                    }}
                                >
                                    <Heart className={`w-4 h-4 ${product.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                                </Button>)}

            {/* Premium fallback image */}
            <div className="fallback-image absolute inset-0 bg-gradient-to-br from-[#FFF0CC] via-[#FFF8E6] to-[#FFE6B3] hidden items-center justify-center group-hover:from-[#FFE6B3] group-hover:via-[#FFF0CC] group-hover:to-[#FFDB99] transition-all duration-700">
              <div className="text-center transform group-hover:scale-110 transition-transform duration-700">
                <div className="relative mb-3 sm:mb-4">
                  <div className="text-5xl sm:text-7xl mb-2 sm:mb-3 filter drop-shadow">
                    💎
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-xl"></div>
                </div>
                <div className="text-sm sm:text-base text-gray-800 font-bold px-3 sm:px-4 py-1.5 bg-white/90 rounded-lg sm:rounded-xl backdrop-blur-md border border-[#C37C00]">
                  {safeProduct.name}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#C37C00]/10 via-transparent to-[#A66A00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Premium favorite button */}
          {!isAdmin && !isShopOwner && (
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/95 hover:bg-white backdrop-blur-md rounded-full w-7 h-7 sm:w-9 sm:h-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/70 z-20"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToFavorites(productId);
              }}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  safeProduct.isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 hover:text-red-500"
                } transition-colors duration-200`}
              />
            </Button>
          )}

          {/* Premium category badge */}
          {safeProduct.category && (
            <Badge className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-[#C37C00] via-[#A66A00] to-[#8A5700] text-white px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold border border-[#C37C00]/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-20">
              {getDisplayCategory(safeProduct.category)}
            </Badge>
          )}
        </div>

        {/* Content area */}
        <div className="p-3 sm:p-4 flex flex-col ">
          {/* Main content */}
          <div className="flex-1">
            <h3 className="font-bold text-lg sm:text-xl mb-2 text-gray-900 line-clamp-2 group-hover:text-[#C37C00] transition-colors duration-300">
              {safeProduct.name}
            </h3>

            {/* Price Display */}
            <div className="mb-2">
              <span className="text-lg sm:text-xl font-bold text-[#C37C00]">
                {safeProduct.formattedPrice}
              </span>
            </div>

            {/* Shop information */}
            {safeProduct.shopName &&
              safeProduct.shopName !== "متجر غير معروف" && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ShoppingBag className="w-4 h-4" />
                  <span
                    className="hover:text-[#C37C00] cursor-pointer font-medium transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (safeProduct.shopId) {
                        navigate(ROUTES.SHOP_DETAILS(safeProduct.shopId));
                      }
                    }}
                  >
                    {safeProduct.shopName}
                  </span>
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white py-2 rounded-xl text-sm font-medium shadow-md hover:shadow-xl transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.PRODUCT_DETAILS(productId));
              }}
            >
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const ratingOptions = [
    { label: "الكل", value: "" },
    { label: "4+ نجوم", value: "4" },
    { label: "3+ نجوم", value: "3" },
    { label: "2+ نجوم", value: "2" },
  ];

  const sortOptions = [
    { label: "موصى به لك", value: "recommended" },
    { label: "الأحدث", value: "newest" },
    { label: "الاسم", value: "name" },
  ];

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50">
      <div className="w-full px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <div className="text-center mb-6">
            {(() => {
              const message = getDisplayMessage();
              return (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {message.title}
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                    {message.subtitle}
                  </p>
                </>
              );
            })()}
          </div>

          {/* Search and Controls */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
            {/* Search Section */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="flex gap-3 items-center">
                {/* Search input */}
                <div className="flex-1 relative">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      {isLoading && searchQuery ? (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Search className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <Input
                      type="text"
                      placeholder="ابحث عن المنتجات..."
                      value={searchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        setSearchParams((prev) => {
                          if (value && value.trim()) {
                            prev.set("search", value.trim());
                          } else {
                            prev.delete("search");
                          }
                          return prev;
                        });
                      }}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl bg-gray-50"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSearch(e);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Search button */}
                <Button
                  type="button"
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-6 py-3 rounded-xl flex-shrink-0 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <Search className="w-4 h-4 mr-1" />
                  <span>بحث</span>
                </Button>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              {/* Results count */}
              <div className="text-sm text-gray-600">
                {filteredProducts.length} منتج
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {/* Clear search */}
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchParams((prev) => {
                        prev.delete("search");
                        return prev;
                      });
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    <span>مسح</span>
                  </Button>
                )}
                {/* Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-1" />
                  <span>فلاتر</span>
                  {Object.keys(filters).some((key) => filters[key]) && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full ml-1"></span>
                  )}
                </Button>
                {/* View mode */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-none ${
                      viewMode === "grid"
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-none ${
                      viewMode === "list"
                        ? "bg-gray-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar - Mobile First */}
          {showFilters && (
            <div className="w-full lg:w-64 lg:flex-shrink-0">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">فلاتر</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-medium mb-3 text-sm sm:text-base">
                      الفئة
                    </h3>
                    <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          checked={filters.category === ""}
                          onChange={(e) =>
                            handleFilterChange("category", e.target.value)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm sm:text-base">الكل</span>
                      </label>
                      {Object.entries(PRODUCT_CATEGORIES).map(
                        ([key, value]) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              value={key.toLowerCase()}
                              checked={filters.category === key.toLowerCase()}
                              onChange={(e) =>
                                handleFilterChange("category", e.target.value)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm sm:text-base">
                              {getDisplayCategory(value)}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h3 className="font-medium mb-3 text-sm sm:text-base">
                      التقييم
                    </h3>
                    <div className="space-y-2">
                      {ratingOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="rating"
                            value={option.value}
                            checked={filters.rating === option.value}
                            onChange={(e) =>
                              handleFilterChange("rating", e.target.value)
                            }
                            className="mr-2"
                          />
                          <span className="text-sm sm:text-base">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sort */}
                  <div>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full p-2 sm:p-3 border rounded-lg sm:rounded-xl text-sm sm:text-base"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    مسح جميع الفلاتر
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1 min-w-0">
            {/* Results Info */}
            <div className="">
              <div className="flex-1">
                {searchQuery && (
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">
                    {t("products.search_for")}{" "}
                    <span className="font-medium text-yellow-600">
                      "{searchQuery}"
                    </span>
                  </p>
                )}
                {filters.category && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("الفئة")}{" "}
                    <span className="font-medium text-yellow-600">
                      {getDisplayCategory(filters.category)}
                    </span>
                  </p>
                )}
              </div>

              <div className=" sm:text-right w-full sm:w-auto">
                <div className="flex gap-2 justify-start sm:justify-end mt-2">
                  {userBehavior.hasSearched && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {t("products.search")}
                    </span>
                  )}
                  {/* {userBehavior.hasFiltered && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      {t("products.filtered")}
                    </span>
                  )} */}
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 max-w-5xl mx-auto"
                }`}
              >
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-white rounded-2xl shadow overflow-hidden flex flex-col h-full"
                  >
                    <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-56 sm:h-64 lg:h-72 xl:h-80"></div>
                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-3"></div>
                      <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 w-3/4"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 w-1/2"></div>
                      <div className="mt-auto pt-6 border-t border-gray-200">
                        <div className="h-6 sm:h-7 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded mb-4 w-32"></div>
                        <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-2xl shadow">
                {(() => {
                  const suggestion = getSuggestionMessage();
                  return (
                    <>
                      <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">
                        {displayMode === "searching"
                          ? "🔍"
                          : displayMode === "filtered"
                          ? "🎯"
                          : "💎"}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                        {suggestion?.title || t("products.no_products_found")}
                      </h3>
                      <Button
                        onClick={suggestion?.actionFn || clearFilters}
                        className="bg-gradient-to-r from-[#C37C00] to-[#A66A00] hover:from-[#A66A00] hover:to-[#8A5700] text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base"
                      >
                        {suggestion?.action || "مسح جميع الفلاتر"}
                      </Button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div
                className={`grid gap-6 sm:gap-8 mb-12 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                    : "grid-cols-1"
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    isListView={viewMode === "list"}
                  />
                ))}
              </div>
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 &&
              userBehavior.viewedProducts.length > 0 && (
                <div className="mt-16 sm:mt-20 mb-12 sm:mb-16">
                  <div className="bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-2xl p-4 sm:p-6 lg:p-8 shadow mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                      موصى به بناءً على مشاهداتك
                    </h3>
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                      منتجات مشابهة لما كنت تتصفحه
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {relatedProducts.slice(0, 6).map((product) => {
                        const safeProduct = {
                          id: product._id || product.id,
                          name:
                            product.title || product.name || "Untitled Product",
                          description:
                            product.description || "No description available",
                          image:
                            product.images_urls?.[0] ||
                            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=60",
                          shopName: product.shop?.name || "Unknown Shop",
                          shopId: product.shop?._id || product.shop?.id,
                          rating: product.rating || 4.5,
                          reviewCount: product.reviewCount || 0,
                          isFavorited: product.isFavorited || false,
                        };

                        return (
                          <Card
                            key={safeProduct.id}
                            className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white rounded-2xl shadow h-full flex flex-col"
                            onClick={async () => {
                              try {
                                trackProductView(safeProduct.id);

                                if (user) {
                                  await fetch(`${baseUrl}/product/track`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${user.token}`,
                                    },
                                    body: JSON.stringify({
                                      productId: safeProduct.id,
                                    }),
                                  });
                                }
                              } catch (error) {
                                console.error(
                                  "Failed to track product click:",
                                  error
                                );
                              } finally {
                                navigate(
                                  ROUTES.PRODUCT_DETAILS(safeProduct.id)
                                );
                              }
                            }}
                          >
                            <div className="relative overflow-hidden rounded-t-2xl">
                              <img
                                src={safeProduct.image}
                                alt={safeProduct.name}
                                className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center&auto=format&q=60";
                                }}
                              />
                              <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                <span className="bg-[#FFF0CC] text-[#C37C00] text-xs px-2 py-1 rounded-full font-medium">
                                  موصى به
                                </span>
                              </div>
                            </div>
                            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                              <h3 className="font-bold text-base sm:text-lg text-primary-900 mb-2 line-clamp-2 font-cairo">
                                {safeProduct.name}
                              </h3>
                              <p className="text-sm sm:text-base text-secondary-800 mb-4 line-clamp-2 font-cairo">
                                {safeProduct.description}
                              </p>
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                                  <span className="text-sm sm:text-base text-gray-600 ml-1">
                                    {safeProduct.rating.toFixed(1)}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm sm:text-base"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      ROUTES.PRODUCT_DETAILS(safeProduct.id)
                                    );
                                  }}
                                >
                                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                                  عرض
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;