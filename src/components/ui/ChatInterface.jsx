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
    <div className="fixed bottom-24 right-6 z-40 w-96 h-[500px] animate-in slide-in-from-bottom-8 duration-300">
      <Card className="w-full h-full shadow-2xl border-0 bg-white/98 backdrop-blur-lg overflow-hidden rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 to-yellow-700/30"></div>
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
          <CardTitle className="text-lg font-bold flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/25 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white">المساعد الذكي</span>
              <span className="text-xs text-yellow-100 font-normal">متاح الآن</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <div className="text-xs text-yellow-100">متصل</div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/30 to-white/50">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4 min-h-full">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                  >
                    <div
                      className={`
                      max-w-[85%] p-4 rounded-2xl text-sm shadow-lg backdrop-blur-sm transition-all duration-200 hover:shadow-xl
                      ${message.sender === 'user'
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-br-md shadow-yellow-200/50 border border-yellow-400/20'
                          : 'bg-white/95 text-gray-800 rounded-bl-md border border-gray-100/50 shadow-gray-200/50'
                        }
                    `}
                    >
                      <div className="flex items-start gap-3">
                        {message.sender === 'bot' && (
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg border-2 border-white/30">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg border-2 border-white/50">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="leading-relaxed break-words text-base font-medium">{message.text}</p>
                          <p className={`text-xs mt-2 font-medium ${message.sender === 'user' ? 'text-yellow-100/80' : 'text-gray-500'
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
                    <div className="bg-white/95 text-gray-800 p-4 rounded-2xl rounded-bl-md max-w-[85%] shadow-lg border border-gray-100/50 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce shadow-sm"></div>
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">يكتب...</span>
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
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  يرجى تسجيل الدخول لاستخدام المساعد الذكي
                </p>
                <Button
                  onClick={() => navigate('/auth/login')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white w-full rounded-xl h-12 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  تسجيل الدخول
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 text-right border-gray-200 focus:border-yellow-400 focus:ring-yellow-400 rounded-xl bg-white/90 backdrop-blur-sm h-12 px-4 font-medium shadow-sm"
                  disabled={isLoading}
                  dir="rtl"
                />
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 rounded-xl h-12 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default ChatInterface;