// src/components/chat/MessageItem.jsx
import ReactionBar from './ReactionBar';

const MessageItem = ({ msg, currentUser }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-4 hover:border-cyan-500/50 transition-all group">
      {/* Message Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-sm">
          {msg.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <strong className="text-white">{msg.nickname}</strong>
          <span className="text-gray-400 text-sm ml-3">
            {msg.timestamp?.toDate ? 
              msg.timestamp.toDate().toLocaleTimeString() : 
              'Just now'}
          </span>
        </div>
      </div>
      
      {/* Message Content */}
      <div className="text-white mb-2">{msg.content}</div>
      
      {/* Message Actions - TYLKO ReactionBar, reszta USUNIĘTA */}
      <div className="flex gap-2 items-center justify-between">
        {/* Reakcje użytkowników - zawsze widoczne jeśli są */}
        <ReactionBar 
          messageId={msg.id}
          currentUser={currentUser}
        />
        
        {/* USUNIĘTE: Zbędne przyciski ↩️ i ⭐ */}
      </div>
    </div>
  );
};

export default MessageItem;