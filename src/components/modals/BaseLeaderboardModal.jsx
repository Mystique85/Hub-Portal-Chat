import { useState, useEffect } from 'react';
import { useNetwork } from '../../hooks/useNetwork';

const BaseLeaderboardModal = ({ isOpen, onClose, currentUser }) => {
  const [timeRemaining, setTimeRemaining] = useState({});
  const [userStatus, setUserStatus] = useState({
    hasNFT: false,
    hasEnoughTokens: false,
    hubBalance: 0,
    isEligible: false,
    loading: true
  });
  const { isCelo, isBase } = useNetwork();

  const launchDate = new Date('2026-01-01T00:00:00');
  const GENESIS_NFT_CONTRACT = "0xdAf7B15f939F6a8faf87d338010867883AAB366a";

  const checkNFTBalance = async (userAddress) => {
    try {
      const providerUrl = import.meta.env.VITE_BASE_MAINNET_RPC_URL;
      
      if (!providerUrl) {
        return 0;
      }

      const functionSignature = '0x70a08231';
      const addressParam = userAddress.slice(2).padStart(64, '0');
      const data = functionSignature + addressParam;

      const response = await fetch(providerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: GENESIS_NFT_CONTRACT,
            data: data
          }, 'latest'],
          id: 1
        })
      });
      
      const result = await response.json();
      
      if (result.result && result.result !== '0x') {
        const balance = BigInt(result.result);
        return Number(balance);
      }
      
      return 0;
    } catch (error) {
      return 0;
    }
  };

  useEffect(() => {
    if (!isOpen || !currentUser || !isBase) return;

    const checkEligibility = async () => {
      try {
        setUserStatus(prev => ({ ...prev, loading: true }));

        const hubBalance = parseFloat(currentUser?.balance || '0');
        const hasEnoughTokens = hubBalance >= 100;

        const nftBalance = await checkNFTBalance(currentUser.walletAddress);
        const hasNFT = nftBalance > 0;

        const isEligible = hasNFT && hasEnoughTokens;

        setUserStatus({
          hasNFT,
          hasEnoughTokens,
          hubBalance,
          isEligible,
          loading: false
        });

      } catch (error) {
        setUserStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkEligibility();
  }, [isOpen, currentUser, isBase]);

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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              Base Leaderboard Available Soon
            </h2>
            <p className="text-gray-300 mb-6">
              The Base network leaderboard with 2000 USDC rewards pool launches on January 1st, 2026!
              Stay tuned for the competition.
            </p>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all"
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                🏆 Base Leaderboard - Coming Soon!
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Launching on January 1st, 2026 - Get Ready!
              </p>
            </div>
            <button 
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all text-xl p-2"
            >
              ✕
            </button>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-y border-blue-500/20 p-3">
            <div className="text-center">
              <h3 className="text-blue-400 font-bold text-sm mb-2">⏰ Countdown to Launch</h3>
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-500/30">
                  <div className="text-blue-300 font-bold text-lg">{timeRemaining.days || 0}</div>
                  <div className="text-blue-200 text-[10px]">Days</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30">
                  <div className="text-purple-300 font-bold text-lg">{timeRemaining.hours || 0}</div>
                  <div className="text-purple-200 text-[10px]">Hours</div>
                </div>
                <div className="bg-cyan-500/20 rounded-lg p-2 border border-cyan-500/30">
                  <div className="text-cyan-300 font-bold text-lg">{timeRemaining.minutes || 0}</div>
                  <div className="text-cyan-200 text-[10px]">Minutes</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30">
                  <div className="text-green-300 font-bold text-lg">{timeRemaining.seconds || 0}</div>
                  <div className="text-green-200 text-[10px]">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="bg-gray-700/30 rounded-xl p-4 border border-cyan-500/30 mb-4">
              <h3 className="text-cyan-400 font-bold text-base mb-3 flex items-center gap-2">
                <span>👤</span> Your Eligibility Status
              </h3>
              
              {userStatus.loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                  <div className="text-gray-400 text-sm">Checking your eligibility...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge 
                      condition={userStatus.hasNFT} 
                      text={userStatus.hasNFT ? "Genesis NFT Owner" : "No Genesis NFT"} 
                    />
                    <StatusBadge 
                      condition={userStatus.hasEnoughTokens} 
                      text={`${userStatus.hubBalance.toFixed(2)} HUB / 100 Required`} 
                    />
                  </div>
                  
                  <div className={`text-center p-3 rounded-lg border ${
                    userStatus.isEligible 
                      ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    <div className="font-bold text-sm">
                      {userStatus.isEligible ? '🎉 You are ELIGIBLE to compete!' : '⚠️ You are NOT eligible yet'}
                    </div>
                    {!userStatus.isEligible && (
                      <div className="text-xs mt-1">
                        {!userStatus.hasNFT && !userStatus.hasEnoughTokens && 'Get Genesis NFT and 100+ HUB tokens'}
                        {!userStatus.hasNFT && userStatus.hasEnoughTokens && 'Get Genesis NFT to qualify'}
                        {userStatus.hasNFT && !userStatus.hasEnoughTokens && `Need ${(100 - userStatus.hubBalance).toFixed(2)} more HUB tokens`}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎯</div>
              <h2 className="text-xl font-bold text-white mb-1">
                HUB Chat Base Leaderboard
              </h2>
              <p className="text-blue-400 text-base font-semibold mb-3">
                Launching on January 1st, 2026!
              </p>
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base font-bold py-2 px-4 rounded-xl inline-block">
                $2000 USDC Reward Pool! 💰
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-gray-700/30 rounded-xl p-4 border border-amber-500/30">
                <h3 className="text-amber-400 font-bold text-base mb-3 flex items-center gap-2">
                  <span>✅</span> Participation Requirements
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm mb-3">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Own a HUB Ecosystem Genesis NFT</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>Hold at least 100 HUB tokens</span>
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
                    <span>Earn HUB tokens</span>
                  </a>
                </div>
                <p className="text-amber-300 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                  ⏳ You have time to secure your NFT and collect 100 HUB tokens!
                </p>
              </div>

              <div className="bg-gray-700/30 rounded-xl p-4 border border-purple-500/30">
                <h3 className="text-purple-400 font-bold text-base mb-3 flex items-center gap-2">
                  <span>📊</span> How the Leaderboard Works
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>12 seasons competition</strong> - year-long tournament</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Each season: 1 month</strong> - fresh start every month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Track messages on Base network</strong> - every message counts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Top 20 users share rewards</strong> - compete for USDC prizes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span><strong>Leaderboard resets after each season</strong> - fair competition for all</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-4xl mb-2">💬🔥</div>
              <h3 className="text-lg font-bold text-white mb-1">
                The more active you are, the bigger your rewards!
              </h3>
              <p className="text-gray-400 text-sm">
                See you on the HUB Chat Base leaderboard starting January 1st, 2026!
              </p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 p-3 border-t border-gray-700/50 bg-gray-800/30">
          <div className="text-center text-gray-400 text-[10px]">
            <p>Base Network Leaderboard • Launching: January 1st, 2026 • $2000 USDC Total Rewards</p>
            <p className="mt-1">Start preparing today to compete for amazing rewards! 🎉</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLeaderboardModal;