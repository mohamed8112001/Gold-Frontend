import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Image, 
  Package, 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  MessageCircle,
  Loader2,
  AlertCircle,
  Store,
  Grid,
  List,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { shopService } from '@/services/shopService';


const SellerChatInterface = ({ 
  isOpen = true, 
  onClose = () => {}, 
  conversation = null,
  user = null,
  chatService = null,
  productService = null
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationData, setConversationData] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(true);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Get other participant (customer)
  const otherParticipant = conversationData?.participants?.find(p => p._id !== user?._id);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation data and messages
  const loadConversationData = useCallback(async () => {
    if (!conversation?._id || !chatService) return;

    setLoadingConversation(true);
    try {
      const socket = chatService.getSocket();
      
      // Join conversation
      await new Promise((resolve, reject) => {
        socket.emit('joinConversation', { conversationId: conversation._id }, (response) => {
          if (response.status === 'success') {
            setConversationData(response.conversation);
            resolve(response.conversation);
          } else {
            reject(new Error(response.message));
          }
        });
      });

      // Get messages
      await new Promise((resolve, reject) => {
        socket.emit('getMessages', { conversationId: conversation._id, limit: 50 }, (response) => {
          if (response.status === 'success') {
            setMessages(response.messages.reverse()); // Reverse to show oldest first
            resolve(response.messages);
          } else {
            reject(new Error(response.message));
          }
        });
      });

    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoadingConversation(false);
    }
  }, [conversation, chatService]);

  // Load seller's products
  const loadSellerProducts = useCallback(async () => {
    if (!user || !productService) return;

    setLoadingProducts(true);
    setProductsError(null);

    try {
      let shopId = null;
      
      console.log(`shop: ${JSON.stringify(user)}`);
      const shops = await shopService.getAllShops();
      const myShop = shops.data.filter((shop)=> {
        return shop.owner._id === user._id
      })
      console.log(`shop: ${JSON.stringify(shops)}`);
      console.log(`myshop: ${JSON.stringify(myShop[0])}`);

      shopId = myShop[0]._id;
      
      
      
      // // Try to get shop ID from different possible locations in user data
      // if (user.shop && user.shop._id) {
      //   shopId = user.shop._id;
      // } else if (user.shop && typeof user.shop === 'string') {
      //   shopId = user.shop;
      // } else if (user.shopId) {
      //   shopId = user.shopId;
      // } else {
      //   // If no shop found, throw specific error
      //   throw new Error('لا يوجد متجر مرتبط بهذا المستخدم');
      // }

      console.log('Loading products for shop:', shopId);
      const response = await productService.getProductsByShop(shopId);
      
      console.log('Products response:', response);
      console.log(`successs: ${response.status}`);
      
      if (response.status === "success") {
        setSellerProducts(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProductsError(error.message);
      setSellerProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [user, productService]);

  // Setup socket event listeners
  const setupSocketListeners = useCallback(() => {
    if (!chatService) return;

    const socket = chatService.getSocket();

    const handleNewMessage = (message) => {
      if (message.conversation === conversation?._id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleUserTyping = ({ userId, isTyping: typing }) => {
      if (userId !== user?._id && conversationData?.participants?.some(p => p._id === userId)) {
        setIsTyping(typing);
      }
    };

    chatService.onNewMessage(handleNewMessage);
    chatService.onUserTyping(handleUserTyping);

    return () => {
      chatService.offNewMessage(handleNewMessage);
      chatService.offUserTyping(handleUserTyping);
    };
  }, [chatService, conversation, user, conversationData]);

  // Initialize data loading
  useEffect(() => {
    if (isOpen && conversation) {
      loadConversationData();
      loadSellerProducts();
    }
  }, [isOpen, conversation, loadConversationData, loadSellerProducts]);

  // Setup socket listeners
  useEffect(() => {
    if (isOpen && conversationData) {
      return setupSocketListeners();
    }
  }, [isOpen, conversationData, setupSocketListeners]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const messageContent = newMessage.trim();
    if (!messageContent || !chatService || !conversation?._id) return;

    setIsLoading(true);
    try {
      const socket = chatService.getSocket();
      
      await new Promise((resolve, reject) => {
        socket.emit('sendMessage', {
          conversationId: conversation._id,
          content: messageContent,
          productId: conversationData?.product
        }, (response) => {
          if (response.status === 'success') {
            setNewMessage('');
            resolve(response.message);
          } else {
            reject(new Error(response.message));
          }
        });
      });

    } catch (error) {
      console.error('Error sending message:', error);
      alert('فشل في إرسال الرسالة: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!chatService || !conversation?._id) return;

    const socket = chatService.getSocket();
    socket.emit('sendTypingIndicator', {
      conversationId: conversation._id,
      isTyping: true
    });

    // Stop typing after 3 seconds
    setTimeout(() => {
      socket.emit('sendTypingIndicator', {
        conversationId: conversation._id,
        isTyping: false
      });
    }, 3000);
  }, [chatService, conversation]);

  // Send product as message
  const handleSendProduct = async (product) => {
    const productMessage = `🛍️ *${product.title}*\n\n${product.description}\n\n💰 السعر: ${product.price} ج.م\n📦 ${product.inStock ? 'متوفر' : 'غير متوفر'}\n\n⭐ التقييم: ${product.rating}/5 (${product.reviews} تقييم)`;
    
    if (!chatService || !conversation?._id) return;

    try {
      const socket = chatService.getSocket();
      
      await new Promise((resolve, reject) => {
        socket.emit('sendMessage', {
          conversationId: conversation._id,
          content: productMessage,
          productId: product._id
        }, (response) => {
          if (response.status === 'success') {
            resolve(response.message);
          } else {
            reject(new Error(response.message));
          }
        });
      });

    } catch (error) {
      console.error('Error sending product:', error);
      alert('فشل في إرسال المنتج: ' + error.message);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format price helper function
  const formatPrice = (price) => {
    if (!price) return '0';
    
    // Handle MongoDB Decimal128 format
    if (typeof price === 'object' && price.$numberDecimal) {
      return parseFloat(price.$numberDecimal).toLocaleString('ar-EG');
    }
    
    // Handle regular number
    if (typeof price === 'number') {
      return price.toLocaleString('ar-EG');
    }
    
    // Handle string number
    if (typeof price === 'string') {
      const numPrice = parseFloat(price);
      return isNaN(numPrice) ? '0' : numPrice.toLocaleString('ar-EG');
    }
    
    return '0';
  };

  // Format message content
  const formatMessageContent = (content) => {
    // Handle product messages with formatting
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      dir="rtl"
      style={{ fontFamily: "'Noto Sans Arabic', 'Cairo', sans-serif" }}
    >
      <div className="w-full max-w-6xl h-[90vh] flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Products Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Products Header */}
          <div className="p-4 border-b bg-gradient-to-l from-amber-50 to-yellow-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                منتجاتي
              </h3>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="w-8 h-8 p-0"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="w-8 h-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {sellerProducts.length} منتج
            </Badge>
          </div>

          {/* Products List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingProducts ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">جاري تحميل المنتجات...</p>
                </div>
              </div>
            ) : productsError ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{productsError}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadSellerProducts}
                    className="mt-2"
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            ) : sellerProducts.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">لا توجد منتجات</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'}>
                {sellerProducts.map((product) => (
                   <Card 
                   key={product._id} 
                   className="cursor-pointer hover:shadow-md transition-shadow duration-200 group"
                   onClick={() => handleSendProduct(product)}
                 >
                   <CardContent className="p-3">
                     {viewMode === 'grid' ? (
                       <div>
                         <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                           {product.images && product.images[0] ? (
                             <img 
                               src={`${import.meta.env.VITE_API_BASE_URL}/product-image/${product.images[0]}`} 
                               alt={product.title}
                               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <Image className="w-8 h-8 text-gray-400" />
                             </div>
                           )}
                         </div>
                         <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                           {product.title}
                         </h4>
                         <p className="text-amber-600 font-bold text-sm mb-2">
                           {formatPrice(product.price)} ج.م
                         </p>
                         <div className="flex items-center justify-between text-xs text-gray-500">
                           <div className="flex items-center gap-1">
                             <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                             <span>{product.rating}</span>
                           </div>
                           <Badge 
                             variant={product.inStock ? "secondary" : "destructive"}
                             className="text-xs"
                           >
                             {product.inStock ? 'متوفر' : 'غير متوفر'}
                           </Badge>
                         </div>
                       </div>
                     ) : (
                       <div className="flex gap-3">
                         <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                           {product.images && product.images[0] ? (
                             <img 
                               src={product.images[0]} 
                               alt={product.title}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <Image className="w-4 h-4 text-gray-400" />
                             </div>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                             {product.title}
                           </h4>
                           <p className="text-amber-600 font-bold text-xs">
                             {formatPrice(product.price)} ج.م
                           </p>
                         </div>
                       </div>
                     )}
                   </CardContent>
                 </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-l from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherParticipant?.avatar} />
                  <AvatarFallback className="bg-blue-500 text-white">
                    {otherParticipant?.name?.charAt(0) || '؟'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {otherParticipant?.name || 'العميل'}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{otherParticipant?.email}</span>
                    {isTyping && (
                      <span className="text-blue-600 animate-pulse">يكتب...</span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingConversation ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-gray-600">جاري تحميل المحادثة...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">ابدأ المحادثة</h3>
                  <p className="text-gray-600">أرسل رسالة أو منتج لبدء المحادثة مع العميل</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender._id === user?._id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 border'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">
                      {formatMessageContent(message.content)}
                    </div>
                    <div className={`text-xs mt-1 ${
                      message.sender._id === user?._id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-3">
              <input
                ref={messageInputRef}
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerChatInterface;