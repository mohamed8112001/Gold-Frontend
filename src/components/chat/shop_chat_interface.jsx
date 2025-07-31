// Enhanced Chat Interface with Simple Media Support - FIXED
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Send, Phone, MessageSquare, User, Store, Paperclip, Smile, AlertCircle,
  Image, Video, Mic, MicOff, Camera, Play, Pause, Download, Volume2,
  Upload, FileText, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import chatService from '../../services/chatService';
import { STORAGE_KEYS } from '@/utils/constants';

// Simple Enhanced Chat Service for Media
class EnhancedChatService {
  constructor(baseService) {
    this.baseService = baseService;
    this.socket = null;
    this.eventHandlers = new Map();
  }

  connect(token) {
    this.socket = this.baseService.connect(token);
    this.setupHandlers();
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.socket && this.socket.connected;
  }

  setupHandlers() {
    if (!this.socket) return;

    this.socket.on('newMessage', (data) => {
      const handler = this.eventHandlers.get('newMessage');
      if (handler) handler(data);
    });

    this.socket.on('messageDeleted', (data) => {
      const handler = this.eventHandlers.get('messageDeleted');
      if (handler) handler(data);
    });
  }

  // Simple file validation
  validateFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'File too large (max 50MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'File type not supported' };
    }

    return { isValid: true };
  }

  // Upload file
  async uploadFile(file, conversationId) {
    return new Promise((resolve, reject) => {
      // Check if socket exists and is connected
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected. Please wait for connection.'));
        return;
      }

      console.log('Socket status:', {
        exists: !!this.socket,
        connected: this.socket?.connected,
        id: this.socket?.id
      });

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const fileBuffer = Array.from(new Uint8Array(arrayBuffer));

        console.log('Emitting uploadMedia with:', {
          fileName: file.name,
          mimeType: file.type,
          conversationId,
          bufferSize: fileBuffer.length
        });

        this.socket.emit('uploadMedia', {
          fileBuffer,
          fileName: file.name,
          mimeType: file.type,
          conversationId
        }, (response) => {
          console.log('Upload response:', response);
          if (response && response.status === 'success') {
            resolve(response.media);
          } else {
            reject(new Error(response?.message || 'Upload failed'));
          }
        });
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Send media message
  async sendMediaMessage(conversationId, file, caption = null, productId = null) {
    try {
      // Check connection first
      if (!this.socket || !this.socket.connected) {
        throw new Error('Not connected to chat service');
      }

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      console.log('Sending media message for file:', file.name);

      // Upload file first
      const mediaData = await this.uploadFile(file, conversationId);

      console.log('File uploaded, sending message with mediaData:', mediaData);

      // Then send the media message
      return new Promise((resolve, reject) => {
        this.socket.emit('sendMediaMessage', {
          conversationId,
          mediaData,
          caption,
          productId
        }, (response) => {
          console.log('Send media message response:', response);
          if (response && response.status === 'success') {
            resolve(response.message);
          } else {
            reject(new Error(response?.message || 'Failed to send message'));
          }
        });
      });
    } catch (error) {
      console.error('Send media message error:', error);
      throw error;
    }
  }

  // Delete message
  async deleteMessage(messageId) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('deleteMediaMessage', {
        messageId
      }, (response) => {
        if (response.status === 'success') {
          resolve();
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  // Event listeners
  onNewMessage(callback) { 
    this.eventHandlers.set('newMessage', callback); 
  }
  
  onMessageDeleted(callback) { 
    this.eventHandlers.set('messageDeleted', callback); 
  }

  // Cleanup
  cleanup() {
    if (this.socket) {
      this.socket.off('newMessage');
      this.socket.off('messageDeleted');
    }
    this.eventHandlers.clear();
  }
}

// Simple Media Message Component
const MediaMessage = ({ message, isOwnMessage, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message._id);
    }
    setShowDeleteConfirm(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get media info from message
  const mediaUrl = message.media?.url;
  const fileName = message.media?.originalName || message.media?.fileName;
  const fileSize = message.media?.size;
  const mediaType = message.media?.mediaType;

  if (!mediaUrl) return null;

  return (
    <div className="relative group">
      {mediaType === 'image' ? (
        <div className="max-w-xs relative">
          <img
            src={mediaUrl}
            alt={fileName}
            className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(mediaUrl, '_blank')}
          />
          {isOwnMessage && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {fileName} {fileSize && `(${formatFileSize(fileSize)})`}
          </div>
          {message.content && message.content !== `Sent a ${mediaType}` && (
            <p className="text-sm mt-2">{message.content}</p>
          )}
        </div>
      ) : mediaType === 'video' ? (
        <div className="max-w-sm relative">
          <video
            src={mediaUrl}
            controls
            className="rounded-lg w-full"
            preload="metadata"
          />
          {isOwnMessage && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {fileName}
          </div>
          {message.content && message.content !== `Sent a ${mediaType}` && (
            <p className="text-sm mt-2">{message.content}</p>
          )}
        </div>
      ) : null}

      {/* Simple Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">حذف الرسالة</h3>
            <p className="text-gray-600 mb-4">هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Shop Chat Interface
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
  
  // Media states
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const enhancedChatService = useRef(new EnhancedChatService(chatService));
  const isInitializingRef = useRef(false);
  const cleanupFunctionsRef = useRef([]);

  // Clear all event listeners
  const clearEventListeners = useCallback(() => {
    cleanupFunctionsRef.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    cleanupFunctionsRef.current = [];
  }, []);

  // Setup message listeners
  const setupMessageListeners = useCallback(() => {
    if (!conversationId) return;

    console.log('Setting up message listeners for conversation:', conversationId);

    // Text message listeners
    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      if (message.conversation === conversationId) {
        setMessages(prev => [...prev, message]);
        setIsTyping(false);

        if (message.sender._id !== user._id) {
          chatService.markAsRead(message._id).catch(console.error);
        }
      }
    };

    const handleUserTyping = ({ userId, isTyping: typing }) => {
      if (userId !== user._id) {
        setIsTyping(typing);
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    // Set up listeners
    const unsubscribeNewMessage = chatService.onNewMessage(handleNewMessage);
    const unsubscribeUserTyping = chatService.onUserTyping(handleUserTyping);

    // Enhanced chat service listeners
    enhancedChatService.current.onNewMessage(handleNewMessage);
    enhancedChatService.current.onMessageDeleted(handleMessageDeleted);

    // Store cleanup functions
    const cleanup = () => {
      console.log('Cleaning up message listeners...');
      if (unsubscribeNewMessage) unsubscribeNewMessage();
      if (unsubscribeUserTyping) unsubscribeUserTyping();
      enhancedChatService.current.cleanup();
    };

    cleanupFunctionsRef.current.push(cleanup);
    return cleanup;
  }, [conversationId, user._id]);

  // Load messages
  const loadMessages = useCallback(async (convId) => {
    try {
      console.log('Loading messages for conversation:', convId);
      const messages = await chatService.getMessages(convId, 50, 0);
      setMessages(messages.reverse());
      console.log('Messages loaded successfully:', messages.length);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('فشل في تحميل الرسائل');
    }
  }, []);

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (isInitializingRef.current || !user || !shop || !product) {
      console.log('Cannot initialize chat: missing requirements or already initializing');
      return;
    }

    isInitializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      console.log('Initializing enhanced chat service...');
      
      // Clear any existing listeners
      clearEventListeners();

      // Connect using enhanced chat service
      if (!enhancedChatService.current.getConnectionStatus()) {
        console.log('Connecting to enhanced chat service...');
        await new Promise((resolve, reject) => {
          const socket = enhancedChatService.current.connect(token);
          const connectTimeout = setTimeout(() => {
            reject(new Error('انتهت مهلة الاتصال'));
          }, 10000);

          const onConnect = () => {
            clearTimeout(connectTimeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            console.log('Enhanced chat service connected successfully');
            setIsConnected(true);
            resolve();
          };

          const onConnectError = (error) => {
            clearTimeout(connectTimeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            console.error('Enhanced chat service connection error:', error);
            reject(new Error('فشل في الاتصال: ' + error.message));
          };

          if (socket.connected) {
            onConnect();
          } else {
            socket.on('connect', onConnect);
            socket.on('connect_error', onConnectError);
          }
        });
      } else {
        console.log('Enhanced chat service already connected');
        setIsConnected(true);
      }

      // Create conversation
      const shopOwnerId = shop.owner?._id || shop.owner || shop.ownerId;
      if (!shopOwnerId) {
        throw new Error('معرف صاحب المتجر غير متوفر');
      }

      console.log('Creating shop conversation...');
      const response = await chatService.createShopConversation(product._id, shopOwnerId);
      console.log('Conversation created:', response.conversationId);
      setConversationId(response.conversationId);

      console.log('Joining conversation...');
      await chatService.joinConversation(response.conversationId);

      console.log('Loading messages...');
      await loadMessages(response.conversationId);

      console.log('Setting up message listeners...');
      setupMessageListeners();

      console.log('Chat initialization completed successfully');

    } catch (error) {
      console.error('Error initializing chat:', error);
      setError(error.message || 'فشل في الاتصال بالدردشة');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }, [user, shop, product, setupMessageListeners, loadMessages, clearEventListeners]);

  // Cleanup chat
  const cleanupChat = useCallback(() => {
    console.log('Cleaning up chat...');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    clearEventListeners();
    isInitializingRef.current = false;
  }, [clearEventListeners]);

  // Simple file upload function
  const handleFileUpload = async (file) => {
    if (!conversationId || isUploading) return;

    // Check if enhanced chat service is connected
    if (!enhancedChatService.current.getConnectionStatus()) {
      setError('غير متصل بالخدمة. يرجى الانتظار للاتصال.');
      return;
    }

    // Validate file
    const validation = enhancedChatService.current.validateFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    // Get media type
    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

    console.log('Starting file upload for:', file.name, 'Type:', mediaType);

    // Add optimistic message
    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      messageType: 'media',
      media: {
        url: URL.createObjectURL(file),
        originalName: file.name,
        size: file.size,
        mediaType: mediaType
      },
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      conversation: conversationId,
      optimistic: true,
      content: `Sent a ${mediaType}`
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setIsUploading(true);
    setError(null); // Clear any previous errors

    try {
      console.log('Calling sendMediaMessage...');
      
      // Send media message
      const sentMessage = await enhancedChatService.current.sendMediaMessage(
        conversationId,
        file,
        `Sent a ${mediaType}`,
        product._id
      );

      console.log('Media message sent successfully:', sentMessage);

      // Replace optimistic message
      setMessages(prev =>
        prev.map(msg =>
          msg.optimistic && msg._id === optimisticMessage._id ? sentMessage : msg
        )
      );

      // Cleanup
      URL.revokeObjectURL(optimisticMessage.media.url);

    } catch (error) {
      console.error('Upload error:', error);
      setError('فشل في الرفع: ' + error.message);
      
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      URL.revokeObjectURL(optimisticMessage.media.url);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file select
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    await handleFileUpload(file);
    
    // Reset file input
    event.target.value = '';
    setShowMediaPicker(false);
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    try {
      await enhancedChatService.current.deleteMessage(messageId);
      // Message will be removed by the messageDeleted event
    } catch (error) {
      console.error('Delete error:', error);
      setError('فشل في حذف الرسالة');
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen && user && shop && product) {
      console.log('Chat opened, initializing...');
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

  // Regular text message methods
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (conversationId && isConnected) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      chatService.sendTypingIndicator(conversationId, true);

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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      chatService.sendTypingIndicator(conversationId, false);
    }

    try {
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

      const sentMessage = await chatService.sendMessage(conversationId, messageContent, product._id);

      setMessages(prev =>
        prev.map(msg =>
          msg.optimistic && msg.content === messageContent ? sentMessage : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('فشل في إرسال الرسالة');
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
    <TooltipProvider>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-2xl">
          {/* Chat Header */}
          <CardHeader className="flex-shrink-0 p-6 border-b bg-gradient-to-l from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white">
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
                    {isUploading && (
                      <span className="text-sm text-green-600 animate-pulse">جاري الرفع...</span>
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
                        const isMediaMessage = message.messageType === 'media';
                        
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
                                } ${message.optimistic ? 'opacity-70' : ''}`}
                              >
                                {isMediaMessage ? (
                                  <MediaMessage 
                                    message={message} 
                                    isOwnMessage={isOwnMessage}
                                    onDelete={handleDeleteMessage}
                                  />
                                ) : (
                                  <p className="text-sm leading-relaxed text-right">{message.content}</p>
                                )}
                                
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
              {/* Media Picker */}
              {showMediaPicker && (
                <div className="mb-3 p-3 bg-white rounded-xl border shadow-sm">
                  <div className="flex items-center justify-around">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            fileInputRef.current.setAttribute('accept', 'image/*');
                            fileInputRef.current.click();
                            setShowMediaPicker(false);
                          }}
                          className="flex-col gap-1 h-auto p-3 hover:bg-blue-50"
                          disabled={isUploading}
                        >
                          <Image className="w-6 h-6 text-blue-600" />
                          <span className="text-xs text-gray-600">صورة</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>إرسال صورة</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            fileInputRef.current.setAttribute('accept', 'video/*');
                            fileInputRef.current.click();
                            setShowMediaPicker(false);
                          }}
                          className="flex-col gap-1 h-auto p-3 hover:bg-purple-50"
                          disabled={isUploading}
                        >
                          <Video className="w-6 h-6 text-purple-600" />
                          <span className="text-xs text-gray-600">فيديو</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>إرسال فيديو</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3">
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected || isSending || isUploading}
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
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full p-3 pl-12 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-right"
                    rows="1"
                    style={{ minHeight: '44px' }}
                    disabled={!isConnected || isSending || isUploading}
                  />
                </div>

                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMediaPicker(!showMediaPicker)}
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full p-2"
                        disabled={isUploading}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>إرفاق ملف</TooltipContent>
                  </Tooltip>
                </div>
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
                  {isUploading && (
                    <span className="text-green-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      جاري الرفع...
                    </span>
                  )}
                </div>
                <span>اضغط Enter للإرسال • اضغط 📎 لإرفاق ملف</span>
              </div>
            </div>
          </CardContent>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </Card>
      </div>
    </TooltipProvider>
  );
};

// Usage Example Component
const ChatExample = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const sampleShop = {
    _id: 'shop123',
    name: 'متجر الذهب الملكي',
    owner: 'owner123',
    logoUrl: 'shop-logo.jpg'
  };
  
  const sampleUser = {
    _id: 'user123',
    name: 'أحمد محمد'
  };
  
  const sampleProduct = {
    _id: 'product123',
    name: 'خاتم ذهبي',
    shop: sampleShop
  };

  return (
    <div>
      <Button onClick={() => setIsChatOpen(true)}>
        فتح الدردشة
      </Button>
      
      <ShopChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        shop={sampleShop}
        user={sampleUser}
        product={sampleProduct}
      />
    </div>
  );
};

export { ShopChatInterface, EnhancedChatService };
export default ShopChatInterface;