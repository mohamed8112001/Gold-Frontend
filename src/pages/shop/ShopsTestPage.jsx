import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import { shopService } from '../../services/shopService.js';
import { Card, CardContent } from '@/components/ui/card.jsx';

const ShopsTestPage = () => {
  const { user } = useContext(AuthContext);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadShops = async () => {
      try {
        setLoading(true);
        console.log('🧪 Testing shops API...');

        const response = await shopService.getAllShops();
        const shopsData = Array.isArray(response) ? response : response.data || response.shops || [];

        console.log('🧪 API Response:', response);
        console.log('🧪 Shops Data:', shopsData);
        console.log('🧪 Total shops:', shopsData.length);

        setShops(shopsData);
      } catch (err) {
        console.error('🧪 Error loading shops:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadShops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg">Testing shops API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">API Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Shops API Test Page
          </h1>

          {user && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-blue-900">Current User:</h3>
              <p className="text-blue-800">
                Name: {user.firstName || user.name || 'Unknown'} |
                Role: {user.role || 'Unknown'} |
                Email: {user.email || 'Unknown'}
              </p>
            </div>
          )}

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">API Results:</h3>
            <p className="text-green-800">
              Total shops loaded: <strong>{shops.length}</strong>
            </p>
            <p className="text-green-800">
              API Status: <strong>✅ Success</strong>
            </p>
          </div>
        </div>

        {shops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop, index) => (
              <Card key={shop.id || shop._id || index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{shop.name || 'Unnamed Shop'}</h3>
                      <p className="text-sm text-gray-600">ID: {shop.id || shop._id || 'No ID'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p><strong>Description:</strong> {shop.description || 'No description'}</p>
                    <p><strong>Address:</strong> {shop.address || shop.area || 'No address'}</p>
                    <p><strong>Phone:</strong> {shop.phone || 'No phone'}</p>
                    <p><strong>Rating:</strong> {shop.rating || 'No rating'}</p>
                    <p><strong>Status:</strong> {shop.status || 'No status'}</p>
                    <p><strong>Approved:</strong> {shop.approved?.toString() || 'No approval status'}</p>
                    <p><strong>Active:</strong> {shop.isActive?.toString() || 'No active status'}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No shops found
            </h3>
            <p className="text-gray-600">
              The API returned an empty array or no shops data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopsTestPage;
