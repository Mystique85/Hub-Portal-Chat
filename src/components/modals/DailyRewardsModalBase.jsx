import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from "wagmi";
import ReactDOM from 'react-dom';
import { parseUnits } from 'viem';

const GM_CONTRACT_ABI = [{"inputs":[{"internalType":"address","name":"feeCollector","type":"address"},{"internalType":"address","name":"newOwnerAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldCollector","type":"address"},{"indexed":true,"internalType":"address","name":"newCollector","type":"address"}],"name":"FeeCollectorUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"FeeUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalGMs","type":"uint256"}],"name":"GMSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"MAX_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MIN_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC_TOKEN","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"amIOwner","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canSendGM","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCurrentFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeCollector","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFeeLimits","outputs":[{"internalType":"uint256","name":"minFee","type":"uint256"},{"internalType":"uint256","name":"maxFee","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUSDCBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"},{"internalType":"bool","name":"canSendNow","type":"bool"},{"internalType":"uint256","name":"timeRemaining","type":"uint256"},{"internalType":"uint256","name":"currentFee","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gmFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sendGM","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"setGMFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"timeUntilNextGM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newCollector","type":"address"}],"name":"updateFeeCollector","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawNative","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const GM_CONTRACT_ADDRESS = "0x220160fad5f6f5c2Af2674469dD99e132759D9Ca";

const USDC_TOKEN_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

const USDC_ABI = [
  {
    "constant": false,
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
];

const DailyGMBase = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const { address } = useAccount();
  const [userStats, setUserStats] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [feeAmount, setFeeAmount] = useState("0.01");
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [usdcAllowance, setUsdcAllowance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { data: statsData, refetch: refetchStats } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'getUserStats',
    args: [address],
    enabled: isOpen && !!address,
  });

  const { data: feeData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'gmFee',
    enabled: isOpen,
  });

  const { data: usdcTokenData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'USDC_TOKEN',
    enabled: isOpen,
  });

  const { data: usdcData, error: usdcError, isLoading: usdcLoading } = useReadContracts({
    contracts: [
      {
        address: USDC_TOKEN_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: USDC_TOKEN_ADDRESS,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [address, GM_CONTRACT_ADDRESS],
      },
    ],
    enabled: isOpen && !!address,
  });

  useEffect(() => {
    if (feeData) {
      const feeInUSDC = Number(feeData) / 10**6;
      setFeeAmount(feeInUSDC.toFixed(2));
    }
  }, [feeData]);

  useEffect(() => {
    console.log('USDC Data:', usdcData);
    console.log('USDC Error:', usdcError);
    console.log('USDC Loading:', usdcLoading);
    
    if (usdcData && usdcData[0] && usdcData[1]) {
      console.log('USDC Balance raw:', usdcData[0].result);
      console.log('USDC Allowance raw:', usdcData[1].result);
      
      const balance = Number(usdcData[0].result) / 10**6;
      const allowance = Number(usdcData[1].result) / 10**6;
      
      console.log('USDC Balance parsed:', balance);
      console.log('USDC Allowance parsed:', allowance);
      
      setUsdcBalance(balance.toFixed(2));
      setUsdcAllowance(allowance.toFixed(2));
    }
  }, [usdcData, usdcError, usdcLoading]);

  useEffect(() => {
    if (statsData) {
      const [currentStreak, longestStreak, totalGMs, lastGMTimestamp, totalSpent, canSendNow, timeRemaining, currentFee] = statsData;
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
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isConfirmed, txHash, onClose, refetchStats]);

  const checkUSDCApproval = () => {
    const requiredAllowance = parseFloat(feeAmount);
    const currentAllowance = parseFloat(usdcAllowance);
    console.log('Check approval:', { requiredAllowance, currentAllowance, feeAmount, usdcAllowance });
    return currentAllowance >= requiredAllowance;
  };

  const handleApproveUSDC = async () => {
    console.log('Approving USDC...');
    if (!address) {
      console.error('No address');
      return;
    }

    setIsApproving(true);
    try {
      const feeInWei = parseUnits(feeAmount, 6);
      console.log('Approving amount:', feeAmount, 'in wei:', feeInWei);
      
      const hash = await writeContractAsync({
        address: USDC_TOKEN_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [GM_CONTRACT_ADDRESS, feeInWei],
      });

      console.log('Approval hash:', hash);
      
      if (hash) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setUsdcAllowance(feeAmount);
        console.log('Approval completed, allowance set to:', feeAmount);
      }
    } catch (error) {
      console.error('❌ Approval failed:', error);
      alert('❌ USDC approval failed: ' + error.message);
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

    const userBalance = parseFloat(usdcBalance);
    const requiredFee = parseFloat(feeAmount);
    
    if (userBalance < requiredFee) {
      alert(`❌ Insufficient USDC balance. You need ${feeAmount} USDC, but you have ${usdcBalance} USDC`);
      return;
    }

    if (!checkUSDCApproval()) {
      alert(`❌ Please approve ${feeAmount} USDC spending first`);
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
      } else if (error.message?.includes('Insufficient USDC balance')) {
        alert('❌ Insufficient USDC balance');
      } else if (error.message?.includes('Insufficient USDC allowance')) {
        alert('❌ Please approve USDC spending first');
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

  const ModalContent = () => {
    if (!isOpen) return null;

    if (txHash && !isConfirmed) {
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-blue-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Sending GM... ⚡</h2>
            <p className="text-gray-400 mb-4">Processing transaction...</p>
            
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
      return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-gray-800 border-2 border-green-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">GM Sent Successfully!</h2>
            <p className="text-gray-400 mb-4">
              Transaction completed successfully
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 font-semibold">
                ✅ Transaction confirmed!<br/>
                🔥 Your streak is now: {userStats ? userStats.currentStreak + 1 : 1} days<br/>
                ⚡ Longer streak = bigger rewards!
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

    const hasSufficientBalance = parseFloat(usdcBalance) >= parseFloat(feeAmount);
    const isApproved = checkUSDCApproval();
    const canSendGM = userStats?.canSendNow && hasSufficientBalance && isApproved;

    console.log('Modal render:', {
      hasSufficientBalance,
      isApproved,
      canSendGM,
      usdcBalance,
      feeAmount,
      usdcAllowance,
      userStatsCanSendNow: userStats?.canSendNow
    });

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-blue-500/40 rounded-2xl p-6 max-w-md w-full mx-auto ${
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
                <div className="grid grid-cols-3 gap-4 text-center mb-6">
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
                
                <div className="text-center text-sm">
                  <div className="text-gray-300">
                    <div className="font-semibold">Last GM:</div>
                    <div>{formatDate(userStats.lastGMTimestamp)}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-blue-400">Daily GM</div>
                <div className="text-sm text-blue-300">Send your daily GM</div>
              </div>
              
              {userStats && !userStats.canSendNow && userStats.timeRemaining > 0 && (
                <div className="text-center mt-3 pt-3 border-t border-blue-500/20">
                  <div className="text-orange-400 text-sm">
                    ⏰ Next GM available in: {formatTime(userStats.timeRemaining)}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
              <div className="text-center mb-3">
                <div className={`text-lg font-bold ${hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>
                  Balance: {usdcBalance} USDC
                </div>
                <div className={`text-sm ${isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                  Allowance: {usdcAllowance} USDC {isApproved ? '✅' : '❌'}
                </div>
              </div>
              
              {!isApproved && (
                <button
                  onClick={handleApproveUSDC}
                  disabled={isApproving || !hasSufficientBalance}
                  className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                    hasSufficientBalance
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 active:scale-95'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isApproving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </span>
                  ) : (
                    `Approve ${feeAmount} USDC`
                  )}
                </button>
              )}
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-purple-500/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📝</span>
                  <span className="font-semibold text-purple-400">How Daily GM Works</span>
                </div>
                <div className="transform transition-transform duration-300">
                  <svg
                    className={`w-5 h-5 text-purple-400 ${showHowItWorks ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showHowItWorks && (
                <div className="px-4 pb-3 border-t border-purple-500/20 pt-2">
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Send your daily GM to keep your streak alive</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Streak continues if you GM within 24h window</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Miss 24h? Your streak resets to 1</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Longer streak = bigger rewards!</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleSendGM}
              disabled={!canSendGM || isSending || isConfirming}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                canSendGM
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 active:scale-95' 
                  : 'bg-gray-600 cursor-not-allowed'
              } ${isSending || isConfirming ? 'opacity-50' : ''}`}
            >
              {isSending || isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing GM...
                </span>
              ) : canSendGM ? (
                <span className="flex items-center justify-center gap-2">
                  <span>🌅</span>
                  Send Daily GM
                </span>
              ) : !userStats?.canSendNow ? (
                <span className="flex items-center justify-center gap-2">
                  <span>⏰</span>
                  Come Back in {formatTime(userStats?.timeRemaining || 0)}
                </span>
              ) : !hasSufficientBalance ? (
                <span className="flex items-center justify-center gap-2">
                  <span>💰</span>
                  Need {feeAmount} USDC
                </span>
              ) : !isApproved ? (
                <span className="flex items-center justify-center gap-2">
                  <span>🔓</span>
                  Approve USDC First
                </span>
              ) : (
                'Send GM'
              )}
            </button>

            <div className="text-center">
              <div className="text-xs text-gray-400">
                <p>Streaks are recorded on-chain • Contract: 0x2201...D9Ca</p>
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

export default DailyGMBase;