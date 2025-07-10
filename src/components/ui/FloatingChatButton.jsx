import React from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from './button.jsx';

const FloatingChatButton = ({ isOpen, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Pulsing ring animation when closed */}
        {!isOpen && (
          <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
        )}
        
        <Button
          onClick={onClick}
          className={`
            relative w-16 h-16 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95
            ${isOpen 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700'
            }
            text-white border-0 flex items-center justify-center
            before:absolute before:inset-0 before:rounded-full before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10
          `}
          size="lg"
        >
          <div className="relative z-10">
            {isOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <div className="flex items-center justify-center">
                <Bot className="w-7 h-7" />
              </div>
            )}
          </div>
          
          {/* Notification dot */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FloatingChatButton;