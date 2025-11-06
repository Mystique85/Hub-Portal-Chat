// src/components/modals/NicknameModal.jsx
const NicknameModal = ({
  currentUser,
  nicknameInput,
  setNicknameInput,
  selectedAvatar,
  setSelectedAvatar,
  onRegister,
  onClose,
  availableAvatars
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {!currentUser && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-pulse">
            <div className="text-yellow-400 text-xl">⚠️</div>
            <div>
              <div className="font-semibold text-yellow-400 text-sm">Important: Your nickname cannot be changed later!</div>
              <div className="text-yellow-300/80 text-xs mt-1">Choose wisely as this will be your permanent identity in HUB Portal.</div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            {currentUser ? 'Edit Profile' : 'Welcome to HUB Portal!'} 🎉
          </h2>
          <p className="text-gray-400">{currentUser ? 'Update your profile' : 'Create your identity'}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-white font-semibold mb-4 text-center">Choose your avatar:</h4>
            
            <div className="grid grid-cols-8 gap-2 mb-4">
              {availableAvatars.map((avatar, index) => (
                <button
                  key={index}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    selectedAvatar === avatar
                      ? 'bg-cyan-500 border-2 border-cyan-400 scale-110'
                      : 'bg-gray-700/50 border border-gray-600/50 hover:scale-105'
                  }`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
          
          <input 
            type="text" 
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Enter your nickname..."
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
          />
          
          <button 
            onClick={() => onRegister(nicknameInput, selectedAvatar)}
            disabled={nicknameInput.length < 3}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {currentUser ? 'Update Profile' : 'Join HUB Portal'} 🚀
          </button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-gray-400">Earn 1 HC token for every message! 💎</p>
        </div>
      </div>
    </div>
  );
};

export default NicknameModal;