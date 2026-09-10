import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { sdk } from '@farcaster/miniapp-sdk';

import NetworkBackground from './components/layout/NetworkBackground';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileFooter from './components/layout/MobileFooter';
import LoginHelpTooltip from './components/layout/LoginHelpTooltip';

import PublicChat from './components/chat/PublicChat';
import BaseAirdropChat from './components/chat/BaseAirdropChat';
import SayHelloChat from './components/chat/SayHelloChat';
import MemesChat from './components/chat/MemesChat';

import NicknameModal from './components/modals/NicknameModal';
import UserProfileModal from './components/modals/UserProfileModal';
import LeaderboardModal from './components/modals/LeaderboardModal';
import BaseLeaderboardModal from './components/modals/BaseLeaderboardModal';
import SubscriptionModal from './components/modals/SubscriptionModal';
import StakingModal from './components/modals/StakingModal';
import DailyGMLinea from './components/modals/DailyGMLinea';
import DailyGMPolygon from './components/modals/DailyGMPolygon';
import DailyGMSoneium from './components/modals/DailyGMSoneium';
import DailyGMArbitrum from './components/modals/DailyGMArbitrum';

import { useFirebase } from './hooks/useFirebase';
import { useUsers } from './hooks/useUsers';
import { useWeb3 } from './hooks/useWeb3';
import { useSeasons } from './hooks/useSeasons';
import { useNetwork } from './hooks/useNetwork';

import { AVAILABLE_AVATARS } from './utils/constants';

// ============================================================
// KONFIGURACJA AIRDROPU
// ============================================================

const GENESIS_NFT_CONTRACT = '0xdAf7B15f939F6a8faf87d338010867883AAB366a';
const NFT_BONUS_PER_UNIT = 50000;
const CLAIM_DATE = 'October 31, 2026';
const SNAPSHOT_DATE = 'October 23, 2026';

const CHECKER_URL = 'https://www.hubecosystem.xyz/';
const X_HANDLE = '@HUB_Ecosystem';

const BASE_RPC_URLS = [
  'https://mainnet.base.org',
  'https://base.llamarpc.com',
  'https://base-rpc.publicnode.com',
  'https://1rpc.io/base',
  'https://base.drpc.org'
];

const RPC_TIMEOUT_MS = 10000;
const GLOBAL_TIMEOUT_MS = 30000;

const ALLOCATION_TIERS = [
  { tier: 0,  minTx: 0,     maxTx: 999,   allocation: 0      },
  { tier: 1,  minTx: 1000,  maxTx: 1499,  allocation: 1347   },
  { tier: 2,  minTx: 1500,  maxTx: 1999,  allocation: 3892   },
  { tier: 3,  minTx: 2000,  maxTx: 2499,  allocation: 7618   },
  { tier: 4,  minTx: 2500,  maxTx: 3499,  allocation: 13245  },
  { tier: 5,  minTx: 3500,  maxTx: 4999,  allocation: 21907  },
  { tier: 6,  minTx: 5000,  maxTx: 5999,  allocation: 34583  },
  { tier: 7,  minTx: 6000,  maxTx: 6999,  allocation: 49271  },
  { tier: 8,  minTx: 7000,  maxTx: 8499,  allocation: 67834  },
  { tier: 9,  minTx: 8500,  maxTx: 9999,  allocation: 84196  },
  { tier: 10, minTx: 10000, maxTx: null,  allocation: 100000 }
];

function getTierFromTxCount(txCount) {
  const tier = ALLOCATION_TIERS.find(
    t => txCount >= t.minTx && (t.maxTx === null || txCount <= t.maxTx)
  );
  return tier || ALLOCATION_TIERS[0];
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// === TX count z Base RPC (eth_getTransactionCount) ===
async function fetchTxCountFromRpc(address) {
  let lastError = null;

  for (const rpcUrl of BASE_RPC_URLS) {
    try {
      const res = await fetchWithTimeout(
        rpcUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionCount',
            params: [address, 'latest'],
            id: 1
          })
        },
        RPC_TIMEOUT_MS
      );

      if (!res.ok) {
        lastError = new Error(`${rpcUrl} HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();

      if (data.error) {
        lastError = new Error(data.error.message || `${rpcUrl} RPC error`);
        continue;
      }

      if (data.result && data.result !== '0x') {
        return parseInt(data.result, 16) || 0;
      }

      return 0;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error('All Base RPC endpoints failed. Please try again in a moment.');
}

// === NFT count z Base RPC (eth_call balanceOf) ===
async function fetchNftCountFromRpc(address) {
  const selector = '0x70a08231'; // balanceOf(address)
  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0');
  const data = selector + paddedAddress;

  let lastError = null;

  for (const rpcUrl of BASE_RPC_URLS) {
    try {
      const res = await fetchWithTimeout(
        rpcUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [
              { to: GENESIS_NFT_CONTRACT, data: data },
              'latest'
            ],
            id: 1
          })
        },
        RPC_TIMEOUT_MS
      );

      if (!res.ok) {
        lastError = new Error(`${rpcUrl} HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();

      if (json.error) {
        lastError = new Error(json.error.message || `${rpcUrl} RPC error`);
        continue;
      }

      if (json.result && json.result !== '0x') {
        return parseInt(json.result, 16) || 0;
      }

      return 0;
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error('All Base RPC endpoints failed for NFT.');
}

function calculateAllocation(txCount, nftCount) {
  const tier = getTierFromTxCount(txCount);
  const baseAllocation = tier.allocation;
  const nftBonus = nftCount * NFT_BONUS_PER_UNIT;
  const total = baseAllocation + nftBonus;

  let status = 'ineligible';
  if (total > 0) status = 'eligible';

  return {
    txCount,
    nftCount,
    tier: tier.tier,
    baseAllocation,
    nftBonus,
    total,
    status
  };
}

// === Generowanie tekstu do tweeta z FOMO ===
function buildTweetText(allocation) {
  const formatted = allocation.total.toLocaleString('en-US');

  return `Just checked my ${X_HANDLE} airdrop allocation and I'm getting ${formatted} $HUB.

If you've been active on Base, check this right now. Snapshot is on October 23, 2026, don't miss it.

Claim opens October 31, 2026. See what you're owed.`;
}

// ============================================================
// GŁÓWNY KOMPONENT
// ============================================================

function App() {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('public');
  const [activeTab, setActiveTab] = useState('online');
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBaseLeaderboard, setShowBaseLeaderboard] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [showDailyStreakLinea, setShowDailyStreakLinea] = useState(false);
  const [showDailyStreakPolygon, setShowDailyStreakPolygon] = useState(false);
  const [showDailyStreakSoneium, setShowDailyStreakSoneium] = useState(false);
  const [showDailyStreakMonad, setShowDailyStreakMonad] = useState(false);

  const [activeChat, setActiveChat] = useState('public');

  const [showAirdropChecker, setShowAirdropChecker] = useState(false);
  const [airdropAddress, setAirdropAddress] = useState('');
  const [airdropResult, setAirdropResult] = useState(null);
  const [airdropLoading, setAirdropLoading] = useState(false);

  const loadingTimeoutRef = useRef(null);

  const [subChars, setSubChars] = useState([]);
  const [hintChars, setHintChars] = useState([]);
  const [noteChars, setNoteChars] = useState([]);
  const [allTyped, setAllTyped] = useState(false);

  const { isCelo, isBase } = useNetwork();

  useEffect(() => {
    (async () => {
      try {
        await sdk.actions.ready();
      } catch (error) {}
    })();
  }, []);

  // === MOVIE TITLE EFFECT ===
  useEffect(() => {
    if (isConnected) return;

    const subText = 'See how many HUB tokens your wallet unlocks';
    const hintText = 'Tap to check allocation';
    const noteText = 'No wallet connection required';

    const timeline = [];
    let delay = 900;

    subText.split('').forEach((char, i) => {
      timeline.push({
        time: delay,
        action: () => setSubChars(prev => [...prev, { char, index: i }])
      });
      delay += 35;
    });

    delay += 350;

    hintText.split('').forEach((char, i) => {
      timeline.push({
        time: delay,
        action: () => setHintChars(prev => [...prev, { char, index: i }])
      });
      delay += 40;
    });

    delay += 350;

    noteText.split('').forEach((char, i) => {
      timeline.push({
        time: delay,
        action: () => setNoteChars(prev => [...prev, { char, index: i }])
      });
      delay += 40;
    });

    timeline.push({
      time: delay + 400,
      action: () => setAllTyped(true)
    });

    const timeouts = timeline.map(item => setTimeout(item.action, item.time));

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [isConnected]);

  const {
    currentUser,
    showNicknameModal,
    setShowNicknameModal,
    registerUser,
    updateUserLastSeen,
    deleteMessage,
    updateUserMessageCount
  } = useFirebase(address);

  const { onlineUsers, allUsers } = useUsers(address);

  const { balance, remaining, getOtherUserBalance, subscriptionInfo } = useWeb3(address);

  const { checkAndDistributeRewards } = useSeasons();

  const [nicknameInput, setNicknameInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐶');

  useEffect(() => {
    if (isCelo && activeChat === 'base-airdrop') {
      setActiveChat('public');
    }
  }, [isCelo, activeChat]);

  const userWithBalance = currentUser ? {
    ...currentUser,
    balance,
    remaining,
    subscriptionInfo,
    tokenSymbol: 'HUB',
    networkName: 'Base',
    supportsDailyRewards: false,
    supportsSeasonSystem: false
  } : null;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isCelo) {
      checkAndDistributeRewards();
    }
  }, [isCelo]);

  const handleShowStakingModal = () => setShowStakingModal(true);
  const handleCloseStakingModal = () => setShowStakingModal(false);
  const handleViewProfile = (user) => setSelectedProfileUser(user);

  const handleShowMyProfile = () => {
    if (currentUser) {
      setSelectedProfileUser({
        walletAddress: currentUser.walletAddress,
        nickname: currentUser.nickname || 'Anonymous',
        avatar: currentUser.avatar || '👤'
      });
    }
  };

  // === HANDLER CHECKERA AIRDROP ===
  const handleCheckAirdrop = async () => {
    const trimmed = airdropAddress.trim();

    if (!trimmed || !trimmed.startsWith('0x') || trimmed.length !== 42) {
      setAirdropResult({ error: 'Please enter a valid EVM address (0x + 40 hex characters)' });
      return;
    }

    setAirdropLoading(true);
    setAirdropResult(null);

    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      setAirdropLoading(false);
      setAirdropResult({
        error: 'Request timed out. Please try again in a moment.'
      });
    }, GLOBAL_TIMEOUT_MS);

    try {
      // Pobierz TX i NFT RÓWNOLEGLE
      const [txCount, nftCountResult] = await Promise.all([
        fetchTxCountFromRpc(trimmed),
        fetchNftCountFromRpc(trimmed).catch(err => {
          console.error('NFT fetch failed:', err);
          return null; // null = błąd NFT
        })
      ]);

      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

      const nftCount = nftCountResult ?? 0;
      const allocation = calculateAllocation(txCount, nftCount);

      setAirdropResult({
        address: trimmed,
        ...allocation,
        message: nftCountResult === null
          ? 'Could not read NFT balance. Allocation based on transactions only.'
          : (allocation.status === 'eligible'
              ? null
              : 'No allocation found. You need at least 1,000 Base transactions or at least 1 Genesis NFT.')
      });
    } catch (error) {
      console.error('Airdrop check error:', error);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      setAirdropResult({
        error: error.message || 'Could not fetch data. Please try again in a moment.'
      });
    } finally {
      setAirdropLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  const handleCloseAirdropChecker = () => {
    setShowAirdropChecker(false);
    setAirdropAddress('');
    setAirdropResult(null);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
  };

  const handleShareOnX = (allocation) => {
    const tweetText = buildTweetText(allocation);
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(CHECKER_URL)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 relative">
        <NetworkBackground />

        <style>{`
          .neon-checker-btn {
            position: relative;
            display: block;
            width: 100%;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            letter-spacing: 0.05em;
            color: #67e8f9;
            background: rgba(34, 211, 238, 0.04);
            border: 1.5px solid rgba(34, 211, 238, 0.55);
            box-shadow:
              0 0 4px rgba(34, 211, 238, 0.35),
              0 0 10px rgba(34, 211, 238, 0.2),
              inset 0 0 10px rgba(34, 211, 238, 0.05);
            text-shadow: 0 0 4px rgba(34, 211, 238, 0.4);
            transition: all 0.3s ease;
            cursor: pointer;
            overflow: hidden;
            text-align: center;
            min-height: 108px;
            isolation: isolate;
          }
          .neon-checker-btn::before {
            content: '';
            position: absolute;
            inset: -1.5px;
            border-radius: 12px;
            padding: 1.5px;
            background: conic-gradient(
              from var(--angle, 0deg),
              transparent 0deg,
              transparent 340deg,
              rgba(103, 232, 249, 0.9) 355deg,
              rgba(165, 243, 252, 1) 359deg,
              rgba(103, 232, 249, 0.9) 360deg,
              transparent 360deg
            );
            -webkit-mask:
              linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            animation: border-orbit 6s linear infinite;
            pointer-events: none;
            z-index: 2;
            filter: drop-shadow(0 0 4px rgba(103, 232, 249, 0.8));
          }
          @property --angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes border-orbit {
            0%   { --angle: 0deg; }
            100% { --angle: 360deg; }
          }
          .neon-checker-btn > * {
            position: relative;
            z-index: 1;
          }
          .neon-checker-btn:hover {
            color: #a5f3fc;
            background: rgba(34, 211, 238, 0.08);
            border-color: rgba(103, 232, 249, 0.8);
            box-shadow:
              0 0 8px rgba(34, 211, 238, 0.5),
              0 0 18px rgba(34, 211, 238, 0.3),
              0 0 36px rgba(34, 211, 238, 0.15),
              inset 0 0 15px rgba(34, 211, 238, 0.1);
            text-shadow: 0 0 6px rgba(34, 211, 238, 0.5);
          }
          .neon-checker-btn:active { transform: scale(0.98); }
          .neon-checker-title {
            font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
            font-size: 15px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            margin-bottom: 6px;
            min-height: 18px;
            background: linear-gradient(90deg, #c084fc 0%, #a855f7 50%, #8b5cf6 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            display: inline-block;
            clip-path: inset(0 100% 0 0);
            animation: title-reveal 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
            white-space: nowrap;
          }
          @keyframes title-reveal {
            0%   { clip-path: inset(0 100% 0 0); }
            100% { clip-path: inset(0 0% 0 0); }
          }
          .neon-checker-sub {
            font-size: 10px;
            color: rgba(148, 163, 184, 0.85);
            letter-spacing: 0.02em;
            font-weight: 400;
            text-transform: none;
            margin-bottom: 4px;
            min-height: 13px;
          }
          .neon-checker-hint {
            font-size: 9px;
            color: rgba(103, 232, 249, 0.5);
            text-transform: uppercase;
            letter-spacing: 0.2em;
            font-weight: 500;
            margin-top: 2px;
            min-height: 12px;
            transition: color 0.3s ease;
          }
          .neon-checker-hint.pulse-active {
            animation: hint-pulse 2s ease-in-out infinite;
          }
          @keyframes hint-pulse {
            0%, 100% {
              color: rgba(103, 232, 249, 0.5);
              text-shadow: 0 0 0 rgba(103, 232, 249, 0);
            }
            50% {
              color: rgba(165, 243, 252, 1);
              text-shadow:
                0 0 6px rgba(103, 232, 249, 0.7),
                0 0 12px rgba(103, 232, 249, 0.4);
            }
          }
          .neon-checker-note {
            font-size: 9px;
            color: rgba(52, 211, 153, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            font-weight: 500;
            margin-top: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            min-height: 12px;
          }
          .neon-checker-note::before {
            content: '✓';
            color: rgba(52, 211, 153, 0.8);
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .neon-checker-note.has-content::before {
            opacity: 1;
          }
          .movie-char {
            display: inline-block;
            opacity: 0;
            animation: movie-char-in 0.55s ease-out forwards;
          }
          @keyframes movie-char-in {
            0%   { opacity: 0; transform: translateY(2px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .movie-char-space {
            display: inline-block;
            width: 0.3em;
          }
          .checker-gradient-btn {
            position: relative;
            display: block;
            width: 100%;
            padding: 2px;
            border-radius: 14px;
            background: linear-gradient(90deg, #22d3ee, #3b82f6, #a855f7, #22d3ee);
            background-size: 300% 100%;
            animation: checker-gradient-move 3s linear infinite;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: none;
          }
          .checker-gradient-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(34, 211, 238, 0.3);
          }
          @keyframes checker-gradient-move {
            0% { background-position: 0% 50%; }
            100% { background-position: 300% 50%; }
          }
          .checker-gradient-inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 16px 18px;
            border-radius: 12px;
            background: rgba(17, 24, 39, 0.95);
            transition: background 0.3s ease;
            text-align: center;
          }
          .checker-gradient-btn:hover .checker-gradient-inner {
            background: rgba(17, 24, 39, 0.85);
          }
          .checker-gradient-title {
            font-weight: 700;
            font-size: 14px;
            color: #67e8f9;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }
          .airdrop-modal-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .airdrop-modal-scroll::-webkit-scrollbar-track {
            background: rgba(75, 85, 99, 0.1);
            border-radius: 3px;
          }
          .airdrop-modal-scroll::-webkit-scrollbar-thumb {
            background: rgba(34, 211, 238, 0.3);
            border-radius: 3px;
          }
          .airdrop-modal-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(34, 211, 238, 0.5);
          }
        `}</style>

        <div className="w-full max-w-md relative z-10 mx-4 animate-fadeIn">

          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-2xl shadow-cyan-500/20">
              <img src="/HUB.logo.png" alt="HUB Portal" className="w-14 h-14" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent leading-none mb-3">
              HUB PORTAL
            </h1>
            <p className="text-gray-400 text-sm tracking-wide">Multi-Chain Social Chat</p>
          </div>

          <div className="bg-gray-800/70 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">

            <button
              onClick={() => setShowAirdropChecker(true)}
              className="neon-checker-btn mb-6"
            >
              <div className="neon-checker-title">
                HUB Airdrop Checker
              </div>

              <div className="neon-checker-sub">
                {subChars.map(({ char, index }) => (
                  char === ' ' ? (
                    <span key={index} className="movie-char-space" />
                  ) : (
                    <span key={index} className="movie-char" style={{ animationDelay: `${index * 0.02}s` }}>
                      {char}
                    </span>
                  )
                ))}
              </div>

              <div className={`neon-checker-hint ${allTyped ? 'pulse-active' : ''}`}>
                {hintChars.map(({ char, index }) => (
                  char === ' ' ? (
                    <span key={index} className="movie-char-space" />
                  ) : (
                    <span key={index} className="movie-char" style={{ animationDelay: `${index * 0.022}s` }}>
                      {char}
                    </span>
                  )
                ))}
              </div>

              <div className={`neon-checker-note ${noteChars.length > 0 ? 'has-content' : ''}`}>
                {noteChars.map(({ char, index }) => (
                  char === ' ' ? (
                    <span key={index} className="movie-char-space" />
                  ) : (
                    <span key={index} className="movie-char" style={{ animationDelay: `${index * 0.022}s` }}>
                      {char}
                    </span>
                  )
                ))}
              </div>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-700/50"></div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">or</span>
              <div className="flex-1 h-px bg-gray-700/50"></div>
            </div>

            <div className="text-center mb-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/70 font-semibold">
                Sign in to access the portal
              </span>
            </div>

            <button onClick={() => open()} className="checker-gradient-btn">
              <div className="checker-gradient-inner">
                <div className="checker-gradient-title">
                  Sign In
                </div>
              </div>
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <LoginHelpTooltip />
          </div>
        </div>

        {showAirdropChecker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={handleCloseAirdropChecker}
          >
            <div className="relative w-full max-w-lg mx-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleCloseAirdropChecker}
                className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-800 border border-gray-700/50 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all flex items-center justify-center text-base sm:text-lg"
              >
                ✕
              </button>

              <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-y-auto airdrop-modal-scroll">
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-[9px] sm:text-[10px] tracking-[0.3em] text-cyan-400/80 font-semibold uppercase mb-2">
                    HUB PORTAL COMMUNITY
                  </p>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent leading-none mb-3">
                    WALLET<br />CHECKER
                  </h2>
                  <p className="text-gray-400 text-[11px] sm:text-xs md:text-sm max-w-sm mx-auto leading-relaxed">
                    Check your Base activity to see how many HUB tokens your wallet unlocks.
                  </p>
                </div>

                {!airdropResult && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold text-center">
                        EVM Address
                      </label>
                      <input
                        type="text"
                        value={airdropAddress}
                        onChange={(e) => setAirdropAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-gray-900/80 border border-cyan-500/30 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono text-center"
                      />
                    </div>
                    <button
                      onClick={handleCheckAirdrop}
                      disabled={airdropLoading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm shadow-lg shadow-cyan-500/20"
                    >
                      {airdropLoading ? '⏳ Checking...' : 'Check Allocation'}
                    </button>
                    <p className="text-[10px] text-gray-500 text-center pt-1">
                      Enter your EVM address to check your HUB token allocation.
                    </p>
                  </div>
                )}

                {airdropResult && (
                  <div className="text-center py-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <img
                        src="/HUB.logo.png"
                        alt="HUB"
                        className="w-10 h-10 sm:w-12 sm:h-12"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span className="text-3xl">🪙</span>';
                        }}
                      />
                    </div>

                    {airdropResult.error ? (
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-red-400 mb-3">
                        ERROR
                      </h3>
                    ) : (
                      <>
                        {airdropResult.status === 'eligible' && (
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3">
                            ELIGIBLE
                          </h3>
                        )}
                        {airdropResult.status === 'ineligible' && (
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent mb-3">
                            NOT ELIGIBLE
                          </h3>
                        )}
                      </>
                    )}

                    {airdropResult.error ? (
                      <p className="text-gray-400 text-[11px] sm:text-xs max-w-sm mx-auto mb-4 sm:mb-5">
                        {airdropResult.error}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-[11px] sm:text-xs max-w-sm mx-auto mb-4 sm:mb-5 leading-relaxed">
                        {airdropResult.message || 'Your wallet activity has been checked. This allocation is based on your on-chain history.'}
                      </p>
                    )}

                    {!airdropResult.error && (
                      <>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-semibold mb-2">
                          Total Allocation
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-none mb-1">
                          {formatNumber(airdropResult.total)}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold mb-4 sm:mb-5">
                          HUB Tokens
                        </div>

                        <div className="bg-gray-900/60 border border-cyan-500/20 rounded-xl p-3 sm:p-4 mb-3 text-left space-y-1.5 sm:space-y-2">
                          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-cyan-400/80 font-bold mb-1.5 sm:mb-2 text-center">
                            Allocation Breakdown
                          </div>

                          <div className="flex justify-between items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-gray-400 shrink-0">Base Transactions</span>
                            <span className="text-white font-mono text-right break-all">
                              {formatNumber(airdropResult.txCount)} TX
                            </span>
                          </div>

                          <div className="flex justify-between items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-gray-400 shrink-0">Tier</span>
                            <span className="text-white font-mono text-right">
                              Tier {airdropResult.tier}
                            </span>
                          </div>

                          <div className="flex justify-between items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-gray-400 shrink-0">Base Allocation</span>
                            <span className="text-cyan-300 font-mono text-right break-all">
                              {formatNumber(airdropResult.baseAllocation)} HUB
                            </span>
                          </div>

                          <div className="border-t border-gray-700/40 my-1"></div>

                          <div className="flex justify-between items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-gray-400 shrink-0">Genesis NFTs</span>
                            <span className="text-white font-mono text-right">
                              {airdropResult.nftCount} × 50,000
                            </span>
                          </div>

                          <div className="flex justify-between items-center gap-2 text-[10px] sm:text-xs">
                            <span className="text-gray-400 shrink-0">NFT Bonus</span>
                            <span className="text-purple-300 font-mono text-right break-all">
                              + {formatNumber(airdropResult.nftBonus)} HUB
                            </span>
                          </div>

                          <div className="border-t border-gray-700/40 my-1"></div>

                          <div className="flex justify-between items-center gap-2 text-xs sm:text-sm font-bold">
                            <span className="text-white">Total</span>
                            <span className="text-green-400 font-mono text-right break-all">
                              {formatNumber(airdropResult.total)} HUB
                            </span>
                          </div>
                        </div>

                        {/* === INFO O SNAPSHOCIE === */}
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-2.5 sm:p-3 mb-4 sm:mb-5">
                          <p className="text-[10px] sm:text-[11px] text-cyan-300/90 leading-relaxed text-center">
                            <span className="font-semibold">Snapshot date: {SNAPSHOT_DATE}.</span>
                            <br />
                            Your allocation is based on the state of your wallet on that date.
                          </p>
                        </div>

                        <div className="text-[9px] text-gray-500 font-mono break-all mb-4 sm:mb-5">
                          {airdropResult.address}
                        </div>
                      </>
                    )}

                    <div className="flex flex-col gap-2 justify-center">
                      {airdropResult.status === 'eligible' && (
                        <>
                          <button
                            onClick={() => handleShareOnX(airdropResult)}
                            className="w-full bg-black hover:bg-gray-900 border border-gray-600/50 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all text-[11px] sm:text-xs flex items-center justify-center gap-2"
                          >
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>Share allocation on X</span>
                          </button>
                          <button
                            disabled
                            className="w-full bg-gray-700/40 border border-gray-600/40 text-gray-400 font-semibold px-4 sm:px-5 py-2.5 rounded-xl cursor-not-allowed text-[10px] sm:text-xs flex items-center justify-center gap-2"
                          >
                            <span>🔒</span>
                            <span>Claim opens {CLAIM_DATE}</span>
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setAirdropResult(null);
                          setAirdropAddress('');
                        }}
                        className="w-full bg-gray-700/50 hover:bg-gray-700/80 border border-gray-600/50 text-gray-300 font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition-all text-[10px] sm:text-xs"
                      >
                        Check Another Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <NetworkBackground />

      {showLeaderboard && isCelo && (
        <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} currentUser={userWithBalance} isMobile={isMobile} />
      )}

      {showBaseLeaderboard && isBase && (
        <BaseLeaderboardModal isOpen={showBaseLeaderboard} onClose={() => setShowBaseLeaderboard(false)} currentUser={userWithBalance} isMobile={isMobile} />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} currentUser={userWithBalance} subscriptionInfo={subscriptionInfo} />
      )}

      {showStakingModal && isBase && (
        <StakingModal isOpen={showStakingModal} onClose={handleCloseStakingModal} currentUser={userWithBalance} isMobile={isMobile} />
      )}

      {isMobile ? (
        <div className="flex flex-col h-screen relative z-10 overflow-hidden">
          <Header
            isMobile={true}
            currentUser={userWithBalance}
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
            onShowLeaderboard={() => { if (isCelo) setShowLeaderboard(true); }}
            onShowBaseLeaderboard={() => { if (isBase) setShowBaseLeaderboard(true); }}
            onShowSubscriptionModal={() => { if (isBase) setShowSubscriptionModal(true); }}
            onShowStakingModal={handleShowStakingModal}
          />

          <div className="flex-1 min-h-0 bg-gray-900/50 overflow-hidden">
            {mobileView === 'public' && (
              <>
                {activeChat === 'public' && (
                  <PublicChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} isMobile={true} />
                )}
                {activeChat === 'say-hello' && (
                  <SayHelloChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} isMobile={true} />
                )}
                {activeChat === 'memes' && (
                  <MemesChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} isMobile={true} />
                )}
                {activeChat === 'base-airdrop' && isBase && (
                  <BaseAirdropChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} isMobile={true} />
                )}
              </>
            )}

            {mobileView === 'users' && (
              <Sidebar isMobile={true} currentUser={userWithBalance} onlineUsers={onlineUsers} allUsers={allUsers} activeTab={activeTab} setActiveTab={setActiveTab} onShowUserProfile={handleShowMyProfile} />
            )}

            {mobileView === 'me' && currentUser && (
              <div className="h-full overflow-y-auto p-4">
                <UserProfileModal
                  user={{ walletAddress: currentUser.walletAddress, nickname: currentUser.nickname || 'Anonymous', avatar: currentUser.avatar || '👤' }}
                  onClose={() => setMobileView('public')}
                  getOtherUserBalance={getOtherUserBalance}
                  currentUser={userWithBalance}
                  onOpenSubscription={() => { if (isBase) { setShowSubscriptionModal(true); setMobileView('public'); } }}
                  isMobile={true}
                />
              </div>
            )}
          </div>

          <MobileFooter mobileView={mobileView} onMobileViewChange={setMobileView} activeChat={activeChat} onChatChange={setActiveChat} />
        </div>
      ) : (
        <div className="flex h-screen relative z-10">
          <Sidebar currentUser={userWithBalance} onlineUsers={onlineUsers} allUsers={allUsers} activeTab={activeTab} setActiveTab={setActiveTab} onShowUserProfile={handleShowMyProfile} activeChat={activeChat} onChatChange={setActiveChat} />

          <div className="flex-1 flex flex-col bg-gray-900/50 min-w-0 relative">
            <Header
              currentUser={userWithBalance}
              onShowLeaderboard={() => { if (isCelo) setShowLeaderboard(true); }}
              onShowBaseLeaderboard={() => { if (isBase) setShowBaseLeaderboard(true); }}
              onShowSubscriptionModal={() => { if (isBase) setShowSubscriptionModal(true); }}
              onShowStakingModal={handleShowStakingModal}
            />

            <div className="flex-1 flex min-h-0">
              <div className="w-full min-w-0">
                {activeChat === 'public' && (
                  <PublicChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} />
                )}
                {activeChat === 'say-hello' && (
                  <SayHelloChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} />
                )}
                {activeChat === 'memes' && (
                  <MemesChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} />
                )}
                {activeChat === 'base-airdrop' && isBase && (
                  <BaseAirdropChat currentUser={userWithBalance} onUpdateLastSeen={updateUserLastSeen} onDeleteMessage={deleteMessage} onViewProfile={handleViewProfile} updateUserMessageCount={updateUserMessageCount} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNicknameModal && (
        <NicknameModal currentUser={currentUser} nicknameInput={nicknameInput} setNicknameInput={setNicknameInput} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar} onRegister={() => registerUser(nicknameInput, selectedAvatar)} onClose={() => setShowNicknameModal(false)} availableAvatars={AVAILABLE_AVATARS} />
      )}

      {selectedProfileUser && (
        <UserProfileModal user={selectedProfileUser} onClose={() => setSelectedProfileUser(null)} getOtherUserBalance={getOtherUserBalance} currentUser={userWithBalance} onOpenSubscription={() => setShowSubscriptionModal(true)} isMobile={isMobile} />
      )}

      {showDailyStreakLinea && (
        <DailyGMLinea isOpen={showDailyStreakLinea} onClose={() => setShowDailyStreakLinea(false)} currentUser={userWithBalance} isMobile={isMobile} />
      )}

      {showDailyStreakPolygon && (
        <DailyGMPolygon isOpen={showDailyStreakPolygon} onClose={() => setShowDailyStreakPolygon(false)} currentUser={userWithBalance} isMobile={isMobile} />
      )}

      {showDailyStreakSoneium && (
        <DailyGMSoneium isOpen={showDailyStreakSoneium} onClose={() => setShowDailyStreakSoneium(false)} currentUser={userWithBalance} isMobile={isMobile} />
      )}

      {showDailyStreakMonad && (
        <DailyGMMonad isOpen={showDailyStreakMonad} onClose={() => setShowDailyStreakMonad(false)} currentUser={userWithBalance} isMobile={isMobile} />
      )}
    </div>
  );
}

export default App;