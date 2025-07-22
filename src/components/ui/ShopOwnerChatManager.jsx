import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  User, 
  ShoppingBag, 
  Clock, 
  Search, 
  Filter,
  CheckCircle,
  Circle,
  MoreVertical,
  Star,
  Phone,
  Mail,
  Eye,
  Archive,
  Trash2,
  Pin,
  X,
  Send,
  Paperclip,
  AlertCircle,
  RefreshCw,
  Bell,
  BellOff,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import chatService from '../../services/chatService';
import { STORAGE_KEYS } from '@/utils/constants';

const ShopOwnerChatManager = ({ user, shop }) => {
  // Conversations list state
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [error, setError] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize chat service and load conversations
  useEffect(() => {
    if (user && shop) {
      initializeChatService();
    }

    return () => {
      cleanupChatService();
    };
  }, [user, shop]);

  // Setup message listeners when conversations change
  useEffect(() => {
    if (isConnected) {
      setupGlobalMessageListeners();
    }

    return () => {
      cleanupMessageListeners();
    };
  }, [isConnected, conversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat service
  const initializeChatService = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      console.log('🏪 Initializing shop owner chat service...');

      // Connect to chat service if not connected
      if (!chatService.getConnectionStatus()) {
        await new Promise((resolve, reject) => {
          const socket = chatService.connect(token);
          const connectTimeout = setTimeout(() => {
            reject(new Error('انتهت مهلة الاتصال'));
          }, 10000);

          socket.on('connect', () => {
            console.log('✅ Socket connected successfully');
            clearTimeout(connectTimeout);
            setIsConnected(true);
            resolve();
          });

          socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            clearTimeout(connectTimeout);
            reject(new Error('فشل في الاتصال: ' + error.message));
          });
        });
      } else {
        setIsConnected(true);
        console.log('✅ Already connected to chat service');
      }

      // Load shop conversations
      await loadShopConversations();

    } catch (error) {
      console.error('❌ Error initializing chat service:', error);
      setError(error.message || 'فشل في الاتصال بخدمة الدردشة');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load shop conversations
  const loadShopConversations = async () => {
    try {
      console.log(`📥 Loading conversations for shop: ${shop._id}`);
      const shopConversations = await chatService.getShopConversations(shop._id);
      console.log(`✅ Loaded ${shopConversations.length} conversations`);
      
      // Sort by last message time (most recent first)
      const sortedConversations = shopConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime) - new Date(aTime);
      });

      setConversations(sortedConversations);
    } catch (error) {
      console.error('❌ Error loading shop conversations:', error);
      setError('فشل في تحميل المحادثات');
    }
  };

  // Setup global message listeners
  const setupGlobalMessageListeners = () => {
    console.log('🔧 Setting up global message listeners...');

    // Listen for new messages in any conversation
    chatService.onNewMessage((message) => {
      console.log('📨 New message received:', message);
      
      // Update conversations list with new message
      setConversations(prev => prev.map(conv => {
        if (conv._id === message.conversation) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount: conv._id === selectedConversation?._id ? 0 : (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      }));

      // If this message is for the currently selected conversation, add it to messages
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read if it's not from current user
        if (message.sender._id !== user._id) {
          chatService.markAsRead(message._id).catch(console.error);
        }
      }

      // Play notification sound or show notification
      if (notifications && message.sender._id !== user._id) {
        playNotificationSound();
      }
    });

    // Listen for new conversations
    chatService.onNewShopConversation((conversation) => {
      console.log('🆕 New conversation received:', conversation);
      setConversations(prev => [conversation, ...prev]);
    });

    // Listen for typing indicators
    chatService.onUserTyping(({ userId, conversationId, isTyping: typing }) => {
      if (selectedConversation && conversationId === selectedConversation._id && userId !== user._id) {
        setIsTyping(typing);
      }
    });

    // Listen for message read confirmations
    chatService.onMessageRead(({ messageId, conversationId }) => {
      if (selectedConversation && conversationId === selectedConversation._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        ));
      }
    });
  };

  // Cleanup message listeners
  const cleanupMessageListeners = () => {
    console.log('🧹 Cleaning up message listeners...');
    chatService.offNewMessage();
    chatService.offNewShopConversation();
    chatService.offUserTyping();
    chatService.offMessageRead();
  };

  // Cleanup chat service
  const cleanupChatService = () => {
    console.log('🧹 Cleaning up chat service...');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    cleanupMessageListeners();
  };

  // Select conversation and load messages
  const selectConversation = async (conversation) => {
    if (selectedConversation?._id === conversation._id) return;

    console.log(`📂 Selecting conversation: ${conversation._id}`);
    setSelectedConversation(conversation);
    setMessages([]);
    setChatError(null);

    try {
      // Join the conversation room
      await chatService.joinConversation(conversation._id);
      
      // Load messages
      await loadMessages(conversation._id);
      
      // Mark conversation as read
      setConversations(prev => prev.map(conv => 
        conv._id === conversation._id ? { ...conv, unreadCount: 0 } : conv
      ));

    } catch (error) {
      console.error('❌ Error selecting conversation:', error);
      setChatError('فشل في تحميل المحادثة');
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId) => {
    try {
      console.log(`📥 Loading messages for conversation: ${conversationId}`);
      const conversationMessages = await chatService.getMessages(conversationId, 50, 0);
      console.log(`✅ Loaded ${conversationMessages.length} messages`);
      setMessages(conversationMessages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('❌ Error loading messages:', error);
      setChatError('فشل في تحميل الرسائل');
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Send typing indicator
    if (selectedConversation && isConnected) {
      // Debounce typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing start
      chatService.sendTypingIndicator(selectedConversation._id, true);

      // Send typing stop after 1 second of no typing
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(selectedConversation._id, false);
      }, 1000);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !isConnected || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setChatError(null);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      chatService.sendTypingIndicator(selectedConversation._id, false);
    }

    try {
      console.log('📤 Sending message:', messageContent);

      // Add optimistic message
      const optimisticMessage = {
        _id: Date.now() + Math.random(),
        content: messageContent,
        sender: { 
          _id: user._id, 
          name: user.name || `${user.firstName} ${user.lastName}`.trim() || 'Shop Owner'
        },
        createdAt: new Date().toISOString(),
        conversation: selectedConversation._id,
        read: false,
        optimistic: true
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // Send actual message
      const productId = selectedConversation.product?._id || selectedConversation.product;
      const sentMessage = await chatService.sendMessage(selectedConversation._id, messageContent, productId);
      console.log('✅ Message sent:', sentMessage);

      // Replace optimistic message with real one
      setMessages(prev =>
        prev.map(msg =>
          msg.optimistic && msg.content === messageContent ? sentMessage : msg
        )
      );

      // Update conversations list
      setConversations(prev => prev.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: sentMessage }
          : conv
      ));

    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setChatError('فشل في إرسال الرسالة');

      // Remove optimistic message and restore content
      setMessages(prev => prev.filter(msg => !msg.optimistic));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Refresh conversations
  const refreshConversations = async () => {
    setIsLoading(true);
    await loadShopConversations();
    setIsLoading(false);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.product?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'unread' && conv.unreadCount > 0) ||
      (filterStatus === 'read' && conv.unreadCount === 0);

    return matchesSearch && matchesFilter;
  });

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playNotificationSound = () => {
    // You can implement notification sound here
    console.log('🔔 Playing notification sound');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!user || !shop) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في التحميل</h3>
          <p className="text-gray-600">بيانات المستخدم أو المتجر غير متوفرة {JSON.stringify(shop)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50" dir="rtl">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-l from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={`${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop.logoUrl}`} />
                <AvatarFallback className="bg-blue-500 text-white">
                  <Store className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold text-lg text-gray-900">{shop.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isConnected ? 'متصل' : 'غير متصل'}
                  </Badge>
                  {getTotalUnreadCount() > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {getTotalUnreadCount()} جديد
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className={`${notifications ? 'text-blue-600' : 'text-gray-400'}`}
              >
                {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshConversations}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المحادثات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
                className="text-xs"
              >
                الكل ({conversations.length})
              </Button>
              <Button
                variant={filterStatus === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('unread')}
                className="text-xs"
              >
                غير مقروء ({conversations.filter(c => c.unreadCount > 0).length})
              </Button>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 text-sm mb-2">{error}</p>
              <Button size="sm" onClick={refreshConversations}>
                إعادة المحاولة
              </Button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'لا توجد محادثات تطابق البحث' : 'لا توجد محادثات بعد'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.customer?.avatar} />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {conversation.customer?.name || 'عميل'}
                        </h4>
                        <div className="flex items-center gap-1">
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          {conversation.customer?.isOnline && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">
                          {conversation.product?.name || 'منتج'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conversation.lastMessage?.content || 'لا توجد رسائل بعد'}
                      </p>
                      
                      <span className="text-xs text-gray-400">
                        {conversation.lastMessage?.createdAt 
                          ? formatDate(conversation.lastMessage.createdAt)
                          : formatDate(conversation.createdAt)
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedConversation.customer?.avatar} />
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.customer?.name || 'عميل'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <ShoppingBag className="w-3 h-3" />
                      <span>{selectedConversation.product?.name || 'منتج'}</span>
                      {isTyping && (
                        <span className="text-blue-600 animate-pulse">يكتب...</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedConversation.customer?.phone && (
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">ابدأ المحادثة</h4>
                    <p className="text-gray-600">
                      لا توجد رسائل في هذه المحادثة بعد
                    </p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-white px-3 py-1 rounded-full shadow-sm">
                        <span className="text-xs text-gray-600 font-medium">
                          {formatDate(dateMessages[0].createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dateMessages.map((message) => {
                      const isOwnMessage = message.sender?._id === user?._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${isOwnMessage ? 'justify-start' : 'justify-end'} mb-3`}
                        >
                          <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row' : 'flex-row-reverse'}`}>
                            {!isOwnMessage && (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={selectedConversation.customer?.avatar} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                  <User className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl ${isOwnMessage
                                ? 'bg-gradient-to-l from-blue-500 to-blue-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                                } ${message.optimistic ? 'opacity-70' : ''}`}
                            >
                              <p className="text-sm leading-relaxed text-right">{message.content}</p>
                              <div className="flex items-center justify-start mt-1 gap-1">
                                <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {formatTime(message.createdAt)}
                                </span>
                                {isOwnMessage && (
                                  <div className="flex items-center gap-1">
                                    {message.optimistic ? (
                                      <div className="w-3 h-3 border border-blue-200 border-t-transparent rounded-full animate-spin"></div>
                                    ) : message.read ? (
                                      <div className="text-blue-100 text-xs">✓✓</div>
                                    ) : (
                                      <div className="text-blue-200 text-xs">✓</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {chatError && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{chatError}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChatError(null)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3">
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected || isSending}
                  className="bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="اكتب ردك هنا..."
                    className="w-full p-3 pl-12 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-right"
                    rows="1"
                    style={{ minHeight: '44px' }}
                    disabled={!isConnected || isSending}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2"
                >
                  <Paperclip className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  {isConnected && !chatError && (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      متصل
                    </span>
                  )}
                  {!isConnected && !isLoading && (
                    <span className="text-orange-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      غير متصل
                    </span>
                  )}
                  {isSending && (
                    <span className="text-blue-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      جاري الإرسال...
                    </span>
                  )}
                </div>
                <span>اضغط Enter للإرسال</span>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                مرحباً بك في إدارة المحادثات
              </h3>
              <p className="text-gray-600 mb-6">
                اختر محادثة من القائمة الجانبية للبدء في التواصل مع العملاء.
                يمكنك الرد على استفساراتهم ومساعدتهم في اختيار المنتجات المناسبة.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg text-right">
                <h4 className="font-medium text-blue-900 mb-2">نصائح للبائعين:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• رد بسرعة على رسائل العملاء لزيادة المبيعات</li>
                  <li>• كن مهذباً ومفيداً في ردودك</li>
                  <li>• قدم معلومات مفصلة عن المنتجات</li>
                  <li>• استخدم الصور لتوضيح المنتجات</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOwnerChatManager;