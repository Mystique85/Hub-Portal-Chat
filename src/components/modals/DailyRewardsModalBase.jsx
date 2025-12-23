import { useState, useEffect } from "react";
import { useAccount, useContractRead, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import ReactDOM from 'react-dom';

const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalClaims","type":"uint256"},{"indexed":false,"internalType":"bool","name":"hasGenesisNFT","type":"bool"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"Claimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"newMessage","type":"string"}],"name":"MessageUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"StreakSaved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"longestStreak","type":"uint256"}],"name":"StreakUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserBlocked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"UserUnblocked","type":"event"},{"inputs":[],"name":"CLAIM_COOLDOWN","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DAILY_USDC_REWARD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"GENESIS_NFT_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"GENESIS_NFT_REWARD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"HUB_TOKEN_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_HUB_REQUIRED","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"STREAK_TIMEFRAME","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC_ADDRESS","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"appLink","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"blacklist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"blacklistMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"blockUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canClaim","outputs":[{"internalType":"bool","name":"canClaimNow","type":"bool"},{"internalType":"string","name":"message","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"cooldownMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"emergencyWithdrawUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"genesisNFTRewardMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getClaimInfo","outputs":[{"internalType":"bool","name":"canClaimNow","type":"bool"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"uint256","name":"nextAvailableClaim","type":"uint256"},{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"potentialReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getFullUserInfo","outputs":[{"internalType":"bool","name":"canClaimNow","type":"bool"},{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"uint256","name":"nextAvailableClaim","type":"uint256"},{"internalType":"uint256","name":"timeRemaining","type":"uint256"},{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalClaims","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"bool","name":"userHasEnoughHUB","type":"bool"},{"internalType":"bool","name":"userHasGenesisNFT","type":"bool"},{"internalType":"uint256","name":"potentialReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getHubBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getRewardInfo","outputs":[{"internalType":"uint256","name":"dailyReward","type":"uint256"},{"internalType":"uint256","name":"nftBonus","type":"uint256"},{"internalType":"uint256","name":"totalReward","type":"uint256"},{"internalType":"bool","name":"eligibleForReward","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"lastClaim","type":"uint256"},{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalClaims","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"bool","name":"userHasEnoughHUB","type":"bool"},{"internalType":"bool","name":"userHasGenesisNFT","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasGenesisNFT","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"insufficientHubMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_newLink","type":"string"}],"name":"setAppLink","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newMessage","type":"string"}],"name":"setBlacklistMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newMessage","type":"string"}],"name":"setCooldownMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newMessage","type":"string"}],"name":"setWelcomeMessage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"streakSavedMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"unblockUser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"lastClaimTime","type":"uint256"},{"internalType":"uint256","name":"streakCount","type":"uint256"},{"internalType":"uint256","name":"totalClaims","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"lastStreakUpdate","type":"uint256"},{"internalType":"bool","name":"isBlocked","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"welcomeMessage","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}];

const CONTRACT_ADDRESS = "0x026417Dd641C090CDAc7ecD961B25c6c45fa3018";

const DailyRewardsModalBase = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const { address } = useAccount();
  const [userStats, setUserStats] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [hasGenesisNFT, setHasGenesisNFT] = useState(false);
  
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: statsData, refetch: refetchStats } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'getFullUserInfo',
    args: [address],
    enabled: isOpen && !!address,
  });

  const { data: canClaimData, refetch: refetchCanClaim } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'canClaim',
    args: [address],
    enabled: isOpen && !!address,
  });

  const { data: nftData, refetch: refetchNFT } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'hasGenesisNFT',
    args: [address],
    enabled: isOpen && !!address,
  });

  useEffect(() => {
    if (statsData) {
      const [canClaimNow, lastClaim, nextAvailableClaim, timeRemaining, currentStreak, longestStreak, totalClaims, totalEarned, userHasEnoughHUB, userHasGenesisNFT, potentialReward] = statsData;
      
      setUserStats({
        canClaimNow,
        lastClaim: Number(lastClaim),
        nextAvailableClaim: Number(nextAvailableClaim),
        timeRemaining: Number(timeRemaining),
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        totalClaims: Number(totalClaims),
        totalEarned: totalEarned.toString(),
        userHasEnoughHUB,
        userHasGenesisNFT,
        potentialReward: potentialReward.toString()
      });
      
      setHasGenesisNFT(userHasGenesisNFT);
    }
  }, [statsData]);

  useEffect(() => {
    if (nftData !== undefined) {
      setHasGenesisNFT(nftData);
    }
  }, [nftData]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      refetchStats();
      refetchCanClaim();
      refetchNFT();
      
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isConfirmed, txHash, onClose, refetchStats, refetchCanClaim, refetchNFT]);

  const handleClaim = async () => {
    if (!address) {
      alert('❌ Please connect your wallet first');
      return;
    }
    
    if (!userStats?.canClaimNow) {
      alert('⏰ You cannot claim yet. Please wait 24 hours between claims.');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'claim',
        args: [],
      });
      
      if (hash) {
        setTxHash(hash);
      } else {
        throw new Error('No transaction hash received');
      }
    } catch (error) {
      console.error('❌ Claim failed:', error);
      
      if (error.message?.includes('user rejected')) {
        alert('❌ Transaction was rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        alert('❌ Insufficient ETH for gas fees');
      } else if (error.message?.includes('network')) {
        alert('❌ Network error. Please check your connection');
      } else {
        alert('❌ Transaction failed: ' + error.message);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'Now';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatUSDC = (amount) => {
    if (!amount) return '0.00';
    const usdcAmount = BigInt(amount);
    return (Number(usdcAmount) / 10**6).toFixed(2);
  };

  const calculateReward = () => {
    if (!userStats?.userHasEnoughHUB) return { amount: 0, label: '0.00' };
    
    let baseReward = 0.01;
    let bonus = 0;
    
    if (hasGenesisNFT) {
      bonus = 0.10;
    }
    
    const total = baseReward + bonus;
    return {
      amount: total,
      label: total.toFixed(2),
      hasBonus: bonus > 0
    };
  };

  const rewardInfo = calculateReward();

  const ModalContent = () => {
    if (!isOpen) return null;

    if (txHash && !isConfirmed) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-blue-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Processing Claim ⏳</h2>
            <p className="text-gray-400 mb-4">Transaction has been sent to the Base network...</p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse"></div>
            </div>
            
            {txHash && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
                <p className="text-blue-300 break-all text-xs">
                  <strong>TX Hash:</strong> {txHash.slice(0, 12)}...{txHash.slice(-8)}
                </p>
                <a 
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline text-xs"
                >
                  🔍 Track transaction on BaseScan
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isConfirmed) {
      const rewardText = userStats?.userHasEnoughHUB 
        ? hasGenesisNFT 
          ? "You received 0.11 USDC (0.01 + 0.10 NFT bonus)!"
          : "You received 0.01 USDC!"
        : "Your streak has been maintained! Get 100 HUB tokens to earn USDC rewards.";
      
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-blue-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-blue-400 mb-2">
              {userStats?.userHasEnoughHUB ? "Reward Claimed!" : "Streak Saved!"}
            </h2>
            <p className="text-gray-400 mb-4">{rewardText}</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 font-semibold">
                ✅ Transaction confirmed!
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-6 max-w-md w-full mx-auto ${
          isMobile ? 'max-h-[90vh] overflow-y-auto' : ''
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🎁 Daily Rewards - Base
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {userStats && (
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                <div className="grid grid-cols-2 gap-4 text-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{userStats.currentStreak}</div>
                    <div className="text-xs text-gray-400">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{userStats.longestStreak}</div>
                    <div className="text-xs text-gray-400">Longest Streak</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-white">{userStats.totalClaims}</div>
                    <div className="text-xs text-gray-400">Total Claims</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-400">
                      {formatUSDC(userStats.totalEarned)} USDC
                    </div>
                    <div className="text-xs text-gray-400">Total Earned</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-600/30 border border-gray-500/50">
                    <span className="text-sm text-gray-300">HUB Balance Status:</span>
                    <span className={`text-sm font-bold ${userStats.userHasEnoughHUB ? 'text-green-400' : 'text-orange-400'}`}>
                      {userStats.userHasEnoughHUB ? '✅ 100+ HUB' : '❌ Need 100 HUB'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-600/30 border border-gray-500/50">
                    <span className="text-sm text-gray-300">Genesis NFT Status:</span>
                    <span className={`text-sm font-bold ${hasGenesisNFT ? 'text-purple-400' : 'text-gray-400'}`}>
                      {hasGenesisNFT ? '✅ NFT Holder' : '❌ No NFT'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className={`border rounded-xl p-4 ${
              userStats?.userHasEnoughHUB 
                ? hasGenesisNFT
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30'
                  : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
                : 'bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-500/30'
            }`}>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-green-400">{rewardInfo.label} USDC</div>
                <div className="text-sm text-green-300">
                  {rewardInfo.hasBonus ? "Daily Reward + NFT Bonus" : "Daily Reward"}
                </div>
                {hasGenesisNFT && userStats?.userHasEnoughHUB && (
                  <div className="text-purple-300 text-sm mt-1">
                    🎭 Genesis NFT Bonus: +0.10 USDC
                  </div>
                )}
                {!userStats?.userHasEnoughHUB && (
                  <div className="text-orange-300 text-sm mt-2">
                    ⚠️ Get 100 HUB tokens to unlock USDC rewards
                  </div>
                )}
              </div>
              
              {userStats && !userStats.canClaimNow && userStats.timeRemaining > 0 && (
                <div className="text-center">
                  <div className="text-orange-400 text-sm">
                    Next claim in: {formatTime(userStats.timeRemaining)}
                  </div>
                </div>
              )}
            </div>

            {canClaimData && canClaimData[1] && (
              <div className="text-center text-sm text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                {canClaimData[1]}
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={!userStats?.canClaimNow || isSending || isConfirming}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                userStats?.canClaimNow 
                  ? userStats?.userHasEnoughHUB
                    ? hasGenesisNFT
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105'
                    : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 hover:scale-105'
                  : 'bg-gray-600 cursor-not-allowed'
              } ${isSending ? 'opacity-50' : ''}`}
            >
              {isSending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : userStats?.canClaimNow ? (
                userStats?.userHasEnoughHUB ? 
                  hasGenesisNFT ? '🎭 Claim 0.11 USDC' : '🎁 Claim 0.01 USDC'
                : '⚡ Save Streak'
              ) : (
                '⏰ Come Back Later'
              )}
            </button>

            <div className="text-xs text-gray-400 text-center space-y-1">
              <div>Claim your daily reward every 24 hours to maintain your streak!</div>
              {!userStats?.userHasEnoughHUB && (
                <div className="text-orange-400">
                  Get 100 HUB tokens to unlock USDC rewards
                </div>
              )}
              {!hasGenesisNFT && (
                <div className="text-purple-400">
                  Get Genesis NFT for +0.10 USDC daily bonus
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(<ModalContent />, document.body);
};

export default DailyRewardsModalBase;