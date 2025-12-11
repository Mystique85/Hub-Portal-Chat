import React, { useState, useEffect, useCallback } from 'react';
import { useStaking } from '../../hooks/useStaking';
import { useWeb3 } from '../../hooks/useWeb3';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';

const STAKING_CONTRACT_ADDRESS = '0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB';
const HUB_TOKEN_ADDRESS = '0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E';

const StakingModal = ({ isOpen, onClose, currentUser, isMobile = false }) => {
  const [activeTab, setActiveTab] = useState('stake');
  const [selectedTier, setSelectedTier] = useState(1);
  const [selectedStakeIndex, setSelectedStakeIndex] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [allowance, setAllowance] = useState('0');
  const [approveHash, setApproveHash] = useState(null);
  const [viewStakesForTier, setViewStakesForTier] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  const { balance } = useWeb3(currentUser?.walletAddress);
  const { 
    stakingData, 
    userStakes, 
    userStakesList,
    aprs, 
    minStake,
    stakeTokens, 
    claimReward,
    claimAllRewardsForTier,
    claimPending,
    unstakeTokens, 
    fundPool,
    isPending: stakingPending,
    isConfirming: stakingConfirming,
    isSuccess: stakingSuccess,
    refetchAll,
    isBase
  } = useStaking(currentUser?.walletAddress);

  const { writeContract } = useWriteContract();

  const HUB_ABI = [
    {
      "constant": false,
      "inputs": [
        {"name": "_spender", "type": "address"},
        {"name": "_value", "type": "uint256"}
      ],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {"name": "_owner", "type": "address"},
        {"name": "_spender", "type": "address"}
      ],
      "name": "allowance",
      "outputs": [{"name": "", "type": "uint256"}],
      "type": "function"
    }
  ];

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: HUB_TOKEN_ADDRESS,
    abi: HUB_ABI,
    functionName: 'allowance',
    args: [currentUser?.walletAddress, STAKING_CONTRACT_ADDRESS],
    query: {
      enabled: !!currentUser?.walletAddress && isBase && isOpen,
      staleTime: 10000,
    }
  });

  const { 
    isLoading: isApproveConfirming, 
    isSuccess: isApproveSuccess 
  } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(`${label} copied!`);
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  useEffect(() => {
    if (allowanceData) {
      setAllowance(formatEther(allowanceData));
    }
  }, [allowanceData]);

  useEffect(() => {
    if (!isOpen) {
      setStakeAmount('');
      setFundAmount('');
      setActionMessage('');
      setActionLoading(false);
      setActiveTab('stake');
      setSelectedTier(1);
      setSelectedStakeIndex(0);
      setViewStakesForTier(null);
      setApproveHash(null);
      setCopySuccess('');
    } else if (isOpen && isBase) {
      refetchAllowance();
    }
  }, [isOpen, isBase, refetchAllowance]);

  useEffect(() => {
    if (isApproveSuccess) {
      setActionMessage('✅ Approval successful! You can now stake.');
      refetchAllowance();
      setActionLoading(false);
      setApproveHash(null);
      
      const timer = setTimeout(() => {
        setActionMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isApproveConfirming) {
      setActionMessage('⏳ Approval transaction confirming...');
    }
  }, [isApproveConfirming]);

  useEffect(() => {
    if (stakingSuccess && isOpen) {
      setActionMessage('✅ Transaction successful!');
      setActionLoading(false);
      
      const timer = setTimeout(() => {
        setActionMessage('');
        refetchAll();
        refetchAllowance();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [stakingSuccess, isOpen, refetchAll, refetchAllowance]);

  useEffect(() => {
    if (stakingConfirming && isOpen) {
      setActionMessage('⏳ Transaction confirming...');
    }
  }, [stakingConfirming, isOpen]);

  useEffect(() => {
    if (stakingPending && isOpen) {
      setActionMessage('⏳ Transaction pending...');
    }
  }, [stakingPending, isOpen]);

  if (!isOpen || !isBase) return null;

  const tiers = [
    { id: 1, name: '3 Month', apr: aprs.apr3M, duration: 3, color: 'from-cyan-500 to-blue-500' },
    { id: 2, name: '6 Month', apr: aprs.apr6M, duration: 6, color: 'from-purple-500 to-pink-500' },
    { id: 3, name: '12 Month', apr: aprs.apr12M, duration: 12, color: 'from-amber-500 to-orange-500' }
  ];

  const getUserStakeForTier = (tierId) => {
    if (!userStakes) return { staked: 0, rewards: 0, timeLeft: 0 };
    
    switch(tierId) {
      case 1: return {
        staked: userStakes.staked3M,
        rewards: userStakes.rewards3M,
        timeLeft: userStakes.timeLeft3M
      };
      case 2: return {
        staked: userStakes.staked6M,
        rewards: userStakes.rewards6M,
        timeLeft: userStakes.timeLeft6M
      };
      case 3: return {
        staked: userStakes.staked12M,
        rewards: userStakes.rewards12M,
        timeLeft: userStakes.timeLeft12M
      };
      default: return { staked: 0, rewards: 0, timeLeft: 0 };
    }
  };

  const getUserStakesByTier = (tierId) => {
    if (!userStakesList) return [];
    return userStakesList.filter(stake => stake.tierId === tierId);
  };

  const formatTimeLeft = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const approveTokens = useCallback(async (amount) => {
    if (!currentUser?.walletAddress || !isBase) {
      setActionMessage('Wallet not connected or not on Base');
      return;
    }
    
    try {
      setActionLoading(true);
      setActionMessage('⏳ Sending approval transaction...');
      
      writeContract({
        address: HUB_TOKEN_ADDRESS,
        abi: HUB_ABI,
        functionName: 'approve',
        args: [STAKING_CONTRACT_ADDRESS, parseEther(amount.toString())]
      }, {
        onSuccess: (hash) => {
          setApproveHash(hash);
          setActionMessage('✅ Approval submitted! Waiting for confirmation...');
        },
        onError: (error) => {
          setActionMessage(`❌ Approval failed: ${error.message}`);
          setActionLoading(false);
        }
      });
      
    } catch (error) {
      setActionMessage(`❌ Approval error: ${error.message}`);
      setActionLoading(false);
    }
  }, [currentUser?.walletAddress, isBase, writeContract]);

  const handleStake = useCallback(async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setActionMessage('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(stakeAmount) < parseFloat(minStake)) {
      setActionMessage(`Minimum stake is ${minStake} HUB`);
      return;
    }
    
    if (parseFloat(stakeAmount) > parseFloat(balance)) {
      setActionMessage('Insufficient balance');
      return;
    }
    
    if (parseFloat(allowance) < parseFloat(stakeAmount)) {
      setActionMessage(`Need to approve ${stakeAmount} HUB first`);
      return;
    }
    
    setActionLoading(true);
    setActionMessage('⏳ Sending staking transaction...');
    
    try {
      await stakeTokens(stakeAmount, selectedTier);
    } catch (error) {
      setActionMessage(`❌ Staking failed: ${error.message}`);
      setActionLoading(false);
    }
  }, [stakeAmount, minStake, balance, allowance, stakeTokens, selectedTier]);

  const handleClaimSingle = useCallback(async (stakeIndex, tierId) => {
    const stake = userStakesList?.find(s => s.index === stakeIndex && s.tierId === tierId);
    if (!stake || parseFloat(stake.currentReward) <= 0) {
      setActionMessage('No rewards to claim for this stake');
      return;
    }
    
    setActionLoading(true);
    setActionMessage('⏳ Sending claim transaction...');
    
    try {
      await claimReward(stakeIndex, tierId);
    } catch (error) {
      setActionMessage(`❌ Claim failed: ${error.message}`);
      setActionLoading(false);
    }
  }, [claimReward, userStakesList]);

  const handleClaimAllForTier = useCallback(async (tierId) => {
    const tierStakes = getUserStakesByTier(tierId);
    const hasRewards = tierStakes.some(stake => parseFloat(stake.currentReward) > 0);
    
    if (!hasRewards) {
      setActionMessage('No rewards to claim for this tier');
      return;
    }
    
    setActionLoading(true);
    setActionMessage('⏳ Claiming all rewards for this tier...');
    
    try {
      await claimAllRewardsForTier(tierId);
    } catch (error) {
      setActionMessage(`❌ Claim all failed: ${error.message}`);
      setActionLoading(false);
    }
  }, [claimAllRewardsForTier]);

  const handleClaimPending = useCallback(async (tierId) => {
    setActionLoading(true);
    setActionMessage('⏳ Claiming pending rewards...');
    
    try {
      await claimPending(tierId);
    } catch (error) {
      setActionMessage(`❌ Claim pending failed: ${error.message}`);
      setActionLoading(false);
    }
  }, [claimPending]);

  const handleUnstake = useCallback(async (stakeIndex, tierId) => {
    const stake = userStakesList?.find(s => s.index === stakeIndex && s.tierId === tierId);
    if (!stake || !stake.active) {
      setActionMessage('No active stake found');
      return;
    }
    
    if (stake.timeLeft > 0) {
      setActionMessage('Stake is still locked');
      return;
    }
    
    setActionLoading(true);
    setActionMessage('⏳ Sending unstaking transaction...');
    
    try {
      await unstakeTokens(stakeIndex, tierId);
    } catch (error) {
      setActionMessage(`❌ Unstake failed: ${error.message}`);
      setActionLoading(false);
    }
  }, [unstakeTokens, userStakesList]);

  const handleFundPool = useCallback(async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setActionMessage('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(fundAmount) > parseFloat(balance)) {
      setActionMessage('Insufficient balance');
      return;
    }
    
    if (parseFloat(allowance) < parseFloat(fundAmount)) {
      setActionMessage(`Need to approve ${fundAmount} HUB first. Use "Approve" button.`);
      return;
    }
    
    setActionLoading(true);
    setActionMessage('⏳ Sending funding transaction...');
    
    try {
      await fundPool(fundAmount);
    } catch (error) {
      setActionMessage(`❌ Funding failed: ${error.message || 'Unknown error'}`);
      setActionLoading(false);
    }
  }, [fundAmount, balance, allowance, fundPool]);

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    const n = parseFloat(num);
    
    // Dodajemy obsługę miliardów (B)
    if (n >= 1000000000) return (n / 1000000000).toFixed(2) + 'B';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    
    // Dla małych liczb z długimi miejscami dziesiętnymi
    if (n.toString().includes('.') && n.toString().split('.')[1].length > 4) {
      return n.toFixed(4);
    }
    
    return n.toString();
  };

  const isAnyTransactionProcessing = actionLoading || stakingPending || stakingConfirming || isApproveConfirming;

  const renderTierStakes = (tierId) => {
    const tierStakes = getUserStakesByTier(tierId);
    if (tierStakes.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          No active stakes in this tier
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {tierStakes.map((stake) => (
          <div key={stake.index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-white font-medium">Stake #{stake.index + 1}</div>
                <div className="text-gray-400 text-sm">
                  Started: {formatDate(stake.start)}
                </div>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                stake.active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {stake.active ? 'Active' : 'Completed'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-gray-400 text-sm">Amount</div>
                <div className="text-white font-medium">{formatNumber(stake.amount)} HUB</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Rewards</div>
                <div className="text-green-400 font-medium">{formatNumber(stake.currentReward)} HUB</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">End Date</div>
                <div className="text-white">{formatDate(stake.finish)}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Time Left</div>
                <div className="text-cyan-300">{formatTimeLeft(stake.timeLeft)}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {stake.active && parseFloat(stake.currentReward) > 0 && (
                <button
                  onClick={() => handleClaimSingle(stake.index, stake.tierId)}
                  disabled={isAnyTransactionProcessing}
                  className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Claim Rewards
                </button>
              )}
              {stake.active && stake.timeLeft === 0 && (
                <button
                  onClick={() => handleUnstake(stake.index, stake.tierId)}
                  disabled={isAnyTransactionProcessing}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Unstake
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] ${
      isMobile ? 'p-2' : 'p-4'
    }`}>
      <div className={`bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 w-full ${
        isMobile 
          ? 'rounded-xl p-3 max-w-md' 
          : 'rounded-3xl p-6 max-w-4xl'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <h2 className={`font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                HUB Staking Multi-Tier
              </h2>
              <p className="text-gray-400 text-sm">Stake your HUB tokens and earn rewards</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            disabled={isAnyTransactionProcessing}
          >
            ×
          </button>
        </div>

        <div className="flex mb-6 border-b border-gray-700">
          <button
            className={`flex-1 py-2 font-medium ${activeTab === 'stake' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('stake')}
            disabled={isAnyTransactionProcessing}
          >
            Stake HUB
          </button>
          <button
            className={`flex-1 py-2 font-medium ${activeTab === 'fund' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('fund')}
            disabled={isAnyTransactionProcessing}
          >
            Fund Pool
          </button>
          <button
            className={`flex-1 py-2 font-medium ${activeTab === 'info' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('info')}
            disabled={isAnyTransactionProcessing}
          >
            Pool Info
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto pr-2">
          {activeTab === 'stake' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-white font-semibold">Select Staking Tier</h3>
                  {viewStakesForTier !== null && (
                    <button
                      onClick={() => setViewStakesForTier(null)}
                      className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                      ← Back to Tiers
                    </button>
                  )}
                </div>
                
                {viewStakesForTier === null ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tiers.map(tier => {
                      const userStake = getUserStakeForTier(tier.id);
                      const tierStakes = getUserStakesByTier(tier.id);
                      const isActive = tierStakes.length > 0;
                      
                      return (
                        <div 
                          key={tier.id}
                          className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${
                            selectedTier === tier.id 
                              ? `border-cyan-500 bg-gradient-to-br ${tier.color}/10` 
                              : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                          } ${isActive ? 'ring-2 ring-green-500/30' : ''}`}
                          onClick={() => !isAnyTransactionProcessing && setSelectedTier(tier.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-white font-bold text-lg">{tier.name}</div>
                              <div className={`text-lg font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                                {tier.apr}% APR
                              </div>
                            </div>
                            {isActive && (
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                {tierStakes.length} stake{tierStakes.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Staked:</span>
                              <span className="text-white font-medium">
                                {formatNumber(userStake.staked)} HUB
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Total Rewards:</span>
                              <span className="text-green-400 font-medium">
                                {formatNumber(userStake.rewards)} HUB
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Max Time Left:</span>
                              <span className="text-cyan-300">
                                {formatTimeLeft(userStake.timeLeft)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewStakesForTier(tier.id);
                              }}
                              disabled={isAnyTransactionProcessing}
                              className={`flex-1 py-1.5 text-white text-xs rounded-lg ${
                                tierStakes.length > 0 
                                  ? 'bg-gray-700 hover:bg-gray-600' 
                                  : 'bg-gray-800/50 hover:bg-gray-700/50'
                              } disabled:opacity-50`}
                            >
                              {tierStakes.length > 0 
                                ? `View Stakes (${tierStakes.length})`
                                : 'View Stakes (0)'
                              }
                            </button>
                            
                            {tierStakes.length > 0 && parseFloat(userStake.rewards) > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClaimAllForTier(tier.id);
                                }}
                                disabled={isAnyTransactionProcessing}
                                className="flex-1 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-lg hover:opacity-90 disabled:opacity-50"
                              >
                                Claim All
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                      <h3 className="text-white font-semibold mb-2">
                        {tiers.find(t => t.id === viewStakesForTier)?.name} Tier Stakes
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Manage your individual stakes in this tier. You can claim rewards from specific stakes or unstake when the lock period ends.
                      </p>
                    </div>
                    
                    {renderTierStakes(viewStakesForTier)}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaimPending(viewStakesForTier)}
                        disabled={isAnyTransactionProcessing}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                      >
                        Claim Pending Rewards
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {viewStakesForTier === null && (
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">
                    Stake in {tiers.find(t => t.id === selectedTier)?.name} Tier
                  </h3>
                  
                  <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Approved:</span>
                      <span className={`font-medium ${
                        parseFloat(allowance) >= parseFloat(stakeAmount || 0) ? 'text-green-400' : 'text-amber-400'
                      }`}>
                        {formatNumber(allowance)} HUB
                      </span>
                    </div>
                    {parseFloat(allowance) < parseFloat(stakeAmount || 0) && (
                      <div className="mt-1 text-xs text-amber-400">
                        Need to approve {stakeAmount} HUB first
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-gray-400 text-sm mb-1 block">Amount to Stake (HUB)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => !isAnyTransactionProcessing && setStakeAmount(e.target.value)}
                        placeholder={`Minimum ${minStake} HUB`}
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                        step="0.1"
                        min={minStake}
                        disabled={isAnyTransactionProcessing}
                      />
                      <button
                        onClick={() => !isAnyTransactionProcessing && setStakeAmount(balance)}
                        className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                        disabled={isAnyTransactionProcessing}
                      >
                        Max
                      </button>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Your balance: {formatNumber(balance)} HUB
                    </div>
                  </div>
                  
                  <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">APR:</span>
                      <span className="text-cyan-400 font-bold">
                        {tiers.find(t => t.id === selectedTier)?.apr}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">
                        {tiers.find(t => t.id === selectedTier)?.duration} months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated Monthly:</span>
                      <span className="text-green-400">
                        {stakeAmount && parseFloat(stakeAmount) > 0 
                          ? `${((parseFloat(stakeAmount) * (tiers.find(t => t.id === selectedTier)?.apr || 0)) / 1200).toFixed(2)} HUB`
                          : '0 HUB'}
                      </span>
                    </div>
                  </div>
                  
                  {parseFloat(allowance) < parseFloat(stakeAmount || 0) && stakeAmount && parseFloat(stakeAmount) > 0 && (
                    <button
                      onClick={() => approveTokens(stakeAmount)}
                      disabled={isAnyTransactionProcessing}
                      className="w-full mb-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                    >
                      {isAnyTransactionProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        `🔓 Approve ${stakeAmount} HUB`
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={handleStake}
                    disabled={isAnyTransactionProcessing || parseFloat(stakeAmount) < parseFloat(minStake) || parseFloat(allowance) < parseFloat(stakeAmount || 0)}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50"
                  >
                    {isAnyTransactionProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      `Stake ${stakeAmount || 0} HUB`
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fund' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                <h3 className="text-cyan-400 font-bold mb-2">💡 Fund the Reward Pool</h3>
                <p className="text-gray-300 text-sm">
                  You can contribute HUB tokens to the pool, from which rewards are distributed to stakers.
                  This is 100% a support action — it does not generate any profits or returns for you.
                  All contributed tokens go directly to the stakers.
                </p>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <div className="mb-3 p-2 bg-gray-800/50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Approved:</span>
                    <span className={`font-medium ${
                      parseFloat(allowance) >= parseFloat(fundAmount || 0) ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {formatNumber(allowance)} HUB
                    </span>
                  </div>
                  {parseFloat(allowance) < parseFloat(fundAmount || 0) && (
                    <div className="mt-1 text-xs text-amber-400">
                      Need to approve {fundAmount} HUB first
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="text-gray-400 text-sm mb-1 block">Amount to Fund (HUB)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => !isAnyTransactionProcessing && setFundAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                      step="0.1"
                      min="0"
                      disabled={isAnyTransactionProcessing}
                    />
                    <button
                      onClick={() => !isAnyTransactionProcessing && setFundAmount(balance)}
                      className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50"
                      disabled={isAnyTransactionProcessing}
                    >
                      Max
                    </button>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Your balance: {formatNumber(balance)} HUB
                  </div>
                </div>
                
                {parseFloat(allowance) < parseFloat(fundAmount || 0) && fundAmount && parseFloat(fundAmount) > 0 && (
                  <button
                    onClick={() => approveTokens(fundAmount)}
                    disabled={isAnyTransactionProcessing}
                    className="w-full mb-3 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                  >
                    {isAnyTransactionProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      `🔓 Approve ${fundAmount} HUB`
                    )}
                  </button>
                )}
                
                <button
                  onClick={handleFundPool}
                  disabled={isAnyTransactionProcessing || parseFloat(fundAmount) <= 0 || parseFloat(allowance) < parseFloat(fundAmount || 0)}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                >
                  {isAnyTransactionProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Fund ${fundAmount || 0} HUB to Pool`
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'info' && stakingData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                  <div className="text-cyan-400 font-bold text-2xl mb-1">
                    {formatNumber(stakingData.totalStaked)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Staked (HUB)</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="text-green-400 font-bold text-2xl mb-1">
                    {formatNumber(stakingData.availableRewards)}
                  </div>
                  <div className="text-gray-400 text-sm">Available Rewards (HUB)</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="text-purple-400 font-bold text-2xl mb-1">
                    {formatNumber(stakingData.stakersCount)}
                  </div>
                  <div className="text-gray-400 text-sm">Active Stakers</div>
                </div>
              </div>
              
              <div className="bg-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">Contract Information</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Address:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 text-sm">
                        {STAKING_CONTRACT_ADDRESS}
                      </span>
                      <button
                        onClick={() => copyToClipboard(STAKING_CONTRACT_ADDRESS, 'Staking Contract')}
                        className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Rewards Distributed:</span>
                    <span className="text-green-400">
                      {formatNumber(stakingData.totalRewardsPaid)} HUB
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Contract Balance:</span>
                    <span className="text-white">
                      {formatNumber(stakingData.contractBalance)} HUB
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Stake:</span>
                    <span className="text-amber-400">{minStake} HUB</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-2">🏦 HUB Staking Multi-Tier</h3>
                <p className="text-gray-300 text-sm">
                  Earn competitive rewards by staking your HUB tokens across three flexible tiers. 
                  Create multiple stakes within each tier to optimize your strategy. Each stake has 
                  its own lock period and accrues rewards independently, giving you complete control 
                  over your token allocation while maximizing your APRs.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">Multiple Stakes per Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">Individual Stake Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">Claim All for Tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">Pending Rewards System</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {actionMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            actionMessage.includes('❌') || actionMessage.includes('failed') || actionMessage.includes('error') || actionMessage.includes('Need to approve')
              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
              : actionMessage.includes('✅') || actionMessage.includes('successful')
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : actionMessage.includes('⏳') || actionMessage.includes('pending') || actionMessage.includes('confirming') || actionMessage.includes('Approval')
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
          }`}>
            {actionMessage}
          </div>
        )}

        {copySuccess && (
          <div className="mt-3 p-2 bg-green-500/20 text-green-300 text-sm text-center rounded-lg border border-green-500/30">
            {copySuccess}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between text-sm text-gray-400 gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span>💎 Need HUB?</span>
                <a 
                  href="https://app.uniswap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  Get on Uniswap
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cyan-300">HUB Token:</span>
                <span className="font-mono">{HUB_TOKEN_ADDRESS}</span>
                <button
                  onClick={() => copyToClipboard(HUB_TOKEN_ADDRESS, 'HUB Token Address')}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  📋
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>🔗</span>
              <a 
                href={`https://basescan.org/address/${STAKING_CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300"
              >
                View on BaseScan
              </a>
              <button
                onClick={() => copyToClipboard(STAKING_CONTRACT_ADDRESS, 'Staking Contract')}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingModal;