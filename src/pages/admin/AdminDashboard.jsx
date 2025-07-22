import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';

import { Badge } from '@/components/ui/badge.jsx';
import {
  Users,
  Store,
  Package,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { shopService } from '../../services/shopService.js';
import { userService } from '../../services/userService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROUTES } from '../../utils/constants.js';
import { testAuthentication } from '../../utils/testAuth.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalShops: 0,
    pendingShops: 0,
    approvedShops: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [pendingShops, setPendingShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadAdminData();

    // Auto-refresh data every 30 seconds
    const interval = setInterval(() => {
      loadAdminData();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isAdmin, navigate]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);

      let shopsData = [];

      // Load all shops (including pending) - use admin endpoint
      try {
        const shopsResponse = await shopService.getAllShopsAdmin();
        shopsData = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
        console.log('Admin shops loaded:', shopsData);
      } catch (error) {
        console.warn('Admin endpoint failed, trying regular endpoint:', error);
        // Fallback to regular endpoint
        try {
          const shopsResponse = await shopService.getAllShops();
          shopsData = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || [];
          console.log('Regular shops loaded:', shopsData);
        } catch (fallbackError) {
          console.error('Both endpoints failed:', fallbackError);
          shopsData = [];
        }
      }

      setAllShops(shopsData);

      // Filter pending shops - use the backend field 'isApproved'
      const pendingShops = shopsData.filter(shop => {
        // A shop is pending if it's not approved (isApproved === false or undefined)
        const isPending = !shop.isApproved;

        console.log(`Shop "${shop.name}" pending check:`, {
          id: shop._id || shop.id,
          isApproved: shop.isApproved,
          isPending: isPending
        });

        return isPending;
      });

      console.log('Pending shops found:', pendingShops.length);
      console.log('Pending shop names:', pendingShops.map(s => s.name));
      setPendingShops(pendingShops);

      // Load users count
      let totalUsers = 0;
      try {
        const usersResponse = await userService.getAllUsers();
        const usersData = Array.isArray(usersResponse) ? usersResponse : usersResponse.data || [];
        totalUsers = usersData.length;
      } catch (error) {
        console.warn('Could not load users count:', error);
        totalUsers = 0;
      }

      // Calculate real stats using backend field 'isApproved'
      const pendingCount = shopsData.filter(shop => !shop.isApproved).length;
      const approvedCount = shopsData.filter(shop => shop.isApproved).length;

      setStats({
        totalShops: shopsData.length,
        pendingShops: pendingCount,
        approvedShops: approvedCount,
        totalUsers: totalUsers,
        totalProducts: 0 // Will be calculated from products API
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      // Set empty state on error
      setAllShops([]);
      setPendingShops([]);
      setStats({
        totalShops: 0,
        pendingShops: 0,
        approvedShops: 0,
        totalUsers: 0,
        totalProducts: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveShop = async (shopId) => {
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log('=== APPROVE SHOP DEBUG ===');
    console.log('Original shopId:', shopId);
    console.log('Found shop:', shop);
    console.log('Shop name:', shopName);
    console.log('Actual shop ID:', actualShopId);
    console.log('User:', user);
    console.log('Is Admin:', isAdmin);
    console.log('Token from localStorage:', localStorage.getItem('dibla_token'));

    // Run authentication test
    testAuthentication();

    try {
      setIsLoading(true);
      console.log('Calling shopService.approveShop with ID:', actualShopId);

      const result = await shopService.approveShop(actualShopId);
      console.log('Approval result:', result);

      alert(`تم قبول متجر "${shopName}" بنجاح! سيظهر الآن للعملاء.`);

      // Reload data to reflect changes
      console.log('Reloading admin data...');
      await loadAdminData();

    } catch (error) {
      console.error('=== APPROVAL ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);

      const errorMessage = error.response?.data?.message || error.message || 'خطأ غير معروف';
      alert('حدث خطأ في الموافقة على المتجر: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectShop = async (shopId) => {
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';
    const actualShopId = shop?._id || shop?.id || shopId;

    const confirmed = window.confirm(
      `هل أنت متأكد من رفض متجر "${shopName}"؟\n\nسيتم إخفاء المتجر ولن يظهر للعملاء.`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        console.log('Rejecting shop with ID:', actualShopId);

        await shopService.rejectShop(actualShopId);

        alert(`تم رفض متجر "${shopName}". لن يظهر للعملاء.`);

        // Reload data to reflect changes
        await loadAdminData();

      } catch (error) {
        console.error('Error rejecting shop:', error);
        alert('حدث خطأ في رفض المتجر: ' + (error.message || 'خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUpdateLegacyShops = async () => {
    const confirmed = window.confirm(
      'هل تريد تحديث جميع المحلات القديمة لتصبح مُوافق عليها؟\n\nهذا سيجعل جميع المحلات التي لا تحتوي على حالة موافقة واضحة تظهر كمُوافق عليها.'
    );

    if (confirmed) {
      try {
        setIsLoading(true);

        // Find legacy shops (no status fields)
        const legacyShops = allShops.filter(shop =>
          !Object.prototype.hasOwnProperty.call(shop, 'status') &&
          !Object.prototype.hasOwnProperty.call(shop, 'approved') &&
          !Object.prototype.hasOwnProperty.call(shop, 'isActive')
        );

        console.log('Found legacy shops:', legacyShops.length);

        // Update each legacy shop
        for (const shop of legacyShops) {
          try {
            await shopService.approveShop(shop._id || shop.id);
            console.log(`Updated legacy shop: ${shop.name}`);
          } catch (error) {
            console.error(`Failed to update shop ${shop.name}:`, error);
          }
        }

        alert(`تم تحديث ${legacyShops.length} متجر قديم بنجاح!`);

        // Reload data
        await loadAdminData();

      } catch (error) {
        console.error('Error updating legacy shops:', error);
        alert('حدث خطأ في تحديث المحلات القديمة');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteShop = async (shopId) => {
    // Try to find shop by both id and _id
    const shop = allShops.find(s => s.id === shopId || s._id === shopId);
    const shopName = shop ? shop.name : 'المتجر';

    // Use the correct ID format (prefer _id if available)
    const actualShopId = shop?._id || shop?.id || shopId;

    console.log('Shop to delete:', shop);
    console.log('Shop ID to use:', actualShopId);

    const confirmed = window.confirm(
      `هل أنت متأكد من حذف متجر "${shopName}" نهائياً؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيتم حذف:\n- بيانات المتجر\n- جميع المنتجات\n- جميع التقييمات\n- جميع الحجوزات المرتبطة`
    );

    if (confirmed) {
      try {
        setIsLoading(true);
        console.log('Deleting shop with ID:', actualShopId);

        await shopService.deleteShop(actualShopId);

        alert(`تم حذف متجر "${shopName}" بنجاح من قاعدة البيانات`);

        // Reload data to reflect changes
        await loadAdminData();

      } catch (error) {
        console.error('Error deleting shop:', error);
        console.error('Shop data:', shop);
        console.error('Shop ID used:', actualShopId);
        alert('حدث خطأ في حذف المتجر: ' + (error.message || 'خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getStatusBadge = (shop) => {
    // Use the backend field 'isApproved' to determine status
    let status = 'unknown';

    if (shop.isApproved === true) {
      status = 'approved';
    } else if (shop.isApproved === false) {
      status = 'pending';
    } else {
      // If isApproved is undefined, assume pending
      status = 'pending';
    }

    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />في الانتظار</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مُوافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-amber-50/20 flex items-center justify-center pt-20">
        <div className="bg-white rounded-2xl  border border-yellow-200/30 backdrop-blur-sm p-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-100 border-t-yellow-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Dashboard...</h3>
          <p className="text-gray-600">Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-amber-50/20 flex pt-20">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white  border-r border-gray-100 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center ">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">Management Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-6">
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#A37F41] to-[#8A6C37] text-white '
                : 'text-gray-700 hover:bg-[#F8F4ED]'
                }`}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              <span className="font-medium">Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === 'pending'
                ? 'bg-gradient-to-r from-[#C5A56D] to-[#A37F41] text-white '
                : 'text-gray-700 hover:bg-[#F8F4ED]'
                }`}
            >
              <Clock className="w-5 h-5 mr-3" />
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Pending Requests</span>
                {stats.pendingShops > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-white/20' : 'bg-[#F0E8DB] text-[#A37F41]'
                    }`}>
                    {stats.pendingShops}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('shops')}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${activeTab === 'shops'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white '
                : 'text-gray-700 hover:bg-yellow-50'
                }`}
            >
              <Store className="w-5 h-5 mr-3" />
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">All Stores</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${activeTab === 'shops' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {stats.totalShops}
                </span>
              </div>
            </button>
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-8 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quick Stats</h3>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Products</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-100">
          <Button
            onClick={loadAdminData}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white  hover: transition-all duration-200 py-3 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Last updated: {new Date().toLocaleTimeString('en-US')}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-700 mb-1">Total Stores</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.totalShops}</p>
                    <p className="text-xs text-yellow-600 mt-1">Active in system</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center ">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.pendingShops}</p>
                    <p className="text-xs text-amber-600 mt-1">Awaiting approval</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center ">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700 mb-1">Approved</p>
                    <p className="text-3xl font-bold text-green-900">{stats.approvedShops}</p>
                    <p className="text-xs text-green-600 mt-1">Live stores</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center ">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-600 mt-1">Registered users</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center ">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover: transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700 mb-1">Products</p>
                    <p className="text-3xl font-bold text-amber-900">{stats.totalProducts}</p>
                    <p className="text-xs text-amber-600 mt-1">Total products</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center ">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content based on active tab */}
          <div className="space-y-8">

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Enhanced Recent Activity */}
                  <Card className="bg-white  border-0 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <Calendar className="w-5 h-5 mr-3" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {pendingShops.length > 0 ? (
                          pendingShops.slice(0, 3).map((shop) => (
                            <div key={shop.id} className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New request from "{shop.name}"</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString('en-US') : 'Recent'}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                                Pending
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">No pending requests</p>
                                <p className="text-xs text-gray-500 mt-1">All caught up!</p>
                              </div>
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs">
                                Clear
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"></div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">System running normally</p>
                                <p className="text-xs text-gray-500 mt-1">All services operational</p>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                Active
                              </Badge>
                            </div>
                          </>
                        )}
                        {stats.totalShops > 0 && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Total {stats.totalShops} stores in system</p>
                              <p className="text-xs text-gray-500 mt-1">System statistics</p>
                            </div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                              Info
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Quick Actions */}
                  <Card className="bg-white  border-0 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-[#A37F41] to-[#8A6C37] text-white p-6">
                      <CardTitle className="flex items-center text-xl font-semibold">
                        <TrendingUp className="w-5 h-5 mr-3" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-[#C5A56D] to-[#A37F41] hover:from-[#A37F41] hover:to-[#8A6C37] text-white  hover: transition-all duration-200 py-3 rounded-xl"
                        onClick={() => setActiveTab('pending')}
                        disabled={stats.pendingShops === 0}
                      >
                        <Clock className="w-5 h-5 mr-3" />
                        Review Pending Requests ({stats.pendingShops})
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-[#8A6C37] to-[#6D552C] hover:from-[#6D552C] hover:to-[#49391D] text-white  hover: transition-all duration-200 py-3 rounded-xl"
                        onClick={() => setActiveTab('shops')}
                      >
                        <Store className="w-5 h-5 mr-3" />
                        Manage All Stores ({stats.totalShops})
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-[#D3BB92] to-[#C5A56D] hover:from-[#C5A56D] hover:to-[#A37F41] text-white  hover: transition-all duration-200 py-3 rounded-xl"
                        onClick={loadAdminData}
                      >
                        <RefreshCw className="w-5 h-5 mr-3" />
                        Refresh Data
                      </Button>
                      <Button
                        className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white  hover: transition-all duration-200 py-3 rounded-xl"
                        onClick={handleUpdateLegacyShops}
                        disabled={isLoading}
                      >
                        <CheckCircle className="w-5 h-5 mr-3" />
                        Update Legacy Stores
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'pending' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl  border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-[#A37F41] to-[#8A6C37] bg-clip-text text-transparent">
                      Pending Requests
                    </h2>
                    <Badge className="bg-gradient-to-r from-[#C5A56D] to-[#A37F41] text-white px-4 py-2 text-sm font-medium">
                      {stats.pendingShops} Requests Waiting
                    </Badge>
                  </div>
                </div>

                {pendingShops.length > 0 ? (
                  <div className="grid gap-6">
                    {pendingShops.map((shop) => (
                      <Card key={shop.id} className="bg-white  border-0 rounded-2xl overflow-hidden hover: transition-all duration-300 border-l-4 border-l-amber-500">
                        <CardContent className="p-8">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                                  <Store className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-xl text-gray-900 mb-1">{shop.name}</h3>
                                  {getStatusBadge(shop)}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-6 text-base leading-relaxed">{shop.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="font-semibold text-gray-900 block mb-2">Address:</span>
                                  <p className="text-gray-600">{shop.address}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="font-semibold text-gray-900 block mb-2">Phone:</span>
                                  <p className="text-gray-600">{shop.phone}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <span className="font-semibold text-gray-900 block mb-2">Request Date:</span>
                                  <p className="text-gray-600">
                                    {new Date(shop.createdAt || Date.now()).toLocaleDateString('en-US')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 ml-6">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl"
                                onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white  hover: transition-all duration-200 px-4 py-2 rounded-xl"
                                onClick={() => handleApproveShop(shop._id || shop.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white  hover: transition-all duration-200 px-4 py-2 rounded-xl"
                                onClick={() => handleRejectShop(shop._id || shop.id)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl  border border-white/20 p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No Pending Requests
                    </h3>
                    <p className="text-gray-600 text-lg">
                      All store requests have been reviewed
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shops' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl  border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      All Stores
                    </h2>
                    <div className="flex gap-3">
                      <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                {allShops.length > 0 ? (
                  <div className="grid gap-6">
                    {allShops.map((shop) => (
                      <Card key={shop.id} className="bg-white  border-0 rounded-2xl overflow-hidden hover: transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center ">
                                <Store className="w-8 h-8 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-bold text-lg text-gray-900">{shop.name}</h4>
                                  {getStatusBadge(shop)}
                                </div>
                                <p className="text-gray-600 font-medium">{shop.address}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Created: {new Date(shop.createdAt || Date.now()).toLocaleDateString('en-US')}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl"
                                onClick={() => navigate(ROUTES.SHOP_DETAILS(shop._id || shop.id))}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              {!shop.isApproved && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white  hover: transition-all duration-200 px-4 py-2 rounded-xl"
                                    onClick={() => handleApproveShop(shop._id || shop.id)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white  hover: transition-all duration-200 px-4 py-2 rounded-xl"
                                    onClick={() => handleRejectShop(shop._id || shop.id)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white  hover: transition-all duration-200 px-4 py-2 rounded-xl"
                                onClick={() => handleDeleteShop(shop._id || shop.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl  border border-white/20 p-12 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Store className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No Stores Found
                    </h3>
                    <p className="text-gray-600 text-lg">
                      No stores have been created yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;