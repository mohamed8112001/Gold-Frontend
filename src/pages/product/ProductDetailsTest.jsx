import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService.js';
import { shopService } from '../../services/shopService.js';

const ProductDetailsTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setLogs([]);
      
      addLog(`🛍️ Loading product details for ID: ${id}`);
      
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      addLog(`🛍️ API URL: ${apiUrl}`);
      
      // Test direct API call to product endpoint
      addLog('🧪 Testing direct product API call...');
      const response = await fetch(`${apiUrl}/product/${id}`);
      addLog(`🧪 Product response status: ${response.status}`);
      addLog(`🧪 Product response ok: ${response.ok}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`❌ Product error response: ${errorText}`);
        throw new Error(`Product not found (${response.status})`);
      }
      
      const data = await response.json();
      addLog(`🧪 Raw product response: ${JSON.stringify(data, null, 2)}`);
      
      // Parse the product data
      let productData = null;
      if (data && data.data) {
        addLog('✅ Using data.data for product');
        productData = data.data;
      } else if (data && data._id) {
        addLog('✅ Using data directly for product');
        productData = data;
      } else {
        addLog('❌ Unexpected product data format');
        productData = data;
      }
      
      addLog(`✅ Final product data: ${JSON.stringify(productData, null, 2)}`);
      setProduct(productData);
      
      // Load shop details if shopId exists
      if (productData && productData.shopId) {
        addLog(`🏪 Loading shop details for shopId: ${productData.shopId}`);
        try {
          const shopResponse = await fetch(`${apiUrl}/shop/public/${productData.shopId}`);
          addLog(`🏪 Shop response status: ${shopResponse.status}`);
          
          if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            addLog(`🏪 Raw shop response: ${JSON.stringify(shopData, null, 2)}`);
            
            let processedShopData = null;
            if (shopData && shopData.data) {
              processedShopData = shopData.data;
              addLog('✅ Using shopData.data');
            } else if (shopData && shopData._id) {
              processedShopData = shopData;
              addLog('✅ Using shopData directly');
            } else {
              processedShopData = shopData;
              addLog('⚠️ Using shopData as fallback');
            }
            
            addLog(`✅ Final shop data: ${JSON.stringify(processedShopData, null, 2)}`);
            setShop(processedShopData);
          } else {
            addLog(`❌ Shop not found: ${shopResponse.status}`);
            setShop(null);
          }
        } catch (shopError) {
          addLog(`❌ Shop loading error: ${shopError.message}`);
          setShop(null);
        }
      } else {
        addLog('⚠️ No shopId found in product data');
        setShop(null);
      }
      
    } catch (err) {
      addLog(`❌ Error: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
      addLog('✅ Loading finished');
    }
  };

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🛍️ Product Details Test - ID: {id}
        </h1>
        
        {/* Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800">Status</h3>
              <p className="text-blue-700">
                {loading ? '🔄 Loading...' : error ? '❌ Error' : product ? '✅ Found' : '❌ Not Found'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800">Product ID</h3>
              <p className="text-green-700 font-mono text-sm">{id}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded">
              <h3 className="font-semibold text-purple-800">Shop Status</h3>
              <p className="text-purple-700">{shop ? '✅ Loaded' : '❌ Not Found'}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded">
              <h3 className="font-semibold text-orange-800">Actions</h3>
              <button 
                onClick={loadProductDetails}
                disabled={loading}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
              >
                🔄 Reload
              </button>
            </div>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔍 Debug Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <div>No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Product Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🛍️ Product Details</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Loading product...</p>
              </div>
            ) : !product ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h3>
                <p className="text-gray-600">
                  {error ? 'There was an error loading the product.' : 'The product was not found.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {product.name || 'Unnamed Product'}
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 mt-2">{product.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>ID:</strong> {product._id || product.id || 'No ID'}</p>
                    <p><strong>Category:</strong> {product.category || 'Not specified'}</p>
                    <p><strong>Price:</strong> {product.price || 'Not specified'}</p>
                    <p><strong>Rating:</strong> {product.rating || 'No rating'}</p>
                  </div>
                  <div>
                    <p><strong>Shop ID:</strong> {product.shopId || 'No shop'}</p>
                    <p><strong>Shop Name:</strong> {product.shopName || 'Unknown'}</p>
                    <p><strong>In Stock:</strong> {product.inStock ? 'Yes' : 'No'}</p>
                    <p><strong>Created:</strong> {product.createdAt || 'Unknown'}</p>
                  </div>
                </div>
                
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Features:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Shop Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🏪 Shop Details</h2>
            
            {!shop ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Shop Not Found</h3>
                <p className="text-gray-600">Shop information is not available.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {shop.name || 'Unnamed Shop'}
                  </h3>
                  {shop.description && (
                    <p className="text-gray-600 mt-2">{shop.description}</p>
                  )}
                </div>
                
                <div className="text-sm space-y-2">
                  <p><strong>ID:</strong> {shop._id || shop.id || 'No ID'}</p>
                  {shop.address && <p><strong>Address:</strong> {shop.address}</p>}
                  {shop.phone && <p><strong>Phone:</strong> {shop.phone}</p>}
                  <p><strong>Status:</strong> {shop.isApproved ? '✅ Approved' : '❌ Pending'}</p>
                  {shop.rating && <p><strong>Rating:</strong> {shop.rating}/5</p>}
                  {shop.workingHours && <p><strong>Hours:</strong> {shop.workingHours}</p>}
                </div>
                
                <div className="pt-4 border-t">
                  <button 
                    onClick={() => window.open(`/shops/${shop._id || shop.id}`, '_blank')}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Visit Shop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsTest;
