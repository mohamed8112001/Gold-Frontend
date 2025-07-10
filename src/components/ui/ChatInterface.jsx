import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, LogIn } from 'lucide-react';
import { Button } from './button.jsx';
import { Input } from './input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from './card.jsx';
import { ScrollArea } from './scroll-area.jsx';
import { chatbotService } from '../../services/chatbotService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ChatInterface = ({ isOpen }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      const loginMessage = {
        id: Date.now() + 1,
        text: 'يرجى تسجيل الدخول أولاً لاستخدام المساعد الذكي.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, loginMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);

      const errorMessage = {
        id: Date.now() + 1,
        text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى لاحقاً.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 w-80 h-96 animate-in slide-in-from-bottom-8 duration-300">
      <Card className="w-full h-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-4 rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 to-yellow-700/20"></div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            المساعد الذكي
            <div className="ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-gray-50/50 to-white">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`
                      max-w-[85%] p-3 rounded-xl text-sm shadow-sm
                      ${message.sender === 'user'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === 'bot' && (
                        <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {message.sender === 'user' && (
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="leading-relaxed break-words">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-yellow-100' : 'text-gray-400'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                  <div className="bg-white text-gray-800 p-3 rounded-xl rounded-bl-sm max-w-[85%] shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">يكتب...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  يرجى تسجيل الدخول لاستخدام المساعد الذكي
                </p>
                <Button
                  onClick={() => navigate('/auth/login')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white w-full rounded-lg h-10 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  تسجيل الدخول
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 text-right border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-lg bg-white/80 backdrop-blur-sm"
                  disabled={isLoading}
                  dir="rtl"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 rounded-lg h-10 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;