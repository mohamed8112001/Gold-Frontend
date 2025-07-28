// Enhanced Chat Interface with Media Support - FIXED
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

// Enhanced Chat Service for Media
class EnhancedChatService {
  constructor(baseService) {
    this.baseService = baseService;
    this.socket = null;
    this.mediaRecorder = null;
    this.recordingChunks = [];
    this.currentRecording = null;
    this.eventHandlers = new Map();
  }

  // Initialize enhanced socket connection
  connect(token) {
    this.socket = this.baseService.connect(token);
    this.setupMediaHandlers();
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.baseService.getConnectionStatus();
  }

  setupMediaHandlers() {
    if (!this.socket) return;

    // Clear existing handlers
    this.clearMediaHandlers();

    // Media message handlers
    this.socket.on('newMediaMessage', (data) => {
      const handler = this.eventHandlers.get('newMediaMessage');
      if (handler) handler(data.message);
    });

    this.socket.on('mediaMessageSent', (data) => {
      const handler = this.eventHandlers.get('mediaMessageSent');
      if (handler) handler(data);
    });

    this.socket.on('uploadComplete', (data) => {
      const handler = this.eventHandlers.get('uploadComplete');
      if (handler) handler(data);
    });

    this.socket.on('voiceRecordingStarted', (data) => {
      const handler = this.eventHandlers.get('voiceRecordingStarted');
      if (handler) handler(data);
    });

    this.socket.on('voiceRecordingCompleted', (data) => {
      const handler = this.eventHandlers.get('voiceRecordingCompleted');
      if (handler) handler(data);
    });

    this.socket.on('liveVoiceChunk', (data) => {
      const handler = this.eventHandlers.get('liveVoiceChunk');
      if (handler) handler(data);
    });
  }

  clearMediaHandlers() {
    if (this.socket) {
      this.socket.off('newMediaMessage');
      this.socket.off('mediaMessageSent');
      this.socket.off('uploadComplete');
      this.socket.off('voiceRecordingStarted');
      this.socket.off('voiceRecordingCompleted');
      this.socket.off('liveVoiceChunk');
    }
  }

  // Send media message
  async sendMediaMessage(conversationId, receiverId, type, fileData, fileName, mimeType, fileSize, tempId) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('sendMediaMessage', {
        conversationId,
        receiverId,
        type,
        fileData,
        fileName,
        mimeType,
        fileSize,
        tempId
      }, (response) => {
        if (response.status === 'success') {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  // Upload large file in chunks
  async uploadLargeFile(file, conversationId, receiverId, type, onProgress) {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = `upload_${Date.now()}`;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      const base64Chunk = await this.fileToBase64(chunk);

      await new Promise((resolve, reject) => {
        this.socket.emit('uploadChunk', {
          uploadId,
          chunkIndex: i,
          totalChunks,
          chunk: base64Chunk,
          fileName: file.name,
          mimeType: file.type,
          conversationId,
          receiverId,
          type
        }, (response) => {
          if (response.status === 'success') {
            onProgress && onProgress(response.chunksReceived, totalChunks);
            resolve();
          } else {
            reject(new Error(response.message));
          }
        });
      });
    }

    return uploadId;
  }

  // Voice recording methods
  async startVoiceRecording(conversationId, receiverId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      this.recordingChunks = [];

      return new Promise((resolve, reject) => {
        this.socket.emit('startVoiceRecording', {
          conversationId,
          receiverId
        }, (response) => {
          if (response.status === 'success') {
            this.currentRecording = response.recordingId;
            
            this.mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                this.recordingChunks.push(event.data);
                
                // Send real-time chunk
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result.split(',')[1];
                  this.socket.emit('voiceChunk', {
                    recordingId: this.currentRecording,
                    chunk: base64,
                    conversationId,
                    receiverId
                  });
                };
                reader.readAsDataURL(event.data);
              }
            };

            this.mediaRecorder.start(100); // Send chunks every 100ms
            resolve(response.recordingId);
          } else {
            reject(new Error(response.message));
          }
        });
      });
    } catch (error) {
      throw new Error('Microphone access denied');
    }
  }

  stopVoiceRecording(conversationId, receiverId) {
    return new Promise((resolve, reject) => {
      if (this.mediaRecorder && this.currentRecording) {
        this.mediaRecorder.stop();
        
        this.mediaRecorder.onstop = () => {
          this.socket.emit('finishVoiceRecording', {
            recordingId: this.currentRecording,
            conversationId,
            receiverId
          }, (response) => {
            if (response.status === 'success') {
              resolve(response.message);
            } else {
              reject(new Error(response.message));
            }
            this.currentRecording = null;
          });
        };
      } else {
        reject(new Error('No active recording'));
      }
    });
  }

  // Utility methods
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Event listeners
  onNewMediaMessage(callback) { 
    this.eventHandlers.set('newMediaMessage', callback); 
  }
  onMediaMessageSent(callback) { 
    this.eventHandlers.set('mediaMessageSent', callback); 
  }
  onUploadComplete(callback) { 
    this.eventHandlers.set('uploadComplete', callback); 
  }
  onVoiceRecordingStarted(callback) { 
    this.eventHandlers.set('voiceRecordingStarted', callback); 
  }
  onVoiceRecordingCompleted(callback) { 
    this.eventHandlers.set('voiceRecordingCompleted', callback); 
  }
  onLiveVoiceChunk(callback) { 
    this.eventHandlers.set('liveVoiceChunk', callback); 
  }

  // Cleanup
  cleanup() {
    this.clearMediaHandlers();
    this.eventHandlers.clear();
  }
}

// Media Message Component
const MediaMessage = ({ message, isOwnMessage, onPlaybackUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRef = useRef(null);

  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
      
      // Notify other users about playback status
      onPlaybackUpdate && onPlaybackUpdate(message._id, isPlaying ? 'paused' : 'playing', currentTime);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      onPlaybackUpdate && onPlaybackUpdate(message._id, 'playing', mediaRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMedia = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="max-w-xs">
            <img
              src={message.mediaUrl}
              alt={message.mediaMetadata?.fileName}
              className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.mediaUrl, '_blank')}
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {message.mediaMetadata?.fileName} ({formatFileSize(message.mediaMetadata?.fileSize)})
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 min-w-[250px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="p-2 rounded-full hover:bg-blue-100"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="text-xs text-gray-600">
                {message.mediaMetadata?.fileName}
              </div>
            </div>

            <audio
              ref={mediaRef}
              src={message.mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
          </div>
        );

      case 'video':
        return (
          <div className="max-w-sm">
            <video
              ref={mediaRef}
              src={message.mediaUrl}
              poster={message.thumbnailUrl}
              controls
              className="rounded-lg w-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.mediaMetadata?.fileName}
              {message.mediaMetadata?.duration && ` (${formatTime(message.mediaMetadata.duration)})`}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return renderMedia();
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [remoteRecording, setRemoteRecording] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const enhancedChatService = useRef(new EnhancedChatService(chatService));
  const recordingTimerRef = useRef(null);
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

    // Media message listeners
    const handleNewMediaMessage = (message) => {
      console.log('New media message received:', message);
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleMediaMessageSent = (data) => {
      console.log('Media message sent confirmation:', data);
      setMessages(prev =>
        prev.map(msg =>
          msg.tempId === data.tempId ? data.message : msg
        )
      );
    };

    const handleVoiceRecordingStarted = (data) => {
      if (data.senderId !== user._id) {
        setRemoteRecording(data.senderName);
      }
    };

    const handleVoiceRecordingCompleted = (data) => {
      if (data.message.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
      setRemoteRecording(null);
    };

    const handleUploadComplete = (data) => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[data.uploadId];
        return newProgress;
      });
      
      if (data.message.conversationId === conversationId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    // Set up listeners
    const unsubscribeNewMessage = chatService.onNewMessage(handleNewMessage);
    const unsubscribeUserTyping = chatService.onUserTyping(handleUserTyping);

    // Enhanced chat service listeners
    enhancedChatService.current.onNewMediaMessage(handleNewMediaMessage);
    enhancedChatService.current.onMediaMessageSent(handleMediaMessageSent);
    enhancedChatService.current.onVoiceRecordingStarted(handleVoiceRecordingStarted);
    enhancedChatService.current.onVoiceRecordingCompleted(handleVoiceRecordingCompleted);
    enhancedChatService.current.onUploadComplete(handleUploadComplete);

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
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    clearEventListeners();
    isInitializingRef.current = false;
  }, [clearEventListeners]);

  // Effects
  useEffect(() => {
    if (isOpen && user && shop && product) {
      console.log('Chat opened, initializing...');
      initializeChat();
    }

    return () => {
      cleanupChat();
    };
  }, [isOpen, user, shop, product]); // Only depend on the essential props

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Media handling methods
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file || !conversationId) return;

    const fileType = file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' :
                    file.type.startsWith('audio/') ? 'audio' : null;

    if (!fileType) {
      setError('نوع الملف غير مدعوم');
      return;
    }

    try {
      if (file.size > 50 * 1024 * 1024) { // >50MB, use chunked upload
        await handleLargeFileUpload(file, fileType);
      } else {
        await handleRegularFileUpload(file, fileType);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setError('فشل في رفع الملف');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleRegularFileUpload = async (file, fileType) => {
    const tempId = `temp_${Date.now()}`;
    const receiverId = shop.owner?._id || shop.owner || shop.ownerId;

    // Add optimistic message
    const optimisticMessage = {
      _id: tempId,
      tempId,
      type: fileType,
      mediaUrl: URL.createObjectURL(file),
      mediaMetadata: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      },
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      conversation: conversationId,
      optimistic: true
    };

    setMessages(prev => [...prev, optimisticMessage]);

    // Upload file
    const base64 = await enhancedChatService.current.fileToBase64(file);
    await enhancedChatService.current.sendMediaMessage(
      conversationId,
      receiverId,
      fileType,
      base64,
      file.name,
      file.type,
      file.size,
      tempId
    );
  };

  const handleLargeFileUpload = async (file, fileType) => {
    const uploadId = `upload_${Date.now()}`;
    const receiverId = shop.owner?._id || shop.owner || shop.ownerId;

    setUploadProgress(prev => ({
      ...prev,
      [uploadId]: { current: 0, total: Math.ceil(file.size / (1024 * 1024)), fileName: file.name }
    }));

    await enhancedChatService.current.uploadLargeFile(
      file,
      conversationId,
      receiverId,
      fileType,
      (current, total) => {
        setUploadProgress(prev => ({
          ...prev,
          [uploadId]: { current, total, fileName: file.name }
        }));
      }
    );
  };

  const startVoiceRecording = async () => {
    try {
      const receiverId = shop.owner?._id || shop.owner || shop.ownerId;
      await enhancedChatService.current.startVoiceRecording(conversationId, receiverId);
      
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Voice recording error:', error);
      setError('فشل في تسجيل الصوت');
    }
  };

  const stopVoiceRecording = async () => {
    try {
      const receiverId = shop.owner?._id || shop.owner || shop.ownerId;
      await enhancedChatService.current.stopVoiceRecording(conversationId, receiverId);
      
      setIsRecording(false);
      setRecordingDuration(0);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
    } catch (error) {
      console.error('Stop recording error:', error);
      setError('فشل في إيقاف التسجيل');
    }
  };

  const handlePlaybackUpdate = (messageId, status, currentTime) => {
    // You can implement playback synchronization here
    console.log('Playback update:', { messageId, status, currentTime });
  };

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

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                    {remoteRecording && (
                      <span className="text-sm text-red-600 animate-pulse flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        {remoteRecording} يسجل...
                      </span>
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

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(uploadProgress).map(([uploadId, progress]) => (
                  <div key={uploadId} className="bg-white/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        جاري رفع: {progress.fileName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {progress.current}/{progress.total}
                      </span>
                    </div>
                    <Progress value={(progress.current / progress.total) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            )}
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
                        const isMediaMessage = ['image', 'audio', 'video'].includes(message.type);
                        
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
                                    onPlaybackUpdate={handlePlaybackUpdate}
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

            {/* Voice Recording Indicator */}
            {isRecording && (
              <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                <div className="flex items-center justify-center gap-3 text-red-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">جاري التسجيل... {formatDuration(recordingDuration)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={stopVoiceRecording}
                    className="text-red-600 hover:text-red-700 rounded-full p-2"
                  >
                    <MicOff className="w-4 h-4" />
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
                        >
                          <Video className="w-6 h-6 text-purple-600" />
                          <span className="text-xs text-gray-600">فيديو</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>إرسال فيديو</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            fileInputRef.current.setAttribute('accept', 'audio/*');
                            fileInputRef.current.click();
                            setShowMediaPicker(false);
                          }}
                          className="flex-col gap-1 h-auto p-3 hover:bg-green-50"
                        >
                          <Volume2 className="w-6 h-6 text-green-600" />
                          <span className="text-xs text-gray-600">ملف صوتي</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>إرسال ملف صوتي</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onMouseDown={startVoiceRecording}
                          onMouseUp={stopVoiceRecording}
                          onMouseLeave={stopVoiceRecording}
                          className="flex-col gap-1 h-auto p-3 hover:bg-red-50"
                          disabled={isRecording}
                        >
                          <Mic className={`w-6 h-6 ${isRecording ? 'text-red-500' : 'text-red-600'}`} />
                          <span className="text-xs text-gray-600">
                            {isRecording ? 'جاري التسجيل' : 'رسالة صوتية'}
                          </span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>اضغط واستمر للتسجيل</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}

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
                    placeholder="اكتب رسالتك هنا..."
                    className="w-full p-3 pl-12 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 text-right"
                    rows="1"
                    style={{ minHeight: '44px' }}
                    disabled={!isConnected || isSending || isRecording}
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
                        disabled={isRecording}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>إرفاق ملف</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onMouseDown={startVoiceRecording}
                        onMouseUp={stopVoiceRecording}
                        onMouseLeave={stopVoiceRecording}
                        className={`rounded-full p-2 ${
                          isRecording 
                            ? 'text-red-500 hover:text-red-600 bg-red-50' 
                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        disabled={!isConnected}
                      >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isRecording ? 'إيقاف التسجيل' : 'اضغط واستمر للتسجيل'}
                    </TooltipContent>
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
                  {isRecording && (
                    <span className="text-red-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      تسجيل الصوت: {formatDuration(recordingDuration)}
                    </span>
                  )}
                </div>
                <span>اضغط Enter للإرسال • اضغط واستمر على 🎤 للتسجيل</span>
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

// Enhanced Chat Service Configuration
const enhancedChatServiceConfig = {
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
    audio: 50 * 1024 * 1024 // 50MB
  },
  
  supportedFormats: {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4']
  },
  
  chunkSize: 1024 * 1024, // 1MB chunks for large files
  maxRecordingDuration: 300 // 5 minutes max recording
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

export { ShopChatInterface, EnhancedChatService, enhancedChatServiceConfig };
export default ShopChatInterface;