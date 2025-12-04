import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { 
  CONTRACT_ADDRESSES, 
  HUB_CHAT_REWARDS_ABI,
  USDC_TOKEN_ADDRESS
} from '../../utils/constants';

const SubscriptionModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  subscriptionInfo
}) => {
  const [selectedTier, setSelectedTier] = useState('basic');
  const [prices, setPrices] = useState({ basic: 10, premium: 50 });
  const [usdcAllowance, setUsdcAllowance] = useState('0');
  const [isApproving, setIsApproving] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [approvalTxHash, setApprovalTxHash] = useState(null);
  const [purchaseTxHash, setPurchaseTxHash] = useState(null);
  
  const { writeContractAsync: approveContract } = useWriteContract();
  const { writeContractAsync: purchaseSubscription } = useWriteContract();
  
  const { isLoading: isApprovingLoading, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
  });
  
  const { isLoading: isPurchasingLoading, isSuccess: isPurchaseSuccess } = useWaitForTransactionReceipt({
    hash: purchaseTxHash,
  });

  // Odczyt cen z kontraktu
  const { data: basicPriceData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: HUB_CHAT_REWARDS_ABI,
    functionName: 'basicPriceUSDC',
    chainId: 8453,
  });

  const { data: premiumPriceData } = useReadContract({
    address: CONTRACT_ADDRESSES.base,
    abi: HUB_CHAT_REWARDS_ABI,
    functionName: 'premiumPriceUSDC',
    chainId: 8453,
  });

  // Odczyt allowance USDC
  const { data: allowanceData } = useReadContract({
    address: USDC_TOKEN_ADDRESS.base,
    abi: [
      {
        "inputs": [
          {"name": "owner", "type": "address"},
          {"name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'allowance',
    args: [currentUser?.walletAddress, CONTRACT_ADDRESSES.base],
    chainId: 8453,
  });

  useEffect(() => {
    if (basicPriceData && premiumPriceData) {
      const basicPrice = Number(basicPriceData) / 1e6; // USDC ma 6 decimal places
      const premiumPrice = Number(premiumPriceData) / 1e6;
      setPrices({ basic: basicPrice, premium: premiumPrice });
    }
  }, [basicPriceData, premiumPriceData]);

  useEffect(() => {
    if (allowanceData) {
      const allowance = Number(allowanceData) / 1e6;
      setUsdcAllowance(allowance.toString());
    }
  }, [allowanceData]);

  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproving(false);
      // Po udanej approve od razu kup subskrypcję
      handlePurchase();
    }
  }, [isApprovalSuccess]);

  useEffect(() => {
    if (isPurchaseSuccess) {
      setIsPurchasing(false);
      setTimeout(() => {
        onClose();
        // Odśwież stronę po udanym zakupie
        window.location.reload();
      }, 2000);
    }
  }, [isPurchaseSuccess]);

  const handleApprove = async () => {
    if (!currentUser || !currentUser.walletAddress) return;
    
    setIsApproving(true);
    
    const price = selectedTier === 'basic' ? prices.basic : prices.premium;
    const priceInWei = BigInt(Math.floor(price * 1e6)); // USDC ma 6 decimal places
    
    try {
      const txHash = await approveContract({
        address: USDC_TOKEN_ADDRESS.base,
        abi: [
          {
            "inputs": [
              {"name": "spender", "type": "address"},
              {"name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.base, priceInWei],
        chainId: 8453,
      });
      
      setApprovalTxHash(txHash);
    } catch (error) {
      console.error('Error approving USDC:', error);
      setIsApproving(false);
      alert('Failed to approve USDC: ' + error.message);
    }
  };

  const handlePurchase = async () => {
    if (!currentUser || !currentUser.walletAddress) return;
    
    setIsPurchasing(true);
    
    try {
      const functionName = selectedTier === 'basic' ? 'buyBasicSubscription' : 'buyPremiumSubscription';
      
      const txHash = await purchaseSubscription({
        address: CONTRACT_ADDRESSES.base,
        abi: HUB_CHAT_REWARDS_ABI,
        functionName: functionName,
        chainId: 8453,
      });
      
      setPurchaseTxHash(txHash);
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      setIsPurchasing(false);
      alert('Failed to purchase subscription: ' + error.message);
    }
  };

  const handleSubscribe = () => {
    const price = selectedTier === 'basic' ? prices.basic : prices.premium;
    const hasSufficientAllowance = parseFloat(usdcAllowance) >= price;
    
    if (hasSufficientAllowance) {
      handlePurchase();
    } else {
      handleApprove();
    }
  };

  const getTierName = (tierId) => {
    switch(tierId) {
      case 0: return 'FREE';
      case 1: return 'BASIC';
      case 2: return 'PREMIUM';
      default: return 'UNKNOWN';
    }
  };

  const formatExpiry = (expiry) => {
    if (!expiry || expiry === 0) return 'Not subscribed';
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = expiry - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (24 * 3600));
    const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
    
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours`;
    
    const minutes = Math.floor((timeLeft % 3600) / 60);
    return `${minutes} minutes`;
  };

  if (!isOpen) return null;

  const currentTier = subscriptionInfo?.tier || 0;
  const isActive = subscriptionInfo?.isActive || false;
  const expiry = subscriptionInfo?.expiry || 0;
  const isWhitelisted = subscriptionInfo?.whitelisted || false;

  // Jeśli użytkownik jest na whitelist, nie pokazuj modal
  if (isWhitelisted) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Whitelisted User
            </h3>
            <p className="text-gray-400 text-sm">
              You are on the whitelist! You have unlimited messages.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
              <div className="text-center">
                <div className="text-white font-bold text-lg">PREMIUM TIER</div>
                <div className="text-gray-300 text-sm">Unlimited Messages</div>
                <div className="text-green-400 text-xs mt-2">🎁 Free for Whitelisted Users</div>
              </div>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gray-700/40 border border-gray-600/40 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            HUB Chat Subscription
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* Current Subscription Status */}
        <div className="mb-6 p-4 bg-gray-700/30 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Current Tier:</span>
            <span className={`font-bold ${
              currentTier === 0 ? 'text-gray-400' :
              currentTier === 1 ? 'text-cyan-400' :
              'text-yellow-400'
            }`}>
              {getTierName(currentTier)}
              {isActive ? ' ✅' : ' ⏸️'}
            </span>
          </div>
          {expiry > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Expires:</span>
              <span className="text-gray-300 text-sm">{formatExpiry(expiry)}</span>
            </div>
          )}
        </div>

        {/* Tier Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* BASIC TIER */}
          <div 
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedTier === 'basic' 
                ? 'border-cyan-500 bg-cyan-500/10' 
                : 'border-gray-600 hover:border-cyan-500/50 hover:bg-gray-700/30'
            }`}
            onClick={() => setSelectedTier('basic')}
          >
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-1">BASIC</div>
              <div className="text-cyan-400 font-bold text-2xl">{prices.basic} USDC</div>
              <div className="text-gray-400 text-xs mt-2">30 days</div>
              <div className="text-gray-300 text-sm mt-3">
                • 50 messages/day<br/>
                • 1 HUB per message
              </div>
            </div>
          </div>

          {/* PREMIUM TIER */}
          <div 
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              selectedTier === 'premium' 
                ? 'border-yellow-500 bg-yellow-500/10' 
                : 'border-gray-600 hover:border-yellow-500/50 hover:bg-gray-700/30'
            }`}
            onClick={() => setSelectedTier('premium')}
          >
            <div className="text-center">
              <div className="text-white font-bold text-lg mb-1">PREMIUM</div>
              <div className="text-yellow-400 font-bold text-2xl">{prices.premium} USDC</div>
              <div className="text-gray-400 text-xs mt-2">30 days</div>
              <div className="text-gray-300 text-sm mt-3">
                • Unlimited messages<br/>
                • 1 HUB per message<br/>
                • Priority support
              </div>
            </div>
          </div>
        </div>

        {/* Current USDC Allowance */}
        {parseFloat(usdcAllowance) > 0 && (
          <div className="mb-4 p-3 bg-gray-700/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">USDC Approved:</span>
              <span className="text-green-400 text-sm font-medium">{usdcAllowance} USDC</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button 
            onClick={handleSubscribe}
            disabled={isApproving || isPurchasing || isApprovingLoading || isPurchasingLoading}
            className={`w-full py-3 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedTier === 'basic'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isApproving || isApprovingLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Approving USDC...
              </>
            ) : isPurchasing || isPurchasingLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Purchasing Subscription...
              </>
            ) : isPurchaseSuccess ? (
              <>
                <span className="text-lg">✅</span>
                Subscription Purchased!
              </>
            ) : (
              <>
                <span className="text-lg">🎫</span>
                {parseFloat(usdcAllowance) >= (selectedTier === 'basic' ? prices.basic : prices.premium)
                  ? `Subscribe Now (${selectedTier === 'basic' ? prices.basic : prices.premium} USDC)`
                  : `Approve USDC First`
                }
              </>
            )}
          </button>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-gray-700/40 border border-gray-600/40 rounded-xl text-gray-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>

        {/* Transaction Status */}
        {(isApproving || isPurchasing || isApprovingLoading || isPurchasingLoading) && (
          <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
            <div className="text-center text-gray-300 text-sm">
              {isApproving || isApprovingLoading ? 'Waiting for USDC approval...' : ''}
              {isPurchasing || isPurchasingLoading ? 'Purchasing subscription...' : ''}
              {isPurchaseSuccess ? 'Subscription purchased successfully!' : ''}
            </div>
            <div className="text-center text-gray-400 text-xs mt-2">
              Please confirm the transaction in your wallet
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;