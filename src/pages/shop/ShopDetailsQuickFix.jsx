import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, MapPin, Phone, Clock, Star, Users } from 'lucide-react';

const ShopDetailsQuickFix = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadShopDetails();
  }, [id]);

  const loadShopDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏪 Loading shop details for ID:', id);

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      console.log('🏪 API URL:', apiUrl);

      // Try direct API call to public endpoint
      const response = await fetch(`${apiUrl}/shop/${id}`);
      console.log('🏪 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          // Shop not found in public API, try to get basic info from products
          console.log('🏪 Shop not found in public API, checking products...');
          try {
            const productsResponse = await fetch(`${apiUrl}/product`);
            if (productsResponse.ok) {
              const productsData = await productsResponse.json();
              const products = productsData.data || [];

              // Find a product from this shop to get basic shop info
              const productFromShop = products.find(p =>
                (p.shop && p.shop._id === id) || p.shopId === id
              );

              if (productFromShop && productFromShop.shop) {
                console.log('🏪 Found shop info from product:', productFromShop.shop);
                const basicShopData = {
                  _id: id,
                  name: productFromShop.shop.name || 'Unknown Shop',
                  description: 'Shop information available through products only',
                  isApproved: false, // Not in public API means not approved
                  address: 'Not available',
                  phone: 'Not available'
                };
                setShop(basicShopData);
                return;
              }
            }
          } catch (productsError) {
            console.error('🏪 Error checking products:', productsError);
          }
        }
        throw new Error(`Shop not found (${response.status})`);
      }

      const data = await response.json();
      console.log('🏪 Raw response:', data);

      // Handle response format
      let shopData = null;
      if (data && data.data) {
        shopData = data.data;
      } else if (data && data._id) {
        shopData = data;
      } else {
        shopData = data;
      }

      console.log('🏪 Processed shop data:', shopData);

      if (!shopData || !shopData.name) {
        throw new Error('Invalid shop data received');
      }

      setShop(shopData);

    } catch (err) {
      console.error('🏪 Error loading shop:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop details...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop Not Available</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Sorry, this shop is currently unavailable or pending approval.'}
          </p>
          <div className="space-y-2">
            <Button onClick={() => navigate('/shops')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shops
            </Button>
            <Button
              variant="outline"
              onClick={loadShopDetails}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="text-sm text-gray-500">
              Shop ID: {shop._id}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shop Info */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {shop.name}
                    </h1>
                    {shop.description && (
                      <p className="text-lg text-gray-600 mb-4">
                        {shop.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${shop.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {shop.isApproved ? '✅ Approved' : '⏳ Pending'}
                      </span>
                      {shop.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold">{shop.rating}</span>
                          <span className="text-gray-500">
                            ({shop.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-6">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">🏪</span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    {shop.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Address</p>
                          <p className="text-gray-600">{shop.address}</p>
                        </div>
                      </div>
                    )}
                    {shop.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Phone</p>
                          <p className="text-gray-600">{shop.phone}</p>
                        </div>
                      </div>
                    )}
                    {shop.workingHours && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Working Hours</p>
                          <p className="text-gray-600">{shop.workingHours}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Owner Information</h3>
                    {shop.owner && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Owner</p>
                          <p className="text-gray-600">
                            {shop.owner.name || shop.owner.email || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialties */}
                {shop.specialties && shop.specialties.length > 0 && (
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {shop.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => {
                    // Navigate to shop products
                    navigate(`/products?shop=${shop._id}`);
                  }}>
                    View Products
                  </Button>
                  <Button variant="outline" className="w-full">
                    Book Appointment
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contact Shop
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Info</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Shop ID:</strong> {shop._id}</p>
                  <p><strong>API URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
                  <p><strong>Endpoint:</strong> /shop/public/{id}</p>
                  <p><strong>Status:</strong> Working ✅</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailsQuickFix;
