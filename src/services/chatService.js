import { STORAGE_KEYS } from '@/utils/constants';
import { io } from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.currentToken = null;
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.currentToken = token;

    try {
      // Your backend checks for token in multiple places:
      // 1. req.headers.authorization (Bearer token)
      // 2. req._query.token (query parameter)  
      // 3. req.cookies.jwt (cookie)
      this.socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
        // Send token in headers (for websocket handshake)
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${token}`,
              'X-Auth-Token': token
            }
          },
          websocket: {
            extraHeaders: {
              Authorization: `Bearer ${token}`,
              'X-Auth-Token': token
            }
          }
        },
        // Send token in query (this is what your backend primarily checks)
        query: {
          token: token
        },
        // Additional headers for the initial connection
        extraHeaders: {
          Authorization: `Bearer ${token}`,
          'X-Auth-Token': token
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        forceNew: true,
        upgrade: true,
        rememberUpgrade: true
      });

      this.setupEventListeners();
      return this.socket;
    } catch (error) {
      console.error('Error connecting to chat service:', error);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Chat service connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Chat service disconnected:', reason);
      this.isConnected = false;
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      // تقليل الرسائل المزعجة في console
      if (this.reconnectAttempts === 0) {
        console.warn('Chat service connection error (will retry silently):', error.message);
      }
      this.isConnected = false;
      this.reconnectAttempts++;

      // If authentication error, try to refresh token
      if (error.message.includes('Authentication') || error.message.includes('No token')) {
        this.handleAuthenticationError();
      }
    });

    // Handle new access token from server
    this.socket.on('newAccessToken', (newToken) => {
      console.log('Received new access token from server');
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      this.currentToken = newToken;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Chat service reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Chat service failed to reconnect after maximum attempts');
      this.isConnected = false;
    });

    // Handle server errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  handleAuthenticationError() {
    console.log('Handling authentication error...');
    
    // Try to get fresh token from localStorage
    const freshToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (freshToken && freshToken !== this.currentToken) {
      console.log('Found fresh token, reconnecting...');
      this.reconnectWithNewToken(freshToken);
    } else {
      console.log('No fresh token available');
      // Could emit an event here to notify the app that user needs to re-login
      this.emit('authenticationFailed');
    }
  }

  reconnectWithNewToken(newToken) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    setTimeout(() => {
      this.connect(newToken);
    }, 1000);
  }

  reconnect() {
    if (this.currentToken) {
      this.connect(this.currentToken);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Shop-specific methods
  createShopConversation(productId, participantId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Chat service not connected'));
        return;
      }

      this.socket.emit('createConversation', { productId, participantId}, (response) => {
        if (response.status === 'success') {
          resolve(response);
        } else {
          reject(new Error(response.message || 'Failed to create shop conversation'));
        }
      });
    });
  }

  getShopConversations(shopId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Chat service not connected'));
        return;
      }

      this.socket.emit('getShopConversations', { shopId }, (response) => {
        if (response.status === 'success') {
          resolve(response.conversations);
        } else {
          reject(new Error(response.message || 'Failed to get shop conversations'));
        }
      });
    });
  }

  joinConversation(conversationId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Chat service not connected'));
        return;
      }

      this.socket.emit('joinConversation', { conversationId }, (response) => {
        if (response.status === 'success') {
          resolve(response.conversation);
        } else {
          reject(new Error(response.message || 'Failed to join conversation'));
        }
      });
    });
  }

  getMessages(conversationId, limit = 50, skip = 0) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Chat service not connected'));
        return;
      }

      this.socket.emit('getMessages', { conversationId, limit, skip }, (response) => {
        if (response.status === 'success') {
          resolve(response.messages);
        } else {
          reject(new Error(response.message || 'Failed to get messages'));
        }
      });
    });
  }

  sendMessage(conversationId, content, productId = null) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Chat service not connected'));
        return;
      }

      this.socket.emit('sendMessage', { conversationId, content, productId }, (response) => {
        if (response.status === 'success') {
          resolve(response.message);
        } else {
          reject(new Error(response.message || 'Failed to send message'));
        }
      });
    });
  }

  markAsRead(messageId) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Chat service not connected'));
        return;
      }

      this.socket.emit('markAsRead', { messageId }, (response) => {
        if (response.status === 'success') {
          resolve();
        } else {
          reject(new Error(response.message || 'Failed to mark message as read'));
        }
      });
    });
  }

  // Typing indicator
  sendTypingIndicator(conversationId, isTyping = true) {
    if (this.socket && this.isConnected) {
      this.socket.emit('userTyping', { conversationId, isTyping });
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onNewShopConversation(callback) {
    if (this.socket) {
      this.socket.on('newShopConversation', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('messageRead', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onAuthenticationFailed(callback) {
    if (this.socket) {
      this.socket.on('authenticationFailed', callback);
    }
  }

  // Remove event listeners
  offNewMessage(callback) {
    if (this.socket) {
      this.socket.off('newMessage', callback);
    }
  }

  offNewShopConversation(callback) {
    if (this.socket) {
      this.socket.off('newShopConversation', callback);
    }
  }

  offMessageRead(callback) {
    if (this.socket) {
      this.socket.off('messageRead', callback);
    }
  }

  offUserTyping(callback) {
    if (this.socket) {
      this.socket.off('userTyping', callback);
    }
  }

  // Custom event emitter for internal events
  emit(event, data) {
    console.log(`ChatService internal event: ${event}`, data);
    // You can implement a simple event emitter here if needed
  }

  // Utility methods
  getConnectionStatus() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }

  getCurrentToken() {
    return this.currentToken;
  }

  // Health check
  ping() {
    return new Promise((resolve) => {
      if (!this.socket || !this.isConnected) {
        resolve(false);
        return;
      }

      this.socket.emit('ping', (response) => {
        resolve(true);
      });

      // Timeout after 5 seconds
      setTimeout(() => resolve(false), 5000);
    });
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService;