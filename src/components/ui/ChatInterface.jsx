import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, LogIn, X, Minimize2, Maximize2, MessageCircle, Sparkles, Shield, Clock } from 'lucide-react';
import { Button } from './button.jsx';
import { Input } from './input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './card.jsx';
import { ScrollArea } from './scroll-area.jsx';
import { chatbotService } from '../../services/chatbotService.js';
import chatService from '../../services/chatService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ChatInterface = ({ isOpen, conversation, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);

  // State for chatbot mode
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: isAuthenticated
        ? `مرحباً ${user?.name || 'عزيزي المستخدم'}! أنا مساعدك الذكي في منصة الذهب الرقمية. كيف يمكنني مساعدتك اليوم؟`
        : 'مرحباً! لاستخدام المساعد الذكي، يرجى تسجيل الدخول أولاً.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // State for real chat mode
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatTyping, setChatTyping] = useState(false);

  // Enhanced UI states
  const [messageCount, setMessageCount] = useState(0);
  const [isUserTyping, setIsUserTyping] = useState(false);

  // Typing indicator for user
  useEffect(() => {
    if (inputMessage.trim() || chatInput.trim()) {
      setIsUserTyping(true);
      const timer = setTimeout(() => setIsUserTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsUserTyping(false);
    }
  }, [inputMessage, chatInput]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMessages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Load conversation messages if conversation is provided
  useEffect(() => {
    if (conversation && isOpen) {
      loadChatMessages();
      setupChatListeners();
    }
    return () => {
      cleanupChatListeners();
    };
    // eslint-disable-next-line
  }, [conversation, isOpen]);

  const loadChatMessages = async () => {
    if (!conversation) return;
    setChatLoading(true);
    try {
      const msgs = await chatService.getMessages(conversation._id, 50, 0);
      setChatMessages(msgs.reverse());
    } catch (err) {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const setupChatListeners = () => {
    chatService.onNewMessage(handleNewChatMessage);
    chatService.onUserTyping(handleUserTyping);
  };
  
  const cleanupChatListeners = () => {
    chatService.offNewMessage(handleNewChatMessage);
    chatService.offUserTyping(handleUserTyping);
  };
  
  const handleNewChatMessage = (msg) => {
    if (msg.conversation === conversation._id) {
      setChatMessages((prev) => [...prev, msg]);
      setChatTyping(false);
      setMessageCount(prev => prev + 1);
      // Mark as read if not from current user
      if (msg.sender._id !== user._id) {
        chatService.markAsRead(msg._id).catch(() => {});
      }
    }
  };
  
  const handleUserTyping = ({ userId, isTyping }) => {
    if (userId !== user._id) {
      setChatTyping(isTyping);
    }
  };

  // Send message in real chat
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    setChatLoading(true);
    
    const optimisticMsg = {
      _id: Date.now() + Math.random(),
      content: chatInput.trim(),
      sender: { _id: user._id, name: user.name },
      createdAt: new Date().toISOString(),
      conversation: conversation._id,
      read: false,
      optimistic: true
    };
    
    setChatMessages((prev) => [...prev, optimisticMsg]);
    setMessageCount(prev => prev + 1);
    const toSend = chatInput.trim();
    setChatInput('');
    
    try {
      const sent = await chatService.sendMessage(conversation._id, toSend);
      setChatMessages((prev) => prev.map((msg) => (msg.optimistic && msg.content === toSend ? sent : msg)));
    } catch (err) {
      setChatMessages((prev) => prev.filter((msg) => !msg.optimistic));
      setChatInput(toSend);
      setMessageCount(prev => prev - 1);
    } finally {
      setChatLoading(false);
    }
  };

  // Send message in chatbot mode
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    
    if (!isAuthenticated) {
      const loginMessage = {
        id: Date.now() + 1,
        text: 'يرجى تسجيل الدخول أولاً لاستخدام المساعد الذكي.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, loginMessage]);
      return;
    }
    
    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setMessageCount(prev => prev + 1);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const response = await chatbotService.sendMessage(inputMessage.trim());
      const botMessage = {
        id: Date.now() + 1,
        text: response.response || 'عذراً، لم أتمكن من فهم طلبك. يرجى المحاولة مرة أخرى.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
      setMessageCount(prev => prev + 1);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
      setMessageCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (conversation) {
        handleSendChatMessage(e);
      } else {
        handleSendMessage(e);
      }
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-8 duration-300">
        <Card className="w-80 shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-yellow-700/30"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-white">
                  {conversation ? conversation.shop?.name || 'متجر' : 'المساعد الذكي'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-yellow-600 p-1" onClick={toggleMinimize}>
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-yellow-600 p-1" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Real chat mode
  if (conversation) {
    const shop = conversation.shop || {};
    return (
      <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] animate-in slide-in-from-bottom-8 duration-300">
        <Card className="w-full h-full shadow-2xl border-0 bg-white/98 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-yellow-200/50">
          <CardHeader className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-yellow-700/30"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden ring-2 ring-white/20">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 object-cover rounded-full" />
                ) : (
                  <Bot className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-lg">{shop.name || 'متجر'}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-yellow-100">متصل</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <MessageCircle className="w-3 h-3 text-yellow-100" />
                  <span className="text-xs text-yellow-100">دردشة المتجر</span>
                  {messageCount > 0 && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {messageCount} رسالة
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-white hover:bg-yellow-600 p-1" onClick={toggleMinimize}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-yellow-600 p-1" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(100%-96px)]">
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/30 to-white/50 relative">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4 min-h-full">
                  {chatLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-yellow-500" />
                      <p className="text-sm">جاري تحميل الرسائل...</p>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <MessageCircle className="w-12 h-12 mb-3 text-yellow-400" />
                      <p className="text-sm text-center">لا توجد رسائل بعد<br />ابدأ المحادثة الآن!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const isUser = msg.sender._id === user.id || msg.sender._id === user._id;
                      const isConsecutive = index > 0 && chatMessages[index - 1].sender._id === msg.sender._id;
                      
                      return (
                        <div 
                          key={msg._id} 
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                        >
                          <div className={`max-w-[85%] group ${isUser ? 'flex-row-reverse' : 'flex-row'} flex items-end gap-2`}>
                            {!isConsecutive && (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'} shadow-lg ring-2 ring-white/30`}>
                                {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                              </div>
                            )}
                            {isConsecutive && <div className="w-8" />}
                            
                            <div className={`p-3 rounded-2xl text-sm shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl group-hover:scale-[1.02] ${isUser ? `bg-gradient-to-r from-yellow-500 to-yellow-600 text-white ${isConsecutive ? 'rounded-br-md' : 'rounded-br-md'} shadow-yellow-200/50 ring-1 ring-yellow-400/20` : `bg-white/95 text-gray-800 ${isConsecutive ? 'rounded-bl-md' : 'rounded-bl-md'} ring-1 ring-gray-100/50 shadow-gray-200/50`}`}>
                              <p className="leading-relaxed break-words font-medium">{msg.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className={`text-xs font-medium ${isUser ? 'text-yellow-100/80' : 'text-gray-500'}`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                                {msg.optimistic && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-yellow-200" />
                                    <span className="text-xs text-yellow-200">جاري الإرسال</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {chatTyping && (
                    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <div className="bg-white/95 text-gray-800 p-3 rounded-2xl rounded-bl-md max-w-[85%] shadow-lg ring-1 ring-gray-100/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">يكتب...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            <div className="p-4 border-t border-gray-100/50 bg-white/95 backdrop-blur-lg">
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 text-right border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl bg-white/90 backdrop-blur-sm h-12 px-4 font-medium shadow-sm ring-1 ring-gray-100/50 focus:ring-2"
                  disabled={chatLoading}
                  dir="rtl"
                />
                <Button
                  onClick={handleSendChatMessage}
                  size="sm"
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 rounded-xl h-12 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl font-semibold ring-1 ring-yellow-400/20 hover:ring-yellow-400/40"
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default chatbot mode
  return (
    <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] animate-in slide-in-from-bottom-8 duration-300">
      <Card className="w-full h-full shadow-2xl border-0 bg-white/98 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-yellow-200/50">
        <CardHeader className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-yellow-700/30"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 ring-2 ring-white/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">المساعد الذكي</span>
                <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-yellow-100">متصل</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-yellow-100" />
                  <span className="text-xs text-yellow-100">آمن ومشفر</span>
                </div>
                {messageCount > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {messageCount} رسالة
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-white hover:bg-yellow-600 p-1" onClick={toggleMinimize}>
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-yellow-600 p-1" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-[calc(100%-96px)]">
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/30 to-white/50 relative">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4 min-h-full">
                {messages.map((message, index) => {
                  const isConsecutive = index > 0 && messages[index - 1].sender === message.sender;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                    >
                      <div className={`max-w-[85%] group ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} flex items-end gap-2`}>
                        {!isConsecutive && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-500'} shadow-lg ring-2 ring-white/30`}>
                            {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                          </div>
                        )}
                        {isConsecutive && <div className="w-8" />}
                        
                        <div className={`p-3 rounded-2xl text-sm shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl group-hover:scale-[1.02] ${message.sender === 'user' ? `bg-gradient-to-r from-yellow-500 to-yellow-600 text-white ${isConsecutive ? 'rounded-br-md' : 'rounded-br-md'} shadow-yellow-200/50 ring-1 ring-yellow-400/20` : `bg-white/95 text-gray-800 ${isConsecutive ? 'rounded-bl-md' : 'rounded-bl-md'} ring-1 ring-gray-100/50 shadow-gray-200/50`}`}>
                          <p className="leading-relaxed break-words font-medium">{message.text}</p>
                          <p className={`text-xs mt-2 font-medium ${message.sender === 'user' ? 'text-yellow-100/80' : 'text-gray-500'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <div className="bg-white/95 text-gray-800 p-3 rounded-2xl rounded-bl-md max-w-[85%] shadow-lg ring-1 ring-gray-100/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">يكتب...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          <div className="p-4 border-t border-gray-100/50 bg-white/95 backdrop-blur-lg">
            {!isAuthenticated ? (
              <div className="text-center">
                <div className="mb-4 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-bold text-yellow-800">مطلوب تسجيل الدخول</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    يرجى تسجيل الدخول للاستفادة من جميع ميزات المساعد الذكي
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/auth/login')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white w-full rounded-xl h-12 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold ring-1 ring-yellow-400/20 hover:ring-yellow-400/40"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  تسجيل الدخول
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {isUserTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span>أنت تكتب...</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 text-right border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl bg-white/90 backdrop-blur-sm h-12 px-4 font-medium shadow-sm ring-1 ring-gray-100/50 focus:ring-2 transition-all duration-200"
                    disabled={isLoading}
                    dir="rtl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 rounded-xl h-12 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl font-semibold ring-1 ring-yellow-400/20 hover:ring-yellow-400/40 hover:scale-105"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage('ما هي أسعار الذهب اليوم؟')}
                    className="text-xs bg-white/80 text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-yellow-300 rounded-full px-3 py-1 whitespace-nowrap transition-all duration-200"
                  >
                    أسعار الذهب
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage('كيف أشتري الذهب؟')}
                    className="text-xs bg-white/80 text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-yellow-300 rounded-full px-3 py-1 whitespace-nowrap transition-all duration-200"
                  >
                    كيفية الشراء
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage('ما هي أنواع الذهب المتوفرة؟')}
                    className="text-xs bg-white/80 text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-yellow-300 rounded-full px-3 py-1 whitespace-nowrap transition-all duration-200"
                  >
                    أنواع الذهب
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;