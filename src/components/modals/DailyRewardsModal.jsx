import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import ReactDOM from 'react-dom';
import { parseEther } from 'viem';

const GM_CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalGMs","type":"uint256"}],"name":"GMSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"GM_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PRIZE_POOL","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canSendGM","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"},{"internalType":"bool","name":"canSendNow","type":"bool"},{"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sendGM","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"timeUntilNextGM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const GM_CONTRACT_ADDRESS = "0xBeBfac3472171C4c6693b5808c039c50e73D99e9";

const DailyGM = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const { address } = useAccount();
  const [userStats, setUserStats] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [feeAmount, setFeeAmount] = useState("0.1");
  
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Pobierz statystyki użytkownika
  const { data: statsData, refetch: refetchStats } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getUserStats',
    args: [address],
    enabled: isOpen && !!address,
  });

  // Pobierz aktualną opłatę z kontraktu
  const { data: feeData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'GM_FEE',
    enabled: isOpen,
  });

  // Pobierz adres prize pool
  const { data: prizePoolData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'PRIZE_POOL',
    enabled: isOpen,
  });

  useEffect(() => {
    if (feeData) {
      const feeInCELO = Number(feeData) / 1e18;
      setFeeAmount(feeInCELO.toFixed(1));
    }
  }, [feeData]);

  useEffect(() => {
    if (statsData) {
      const [currentStreak, longestStreak, totalGMs, lastGMTimestamp, totalSpent, canSendNow, timeRemaining] = statsData;
      setUserStats({
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        totalGMs: Number(totalGMs),
        lastGMTimestamp: Number(lastGMTimestamp) * 1000, // convert to ms
        totalSpent: totalSpent.toString(),
        canSendNow,
        timeRemaining: Number(timeRemaining)
      });
    }
  }, [statsData]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      refetchStats();
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isConfirmed, txHash, onClose, refetchStats]);

  const handleSendGM = async () => {
    if (!address) {
      alert('❌ Please connect your wallet first');
      return;
    }

    if (!userStats?.canSendNow) {
      alert('⏰ You can only send GM once per 24 hours');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: GM_CONTRACT_ADDRESS,
        abi: GM_CONTRACT_ABI,
        functionName: 'sendGM',
        args: [],
        value: parseEther(feeAmount), // dynamic fee from contract
      });
      
      if (hash) {
        setTxHash(hash);
      }
    } catch (error) {
      console.error('❌ GM failed:', error);
      
      if (error.message?.includes('user rejected')) {
        alert('❌ Transaction was rejected');
      } else if (error.message?.includes('insufficient funds')) {
        alert('❌ Insufficient CELO balance');
      } else if (error.message?.includes('Wait 24 hours')) {
        alert('⏰ Please wait 24 hours between GMs');
      } else if (error.message?.includes('Incorrect fee amount')) {
        alert(`❌ Please send exactly ${feeAmount} CELO`);
      } else {
        alert('❌ Transaction failed: ' + error.message);
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return 'Now';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const ModalContent = () => {
    if (!isOpen) return null;

    if (txHash && !isConfirmed) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-yellow-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Sending GM... ⚡</h2>
            <p className="text-gray-400 mb-4">Processing {feeAmount} CELO transaction to prize pool...</p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-yellow-500 h-2 rounded-full animate-pulse"></div>
            </div>
            
            {txHash && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
                <p className="text-yellow-300 break-all text-xs">
                  <strong>TX Hash:</strong> {txHash.slice(0, 12)}...{txHash.slice(-8)}
                </p>
                <a 
                  href={`https://celoscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 underline text-xs"
                >
                  🔍 Track transaction on CeloScan
                </a>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isConfirmed) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-green-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">GM Sent Successfully!</h2>
            <p className="text-gray-400 mb-4">
              You sent {feeAmount} CELO to the prize pool
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 font-semibold">
                ✅ Transaction confirmed!<br/>
                🔥 Your streak is now: {userStats ? userStats.currentStreak + 1 : 1} days<br/>
                💰 Funds sent to prize pool
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              Awesome!
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-yellow-500/40 rounded-2xl p-6 max-w-md w-full mx-auto ${
          isMobile ? 'max-h-[90vh] overflow-y-auto' : ''
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🌅 Daily GM Challenge
              </h2>
              <p className="text-gray-400 text-xs mt-1">Keep your streak alive!</p>
            </div>
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
                <div className="grid grid-cols-3 gap-4 text-center mb-4">
                  <div>
                    <div className="text-2xl font-bold text-orange-400">{userStats.currentStreak}</div>
                    <div className="text-xs text-gray-400">Current Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-cyan-400">{userStats.longestStreak}</div>
                    <div className="text-xs text-gray-400">Longest Streak</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{userStats.totalGMs}</div>
                    <div className="text-xs text-gray-400">Total GMs</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div className="text-gray-300">
                    <div className="font-semibold">Last GM:</div>
                    <div>{formatDate(userStats.lastGMTimestamp)}</div>
                  </div>
                  <div className="text-gray-300">
                    <div className="font-semibold">Total Spent:</div>
                    <div className="text-green-400">{(parseInt(userStats.totalSpent) / 1e18).toFixed(1)} CELO</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-yellow-400">{feeAmount} CELO</div>
                <div className="text-sm text-yellow-300">Daily GM Fee</div>
              </div>
              
              <div className="text-center">
                <div className="text-green-400 text-sm mb-1">
                  💰 {feeAmount} CELO goes directly to prize pool
                </div>
                <div className="text-xs text-gray-300">
                  Pool: 0xd302...F73D6
                </div>
              </div>
              
              {userStats && !userStats.canSendNow && userStats.timeRemaining > 0 && (
                <div className="text-center mt-3 pt-3 border-t border-yellow-500/20">
                  <div className="text-orange-400 text-sm">
                    ⏰ Next GM available in: {formatTime(userStats.timeRemaining)}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              <div className="text-blue-400 text-sm">
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <span>📝</span> How Daily GM Works:
                </p>
                <ul className="space-y-1 text-xs mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-0.5">•</span>
                    <span>Pay {feeAmount} CELO to send your daily GM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-0.5">•</span>
                    <span>Entire {feeAmount} CELO goes to prize pool address</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-0.5">•</span>
                    <span>You pay gas fee separately for the transaction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-0.5">•</span>
                    <span>Streak continues if you GM within 24h window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-300 mt-0.5">•</span>
                    <span>Miss 24h? Your streak resets to 1</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleSendGM}
              disabled={!userStats?.canSendNow || isSending || isConfirming}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                userStats?.canSendNow
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 active:scale-95' 
                  : 'bg-gray-600 cursor-not-allowed'
              } ${isSending || isConfirming ? 'opacity-50' : ''}`}
            >
              {isSending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing GM...
                </span>
              ) : userStats?.canSendNow ? (
                <span className="flex items-center justify-center gap-2">
                  <span>🌅</span>
                  Send Daily GM ({feeAmount} CELO)
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>⏰</span>
                  Come Back in {formatTime(userStats?.timeRemaining || 0)}
                </span>
              )}
            </button>

            <div className="text-center">
              <div className="text-xs text-gray-400">
                <p>Streaks are recorded on-chain • Contract: 0xBeBf...D99e9</p>
                <p className="mt-1">Keep your streak alive every 24 hours! 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return ReactDOM.createPortal(<ModalContent />, document.body);
};

export default DailyGM;