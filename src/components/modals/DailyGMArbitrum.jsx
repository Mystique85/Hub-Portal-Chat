import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from "wagmi";
import ReactDOM from 'react-dom';
import { parseUnits } from 'viem';
import { useNetwork } from '../../hooks/useNetwork';

const GM_CONTRACT_ABI = [{"inputs":[{"internalType":"address","name":"feeCollector","type":"address"},{"internalType":"address","name":"newOwnerAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"allowance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"required","type":"uint256"}],"name":"ApprovalChecked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldCollector","type":"address"},{"indexed":true,"internalType":"address","name":"newCollector","type":"address"}],"name":"FeeCollectorUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalGMs","type":"uint256"}],"name":"GMSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"ARB_TOKEN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"amIOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canSendGM","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getBasicUserStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"},{"internalType":"bool","name":"canSendNow","type":"bool"},{"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeCollector","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeLimits","outputs":[{"internalType":"uint256","name":"minFee","type":"uint256"},{"internalType":"uint256","name":"maxFee","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRecommendedApproval","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserARBBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserDetails","outputs":[{"internalType":"uint256","name":"currentFee","type":"uint256"},{"internalType":"uint256","name":"userAllowance","type":"uint256"},{"internalType":"uint256","name":"userBalance","type":"uint256"},{"internalType":"bool","name":"sufficientAllowance","type":"bool"},{"internalType":"uint256","name":"streakLossTime","type":"uint256"},{"internalType":"bool","name":"streakInDanger","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStreakDeadline","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gmFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasSufficientAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"hasSufficientBalance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sendGM","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sendGMWithCheck","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setGMFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"timeUntilNextGM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"timeUntilStreakLoss","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newCollector","type":"address"}],"name":"updateFeeCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userApprovedAmounts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"willLoseStreak","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawTokens","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const GM_CONTRACT_ADDRESS = "0x8E0A9B35306ce9Ddf7ea7BD3cc4E2D266186a4ED";
const ARB_TOKEN_ABI = [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"type":"function"}];

const DailyGMArbitrum = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const { address } = useAccount();
  const { isArbitrum } = useNetwork();
  
  const [userStats, setUserStats] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [arbBalance, setArbBalance] = useState("0");
  const [arbAllowance, setArbAllowance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: arbTokenAddress } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'ARB_TOKEN',
    enabled: isOpen && isArbitrum,
  });

  const { data: statsData, refetch: refetchStats } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getBasicUserStats',
    args: [address],
    enabled: isOpen && !!address && isArbitrum,
  });

  const { data: arbData, refetch: refetchArb, error: arbError, isLoading: arbLoading } = useReadContracts({
    contracts: [
      {
        address: arbTokenAddress,
        abi: ARB_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: arbTokenAddress,
        abi: ARB_TOKEN_ABI,
        functionName: 'allowance',
        args: [address, GM_CONTRACT_ADDRESS],
      },
    ],
    enabled: isOpen && !!address && !!arbTokenAddress && isArbitrum,
  });

  useEffect(() => {
    if (arbData && arbData[0] && arbData[1]) {
      const balance = Number(arbData[0].result) / 10**18;
      const allowance = Number(arbData[1].result) / 10**18;
      setArbBalance(balance.toFixed(4));
      setArbAllowance(allowance.toFixed(4));
    }
  }, [arbData, arbError, arbLoading]);

  useEffect(() => {
    if (statsData) {
      const [currentStreak, longestStreak, totalGMs, lastGMTimestamp, totalSpent, canSendNow, timeRemaining] = statsData;
      setUserStats({
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        totalGMs: Number(totalGMs),
        lastGMTimestamp: Number(lastGMTimestamp) * 1000,
        canSendNow,
        timeRemaining: Number(timeRemaining)
      });
    }
  }, [statsData]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      refetchStats();
      refetchArb();
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isConfirmed, txHash, onClose, refetchStats, refetchArb]);

  const checkARBApproval = () => {
    const currentAllowance = parseFloat(arbAllowance);
    return currentAllowance >= 0.01;
  };

  const handleApproveARB = async () => {
    if (!address || !arbTokenAddress) return;
    
    setIsApproving(true);
    try {
      const approveAmount = 100;
      const feeInWei = parseUnits(approveAmount.toString(), 18);
      
      const hash = await writeContractAsync({
        address: arbTokenAddress,
        abi: ARB_TOKEN_ABI,
        functionName: 'approve',
        args: [GM_CONTRACT_ADDRESS, feeInWei],
      });
      
      if (hash) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        refetchArb();
        alert('✅ ARB approved! You can now send GMs.');
      }
    } catch (error) {
      console.error('❌ Approval failed:', error);
      alert('❌ ARB approval failed: ' + error.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSendGM = async () => {
    if (!address) {
      alert('❌ Please connect your wallet first');
      return;
    }
    
    if (!userStats?.canSendNow) {
      alert('⏰ You can only send GM once per 24 hours');
      return;
    }

    const userBalance = parseFloat(arbBalance);
    if (userBalance < 0.01) {
      alert('❌ Insufficient ARB balance');
      return;
    }

    if (!checkARBApproval()) {
      alert('❌ Please approve ARB spending first');
      return;
    }

    try {
      const hash = await writeContractAsync({
        address: GM_CONTRACT_ADDRESS,
        abi: GM_CONTRACT_ABI,
        functionName: 'sendGM',
        args: [],
      });
      if (hash) {
        setTxHash(hash);
      }
    } catch (error) {
      console.error('❌ GM failed:', error);
      if (error.message?.includes('user rejected')) {
        alert('❌ Transaction was rejected');
      } else if (error.message?.includes('Insufficient ARB balance')) {
        alert('❌ Insufficient ARB balance');
      } else if (error.message?.includes('Insufficient ARB allowance')) {
        alert('❌ Please approve ARB spending first');
      } else if (error.message?.includes('Wait 24 hours')) {
        alert('⏰ Please wait 24 hours between GMs');
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

  const WrongNetworkContent = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className="bg-gray-800 border-2 border-blue-500/40 rounded-2xl text-center max-w-md w-full p-8">
        <div className="text-6xl mb-4">🌐</div>
        <h2 className="text-2xl font-bold text-blue-400 mb-2">Switch to Arbitrum</h2>
        <p className="text-gray-400 mb-4">Daily GM is available only on Arbitrum network.</p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-300">Please switch to <strong>Arbitrum</strong> network in your wallet to participate in Daily GM!</p>
        </div>
        <button onClick={onClose} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Close</button>
      </div>
    </div>
  );

  const ModalContent = () => {
    if (!isOpen) return null;
    
    if (!isArbitrum) {
      return <WrongNetworkContent />;
    }

    if (txHash && !isConfirmed) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-blue-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Sending GM... ⚡</h2>
            <p className="text-gray-400 mb-4">Processing transaction on Arbitrum...</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4"><div className="bg-blue-500 h-2 rounded-full animate-pulse"></div></div>
            {txHash && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-4">
                <p className="text-blue-300 break-all text-xs"><strong>TX Hash:</strong> {txHash.slice(0, 12)}...{txHash.slice(-8)}</p>
                <a href={`https://arbiscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline text-xs">🔍 Track transaction on Arbiscan</a>
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
            <p className="text-gray-400 mb-4">Transaction completed successfully on Arbitrum</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 font-semibold">✅ Transaction confirmed!<br/>⚡ Your total GMs are now: {userStats ? userStats.totalGMs + 1 : 1}</p>
            </div>
            <button onClick={onClose} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Awesome!</button>
          </div>
        </div>
      );
    }

    const hasSufficientBalance = parseFloat(arbBalance) >= 0.01;
    const isApproved = checkARBApproval();
    const canSendGM = userStats?.canSendNow && hasSufficientBalance && isApproved;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-6 max-w-md w-full mx-auto ${isMobile ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <img src="/Arbitrum.logo.jpg" alt="Arbitrum Logo" className="w-6 h-6" />
                <h2 className="text-xl font-bold text-white">Daily GM Challenge</h2>
              </div>
              <p className="text-gray-400 text-xs mt-1">Keep your streak alive!</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl font-bold">×</button>
          </div>
          
          <div className="space-y-4">
            {userStats && (
              <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-green-400">{userStats.currentStreak}</div><div className="text-xs text-gray-400">Current Streak</div></div>
                  <div><div className="text-2xl font-bold text-purple-400">{userStats.longestStreak}</div><div className="text-xs text-gray-400">Longest Streak</div></div>
                  <div><div className="text-2xl font-bold text-blue-400">{userStats.totalGMs}</div><div className="text-xs text-gray-400">Total GMs</div></div>
                </div>
                <div className="text-center text-sm mt-4">
                  <div className="text-gray-300">
                    <div className="font-semibold">Last GM:</div>
                    <div>{formatDate(userStats.lastGMTimestamp)}</div>
                  </div>
                  {userStats.timeRemaining > 0 && !userStats.canSendNow && (
                    <div className="mt-2 text-sm text-orange-400">⏰ Next GM available in: {formatTime(userStats.timeRemaining)}</div>
                  )}
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">Daily GM</div>
                <div className="text-sm text-blue-300">Send your daily GM</div>
              </div>
            </div>
            
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
              <div className="text-center mb-3">
                <div className={`text-lg font-bold ${hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>Balance: {arbBalance} ARB</div>
                <div className={`text-sm ${isApproved ? 'text-green-400' : 'text-yellow-400'}`}>Allowance: {isApproved ? '✅ Approved' : '❌ Not Approved'}</div>
              </div>
              
              {!isApproved && (
                <button onClick={handleApproveARB} disabled={isApproving || !hasSufficientBalance} className={`w-full py-3 rounded-lg font-bold text-white transition-all ${hasSufficientBalance ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 active:scale-95' : 'bg-gray-600 cursor-not-allowed'}`}>
                  {isApproving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </span>
                  ) : 'Approve ARB'}
                </button>
              )}
            </div>
            
            <div className="relative group">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 cursor-pointer hover:bg-blue-500/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">📝</span>
                  <span className="font-semibold text-blue-400">How Daily GM Works</span>
                </div>
              </div>
              
              <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 border border-blue-500/30 rounded-xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg">
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-start gap-2 text-blue-300"><span className="text-blue-400 mt-0.5">•</span><span>Approve ARB once (no re-approvals needed)</span></li>
                  <li className="flex items-start gap-2 text-blue-300"><span className="text-blue-400 mt-0.5">•</span><span>Send your daily GM to keep your streak alive</span></li>
                  <li className="flex items-start gap-2 text-blue-300"><span className="text-blue-400 mt-0.5">•</span><span>Streak continues if you GM within 24h window</span></li>
                  <li className="flex items-start gap-2 text-blue-300"><span className="text-blue-400 mt-0.5">•</span><span>Miss 24h? Your streak resets to 1</span></li>
                  <li className="flex items-start gap-2 text-blue-300"><span className="text-blue-400 mt-0.5">•</span><span>Longer streak = bigger rewards!</span></li>
                </ul>
              </div>
            </div>
            
            <button onClick={handleSendGM} disabled={!canSendGM || isSending || isConfirming} className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 ${canSendGM ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 active:scale-95' : 'bg-gray-600 cursor-not-allowed'} ${isSending || isConfirming ? 'opacity-50' : ''}`}>
              {isSending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing GM...
                </span>
              ) : canSendGM ? (
                <span className="flex items-center justify-center gap-2">Send Daily GM</span>
              ) : !userStats?.canSendNow ? (
                <span className="flex items-center justify-center gap-2"><span>⏰</span>Come Back in {formatTime(userStats?.timeRemaining || 0)}</span>
              ) : !hasSufficientBalance ? (
                <span className="flex items-center justify-center gap-2"><span>💰</span>Need ARB</span>
              ) : !isApproved ? (
                <span className="flex items-center justify-center gap-2"><span>🔓</span>Approve ARB First</span>
              ) : 'Send GM'}
            </button>
            
            <div className="text-center">
              <div className="text-xs text-gray-400">
                <p>Streaks are recorded on-chain • Contract: 0x8E0A...a4ED</p>
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

export default DailyGMArbitrum;