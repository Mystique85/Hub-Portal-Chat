import { useReactions } from '../../hooks/useReactions';

const ReactionBar = ({ messageId, currentUser, isMobile = false }) => {
  const { reactions, toggleReaction, hasUserReacted, loading } = useReactions(messageId, currentUser);
  
  const activeReactions = Object.entries(reactions).filter(([_, data]) => data.count > 0);

  const handleReactionClick = async (emoji) => {
    await toggleReaction(emoji);
  };

  return (
    <div className="relative">
      {activeReactions.length > 0 && (
        <div className="flex flex-wrap gap-1">
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