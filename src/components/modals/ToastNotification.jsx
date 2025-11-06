// src/components/modals/ToastNotification.jsx
import { useEffect } from 'react';

const ToastNotification = ({ notification, onOpenChat, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500 cursor-pointer"
      onClick={() => onOpenChat(notification.userId)}
    >
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/30 rounded-2xl p-4 max-w-sm shadow-2xl backdrop-blur-xl transform transition-all duration-300 hover:scale-105 hover:border-cyan-400/50">
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-xl shadow-lg animate-pulse">
                {notification.avatar}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-gray-900 animate-bounce"></div>
            </div>
            <div>
              <div className="text-white font-bold text-sm">Nowa wiadomość 💬</div>
              <div className="text-cyan-400 font-semibold">{notification.from}</div>
              <div className="text-gray-400 text-xs">Kliknij aby otworzyć czat</div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="bg-gray-700/50 rounded-xl p-3 border border-gray-600/50">
          <p className="text-gray-200 text-sm leading-relaxed">
            {notification.message}
          </p>
        </div>
        
        <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-progress"
            style={{animation: 'progress 5s linear'}}
          ></div>
        </div>
        
        <div className="text-gray-400 text-xs mt-2 text-right">
          Teraz
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 5s linear;
        }
      `}</style>
    </div>
  );
};

export default ToastNotification;