import { useState, useEffect } from 'react';
import { useReadContract } from 'wagmi';
import { useNetwork } from '../../hooks/useNetwork';

const BaseLeaderboardModal = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const [timeRemaining, setTimeRemaining] = useState({});
  const [userStatus, setUserStatus] = useState({
    hasNFT: false,
    hasEnoughTokens: false,
    hubBalance: 0,
    isEligible: false,
    loading: true
  });
  const { isCelo, isBase } = useNetwork();

  const launchDate = new Date('2026-04-01T00:00:00');
  const MIN_TOKENS_REQUIRED = 100;
  const GENESIS_NFT_CONTRACT = "0xdAf7B15f939F6a8faf87d338010867883AAB366a";

  const NFT_ABI = [
    {
      "inputs": [{ "name": "owner", "type": "address" }],
      "name": "balanceOf",
      "outputs": [{ "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const { 
    data: nftBalanceData, 
    isLoading: nftLoading,
    error: nftError 
  } = useReadContract({
    address: GENESIS_NFT_CONTRACT,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: [currentUser?.walletAddress],
    query: {
      enabled: !!currentUser?.walletAddress && isOpen && isBase,
      refetchInterval: 30000,
    }
  });

  useEffect(() => {
    if (!isOpen || !currentUser || !isBase) return;

    const checkEligibility = async () => {
      try {
        setUserStatus(prev => ({ ...prev, loading: true }));

        const hubBalance = parseFloat(currentUser?.balance || '0');
        const hasEnoughTokens = hubBalance >= MIN_TOKENS_REQUIRED;

        let hasNFT = false;
        if (nftBalanceData !== undefined) {
          const balance = Number(nftBalanceData);
          hasNFT = balance > 0;
        }

        const isEligible = hasNFT && hasEnoughTokens;

        setUserStatus({
          hasNFT,
          hasEnoughTokens,
          hubBalance,
          isEligible,
          loading: nftLoading
        });

      } catch (error) {
        setUserStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkEligibility();
  }, [isOpen, currentUser, isBase, nftBalanceData, nftLoading]);

  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isBase && isOpen) {
    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
        isMobile ? 'p-0' : 'p-4'
      }`}>
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${
          isMobile 
            ? 'h-full rounded-none p-4 max-w-full' 
            : 'rounded-3xl p-6 max-w-md'
        }`}>
          <div className="text-center">
            <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-4`}>🌐</div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-400 mb-4`}>
              Base Leaderboard Available Soon
            </h2>
            <p className="text-gray-300 mb-6">
              The Base network leaderboard with 2000 USDC rewards pool launches on April 1st, 2026!
              The first season starts in April - get ready to compete!
            </p>
            <button 
              onClick={onClose}
              className={`${isMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  const StatusBadge = ({ condition, text }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
      condition 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border border-red-500/30'
    }`}>
      <span>{condition ? '✅' : '❌'}</span>
      <span>{text}</span>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 ${
      isMobile ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 w-full ${
        isMobile 
          ? 'h-full rounded-none overflow-hidden flex flex-col max-w-full' 
          : 'rounded-3xl max-w-4xl h-[85vh] overflow-hidden flex flex-col'
      }`}>
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} border-b border-gray-700/50`}>
            <div>
              <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent`}>
                🏆 Base Leaderboard - First Season Coming Soon!
              </h2>
              <p className={`text-gray-400 ${isMobile ? 'text-xs mt-0.5' : 'text-xs mt-1'}`}>
                Launching on April 1st, 2026 - April Season Only!
              </p>
            </div>
            <button 
              onClick={onClose}
              className={`${isMobile ? 'w-8 h-8 text-lg' : 'w-12 h-12 text-xl'} flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all p-2`}
            >
              ✕
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-y border-blue-500/20 p-3">
            <div className="text-center">
              <h3 className="text-blue-400 font-bold text-sm mb-2">⏰ Countdown to April Season Launch</h3>
              <div className={`grid grid-cols-4 gap-2 ${isMobile ? 'max-w-xs' : 'max-w-md'} mx-auto`}>
                <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
                  <div className={`text-blue-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.days || 0}</div>
                  <div className="text-blue-200 text-[10px]">Days</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30">
                  <div className={`text-purple-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.hours || 0}</div>
                  <div className="text-purple-200 text-[10px]">Hours</div>
                </div>
                <div className="bg-cyan-500/20 rounded-lg p-2 border border-cyan-500/30">
                  <div className={`text-cyan-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.minutes || 0}</div>
                  <div className="text-cyan-200 text-[10px]">Minutes</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                  <div className={`text-green-300 font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>{timeRemaining.seconds || 0}</div>
                  <div className="text-green-200 text-[10px]">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
          <div className={isMobile ? '' : 'p-4'}>
            <div className="bg-gray-700/30 rounded-xl p-4 border border-cyan-500/30 mb-4">
              <h3 className={`text-cyan-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                <span>👤</span> Your Eligibility Status
              </h3>
              
              {userStatus.loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <div className="text-gray-400 text-sm">Checking your eligibility...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-wrap gap-2'}`}>
                    <StatusBadge 
                      condition={userStatus.hasNFT} 
                      text={userStatus.hasNFT ? "Genesis NFT Owner" : "No Genesis NFT"} 
                    />
                    <StatusBadge 
                      condition={userStatus.hasEnoughTokens} 
                      text={`${userStatus.hubBalance.toFixed(2)} HUB / ${MIN_TOKENS_REQUIRED} Required`} 
                    />
                  </div>
                  
                  <div className={`text-center p-3 rounded-lg border text-sm ${
                    userStatus.isEligible 
                      ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    <div className="font-bold">
                      {userStatus.isEligible ? '🎉 You are ELIGIBLE to compete!' : '⚠️ You are NOT eligible yet'}
                    </div>
                    {!userStatus.isEligible && (
                      <div className="text-xs mt-1">
                        {!userStatus.hasNFT && !userStatus.hasEnoughTokens && `Get Genesis NFT and ${MIN_TOKENS_REQUIRED}+ HUB tokens`}
                        {!userStatus.hasNFT && userStatus.hasEnoughTokens && 'Get Genesis NFT to qualify'}
                        {userStatus.hasNFT && !userStatus.hasEnoughTokens && `Need ${(MIN_TOKENS_REQUIRED - userStatus.hubBalance).toFixed(2)} more HUB tokens`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mb-4">
              <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}>🎯</div>
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-1`}>
                HUB Chat Base Leaderboard - April Season
              </h2>
              <p className={`text-blue-400 ${isMobile ? 'text-sm' : 'text-base'} font-semibold mb-3`}>
                Launching on April 1st, 2026 for 1 Month Only!
              </p>
              <div className={`bg-gradient-to-r from-green-500 to-emerald-500 text-white ${isMobile ? 'text-sm py-1.5 px-3' : 'text-base py-2 px-4'} font-bold rounded-xl inline-block`}>
                $2000 USDC Reward Pool! 💰
              </div>
            </div>

            <div className={`${isMobile ? 'space-y-4' : 'grid md:grid-cols-2 gap-4'} text-sm mb-4`}>
              <div className="bg-gray-700/30 rounded-xl p-4 border border-amber-500/30">
                <h3 className={`text-amber-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                  <span>✅</span> Participation Requirements
                </h3>
                <ul className={`space-y-2 text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'} mb-3`}>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Own a HUB Ecosystem Genesis NFT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Hold at least {MIN_TOKENS_REQUIRED} HUB tokens</span>
                  </li>
                </ul>
                <div className="space-y-2 text-xs mb-3">
                  <a href="https://opensea.io/collection/hub-ecosystem-genesis-nft/overview" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 py-1">
                    <span className="text-sm">🌐</span>
                    <span>HUB Ecosystem Genesis NFT</span>
                  </a>
                  <a href="https://hub-portal-chat.vercel.app/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 py-1">
                    <span className="text-sm">🌐</span>
                    <span>Earn HUB tokens to reach {MIN_TOKENS_REQUIRED} HUB requirement</span>
                  </a>
                </div>
                <p className="text-amber-300 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                  ⏳ You have time to secure your NFT and collect {MIN_TOKENS_REQUIRED} HUB tokens before April 1st!
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4 border border-purple-500/30">
                <h3 className={`text-purple-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                  <span>📊</span> April Season Details
                </h3>
                <ul className={`space-y-2 text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>FIRST SEASON ONLY</strong> - April 1st to April 30th, 2026</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>1 month competition</strong> - exclusive April event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Total messages on Base network</strong> - count every message sent during April</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Future seasons depend on April participation</strong> - show your activity!</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-700/30 rounded-xl p-4 border border-green-500/30 mb-4">
              <h3 className={`text-green-400 font-bold ${isMobile ? 'text-sm' : 'text-base'} mb-3 flex items-center gap-2`}>
                <span>🔮</span> What Happens After April?
              </h3>
              <div className="text-gray-300 text-sm">
                <p className="mb-2">
                  <strong>The April season is our pilot program!</strong> Future leaderboard seasons will depend on:
                </p>
                <ul className="space-y-1.5 mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Total number of active participants in April</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Community engagement and feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Overall activity and message volume</span>
                  </li>
                </ul>
                <p className="text-green-300 text-xs font-semibold bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center">
                  📢 Continuation announcement will be made during the April season!
                </p>
              </div>
            </div>

            <div className="text-center py-4">
              <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-2`}>💬🔥</div>
              <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white mb-1`}>
                Make April count - Your activity decides the future of leaderboards!
              </h3>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Join us for the exclusive April season starting April 1st, 2026!
              </p>
            </div>
          </div>
        </div>

        <div className={`flex-shrink-0 border-t border-gray-700/50 bg-gray-800/30 ${
          isMobile ? 'p-2' : 'p-3'
        }`}>
          <div className={`text-center text-gray-400 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
            <p>Base Network Leaderboard • April Season Only: April 1-30, 2026 • $2000 USDC Total Rewards</p>
            <p className={isMobile ? 'mt-0.5' : 'mt-1'}>Genesis NFT + {MIN_TOKENS_REQUIRED} HUB tokens required • Only 1 season in April</p>
            
            <div className={`mt-2 pt-2 border-t border-gray-700/30 ${isMobile ? 'mt-1 pt-1' : ''}`}>
              <p className={`text-gray-500 ${isMobile ? 'text-[8px]' : 'text-[9px]'}`}>
                ℹ️ Future leaderboard seasons will be announced based on April participation results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLeaderboardModal;