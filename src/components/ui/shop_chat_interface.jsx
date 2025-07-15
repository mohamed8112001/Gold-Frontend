import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, MessageSquare, User, Store, Paperclip, Smile, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import chatService from '../../services/chatService';
import { STORAGE_KEYS } from '@/utils/constants';

const ShopChatInterface = ({ 
  isOpen, 
  onClose, 
  shop, 
  user,
  product
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    console.log(`Chat opened: isOpen=${isOpen}, user=${user?._id}, shop=${shop?._id}, product=${product?._id}`);
    
    if (isOpen && user && shop && product) {
      initializeChat();
    }

    return () => {
      cleanupChat();
    };
  }, [isOpen, user, shop, product]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage or user object
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      console.log('Initializing chat with token:', token ? 'Token found' : 'No token');

      // Connect to chat service if not connected
      if (!chatService.getConnectionStatus()) {
        await new Promise((resolve, reject) => {
          const socket = chatService.connect(token);
          const connectTimeout = setTimeout(() => {
            reject(new Error('انتهت مهلة الاتصال'));
          }, 10000);

          socket.on('connect', () => {
            console.log('Socket connected successfully');
            clearTimeout(connectTimeout);
            setIsConnected(true);
            resolve();
          });

          socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            clearTimeout(connectTimeout);
            reject(new Error('فشل في الاتصال: ' + error.message));
          });
        });
      } else {
        setIsConnected(true);
        console.log('Already connected to chat service');
      }

      // Create or get shop conversation
      const shopOwnerId = shop.owner?._id || shop.owner || shop.ownerId;
      if (!shopOwnerId) {
        throw new Error('معرف صاحب المتجر غير متوفر');
      }

      console.log(`Creating conversation: productId=${product._id}, shopOwnerId=${shopOwnerId}`);
      
      const response = await chatService.createShopConversation(product._id, shopOwnerId);
      console.log('Conversation created:', response);
      
      setConversationId(response.conversationId);
      
      // Join the conversation room
      await chatService.joinConversation(response.conversationId);
      console.log('Joined conversation room');
      
      // Load existing messages
      await loadMessages(response.conversationId);
      
      // Setup message listeners
      setupMessageListeners();
      
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError(error.message || 'فشل في الاتصال بالدردشة');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setupMessageListeners = () => {
    console.log('Setting up message listeners...');
    
    // Listen for new messages
    chatService.onNewMessage((message) => {
      console.log('New message received:', message);
      if (message.conversation === conversationId) {
        setMessages(prev => [...prev, message]);
        setIsTyping(false);
        
        // Mark message as read if it's not from current user
        if (message.sender._id !== user._id) {
          chatService.markAsRead(message._id).catch(console.error);
        }
      }
    });

    // Listen for typing indicators
    chatService.onUserTyping(({ userId, isTyping: typing }) => {
      console.log(`Typing indicator: userId=${userId}, isTyping=${typing}`);
      if (userId !== user._id) {
        setIsTyping(typing);
      }
    });
  };

  const cleanupChat = () => {
    console.log('Cleaning up chat...');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Remove listeners
    chatService.offNewMessage();
    chatService.offUserTyping();
  };

  const loadMessages = async (convId) => {
    try {
      console.log('Loading messages for conversation:', convId);
      const messages = await chatService.getMessages(convId, 50, 0);
      console.log('Messages loaded:', messages.length);
      setMessages(messages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('فشل في تحميل الرسائل');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Send typing indicator
    if (conversationId && isConnected) {
      // Debounce typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Send typing start
      chatService.sendTypingIndicator(conversationId, true);
      
      // Send typing stop after 1 second of no typing
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(conversationId, false);
      }, 1000);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !isConnected || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setError(null);

    // Stop typing indicator when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      chatService.sendTypingIndicator(conversationId, false);
    }

    try {
      console.log('Sending message:', messageContent);
      
      // Add optimistic message for better UX
      const optimisticMessage = {
        _id: Date.now() + Math.random(),
        content: messageContent,
        sender: { _id: user._id, name: user.name },
        createdAt: new Date().toISOString(),
        conversation: conversationId,
        read: false,
        optimistic: true
      };
      
      setMessages(prev => [...prev, optimisticMessage]);

      // Send actual message
      const sentMessage = await chatService.sendMessage(conversationId, messageContent, product._id);
      console.log('Message sent:', sentMessage);
      
      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.optimistic && msg.content === messageContent 
            ? sentMessage 
            : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('فشل في إرسال الرسالة');
      
      // Remove optimistic message and restore content
      setMessages(prev => prev.filter(msg => !msg.optimistic));
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl">
        {/* Chat Header */}
        <CardHeader className="flex-shrink-0 p-6 border-b bg-gradient-to-l from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                <AvatarImage src={shop?.image || `${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop?.logoUrl}`} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold">
                  <Store className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <h3 className="font-bold text-xl text-gray-900">{shop?.name}</h3>
                <div className="flex items-center gap-2 justify-end">
                  <Badge className={`${isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} text-xs`}>
                    {isConnected ? 'متصل' : 'غير متصل'}
                  </Badge>
                  {isTyping && (
                    <span className="text-sm text-blue-600 animate-pulse">يكتب...</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل المحادثة...</p>
              </div>
            </div>
          ) : error && !conversationId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">خطأ في الاتصال</h4>
                <p className="text-gray-600 mb-4 max-w-md text-center">{error}</p>
                <Button 
                  onClick={initializeChat}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {Object.keys(groupedMessages).length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-8">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">ابدأ محادثة جديدة</h4>
                    <p className="text-gray-600 max-w-md text-center">
                      مرحباً! يمكنك التواصل مع {shop?.name} مباشرة هنا. اطرح أسئلتك حول {product?.name || 'المنتج'}.
                    </p>
                  </div>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, dateMessages]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gray-100 px-3 py-1 rounded-full">
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
                                <AvatarImage src={shop?.image || `${import.meta.env.VITE_API_BASE_URL}/shop-image/${shop?.logoUrl}`} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                  <Store className="w-4 h-4" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                isOwnMessage
                                  ? 'bg-gradient-to-l from-blue-500 to-blue-600 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
                              } shadow-sm ${message.optimistic ? 'opacity-70' : ''}`}
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
          )}

          {/* Error Message */}
          {error && conversationId && (
            <div className="px-4 py-2 bg-red-50 border-t border-red-100">
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="flex-shrink-0 p-4 border-t bg-gray-50">
            <div className="flex items-end gap-3">
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected || isSending}
                className="bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="اكتب رسالتك هنا..."
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
                {isConnected && !error && (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopChatInterface;