import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Package, 
  X, 
  Star,
  Tag,
  User,
  Clock,
  Phone,
  Mail,
  ShoppingCart,
  Eye,
  ArrowLeft
} from 'lucide-react';
import chatService from './services/chatService';
import { productService } from './services/productService';
import api from './services/api';

const SellerChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  
  // Chat states
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Product states
  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [showProductSidebar, setShowProductSidebar] = useState(false);
  
  // Current user
  const [currentUser, setCurrentUser] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get current user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  // Initialize chat service and load conversation
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Connect to chat service
        chatService.connect(token);

        // Wait for connection
        await new Promise((resolve) => {
          const checkConnection = () => {
            if (chatService.getConnectionStatus()) {
              resolve();
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
        });

        // Join conversation and load messages
        const conversationData = await chatService.joinConversation(conversationId);
        setConversation(conversationData);

        const messagesData = await chatService.getMessages(conversationId);
        setMessages(messagesData || []);

        // Load product if productId exists in conversation
        if (conversationData?.productId) {
          loadProduct(conversationData.productId);
        }

      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      initializeChat();
    }

    return () => {
      chatService.disconnect();
    };
  }, [conversationId, navigate]);

  // Load product details
  const loadProduct = async (productId) => {
    try {
      setProductLoading(true);
      const productData = await productService.getProduct(productId);
      setProduct(productData.data || productData);
    } catch (err) {
      console.error('Error loading product:', err);
    } finally {
      setProductLoading(false);
    }
  };

  // Set up chat event listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId !== currentUser?.id) {
        setOtherUserTyping(isTyping);
      }
    };

    chatService.onNewMessage(handleNewMessage);
    chatService.onUserTyping(handleUserTyping);

    return () => {
      chatService.offNewMessage(handleNewMessage);
      chatService.offUserTyping(handleUserTyping);
    };
  }, [currentUser]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const messageContent = newMessage.trim();
      setNewMessage('');
      
      await chatService.sendMessage(
        conversationId, 
        messageContent, 
        conversation?.productId
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      chatService.sendTypingIndicator(conversationId, true);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.sendTypingIndicator(conversationId, false);
    }, 1000);
  };

  // Format message time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get other participant
  const getOtherParticipant = () => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p.id !== currentUser?.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MessageCircle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/seller/conversations')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {otherParticipant?.username || 'Customer'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {otherParticipant?.email || 'Unknown email'}
                  </p>
                </div>
              </div>
            </div>
            
            {conversation?.productId && (
              <button
                onClick={() => setShowProductSidebar(true)}
                className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>View Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            
            return (
              <div
                key={message.id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          
          {otherUserTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  sendMessage(e);
                }
              }}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Product Sidebar */}
      {showProductSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-96 bg-white h-full overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={() => setShowProductSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Product Content */}
            <div className="p-4">
              {productLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : product ? (
                <div className="space-y-6">
                  {/* Product Images */}
                  {product.images && product.images.length > 0 && (
                    <div className="space-y-2">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {product.images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {product.images.slice(1, 4).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${product.name} ${index + 2}`}
                              className="w-full h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-1">
                        ${product.price}
                      </p>
                    </div>

                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-gray-500">
                          ({product.reviewCount || 0} reviews)
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Tag className="w-4 h-4" />
                        <span>Category: {product.category || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>Stock: {product.stock || 0} units</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>Views: {product.views || 0}</span>
                      </div>
                    </div>

                    {product.description && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Edit Product
                      </button>
                      
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Public Page
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Product not found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerChatPage;