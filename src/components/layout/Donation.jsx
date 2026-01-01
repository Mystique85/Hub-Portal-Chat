import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ReactDOM from 'react-dom';
import { useNetwork } from '../../hooks/useNetwork';

// TEN SAM ADRES DLA WSZYSTKICH SIECI
const DONATION_ADDRESS = '0xd30286180E142628cc437624Ea4160d5450F73D6';

const TOKEN_ADDRESSES = {
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC na Base
  linea: '0xaca92e438df0b2401ff60da7e4337b687a2435da', // mUSD na Linea
  soneium: '0x2CAE934a1e84F693fbb78CA5ED3B0A6893259441', // ASTR na Soneium
  arbitrum: '0x912CE59144191C1204E64559FE8253a0e49E6548' // ARB na Arbitrum
};

const DONATION_CONFIG = {
  celo: {
    symbol: 'CELO',
    decimals: 18,
    explorer: 'https://celoscan.io',
    isNative: true,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: '/Celo.logo.jpg'
  },
  base: {
    symbol: 'USDC',
    decimals: 6,
    explorer: 'https://basescan.org',
    isNative: false,
    tokenAddress: TOKEN_ADDRESSES.base,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    icon: '/Base.logo.jpg'
  },
  linea: {
    symbol: 'mUSD',
    decimals: 6,
    explorer: 'https://lineascan.build',
    isNative: false,
    tokenAddress: TOKEN_ADDRESSES.linea,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    icon: '/Linea.logo.png'
  },
  polygon: {
    symbol: 'POL',
    decimals: 18,
    explorer: 'https://polygonscan.com',
    isNative: true,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: '/Polygon.logo.jpg'
  },
  soneium: {
    symbol: 'ASTR',
    decimals: 18,
    explorer: 'https://soneium.blockscout.com',
    isNative: false,
    tokenAddress: TOKEN_ADDRESSES.soneium,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    icon: '/Soneium.logo.jpg'
  },
  arbitrum: {
    symbol: 'ARB',
    decimals: 18,
    explorer: 'https://arbiscan.io',
    isNative: false,
    tokenAddress: TOKEN_ADDRESSES.arbitrum,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: '/Arbitrum.logo.jpg'
  }
};

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

const Donation = ({ isMobile = false, showButton = true, isOpen: externalIsOpen, onClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const { address } = useAccount();
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');

  const { currentNetwork, isCelo, isBase, isLinea, isPolygon, isSoneium, isArbitrum, networkConfig } = useNetwork();

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const donationConfig = DONATION_CONFIG[currentNetwork] || DONATION_CONFIG.celo;

  const getPresetAmounts = () => {
    if (isMobile) {
      if (isCelo) return ['0.1', '0.5', '1', '5'];
      if (isBase) return ['1', '5', '10', '20'];
      if (isLinea) return ['1', '5', '10', '20'];
      if (isPolygon) return ['0.1', '0.5', '1', '5'];
      if (isSoneium) return ['1', '5', '10', '20'];
      if (isArbitrum) return ['0.5', '1', '5', '10']; // ARB preset dla Arbitrum
      return ['0.1', '0.5', '1', '5'];
    } else {
      if (isCelo) return ['0.1', '0.5', '1', '5', '10'];
      if (isBase) return ['1', '5', '10', '20', '50'];
      if (isLinea) return ['1', '5', '10', '20', '50'];
      if (isPolygon) return ['0.1', '0.5', '1', '5', '10'];
      if (isSoneium) return ['1', '5', '10', '20', '50'];
      if (isArbitrum) return ['0.5', '1', '5', '10', '20']; // ARB preset dla Arbitrum
      return ['0.1', '0.5', '1', '5', '10'];
    }
  };

  const presetAmounts = getPresetAmounts();

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
      
      const decimals = donationConfig.decimals;
      const amountInWei = BigInt(Math.floor(parseFloat(donateAmount) * 10 ** decimals));
      
      let hash;

      if (donationConfig.isNative) {
        // Dla native tokenów (CELO, POL) - prosty transfer
        hash = await writeContractAsync({
          address: DONATION_ADDRESS,
          abi: [{
            name: 'transfer',
            type: 'function',
            stateMutability: 'payable',
            inputs: [],
            outputs: [{ name: '', type: 'bool' }],
          }],
          functionName: 'transfer',
          args: [],
          value: amountInWei,
        });
      } else {
        // Dla ERC20 tokenów (USDC/mUSD/ASTR/ARB) - użyj funkcji transfer
        hash = await writeContractAsync({
          address: donationConfig.tokenAddress,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [DONATION_ADDRESS, amountInWei],
        });
      }
      
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

  const getDonationTokenText = () => {
    if (isCelo) return 'Donate in CELO';
    if (isBase) return 'Donate in USDC';
    if (isLinea) return 'Donate in mUSD';
    if (isPolygon) return 'Donate in POL';
    if (isSoneium) return 'Donate in ASTR';
    if (isArbitrum) return 'Donate in ARB';
    return 'Donate';
  };

  const getExplorerUrl = () => {
    return `${donationConfig.explorer}/tx/${txHash}`;
  };

  const getExplorerName = () => {
    if (isCelo) return 'CeloScan';
    if (isBase) return 'BaseScan';
    if (isLinea) return 'LineaScan';
    if (isPolygon) return 'PolygonScan';
    if (isSoneium) return 'Soneium Explorer';
    if (isArbitrum) return 'Arbitrum Explorer';
    return 'Explorer';
  };

  const getTokenInfo = () => {
    if (isCelo) return 'CELO is the native token of Celo network';
    if (isBase) return 'USDC is the stablecoin on Base network';
    if (isLinea) return 'mUSD is the stablecoin on Linea network';
    if (isPolygon) return 'POL (MATIC) is the native token of Polygon network';
    if (isSoneium) return 'ASTR is the native token of Soneium network';
    if (isArbitrum) return 'ARB is the governance token of Arbitrum network';
    return '';
  };

  const getNetworkEmoji = () => {
    if (isCelo) return '📱';
    if (isBase) return '🌉';
    if (isLinea) return '🚀';
    if (isPolygon) return '🔶';
    if (isSoneium) return '🌟';
    if (isArbitrum) return '🔵';
    return '💝';
  };

  const DonationModal = () => {
    if (!isOpen) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
        {currentStep === 'confirming' && (
          <div className={`${donationConfig.bgColor} border-2 ${donationConfig.borderColor} rounded-2xl text-center ${
            isMobile ? 'max-w-xs w-full p-6' : 'max-w-md w-full p-8'
          }`}>
            <div className={`animate-spin rounded-full border-b-2 ${donationConfig.color} mx-auto mb-4 ${
              isMobile ? 'h-12 w-12' : 'h-16 w-16'
            }`}></div>
            <h2 className={`font-bold ${donationConfig.color} mb-2 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>{`Sending Donation ⏳`}</h2>
            <p className={`text-gray-400 mb-4 ${
              isMobile ? 'text-sm' : ''
            }`}>
              {isMobile ? 'Processing transaction...' : `Transaction has been sent to the ${networkConfig.name} network...`}
            </p>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <div className={`${donationConfig.color.replace('text-', 'bg-')} h-2 rounded-full animate-pulse`}></div>
            </div>
            
            {txHash && (
              <div className={`${donationConfig.bgColor} border ${donationConfig.borderColor} rounded-xl p-3 mb-4`}>
                <p className={`${donationConfig.color} break-all ${
                  isMobile ? 'text-xs' : 'text-xs'
                }`}>
                  <strong>TX Hash:</strong> {isMobile ? `${txHash.slice(0, 12)}...${txHash.slice(-8)}` : txHash}
                </p>
                <a 
                  href={getExplorerUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${donationConfig.color} hover:opacity-80 underline text-xs`}
                >
                  🔍 {`Track transaction on ${getExplorerName()}`}
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
          <div className={`${donationConfig.bgColor} border-2 ${donationConfig.borderColor} rounded-2xl text-center ${
            isMobile ? 'max-w-xs w-full p-6' : 'max-w-md w-full p-8'
          }`}>
            <div className={`mb-4 ${
              isMobile ? 'text-4xl' : 'text-6xl'
            }`}>🎉</div>
            <h2 className={`font-bold ${donationConfig.color} mb-2 ${
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
          <div className={`bg-gray-800 border-2 ${donationConfig.borderColor} rounded-2xl ${
            isMobile ? 'p-4 w-full max-w-xs' : 'p-6 w-full max-w-md'
          }`}>
            <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-${isMobile ? '5' : '6'} h-${isMobile ? '5' : '6'} flex items-center justify-center`}>
                  <img 
                    src={donationConfig.icon}
                    alt={networkConfig.name}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="${donationConfig.color} ${
                        isMobile ? 'text-lg' : 'text-xl'
                      }">${getNetworkEmoji()}</span>`;
                    }}
                  />
                </div>
                <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
                  isMobile ? 'text-lg' : 'text-2xl'
                }`}>
                  {isMobile ? 'Support 💝' : 'Support the Project 💝'}
                </h2>
              </div>
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
              
              <div className={`${donationConfig.bgColor} border ${donationConfig.borderColor} rounded-xl p-4 mb-4`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img 
                      src={donationConfig.icon}
                      alt={donationConfig.symbol}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="${donationConfig.color} text-sm">${getNetworkEmoji()}</span>`;
                      }}
                    />
                  </div>
                  <p className={`${donationConfig.color} text-center ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    💛 {getDonationTokenText()}
                  </p>
                </div>
                <p className={`${donationConfig.color} text-center text-xs mt-1`}>
                  Network: {networkConfig.name}
                </p>
                <p className="text-cyan-300 text-center text-xs mt-1">
                  {getTokenInfo()}
                </p>
              </div>
            </div>

            <div className={isMobile ? 'mb-4' : 'mb-6'}>
              <h3 className={`${donationConfig.color} font-semibold mb-3 ${
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
                        ? `${donationConfig.color.replace('text-', 'bg-')} text-white ${donationConfig.borderColor} shadow-lg`
                        : 'bg-gray-700/50 text-gray-300 border-gray-600/50 hover:bg-gray-700'
                    } ${isMobile ? 'text-xs py-2' : ''}`}
                  >
                    {presetAmount} {donationConfig.symbol}
                  </button>
                ))}
              </div>

              <div>
                <label className={`block ${donationConfig.color} font-medium mb-2 ${
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
                    className={`w-full bg-gray-700/50 border ${donationConfig.borderColor} rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${donationConfig.color.replace('text-', 'focus:ring-')} focus:border-transparent ${
                      isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-3'
                    }`}
                  />
                  <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${donationConfig.color} font-medium ${
                    isMobile ? 'text-xs' : ''
                  }`}>
                    {donationConfig.symbol}
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