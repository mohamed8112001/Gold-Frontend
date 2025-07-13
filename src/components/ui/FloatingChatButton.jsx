import React from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from './button.jsx';

const FloatingChatButton = ({ isOpen, onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        {/* Pulsing ring animation when closed */}
        {!isOpen && (
          <>
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-30"></div>
            <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse opacity-20"></div>
          </>
        )}

        <Button
          onClick={onClick}
          className={`
            relative w-18 h-18 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm
            ${isOpen
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-200/50'
              : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-yellow-200/50'
            }
            text-white border-2 border-white/20 flex items-center justify-center
            before:absolute before:inset-0 before:rounded-full before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-15
          `}
          size="lg"
        >
          <div className="relative z-10">
            {isOpen ? (
              <X className="w-8 h-8 drop-shadow-lg" />
            ) : (
              <div className="flex items-center justify-center">
                <Bot className="w-8 h-8 drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Notification dot */}
          {!isOpen && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
            </div>
          )}

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              المساعد الذكي
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FloatingChatButton;