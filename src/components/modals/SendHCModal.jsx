import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useNetwork } from '../../hooks/useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, NETWORK_CONFIG, HUB_TOKEN_ADDRESS } from '../../utils/constants';

const SendHCModal = ({ user, onClose, isMobile = false }) => {
  const [sendAmount, setSendAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [currentStep, setCurrentStep] = useState('input');
  
  const { address } = useAccount();
  const { writeContractAsync, isPending: isSendingHC } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { currentNetwork, isCelo, isBase, isLinea, isPolygon, isSoneium, isArbitrum, tokenSymbol, networkConfig } = useNetwork();

  const ERC20_ABI = [
    {
      "constant": false,
      "inputs": [
        {"name": "_to", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    }
  ];

  // Preset amounts dla różnych sieci
  const getPresetAmounts = () => {
    if (isCelo) return ['1', '5', '10', '50']; // HC
    if (isBase) return ['10', '50', '100', '500']; // HUB
    if (isLinea) return ['1', '5', '10', '50']; // LPX
    if (isPolygon) return ['1', '5', '10', '50']; // MSG
    if (isSoneium) return ['1', '5', '10', '50']; // LUM
    if (isArbitrum) return ['1', '5', '10', '50']; // ARBX
    return ['1', '5', '10', '50'];
  };

  const presetAmounts = getPresetAmounts();

  useEffect(() => {
    if (isConfirmed && txHash) {
      setCurrentStep('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [isConfirmed, txHash, onClose]);

  const handleSendHC = async () => {
    if (!address) {
      alert('Wallet address not found');
      return;
    }

    if (!user?.walletAddress) {
      alert('Recipient address not found');
      return;
    }

    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setCurrentStep('confirming');
      
      const amountInWei = BigInt(Math.floor(parseFloat(sendAmount) * 1e18));
      
      console.log(`🟢 Sending ${tokenSymbol}:`, {
        from: address,
        to: user.walletAddress,
        amount: sendAmount,
        amountInWei: amountInWei.toString(),
        network: currentNetwork
      });

      let contractAddress;
      let contractAbi;

      if (isCelo) {
        contractAddress = CONTRACT_ADDRESSES.celo;
        contractAbi = CONTRACT_ABIS.celo;
      } else if (isBase) {
        contractAddress = HUB_TOKEN_ADDRESS.base;
        contractAbi = ERC20_ABI;
      } else if (isLinea) {
        contractAddress = CONTRACT_ADDRESSES.linea;
        contractAbi = CONTRACT_ABIS.linea;
      } else if (isPolygon) {
        contractAddress = HUB_TOKEN_ADDRESS.polygon;
        contractAbi = ERC20_ABI;
      } else if (isSoneium) {
        contractAddress = '0x775AD8230648CA3E9C02687A21C69BECC54868Ad';
        contractAbi = ERC20_ABI;
      } else if (isArbitrum) {
        // Adres tokena ARBX na Arbitrum - jednocześnie kontrakt i token
        contractAddress = '0xe89F9D96f059D656d62302c30fD513C945aCcF38';
        contractAbi = ERC20_ABI;
      }

      const hash = await writeContractAsync({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'transfer',
        args: [user.walletAddress, amountInWei],
      });
      
      if (hash) {
        setTxHash(hash);
      } else {
        throw new Error('No transaction hash received');
      }
    } catch (error) {
      console.error(`Send ${tokenSymbol} error:`, error);
      alert(`Error sending ${tokenSymbol}: ` + error.message);
      setCurrentStep('input');
      setTxHash(null);
    }
  };

  const handleAmountSelect = (amount) => {
    setSendAmount(amount);
  };

  const getExplorerUrl = () => {
    if (!txHash) return '';
    return `${networkConfig.explorer}/tx/${txHash}`;
  };

  const getExplorerName = () => {
    if (isCelo) return 'CeloScan';
    if (isBase) return 'BaseScan';
    if (isLinea) return 'LineaScan';
    if (isPolygon) return 'PolygonScan';
    if (isSoneium) return 'Soneium Explorer';
    if (isArbitrum) return 'Arbiscan';
    return 'Explorer';
  };

  const getNetworkIcon = () => {
    if (isCelo) return '📱';
    if (isBase) return '🌉';
    if (isLinea) return '🚀';
    if (isPolygon) return '🔶';
    if (isSoneium) return '🌟';
    if (isArbitrum) return '⚡';
    return '🔗';
  };

  const getNetworkColor = () => {
    if (isCelo) return 'border-yellow-500/40 text-yellow-400';
    if (isBase) return 'border-blue-500/40 text-blue-400';
    if (isLinea) return 'border-cyan-500/40 text-cyan-400';
    if (isPolygon) return 'border-purple-500/40 text-purple-400';
    if (isSoneium) return 'border-pink-500/40 text-pink-400';
    if (isArbitrum) return 'border-blue-600/40 text-blue-500';
    return 'border-cyan-500/40 text-cyan-400';
  };

  const getNetworkBgColor = () => {
    if (isCelo) return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300';
    if (isBase) return 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    if (isLinea) return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    if (isPolygon) return 'bg-purple-500/10 border-purple-500/30 text-purple-300';
    if (isSoneium) return 'bg-pink-500/10 border-pink-500/30 text-pink-300';
    if (isArbitrum) return 'bg-blue-600/10 border-blue-600/30 text-blue-400';
    return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
  };

  const getNetworkGradient = () => {
    if (isCelo) return 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600';
    if (isBase) return 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600';
    if (isLinea) return 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600';
    if (isPolygon) return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600';
    if (isSoneium) return 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600';
    if (isArbitrum) return 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600';
    return 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600';
  };

  const getTextGradient = () => {
    if (isCelo) return 'bg-gradient-to-r from-yellow-400 to-amber-500';
    if (isBase) return 'bg-gradient-to-r from-blue-400 to-purple-500';
    if (isLinea) return 'bg-gradient-to-r from-cyan-400 to-blue-500';
    if (isPolygon) return 'bg-gradient-to-r from-purple-400 to-pink-500';
    if (isSoneium) return 'bg-gradient-to-r from-pink-400 to-purple-500';
    if (isArbitrum) return 'bg-gradient-to-r from-blue-400 to-cyan-500';
    return 'bg-gradient-to-r from-cyan-400 to-blue-500';
  };

  const getBorderColor = () => {
    if (isCelo) return 'border-yellow-500';
    if (isBase) return 'border-blue-500';
    if (isLinea) return 'border-cyan-500';
    if (isPolygon) return 'border-purple-500';
    if (isSoneium) return 'border-pink-500';
    if (isArbitrum) return 'border-blue-600';
    return 'border-cyan-500';
  };

  const getFocusRing = () => {
    if (isCelo) return 'focus:ring-yellow-500';
    if (isBase) return 'focus:ring-blue-500';
    if (isLinea) return 'focus:ring-cyan-500';
    if (isPolygon) return 'focus:ring-purple-500';
    if (isSoneium) return 'focus:ring-pink-500';
    if (isArbitrum) return 'focus:ring-blue-500';
    return 'focus:ring-cyan-500';
  };

  const getTextColor = () => {
    if (isCelo) return 'text-yellow-400';
    if (isBase) return 'text-blue-400';
    if (isLinea) return 'text-cyan-400';
    if (isPolygon) return 'text-purple-400';
    if (isSoneium) return 'text-pink-400';
    if (isArbitrum) return 'text-blue-500';
    return 'text-cyan-400';
  };

  if (currentStep === 'confirming') {
    const bgColor = getNetworkBgColor().split(' ')[0];
    const borderColor = getNetworkBgColor().split(' ')[1];
    const textColor = getNetworkBgColor().split(' ')[2];

    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className={`bg-gray-800 border-2 ${getNetworkColor()} text-center w-full ${
          isMobile 
            ? 'rounded-xl p-4 max-w-xs' 
            : 'rounded-2xl p-8 max-w-md'
        }`}>
          <div className={`animate-spin rounded-full border-b-2 mx-auto mb-3 ${
            isMobile ? 'h-10 w-10' : 'h-16 w-16 mb-4'
          } ${getBorderColor()}`}></div>
          <h2 className={`font-bold mb-2 ${
            isMobile ? 'text-lg' : 'text-2xl'
          } ${getTextColor()}`}>{`Sending ${tokenSymbol} Tokens ⏳`}</h2>
          <p className={`text-gray-400 mb-3 ${
            isMobile ? 'text-xs' : 'mb-4'
          }`}>{`Transaction has been sent to the ${networkConfig.name} network...`}</p>
          
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
            <div className={`h-1.5 rounded-full animate-pulse ${getBorderColor().replace('border-', 'bg-')}`}></div>
          </div>
          
          {txHash && (
            <div className={`${bgColor} ${borderColor} rounded-lg p-2 mb-3 ${
              isMobile ? 'p-2' : 'p-3 mb-4'
            }`}>
              <p className={`break-all ${
                isMobile ? 'text-[10px]' : 'text-xs'
              } ${textColor}`}>
                <strong>TX Hash:</strong> {txHash.slice(0, 12)}...{txHash.slice(-8)}
              </p>
              <a 
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${
                  isMobile ? 'text-[10px]' : 'text-xs'
                } ${getTextColor()} hover:opacity-80`}
              >
                🔍 {`Track transaction on ${getExplorerName()}`}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    const bgColor = getNetworkBgColor().split(' ')[0];
    const borderColor = getNetworkBgColor().split(' ')[1];
    const textColor = getNetworkBgColor().split(' ')[2];

    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className={`bg-gray-800 border-2 ${getNetworkColor()} text-center w-full ${
          isMobile 
            ? 'rounded-xl p-4 max-w-xs' 
            : 'rounded-2xl p-8 max-w-md'
        }`}>
          <div className={`mb-3 ${
            isMobile ? 'text-4xl' : 'text-6xl mb-4'
          }`}>🎉</div>
          <h2 className={`font-bold mb-2 ${
            isMobile ? 'text-lg' : 'text-2xl'
          } ${getTextColor()}`}>{`${tokenSymbol} Sent Successfully!`}</h2>
          <p className={`text-gray-400 mb-3 ${
            isMobile ? 'text-xs' : 'mb-4'
          }`}>
            You sent {sendAmount} {tokenSymbol} to <strong>{user.nickname}</strong>
          </p>
          <div className={`${bgColor} ${borderColor} rounded-lg p-3 ${
            isMobile ? 'p-3 mb-4' : 'p-4 mb-6'
          }`}>
            <p className={`font-semibold ${
              isMobile ? 'text-xs' : ''
            } ${textColor}`}>
              ✅ Transaction confirmed!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const infoBgColor = getNetworkBgColor().split(' ')[0];
  const infoBorderColor = getNetworkBgColor().split(' ')[1];
  const infoTextColor = getNetworkBgColor().split(' ')[2];

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] ${
      isMobile ? 'p-2' : 'p-4'
    }`}>
      <div className={`bg-gray-800 border-2 ${getNetworkColor()} w-full ${
        isMobile 
          ? 'rounded-xl p-3 max-w-xs' 
          : 'rounded-2xl max-w-md w-full p-6'
      }`}>
        <div className={`flex items-center justify-between ${
          isMobile ? 'mb-4' : 'mb-6'
        }`}>
          <h2 className={`font-bold bg-clip-text text-transparent ${
            isMobile ? 'text-lg' : 'text-2xl'
          } ${getTextGradient()}`}>
            {`Send ${tokenSymbol} Tokens`}
          </h2>
          <button
            onClick={onClose}
            className={`text-gray-400 hover:text-white font-bold leading-none ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}
          >
            ×
          </button>
        </div>

        <div className={`${infoBgColor} ${infoBorderColor} rounded-lg p-3 text-center ${
          isMobile ? 'p-3 mb-4' : 'p-4 mb-6'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className={`text-lg ${getTextColor()}`}>{getNetworkIcon()}</span>
            <p className={`font-semibold ${
              isMobile ? 'text-xs' : 'text-sm'
            } ${infoTextColor}`}>
              Sending to: <strong>{user.nickname}</strong>
            </p>
          </div>
          <p className={`mt-0.5 ${
            isMobile ? 'text-[10px]' : 'text-xs mt-1'
          } ${getTextColor()}`}>
            {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-6)}
          </p>
          <p className={`mt-1 ${
            isMobile ? 'text-[10px]' : 'text-xs mt-2'
          } ${infoTextColor}`}>
            Network: {networkConfig.name}
          </p>
        </div>

        <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
          <h3 className={`font-semibold mb-2 text-center ${
            isMobile ? 'text-sm' : 'mb-3'
          } ${getTextColor()}`}>Select amount:</h3>
          <div className={`grid grid-cols-2 gap-2 mb-3 ${
            isMobile ? 'gap-2 mb-3' : 'gap-3 mb-4'
          }`}>
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`font-semibold transition-all border ${
                  sendAmount === amount
                    ? `text-white ${getBorderColor()} ${getNetworkGradient().replace('hover:', '')}`
                    : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-700'
                } ${
                  isMobile 
                    ? 'py-2 rounded-lg text-xs' 
                    : 'py-3 rounded-xl border-2 shadow-lg'
                }`}
              >
                {amount} {tokenSymbol}
              </button>
            ))}
          </div>

          <div>
            <label className={`block font-medium mb-1.5 text-center ${
              isMobile ? 'text-xs' : 'text-sm mb-2'
            } ${getTextColor()}`}>
              Or enter custom amount:
            </label>
            <div className="relative">
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                placeholder="0.00"
                step="0.1"
                min="0.1"
                className={`w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                  isMobile 
                    ? 'rounded-lg px-3 py-2 text-sm' 
                    : 'rounded-xl px-4 py-3'
                } ${getFocusRing()}`}
              />
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 font-medium ${
                isMobile ? 'text-xs' : ''
              } ${getTextColor()}`}>
                {tokenSymbol}
              </div>
            </div>
          </div>
        </div>

        <div className={`flex gap-2 ${isMobile ? 'gap-2' : 'gap-3'}`}>
          <button 
            onClick={onClose}
            className={`flex-1 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all ${
              isMobile 
                ? 'py-2 bg-gray-700 text-xs' 
                : 'py-3 bg-gray-700 rounded-xl hover:bg-gray-600'
            }`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSendHC}
            disabled={!sendAmount || isSendingHC}
            className={`flex-1 text-white font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
              isMobile 
                ? 'py-2 rounded-lg text-xs' 
                : 'py-3 rounded-xl'
            } ${getNetworkGradient()}`}
          >
            {isSendingHC ? (
              <>
                <div className={`animate-spin rounded-full border-b-2 border-white ${
                  isMobile ? 'h-3 w-3' : 'h-4 w-4'
                }`}></div>
                Sending...
              </>
            ) : (
              `Send ${tokenSymbol}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendHCModal;