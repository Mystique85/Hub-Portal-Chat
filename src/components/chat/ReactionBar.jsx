// src/components/chat/ReactionBar.jsx
import { useState } from 'react';
import { useReactions } from '../../hooks/useReactions';

const ReactionBar = ({ messageId, currentUser }) => {
  const [showReactions, setShowReactions] = useState(false);
  const { reactions, toggleReaction, hasUserReacted, loading } = useReactions(messageId, currentUser);
  
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  const handleReactionClick = async (emoji) => {
    await toggleReaction(emoji);
    setShowReactions(false);
  };

  // Filtruj tylko reakcje z count > 0
  const activeReactions = Object.entries(reactions).filter(([_, data]) => data.count > 0);

  return (
    <div className="relative">
      {/* Reaction Trigger Button - NOWA WERSJA */}
      <button
        onClick={() => setShowReactions(!showReactions)}
        disabled={loading}
        className="text-gray-400 hover:text-cyan-400 text-xs transition-all transform hover:scale-105 px-2 py-1 rounded-lg hover:bg-gray-700/50 disabled:opacity-50 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        title="Add reaction"
      >
        <span>😊</span>
        <span>React</span>
      </button>

      {/* Reactions Picker */}
      {showReactions && (
        <div className="absolute bottom-full left-0 mb-2 bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
          <div className="flex gap-1">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                disabled={loading}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all transform hover:scale-125 ${
                  hasUserReacted(emoji)
                    ? 'bg-cyan-500/20 border border-cyan-500/50' 
                    : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50'
                } disabled:opacity-50`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Reactions Display - zawsze widoczne jeśli są reakcje */}
      {activeReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {activeReactions.map(([emoji, data]) => (
            <button
              key={emoji}
              onClick={() => handleReactionClick(emoji)}
              disabled={loading}
              className={`px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                hasUserReacted(emoji)
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:bg-gray-600/50'
              } disabled:opacity-50`}
            >
              <span>{emoji}</span>
              <span className="font-semibold">{data.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionBar;