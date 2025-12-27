import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts } from "wagmi";
import ReactDOM from 'react-dom';
import { parseUnits } from 'viem';

const GM_CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newStreak","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"totalGMs","type":"uint256"}],"name":"GMSent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawn","type":"event"},{"inputs":[],"name":"GM_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MUSD_TOKEN","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PRIZE_POOL","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"canSendGM","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getMUSDBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getUserStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"},{"internalType":"bool","name":"canSendNow","type":"bool"},{"internalType":"uint256","name":"timeRemaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"sendGM","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"timeUntilNextGM","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userStats","outputs":[{"internalType":"uint256","name":"currentStreak","type":"uint256"},{"internalType":"uint256","name":"longestStreak","type":"uint256"},{"internalType":"uint256","name":"totalGMs","type":"uint256"},{"internalType":"uint256","name":"lastGMTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalSpent","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawNative","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

const GM_CONTRACT_ADDRESS = "0x4e4F31986aB5eCf851F5a5321eE83C501cd1D4a8";

// ABI dla mUSD dla approve
const MUSD_ABI = [
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

const DailyGMLinea = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const { address } = useAccount();
  const [userStats, setUserStats] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [feeAmount, setFeeAmount] = useState("0.01");
  const [musdBalance, setMusdBalance] = useState("0");
  const [musdAllowance, setMusdAllowance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [musdTokenAddress, setMusdTokenAddress] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false); // Nowy stan dla dropdownu
  
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

  // Pobierz adres mUSD tokena
  const { data: musdTokenData } = useReadContract({
    address: GM_CONTRACT_ADDRESS,
    abi: GM_CONTRACT_ABI,
    functionName: 'MUSD_TOKEN',
    enabled: isOpen,
  });

  // Pobierz opłatę
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

  // Pobierz balance i allowance mUSD
  const { data: musdData } = useReadContracts({
    contracts: [
      {
        address: musdTokenData,
        abi: MUSD_ABI,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        address: musdTokenData,
        abi: MUSD_ABI,
        functionName: 'allowance',
        args: [address, GM_CONTRACT_ADDRESS],
      },
    ],
    enabled: isOpen && !!address && !!musdTokenData,
  });

  useEffect(() => {
    if (musdTokenData) {
      setMusdTokenAddress(musdTokenData);
    }
  }, [musdTokenData]);

  useEffect(() => {
    if (feeData) {
      const feeInMUSD = Number(feeData) / 10**6; // mUSD ma 6 decimals
      setFeeAmount(feeInMUSD.toFixed(2));
    }
  }, [feeData]);

  useEffect(() => {
    if (musdData && musdData[0] && musdData[1]) {
      setMusdBalance((Number(musdData[0].result) / 10**6).toFixed(2));
      setMusdAllowance((Number(musdData[1].result) / 10**6).toFixed(2));
    }
  }, [musdData]);

  useEffect(() => {
    if (statsData) {
      const [currentStreak, longestStreak, totalGMs, lastGMTimestamp, totalSpent, canSendNow, timeRemaining] = statsData;
      setUserStats({
        currentStreak: Number(currentStreak),
        longestStreak: Number(longestStreak),
        totalGMs: Number(totalGMs),
        lastGMTimestamp: Number(lastGMTimestamp) * 1000,
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

  const checkMUSDApproval = () => {
    const requiredAllowance = parseFloat(feeAmount);
    const currentAllowance = parseFloat(musdAllowance);
    return currentAllowance >= requiredAllowance;
  };

  const handleApproveMUSD = async () => {
    if (!address || !musdTokenAddress) return;

    setIsApproving(true);
    try {
      const feeInWei = parseUnits(feeAmount, 6); // mUSD has 6 decimals
      
      const hash = await writeContractAsync({
        address: musdTokenAddress,
        abi: MUSD_ABI,
        functionName: 'approve',
        args: [GM_CONTRACT_ADDRESS, feeInWei],
      });

      if (hash) {
        // Wait for approval
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Refresh allowance
        if (musdData && musdData[1]) {
          setMusdAllowance(feeAmount);
        }
      }
    } catch (error) {
      console.error('❌ Approval failed:', error);
      alert('❌ mUSD approval failed: ' + error.message);
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

    // Check mUSD balance
    const userBalance = parseFloat(musdBalance);
    const requiredFee = parseFloat(feeAmount);
    
    if (userBalance < requiredFee) {
      alert(`❌ Insufficient mUSD balance. You need ${feeAmount} mUSD, but you have ${musdBalance} mUSD`);
      return;
    }

    // Check mUSD approval
    if (!checkMUSDApproval()) {
      alert(`❌ Please approve ${feeAmount} mUSD spending first`);
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
      } else if (error.message?.includes('Insufficient mUSD balance')) {
        alert('❌ Insufficient mUSD balance');
      } else if (error.message?.includes('Insufficient mUSD allowance')) {
        alert('❌ Please approve mUSD spending first');
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
          <div className="bg-gray-800 border-2 border-cyan-500/40 rounded-2xl text-center max-w-md w-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Sending GM... ⚡</h2>
            <p className="text-gray-400 mb-4">Processing {feeAmount} mUSD transaction to prize pool...</p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-cyan-500 h-2 rounded-full animate-pulse"></div>
            </div>
            
            {txHash && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 mb-4">
                <p className="text-cyan-300 break-all text-xs">
                  <strong>TX Hash:</strong> {txHash.slice(0, 12)}...{txHash.slice(-8)}
                </p>
                <a 
                  href={`https://lineascan.build/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline text-xs"
                >
                  🔍 Track transaction on LineaScan
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
              You sent {feeAmount} mUSD to the prize pool
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

    const hasSufficientBalance = parseFloat(musdBalance) >= parseFloat(feeAmount);
    const isApproved = checkMUSDApproval();
    const canSendGM = userStats?.canSendNow && hasSufficientBalance && isApproved;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        <div className={`bg-gray-800/90 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-6 max-w-md w-full mx-auto ${
          isMobile ? 'max-h-[90vh] overflow-y-auto' : ''
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                🌅 Daily GM - Linea Network
              </h2>
              <p className="text-gray-400 text-xs mt-1">Keep your streak alive with mUSD!</p>
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
                    <div className="text-green-400">{(parseInt(userStats.totalSpent) / 10**6).toFixed(2)} mUSD</div>
                  </div>
                </div>
              </div>
            )}

            {/* mUSD Status */}
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className={`text-lg font-bold ${hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>
                    {musdBalance} mUSD
                  </div>
                  <div className="text-xs text-gray-400">Your Balance</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${isApproved ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isApproved ? '✅ Approved' : '❌ Not Approved'}
                  </div>
                  <div className="text-xs text-gray-400">Allowance Status</div>
                </div>
              </div>
              
              {!isApproved && (
                <button
                  onClick={handleApproveMUSD}
                  disabled={isApproving || !hasSufficientBalance}
                  className={`w-full py-2 rounded-lg font-bold text-white transition-all ${
                    hasSufficientBalance
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {isApproving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </span>
                  ) : (
                    `Approve ${feeAmount} mUSD`
                  )}
                </button>
              )}
            </div>

            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4">
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-cyan-400">{feeAmount} mUSD</div>
                <div className="text-sm text-cyan-300">Daily GM Fee</div>
              </div>
              
              <div className="text-center">
                <div className="text-green-400 text-sm mb-1">
                  💰 {feeAmount} mUSD goes directly to prize pool
                </div>
                <div className="text-xs text-gray-300">
                  Pool: 0xd302...F73D6
                </div>
              </div>
              
              {userStats && !userStats.canSendNow && userStats.timeRemaining > 0 && (
                <div className="text-center mt-3 pt-3 border-t border-cyan-500/20">
                  <div className="text-orange-400 text-sm">
                    ⏰ Next GM available in: {formatTime(userStats.timeRemaining)}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible How It Works Section */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                className="w-full p-3 text-left flex items-center justify-between hover:bg-purple-500/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📝</span>
                  <span className="font-semibold text-purple-400">How Daily GM Works on Linea</span>
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
                      <span>Pay {feeAmount} mUSD to send your daily GM</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>First, approve mUSD (MetaMask USD) spending</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Then send GM to maintain your streak</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>Entire {feeAmount} mUSD goes to prize pool</span>
                    </li>
                    <li className="flex items-start gap-2 text-purple-300">
                      <span className="text-purple-400 mt-0.5">•</span>
                      <span>You pay ETH gas fee for the transaction</span>
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
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 active:scale-95' 
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
                  Send Daily GM ({feeAmount} mUSD)
                </span>
              ) : !userStats?.canSendNow ? (
                <span className="flex items-center justify-center gap-2">
                  <span>⏰</span>
                  Come Back in {formatTime(userStats?.timeRemaining || 0)}
                </span>
              ) : !hasSufficientBalance ? (
                <span className="flex items-center justify-center gap-2">
                  <span>💰</span>
                  Need {feeAmount} mUSD
                </span>
              ) : !isApproved ? (
                <span className="flex items-center justify-center gap-2">
                  <span>🔓</span>
                  Approve mUSD First
                </span>
              ) : (
                'Send GM'
              )}
            </button>

            <div className="text-center">
              <div className="text-xs text-gray-400">
                <p>Streaks are recorded on-chain • Contract: 0x4e4F...D4a8</p>
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

export default DailyGMLinea;