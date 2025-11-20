const ReactionPicker = ({ onReactionSelect, onClose }) => {
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <>
      <div 
        className="fixed inset-0 z-50" 
        onClick={onClose}
      />
      <div 
        className="fixed bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-4 shadow-2xl z-50"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-2">
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReactionSelect(emoji)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all transform hover:scale-125 bg-gray-700/50 border border-gray-600/50 hover:bg-gray-600/50"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReactionPicker;