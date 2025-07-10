import React, { useState } from 'react';
import FloatingChatButton from './FloatingChatButton.jsx';
import ChatInterface from './ChatInterface.jsx';

const FloatingChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <FloatingChatButton isOpen={isChatOpen} onClick={toggleChat} />
      <ChatInterface isOpen={isChatOpen} />
    </>
  );
};

export default FloatingChat;