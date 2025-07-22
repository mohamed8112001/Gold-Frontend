import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Button } from './button.jsx';
import { X } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ShopChat = ({ isOpen, onClose, shopId, shopOwnerId, productId, user, token, shopName, shopAvatar }) => {
  const [socket, setSocket] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(true);
  const messagesEndRef = useRef(null);

  // Connect to socket
  useEffect(() => {
    if (!isOpen || !token) return;
    setConnecting(true);
    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` }
    });
    setSocket(s);
    setLoading(true);
    return () => s.disconnect();
  }, [isOpen, token]);

  // Create or join conversation
  useEffect(() => {
    if (!socket || !shopOwnerId || !productId) return;
    socket.emit('createConversation', { productId, participantId: shopOwnerId }, (res) => {
      if (res.status === 'success') {
        setConversationId(res.conversationId);
        socket.emit('joinConversation', { conversationId: res.conversationId }, () => {});
      }
    });
  }, [socket, shopOwnerId, productId]);

  // Listen for messages
  useEffect(() => {
    if (!socket || !conversationId) return;
    setLoading(true);
    socket.emit('getMessages', { conversationId }, (res) => {
      if (res.status === 'success') setMessages(res.messages.reverse());
      setLoading(false);
      setConnecting(false);
    });
    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off('newMessage');
  }, [socket, conversationId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = () => {
    if (!input.trim() || !conversationId) return;
    socket.emit('sendMessage', { conversationId, content: input, productId }, (res) => {
      if (res.status === 'success') setInput('');
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 h-[540px] bg-white rounded-2xl  flex flex-col animate-in slide-in-from-bottom-8 duration-300 border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          {shopAvatar ? (
            <img src={shopAvatar} alt="Shop" className="w-10 h-10 rounded-full border-2 border-white " />
          ) : (
            <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-xl font-bold text-yellow-700 ">🏪</div>
          )}
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg leading-tight">{shopName || 'Chat with Store'}</span>
            <span className="text-xs text-yellow-100 font-normal">Online</span>
          </div>
        </div>
        <button onClick={onClose} className="text-white hover:text-yellow-200 p-1 rounded-full focus:outline-none">
          <X className="w-6 h-6" />
        </button>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50/60 to-white/90">
        {connecting && (
          <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">Connecting...</div>
        )}
        {!connecting && loading && (
          <div className="flex items-center justify-center h-full text-gray-400 animate-pulse">Loading messages...</div>
        )}
        {!connecting && !loading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">No messages yet. Say hello to the shop!</div>
        )}
        {!connecting && !loading && messages.length > 0 && (
          <div className="flex flex-col gap-2">
            {messages.map((msg) => {
              const isUser = msg.sender._id === user.id || msg.sender._id === user._id;
              return (
                <div key={msg._id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl  text-base ${isUser ? 'bg-yellow-100 text-right rounded-br-md' : 'bg-white border border-gray-200 text-left rounded-bl-md'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${isUser ? 'text-yellow-700' : 'text-gray-700'}`}>{isUser ? 'You' : (msg.sender.name || 'Shop')}</span>
                      <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                    </div>
                    <div className="whitespace-pre-line break-words text-gray-900">{msg.content}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      {/* Input */}
      <div className="p-4 border-t bg-white flex gap-2 items-center rounded-b-2xl">
        <input
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-gray-50"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          disabled={connecting || loading}
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || connecting || loading}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 rounded-xl h-12 transition-all duration-200 disabled:opacity-50  hover: font-semibold"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ShopChat; 