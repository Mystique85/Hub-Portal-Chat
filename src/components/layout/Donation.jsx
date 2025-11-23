import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ReactDOM from 'react-dom';

const DONATION_ADDRESS = '0xd30286180E142628cc437624Ea4160d5450F73D6';

const Donation = ({ isMobile = false, showButton = true, isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const presetAmounts = isMobile ? ['0.1', '0.5', '1', '5'] : ['0.1', '0.5', '1', '5', '10'];

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

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
        handleClose();
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        {currentStep === 'confirming' && (
          <div className={`bg-gray-800 border-2 border-cyan-500/40 rounded-2xl text-center ${
            isMobile ? 'max-w-xs w-full p-6' : 'max-w-md w-full p-8'
          }`}>
            <div className={`animate-spin rounded-full border-b-2 border-cyan-500 mx-auto mb-4 ${
              isMobile ? 'h-12 w-12' : 'h-16 w-16'
            }`}></div>
            <h2 className={`font-bold text-cyan-400 mb-2 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>Sending Donation ⏳</h2>
            <p className={`text-gray-400 mb-4 ${
              isMobile ? 'text-sm' : ''
            }`}>
              {isMobile ? 'Processing transaction...' : 'Transaction has been sent to the Celo network...'}
            </p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className="bg-cyan-500 h-2 rounded-full animate-pulse"></div>
            </div>
            
            {txHash && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 mb-4">
                <p className={`text-cyan-300 break-all ${
                  isMobile ? 'text-xs' : 'text-xs'
                }`}>
                  <strong>TX Hash:</strong> {isMobile ? `${txHash.slice(0, 12)}...${txHash.slice(-8)}` : txHash}
                </p>
                <a 
                  href={`https://celoscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline text-xs"
                >
                  🔍 Track transaction on CeloScan
                </a>
              </div>
            )}
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
              <p className={`text-blue-300 ${
                isMobile ? 'text-sm' : 'text-sm'
              }`}>
                ⏱️ <strong>Please wait...</strong>
                {!isMobile && <br/>}
                Confirmation may take 5-15 seconds.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className={`bg-gray-800 border-2 border-cyan-500/40 rounded-2xl text-center ${
            isMobile ? 'max-w-xs w-full p-6' : 'max-w-md w-full p-8'
          }`}>
            <div className={`mb-4 ${
              isMobile ? 'text-4xl' : 'text-6xl'
            }`}>🎉</div>
            <h2 className={`font-bold text-cyan-400 mb-2 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>Thank You!</h2>
            <p className={`text-gray-400 mb-4 ${
              isMobile ? 'text-sm' : ''
            }`}>
              {isMobile ? 'Donation sent successfully.' : 'Your donation has been successfully sent.'}
            </p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
              <p className="text-green-300 font-semibold">
                💝 Thank you for supporting the HUB Portal project!
              </p>
            </div>
            {!isMobile && (
              <p className="text-gray-500 text-sm">
                Window will close automatically...
              </p>
            )}
          </div>
        )}

        {currentStep === 'select' && (
          <div className={`bg-gray-800 border-2 border-cyan-500/40 rounded-2xl ${
            isMobile ? 'p-4 w-full max-w-xs' : 'p-6 w-full max-w-md'
          }`}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
                isMobile ? 'text-lg' : 'text-2xl'
              }`}>
                {isMobile ? 'Support 💝' : 'Support the Project 💝'}
              </h2>
              <button
                onClick={handleClose}
                className={`text-gray-400 hover:text-white font-bold leading-none ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}
              >
                ×
              </button>
            </div>

            <div className={isMobile ? 'mb-4' : 'mb-6'}>
              <p className={`text-gray-400 text-center ${
                isMobile ? 'text-xs mb-3' : 'mb-4'
              }`}>
                {isMobile ? 'Support HUB Ecosystem development!' : 'Your support helps develop the HUB Ecosystem and create better tools for the community!'}
              </p>
              
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
                <p className={`text-cyan-300 text-center ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  💛 {isMobile ? 'Donate in CELO' : 'All donations are sent in CELO tokens'}
                </p>
              </div>
            </div>

            <div className={isMobile ? 'mb-4' : 'mb-6'}>
              <h3 className={`text-cyan-400 font-semibold mb-3 ${
                isMobile ? 'text-sm' : ''
              }`}>Select amount:</h3>
              <div className={`grid gap-3 mb-4 ${
                isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-3 gap-3'
              }`}>
                {presetAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    onClick={() => handleAmountSelect(presetAmount)}
                    className={`py-3 rounded-xl font-semibold transition-all border-2 ${
                      amount === presetAmount
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg'
                        : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-700'
                    } ${isMobile ? 'text-xs py-2' : ''}`}
                  >
                    {presetAmount} CELO
                  </button>
                ))}
              </div>

              <div>
                <label className={`block text-cyan-400 font-medium mb-2 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {isMobile ? 'Custom amount:' : 'Or enter custom amount:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.001"
                    className={`w-full bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'
                    }`}
                  />
                  <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-medium ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    CELO
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="text-center">
                <p className={`text-blue-300 font-semibold mb-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {isMobile ? 'HUB Team:' : 'HUB Development Team Address:'}
                </p>
                <p className={`text-blue-400 font-mono break-all ${
                  isMobile ? 'text-xs' : 'text-xs'
                }`}>
                  {isMobile ? `${DONATION_ADDRESS.slice(0, 8)}...${DONATION_ADDRESS.slice(-6)}` : DONATION_ADDRESS}
                </p>
                {!isMobile && (
                  <p className="text-blue-300 text-xs mt-2">
                    Donation will be sent directly to this address
                  </p>
                )}
              </div>
            </div>

            <div className={`flex gap-3 ${isMobile ? 'gap-2' : ''}`}>
              <button
                onClick={handleClose}
                className={`flex-1 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all ${
                  isMobile ? 'py-2 text-xs' : 'py-3'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDonate}
                disabled={!address || (!amount && !customAmount) || isSending}
                className={`flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isMobile ? 'py-2 text-xs gap-1' : 'py-3'
                }`}
              >
                {isSending ? (
                  <>
                    <div className={`animate-spin rounded-full border-b-2 border-white ${
                      isMobile ? 'h-3 w-3' : 'h-4 w-4'
                    }`}></div>
                    Sending...
                  </>
                ) : (
                  <>
                    💝 {isMobile ? 'Donate' : 'Send Donation'}
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
      {showButton && !isOpen && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className={`flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg ${
            isMobile ? 'px-3 py-1.5 text-xs gap-1' : 'px-4 py-2 text-sm'
          }`}
        >
          <span className={isMobile ? 'text-sm' : 'text-sm'}>💝</span>
          <span>{isMobile ? 'Support' : 'Support Project'}</span>
        </button>
      )}

      <DonationModal />
    </>
  );
};

export default Donation;