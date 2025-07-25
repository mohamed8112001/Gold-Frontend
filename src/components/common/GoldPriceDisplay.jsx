import React, { useState, useEffect } from 'react';
import { goldPriceService } from '../../services/goldPriceService.js';

/**
 * GoldPriceDisplay Component
 * Displays current gold prices for different karats (18k, 21k, 24k)
 * Updates automatically on component mount
 */
const GoldPriceDisplay = ({ 
  className = '', 
  showIcon = true, 
  updateInterval = null,
  compact = false 
}) => {
  const [prices, setPrices] = useState({
    karat18: '---',
    karat21: '---',
    karat24: '---',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetch gold prices from the API
   */
  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await goldPriceService.getFormattedPrices();
      
      if (result.success) {
        setPrices(result.data);
        setLastUpdated(new Date());
        
        // Log any partial errors
        if (result.errors && result.errors.length > 0) {
          console.warn('Some gold prices failed to load:', result.errors);
        }
      } else {
        setError(result.message || 'فشل في تحميل أسعار الذهب');
        console.error('Failed to fetch gold prices:', result.message);
      }
    } catch (err) {
      setError('خطأ في الاتصال بالخادم');
      console.error('Error fetching gold prices:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to fetch prices on mount and set up interval if specified
   */
  useEffect(() => {
    fetchPrices();

    // Set up auto-refresh if interval is specified
    let intervalId;
    if (updateInterval && updateInterval > 0) {
      intervalId = setInterval(fetchPrices, updateInterval);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updateInterval]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = () => {
    fetchPrices();
  };

  // Loading state
  if (loading && !lastUpdated) {
    return (
      <div className={`flex items-center justify-center bg-[#FFF8E6] rounded-lg px-4 py-2 ${className}`} dir="rtl">
        <div className="flex items-center gap-2 text-[#8A5700]">
          {showIcon && <span className="text-lg">🪙</span>}
          <span className="text-sm font-medium animate-pulse">جاري تحميل الأسعار...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !lastUpdated) {
    return (
      <div className={`flex items-center justify-center bg-[#FFF8E6] rounded-lg px-4 py-2 ${className}`} dir="rtl">
        <div className="flex items-center gap-2 text-[#8A5700]">
          {showIcon && <span className="text-lg">⚠️</span>}
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={handleRefresh}
            className="text-xs text-[#C37C00] hover:text-[#8A5700] underline mr-2"
            disabled={loading}
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // Compact version for mobile or small spaces
  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-xl px-2 py-1.5 border border-[#E6A500]/20 ${className}`} dir="rtl">
        <div className="flex items-center justify-center gap-1 text-[#8A5700]">
          {showIcon && <span className="text-sm animate-pulse">🪙</span>}
          <div className="flex items-center gap-1 text-xs font-medium">
            <span className="bg-white/60 px-1.5 py-0.5 rounded font-bold">18: {prices.karat18}</span>
            <span className="bg-white/60 px-1.5 py-0.5 rounded font-bold">21: {prices.karat21}</span>
            <span className="bg-white/60 px-1.5 py-0.5 rounded font-bold">24: {prices.karat24}</span>
            <span className="text-[#8A5700]/70 font-bold text-xs">ج.م</span>
          </div>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className={`bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-xl px-3 py-2 shadow-sm border border-[#E6A500]/30 ${className}`} dir="rtl">
      <div className="flex items-center justify-center gap-2">
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0">
            <span className="text-lg animate-pulse">🪙</span>
          </div>
        )}

        {/* Price Display */}
        <div className="flex items-center gap-1 text-[#8A5700]">
          <span className="font-bold text-xs whitespace-nowrap text-[#8A5700] hidden sm:inline">أسعار الذهب:</span>

          <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium flex-wrap justify-center">
            {/* 18k Price */}
            <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md">
              <span className="text-[#8A5700]/80 font-medium">18:</span>
              <span className="font-bold text-[#C37C00]">{prices.karat18}</span>
            </div>

            {/* Separator */}
            <span className="text-[#8A5700]/50 font-bold hidden sm:inline">|</span>

            {/* 21k Price */}
            <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md">
              <span className="text-[#8A5700]/80 font-medium">21:</span>
              <span className="font-bold text-[#C37C00]">{prices.karat21}</span>
            </div>

            {/* Separator */}
            <span className="text-[#8A5700]/50 font-bold hidden sm:inline">|</span>

            {/* 24k Price */}
            <div className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-md">
              <span className="text-[#8A5700]/80 font-medium">24:</span>
              <span className="font-bold text-[#C37C00]">{prices.karat24}</span>
            </div>

            {/* Currency */}
            <span className="text-[#8A5700]/70 font-bold text-xs">ج.م</span>
          </div>
        </div>

        {/* Refresh Button (optional) */}
        {!updateInterval && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex-shrink-0 text-[#C37C00] hover:text-[#8A5700] transition-colors duration-200 disabled:opacity-50"
            title="تحديث الأسعار"
          >
            <svg 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* Last Updated Info (optional) */}
      {lastUpdated && !updateInterval && (
        <div className="text-center mt-1">
          <span className="text-xs text-[#8A5700]/60">
            آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default GoldPriceDisplay;
