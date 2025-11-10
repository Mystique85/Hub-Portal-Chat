import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ReactDOM from 'react-dom';

const DONATION_ADDRESS = '0xd30286180E142628cc437624Ea4160d5450F73D6';

const Donation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const presetAmounts = ['0.1', '0.5', '1', '5', '10'];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
      setAmount('');
      setCustomAmount('');
      setTxHash(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isConfirmed && txHash) {
      setCurrentStep('success');
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    }
  }, [isConfirmed, txHash]);

  const handleDonate = async () => {
    if (!address) {
      alert('Wallet address not found');
      return;
    }

    const donateAmount = customAmount || amount;
    if (!donateAmount || parseFloat(donateAmount) <= 0) {
      alert('Please select a donation amount');
      return;
    }

    try {
      setCurrentStep('confirming');
      const amountInWei = BigInt(Math.floor(parseFloat(donateAmount) * 1e18));
      
      const hash = await writeContractAsync({
        address: DONATION_ADDRESS,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            stateMutability: 'payable',
            inputs: [],
            outputs: [{ name: '', type: 'bool' }],
          }
        ],
        functionName: 'transfer',
        args: [],
        value: amountInWei,
      });
      
      if (hash) {
        setTxHash(hash);
      } else {
        throw new Error('No transaction hash received');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Error sending donation: ' + error.message);
      setCurrentStep('select');
      setTxHash(null);
    }
  };

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value);
    setAmount('');
  };

  const DonationModal = () => {
    if (!isOpen) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        {currentStep === 'confirming' && (
          <div className="bg-gray-800 border-2 border-cyan-500/40 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Sending Donation ⏳</h2>
            <p className="text-gray-400 mb-4">Transaction has been sent to the Celo network...</p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-cyan-500 h-2 rounded-full animate-pulse"></div>
            </div>
            
            {txHash && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 mb-4">
                <p className="text-cyan-300 text-xs break-all mb-2">
                  <strong>TX Hash:</strong> {txHash}
                </p>
                <a 
                  href={`https://celoscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-xs underline"
                >
                  🔍 Track transaction on CeloScan
                </a>
              </div>
            )}
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              <p className="text-blue-300 text-sm">
                ⏱️ <strong>Please wait...</strong><br/>
                Confirmation may take 5-15 seconds.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="bg-gray-800 border-2 border-cyan-500/40 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">Thank You!</h2>
            <p className="text-gray-400 mb-4">Your donation has been successfully sent.</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 font-semibold">
                💝 Thank you for supporting the HUB Portal project!
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Window will close automatically...
            </p>
          </div>
        )}

        {currentStep === 'select' && (
          <div className="bg-gray-800 border-2 border-cyan-500/40 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Support the Project 💝
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 mb-4 text-center">
                Your support helps develop the HUB Ecosystem and create better tools for the community!
              </p>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
                <p className="text-cyan-300 text-sm text-center">
                  💛 All donations are sent in CELO tokens
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-cyan-400 font-semibold mb-3">Select amount:</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {presetAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    onClick={() => handleAmountSelect(presetAmount)}
                    className={`py-3 rounded-xl font-semibold transition-all border-2 ${
                      amount === presetAmount
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-700'
                    }`}
                  >
                    {presetAmount} CELO
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-cyan-400 text-sm font-medium mb-2">
                  Or enter custom amount:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.001"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-medium">
                    CELO
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className="text-blue-300 font-semibold text-sm mb-1">
                  HUB Development Team Address:
                </p>
                <p className="text-blue-400 text-xs font-mono break-all">
                  {DONATION_ADDRESS}
                </p>
                <p className="text-blue-300 text-xs mt-2">
                  Donation will be sent directly to this address
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                disabled={!address || (!amount && !customAmount) || isSending}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    💝 Send Donation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
      >
        <span className="text-sm">💝</span>
        <span>Support Project</span>
      </button>

      <DonationModal />
    </>
  );
};

export default Donation;