// src/components/modals/PrivateChatModal.jsx
const PrivateChatModal = ({
  selectedUser,
  privateMessage,
  setPrivateMessage,
  onConfirm,
  onClose,
  isStartingDM
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Start Private Chat 🔒
          </h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-2xl">
              {selectedUser.avatar}
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-lg">{selectedUser.nickname}</div>
              <div className="text-cyan-400 text-sm">Cost: 1 HC</div>
              <div className="text-green-400 text-sm">Reward: 1 HC</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
            <p className="text-cyan-400 text-sm text-center">
              💡 <strong>First message requires 1 HC fee</strong><br/>
              This prevents spam and rewards quality conversations
            </p>
          </div>
          
          <textarea 
            value={privateMessage}
            onChange={(e) => setPrivateMessage(e.target.value)}
            placeholder="Type your first private message..."
            rows="3"
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none"
          />
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(privateMessage)}
              disabled={!privateMessage.trim() || isStartingDM}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isStartingDM ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </div>
              ) : (
                'Start Chat (1 HC)'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateChatModal;