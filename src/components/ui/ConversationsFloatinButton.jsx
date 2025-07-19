import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, X, Bell, AlertCircle, Search, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import chatService from '@/services/chatService';
import { productService } from '@/services/productService'; 
import { STORAGE_KEYS } from '@/utils/constants';
import ShopChatInterface from './shop_chat_interface';

// Conversations Modal Component
const ConversationsModal = ({ isOpen, onClose, onSelectConversation, conversations, isConnected, isLoading, user }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    conv.lastMessage?.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}د`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} س`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}ي`;

    return date.toLocaleDateString('ar-EG');
  };

  const formatLastMessage = (message, senderId) => {
    if (!message) return 'لا توجد رسائل';

    const isFromMe = senderId === user?._id;
    const prefix = isFromMe ? 'أنت: ' : '';

    return `${prefix}${message.content}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md h-[70vh] flex flex-col bg-white rounded-2xl shadow-2xl">
        <CardHeader className="flex-shrink-0 p-6 border-b bg-gradient-to-l from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">المحادثات</h2>
              <Badge className={`${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-xs`}>
                {isConnected ? 'متصل' : 'غير متصل'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المحادثات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل المحادثات...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'لم يتم العثور على محادثات' : 'لا توجد محادثات'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'جرب البحث بكلمات أخرى' : 'ابدأ محادثة جديدة مع أحد المتاجر'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-full">
              {filteredConversations.map((conversation) => {
                
                const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
                const isShopChat = conversation.type === 'shop_chat';

                return (
                  <div
                    key={conversation._id}
                    onClick={() => onSelectConversation(conversation)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          {isShopChat ? <Store className="w-6 h-6" /> : <User className="w-6 h-6" />}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-right">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatTime(conversation.updatedAt)}</span>
                          {isShopChat && (
                            <Badge variant="secondary" className="text-xs">متجر</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 truncate">{otherParticipant?.name}</h3>
                      </div>

                      <p className="text-sm text-gray-600 truncate text-right mt-1">
                        {formatLastMessage(conversation.lastMessage, conversation.lastMessage?.sender?._id)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ConversationsFloatinButton = ({ user, onOpenChat, onSelectConversation }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [showChatInterface, setShowChatInterface] = useState(false);

  // Initialize socket connection
  const initializeSocket = useCallback(async () => {
    if (!user) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Connecting to chat service...');
      const socket = chatService.connect(token);

      // Wait for connection
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 20000);

        const onConnect = () => {
          clearTimeout(timeout);
          socket.off('connect', onConnect);
          socket.off('connect_error', onConnectError);
          setIsConnected(true);
          setConnectionError(null);
          resolve();
        };

        const onConnectError = (error) => {
          clearTimeout(timeout);
          socket.off('connect', onConnect);
          socket.off('connect_error', onConnectError);
          setIsConnected(false);
          setConnectionError(error.message);
          reject(error);
        };

        if (socket.connected) {
          onConnect();
        } else {
          socket.on('connect', onConnect);
          socket.on('connect_error', onConnectError);
        }
      });

      // Load conversations to get unread count
      await loadConversations();

      // Setup event listeners
      setupEventListeners();

      console.log('Chat service connected successfully');

    } catch (error) {
      console.error('Failed to connect to chat service:', error);
      setConnectionError(error.message);
      setIsConnected(false);

      // Retry connection after delay
      setTimeout(() => {
        initializeSocket();
      }, 5000);
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  // Load conversations to calculate unread count
  const loadConversations = useCallback(async () => {
    try {
      const socket = chatService.getSocket();
      if (!socket || !chatService.getConnectionStatus()) {
        return;
      }

      const loadedConversations = await new Promise((resolve, reject) => {
        socket.emit('getConversations', (response) => {
          if (response.status === 'success') {
            resolve(response.conversations);
          } else {
            reject(new Error(response.message));
          }
        });
      });

      setConversations(loadedConversations);

      // Calculate unread count
      const totalUnread = loadedConversations.reduce((total, conv) => {
        return total + (conv.unreadCount || 0);
      }, 0);

      setUnreadCount(totalUnread);

    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Setup event listeners for real-time updates
  const setupEventListeners = useCallback(() => {
    const socket = chatService.getSocket();
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('New message received:', message);

      // Update conversations
      setConversations(prev =>
        prev.map(conv => {
          if (conv._id === message.conversation) {
            return {
              ...conv,
              lastMessage: message,
              updatedAt: message.createdAt,
              unreadCount: message.sender._id !== user._id ? (conv.unreadCount || 0) + 1 : conv.unreadCount
            };
          }
          return conv;
        })
      );

      // Update unread count if message is from someone else
      if (message.sender._id !== user._id) {
        setUnreadCount(prev => prev + 1);

        // Show notification
        showNotification(message);
      }
    };

    // Listen for new conversations
    const handleNewConversation = (data) => {
      console.log('New conversation:', data);
      loadConversations();

      toast.info('محادثة جديدة', {
        description: 'تم إنشاء محادثة جديدة',
        duration: 3000,
      });
    };

    // Listen for message read events
    const handleMessageRead = ({ messageId }) => {
      console.log('Message read:', messageId);
      // You can update UI to show read status if needed
    };

    // Listen for typing indicators
    const handleUserTyping = ({ userId, userName, isTyping }) => {
      console.log(`${userName} is ${isTyping ? 'typing' : 'stopped typing'}`);
      // You can show typing indicators in chat UI
    };

    // Listen for authentication failures
    const handleAuthenticationFailed = () => {
      console.log('Authentication failed, user needs to re-login');
      setIsConnected(false);
      setConnectionError('Authentication failed');

      toast.error('خطأ في المصادقة', {
        description: 'يرجى إعادة تسجيل الدخول',
        duration: 5000,
      });
    };

    // Listen for connection status changes
    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        setConnectionError('Server disconnected');
      }
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setConnectionError(error.message);
    };

    // Setup all listeners
    chatService.onNewMessage(handleNewMessage);
    chatService.onNewShopConversation(handleNewConversation);
    chatService.onMessageRead(handleMessageRead);
    chatService.onUserTyping(handleUserTyping);
    chatService.onAuthenticationFailed(handleAuthenticationFailed);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    // Cleanup function
    return () => {
      chatService.offNewMessage(handleNewMessage);
      chatService.offNewShopConversation(handleNewConversation);
      chatService.offMessageRead(handleMessageRead);
      chatService.offUserTyping(handleUserTyping);

      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [user, loadConversations]);

  // Show browser/toast notification for new messages
  const showNotification = useCallback((message) => {
    // Try browser notification first
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`رسالة جديدة من ${message.sender.name}`, {
        body: message.content,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        dir: 'rtl',
        lang: 'ar',
        tag: `message-${message.conversation}`,
        renotify: true,
        requireInteraction: false,
        silent: false
      });
    }

    // Show toast notification
    toast.success(`رسالة جديدة من ${message.sender.name}`, {
      description: message.content,
      duration: 5000,
      action: {
        label: 'عرض',
        onClick: () => {
          if (onOpenChat) {
            onOpenChat();
          }
        }
      }
    });
  }, [onOpenChat]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    }
    return 'denied';
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializeSocket();
      requestNotificationPermission();
    }

    return () => {
      // Cleanup on unmount
      const cleanup = setupEventListeners();
      if (cleanup) cleanup();
    };
  }, [user, initializeSocket, requestNotificationPermission]);

  // Handle button click
  const handleClick = () => {
    setShowConversations(!showConversations);
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation) => {
    console.log('Conversation selected:', conversation);
    setShowConversations(false);
    setIsLoadingProduct(true);

    try {
      // Mark conversation as read
      setConversations(prev =>
        prev.map(conv =>
          conv._id === conversation._id
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );

      // Update total unread count
      setUnreadCount(prev => prev - (conversation.unreadCount || 0));

      // Check if user is a seller (has shop)
      const isSeller = user?.role === 'seller';
      console.log('User role:', user?.role);
      console.log('Is seller:', isSeller);
      console.log('Conversation product:', conversation.product);
      
      if (isSeller && conversation.product) {
        // Fetch product details first
        console.log('Fetching product details for:', conversation.product);
        const productData = await productService.getProduct(conversation.product);
        console.log('Product fetched:', productData);
        
        
        setSelectedProduct(productData);
        setShowChatInterface(true);
      } else {
        console.log(`prod id: ${JSON.stringify(conversation.product)}`);
        
        // For non-sellers or if no product, use the original callback
        if (onSelectConversation) {
          onSelectConversation(conversation.product);
        } else if (onOpenChat) {
          onOpenChat(conversation);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('خطأ في تحميل تفاصيل المنتج', {
        description: error.message || 'فشل في تحميل تفاصيل المنتج',
        duration: 5000,
      });
      
      // Fallback to original behavior
      if (onSelectConversation) {
        onSelectConversation(conversation);
      } else if (onOpenChat) {
        onOpenChat(conversation);
      }
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // Handle close conversations modal
  const handleCloseConversations = () => {
    setShowConversations(false);
  };

  // Handle close chat interface
  const handleCloseChatInterface = () => {
    setShowChatInterface(false);
    setSelectedProduct(null);
  };

  // Get button status
  const getButtonStatus = () => {
    if (isConnecting) return 'connecting';
    if (connectionError) return 'error';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const buttonStatus = getButtonStatus();

  return (
    <>
      <div className="fixed bottom-6 right-28 z-50">
        <div className="relative">
          {/* Pulsing animation when connected */}
          {buttonStatus === 'connected' && unreadCount > 0 && (
            <>
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-30"></div>
              <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse opacity-20"></div>
            </>
          )}

          <Button
            onClick={handleClick}
            disabled={buttonStatus === 'connecting'}
            className={`
              relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm
              ${buttonStatus === 'connected'
                ? 'bg-gradient-to-r from-[#A37F41] via-[#C5A56D] to-[#8A6C37] hover:from-[#8A6C37] hover:via-[#A37F41] hover:to-[#6D552C] shadow-[#A37F41]/20'
                : buttonStatus === 'error'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/20'
                  : buttonStatus === 'connecting'
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-400/20'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-gray-500/20'
              }
              text-white border-2 border-white/20 flex items-center justify-center
              before:absolute before:inset-0 before:rounded-full before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-15
              disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
            `}
            size="lg"
          >
            <div className="relative z-10">
              {buttonStatus === 'connecting' ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : buttonStatus === 'error' ? (
                <AlertCircle className="w-7 h-7 drop-shadow-lg" />
              ) : showConversations ? (
                <X className="w-7 h-7 drop-shadow-lg" />
              ) : (
                <MessageSquare className="w-7 h-7 drop-shadow-lg" />
              )}
            </div>

            {/* Unread count badge */}
            {unreadCount > 0 && buttonStatus === 'connected' && !showConversations && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              </div>
            )}

            {/* Connection status indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${buttonStatus === 'connected' ? 'bg-green-500' :
                buttonStatus === 'connecting' ? 'bg-yellow-500' :
                  'bg-red-500'
              }`} />

            {/* Tooltip */}
            {!showConversations && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {buttonStatus === 'connected' ? 'الدردشة المباشرة' :
                  buttonStatus === 'connecting' ? 'جاري الاتصال...' :
                    buttonStatus === 'error' ? 'خطأ في الاتصال' :
                      'غير متصل'}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </Button>
        </div>

        {/* Connection error tooltip */}
        {connectionError && !showConversations && (
          <div className="absolute bottom-full right-0 mb-2 max-w-xs p-3 bg-red-900 text-white text-sm rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>خطأ في الاتصال</span>
            </div>
            <p className="mt-1 text-xs text-red-200">{connectionError}</p>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900"></div>
          </div>
        )}
      </div>

      <ConversationsModal
        isOpen={showConversations}
        onClose={handleCloseConversations}
        onSelectConversation={handleSelectConversation}
        conversations={conversations}
        isConnected={isConnected}
        isLoading={isConnecting}
        user={user}
      />

      {/* Shop Chat Interface */}
      {showChatInterface && selectedProduct && (
        <ShopChatInterface
          isOpen={showChatInterface}
          onClose={handleCloseChatInterface}
          shop={selectedProduct.shop || selectedProduct.shopId}
          user={user}
          product={selectedProduct.data}
        />
      )}

      {/* Loading overlay for product fetching */}
      {isLoadingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900">جاري تحميل تفاصيل المنتج...</h3>
                <p className="text-gray-600">يرجى الانتظار</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ConversationsFloatinButton;