import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useNetwork } from '../../hooks/useNetwork';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, NETWORK_CONFIG } from '../../utils/constants';

const SendHCModal = ({ user, onClose, isMobile = false }) => {
  const [sendAmount, setSendAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [currentStep, setCurrentStep] = useState('input');
  
  const { address } = useAccount();
  const { writeContractAsync, isPending: isSendingHC } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const { currentNetwork, isCelo, isBase, tokenSymbol, networkConfig } = useNetwork();

  const HUB_TOKEN_ADDRESS_BASE = "0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E";

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

  const presetAmounts = ['1', '5', '10', '50'];

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
        contractAddress = HUB_TOKEN_ADDRESS_BASE;
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
    return `${networkConfig.explorer}/tx/${txHash}`;
  };

  const getExplorerName = () => {
    return isCelo ? 'CeloScan' : 'BaseScan';
  };

  if (currentStep === 'confirming') {
    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className={`bg-gray-800 border-2 border-cyan-500/40 text-center w-full ${
          isMobile 
            ? 'rounded-xl p-4 max-w-xs' 
            : 'rounded-2xl p-8 max-w-md'
        }`}>
          <div className={`animate-spin rounded-full border-b-2 border-cyan-500 mx-auto mb-3 ${
            isMobile ? 'h-10 w-10' : 'h-16 w-16 mb-4'
          }`}></div>
          <h2 className={`font-bold text-cyan-400 mb-2 ${
            isMobile ? 'text-lg' : 'text-2xl'
          }`}>{`Sending ${tokenSymbol} Tokens ⏳`}</h2>
          <p className={`text-gray-400 mb-3 ${
            isMobile ? 'text-xs' : 'mb-4'
          }`}>{`Transaction has been sent to the ${networkConfig.name} network...`}</p>
          
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
            <div className="bg-cyan-500 h-1.5 rounded-full animate-pulse"></div>
          </div>
          
          {txHash && (
            <div className={`bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-2 mb-3 ${
              isMobile ? 'p-2' : 'p-3 mb-4'
            }`}>
              <p className={`text-cyan-300 break-all ${
                isMobile ? 'text-[10px]' : 'text-xs'
              }`}>
                <strong>TX Hash:</strong> {txHash.slice(0, 12)}...{txHash.slice(-8)}
              </p>
              <a 
                href={getExplorerUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-cyan-400 hover:text-cyan-300 underline ${
                  isMobile ? 'text-[10px]' : 'text-xs'
                }`}
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
    return (
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] ${
        isMobile ? 'p-2' : 'p-4'
      }`}>
        <div className={`bg-gray-800 border-2 border-cyan-500/40 text-center w-full ${
          isMobile 
            ? 'rounded-xl p-4 max-w-xs' 
            : 'rounded-2xl p-8 max-w-md'
        }`}>
          <div className={`mb-3 ${
            isMobile ? 'text-4xl' : 'text-6xl mb-4'
          }`}>🎉</div>
          <h2 className={`font-bold text-cyan-400 mb-2 ${
            isMobile ? 'text-lg' : 'text-2xl'
          }`}>{`${tokenSymbol} Sent Successfully!`}</h2>
          <p className={`text-gray-400 mb-3 ${
            isMobile ? 'text-xs' : 'mb-4'
          }`}>
            You sent {sendAmount} {tokenSymbol} to <strong>{user.nickname}</strong>
          </p>
          <div className={`bg-green-500/10 border border-green-500/30 rounded-lg p-3 ${
            isMobile ? 'p-3 mb-4' : 'p-4 mb-6'
          }`}>
            <p className={`text-green-300 font-semibold ${
              isMobile ? 'text-xs' : ''
            }`}>
              ✅ Transaction confirmed!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] ${
      isMobile ? 'p-2' : 'p-4'
    }`}>
      <div className={`bg-gray-800 border-2 border-cyan-500/40 w-full ${
        isMobile 
          ? 'rounded-xl p-3 max-w-xs' 
          : 'rounded-2xl max-w-md w-full p-6'
      }`}>
        <div className={`flex items-center justify-between ${
          isMobile ? 'mb-4' : 'mb-6'
        }`}>
          <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
            isMobile ? 'text-lg' : 'text-2xl'
          }`}>
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

        <div className={`bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center ${
          isMobile ? 'p-3 mb-4' : 'p-4 mb-6'
        }`}>
          <p className={`text-cyan-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Sending to: <strong>{user.nickname}</strong>
          </p>
          <p className={`text-cyan-400 mt-0.5 ${
            isMobile ? 'text-[10px]' : 'text-xs mt-1'
          }`}>
            {user.walletAddress?.slice(0, 8)}...{user.walletAddress?.slice(-6)}
          </p>
          <p className={`text-cyan-300 mt-1 ${
            isMobile ? 'text-[10px]' : 'text-xs mt-2'
          }`}>
            Network: {networkConfig.name}
          </p>
        </div>

        <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
          <h3 className={`text-cyan-400 font-semibold mb-2 text-center ${
            isMobile ? 'text-sm' : 'mb-3'
          }`}>Select amount:</h3>
          <div className={`grid grid-cols-2 gap-2 mb-3 ${
            isMobile ? 'gap-2 mb-3' : 'gap-3 mb-4'
          }`}>
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className={`font-semibold transition-all border ${
                  sendAmount === amount
                    ? 'bg-cyan-500 text-white border-cyan-500'
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
            <label className={`block text-cyan-400 font-medium mb-1.5 text-center ${
              isMobile ? 'text-xs' : 'text-sm mb-2'
            }`}>
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
                className={`w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                  isMobile 
                    ? 'rounded-lg px-3 py-2 text-sm' 
                    : 'rounded-xl px-4 py-3'
                }`}
              />
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-medium ${
                isMobile ? 'text-xs' : ''
              }`}>
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
            className={`flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 ${
              isMobile 
                ? 'py-2 rounded-lg text-xs' 
                : 'py-3 rounded-xl'
            }`}
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