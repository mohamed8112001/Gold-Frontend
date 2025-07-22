import React, { useState, useEffect } from 'react';
import FloatingChatButton from './FloatingChatButton.jsx';
import ChatInterface from './ChatInterface.jsx';
import chatService from '../../services/chatService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const FloatingChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, isShopOwner, isRegularUser } = useAuth();

  // Fetch conversations on mount or when chat is closed
  useEffect(() => {
    if (isAuthenticated && !isChatOpen) {
      fetchConversations();
    }
    // eslint-disable-next-line
  }, [isAuthenticated, isChatOpen]);

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!chatService.getConnectionStatus()) {
      const token = localStorage.getItem('token');
      if (token) chatService.connect(token);
    }
    const handleNewMessage = (msg) => {
      fetchConversations();
      // Play sound and vibrate if chat is not open
      if (!isChatOpen) {
        // Play notification sound
        try {
          const audio = new window.Audio('/src/assets/notification.mp3');
          audio.play();
        } catch (e) {}
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    };
    chatService.onNewMessage(handleNewMessage);
    return () => {
      chatService.offNewMessage(handleNewMessage);
    };
  }, [isAuthenticated, isChatOpen]);

  const fetchConversations = async () => {
    try {
      let convs = [];
      if (isShopOwner) {
        // Seller: fetch all shop conversations
        convs = await chatService.getShopConversations();
      } else if (isRegularUser) {
        // Customer: fetch all their shop conversations
        convs = await chatService.getShopConversations();
      }
      // Sort by updatedAt descending
      convs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setConversations(convs);
      // Calculate unread count
      let totalUnread = 0;
      convs.forEach((conv) => {
        if (conv.unreadCount && user && conv.unreadCount[user._id || user.id]) {
          totalUnread += conv.unreadCount[user._id || user.id];
        }
      });
      setUnreadCount(totalUnread);
    } catch (err) {
      setConversations([]);
      setUnreadCount(0);
    }
  };

  const handleOpenChat = (conversation) => {
    setSelectedConversation(conversation);
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    fetchConversations();
  };

  // Show conversation list when chat is closed and user is authenticated
  const showConversationList = isAuthenticated && !isChatOpen && conversations.length > 0;

  return (
    <>
      <FloatingChatButton isOpen={isChatOpen} onClick={() => setIsChatOpen((open) => !open)} unreadCount={unreadCount} />
      {showConversationList && (
        <div className="fixed bottom-28 right-6 z-40 w-96 bg-white rounded-2xl  overflow-y-auto animate-in slide-in-from-bottom-8 duration-300 border border-yellow-100">
          <div className="p-4 border-b font-bold text-lg text-yellow-700">محادثاتك</div>
          <ul className="divide-y">
            {conversations.map((conv) => {
              const shop = conv.shop || {};
              const lastMsg = conv.lastMessage || {};
              const unread = conv.unreadCount && user && conv.unreadCount[user._id || user.id];
              return (
                <li key={conv._id} className="p-4 hover:bg-yellow-50 cursor-pointer flex items-center" onClick={() => handleOpenChat(conv)}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-3 overflow-hidden">
                    {shop.logoUrl ? (
                      <img src={shop.logoUrl} alt={shop.name} className="w-12 h-12 object-cover rounded-full" />
                    ) : (
                      <span className="text-yellow-700 font-bold text-xl">{shop.name?.charAt(0) || 'م'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">{shop.name || 'متجر'}</div>
                    <div className="text-sm text-gray-500 truncate">{lastMsg.content || 'بدء محادثة جديدة'}</div>
                  </div>
                  {unread > 0 && (
                    <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-bold">{unread}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {isChatOpen && (
        <ChatInterface isOpen={isChatOpen} conversation={selectedConversation} onClose={handleCloseChat} />
      )}
    </>
  );
};

export default FloatingChat;