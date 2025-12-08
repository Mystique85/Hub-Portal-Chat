import { useNetwork } from '../../hooks/useNetwork';

const PrivateChatModal = ({
  selectedUser,
  privateMessage,
  setPrivateMessage,
  onConfirm,
  onClose,
  isStartingDM,
  isConfirming,
  isMobile = false
}) => {
  const { currentNetwork, tokenSymbol, networkName } = useNetwork();
  
  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
      isMobile ? 'p-2' : 'p-4'
    }`}>
      <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${
        isMobile 
          ? 'rounded-xl p-4 max-w-sm'
          : 'rounded-3xl p-8 max-w-md'
      }`}>
        <div className={`text-center ${
          isMobile ? 'mb-4' : 'mb-6'
        }`}>
          <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>
            Start Private Chat 🔒
          </h2>
          <div className={`flex items-center justify-center gap-3 ${
            isMobile ? 'mt-2' : 'mt-4'
          }`}>
            <div className={`rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center ${
              isMobile 
                ? 'w-12 h-12 text-xl'
                : 'w-16 h-16 text-2xl'
            }`}>
              {selectedUser.avatar}
            </div>
            <div className="text-left">
              <div className={`text-white font-semibold ${
                isMobile ? 'text-base' : 'text-lg'
              }`}>
                {selectedUser.nickname}
              </div>
              <div className={`text-cyan-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                First message requires on-chain transaction
              </div>
              <div className={`text-green-400 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Reward: 1 {tokenSymbol}
              </div>
            </div>
          </div>
        </div>
        
        <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
          <div className={`bg-cyan-500/10 border border-cyan-500/30 rounded-xl ${
            isMobile ? 'p-3' : 'p-4 rounded-2xl'
          }`}>
            <p className={`text-cyan-400 text-center ${
              isMobile ? 'text-xs leading-relaxed' : 'text-sm'
            }`}>
              🔐 <strong>First message requires blockchain confirmation</strong><br/>
              • Sign transaction to start chat<br/>
              • Earn 1 {tokenSymbol} reward<br/>
              • Subsequent messages don't require transactions
            </p>
          </div>
          
          <textarea 
            value={privateMessage}
            onChange={(e) => setPrivateMessage(e.target.value)}
            placeholder="Type your first private message..."
            rows={isMobile ? "2" : "3"}
            className={`w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none ${
              isMobile 
                ? 'rounded-lg text-sm'
                : 'rounded-xl'
            }`}
            disabled={isStartingDM || isConfirming}
          />
          
          <div className={`text-gray-400 text-center ${
            isMobile ? 'text-[10px] leading-tight' : 'text-xs'
          }`}>
            💡 Only the first message requires transaction<br/>
            All following messages are free & instant
          </div>
          
          <div className={`flex gap-3 ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <button 
              onClick={onClose}
              disabled={isStartingDM || isConfirming}
              className={`flex-1 border border-gray-600/50 text-gray-400 hover:text-white transition-all disabled:opacity-50 ${
                isMobile 
                  ? 'py-2.5 rounded-lg text-sm'
                  : 'py-3 rounded-xl'
              } bg-gray-700/50`}
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(privateMessage)}
              disabled={!privateMessage.trim() || isStartingDM || isConfirming}
              className={`flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                isMobile 
                  ? 'py-2.5 rounded-lg text-sm'
                  : 'py-3 rounded-xl'
              }`}
            >
              {isStartingDM || isConfirming ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isConfirming ? 'Confirming...' : 'Starting...'}
                </div>
              ) : (
                `Start Chat & Earn 1 ${tokenSymbol}`
              )}
            </button>
          </div>
          
          {isConfirming && (
            <div className={`p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl ${
              isMobile ? 'mt-2' : 'mt-4'
            }`}>
              <p className={`text-amber-400 text-center ${
                isMobile ? 'text-xs leading-relaxed' : 'text-sm'
              }`}>
                ⏳ <strong>Transaction pending</strong><br/>
                Chat will start after confirmation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateChatModal;