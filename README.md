# <img src="./public/HUB.logo.png" alt="HUB Portal" width="40" height="40" /> HUB Portal - Multi-Chain Social Chat Platform

<div align="center">

<img src="./public/HUB.logo.png" alt="HUB Portal Logo" width="200" height="200" />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HUB Portal** is a revolutionary Web3 social platform that combines real-time chat with comprehensive token rewards across multiple blockchain networks. Experience seamless wallet integration, beautiful design, and true digital ownership through innovative subscription, staking, and NFT bonus systems.

</div>

---

## 🧾 Smart Contracts Overview

| Network | Purpose | Contract | Address |
|--------|----------|----------|----------|
| **Base** | HUB Token (ERC20) | HUB Ecosystem Token | [`0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E`](https://basescan.org/address/0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E) |
| **Base** | HUB Chat Rewards | Tiered Mining System | [`0x8ea3818294887376673e4e64fBd518598e3a2306`](https://basescan.org/address/0x8ea3818294887376673e4e64fBd518598e3a2306) |
| **Base** | HUB Staking | Multi-Tier Staking 3/6/12M | [`0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB`](https://basescan.org/address/0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB) |
| **Celo** | HC Token | HelloCelo ERC20 | [`0x12b6e1f30cb714e8129F6101a7825a910a9982F2`](https://celoscan.io/token/0x12b6e1f30cb714e8129F6101a7825a910a9982F2) |
| **Base** | Genesis NFT | HUB Ecosystem Genesis NFT | [`0xdAf7B15f939F6a8faf87d338010867883AAB366a`](https://basescan.org/address/0xdAf7B15f939F6a8faf87d338010867883AAB366a) |
| **Linea** | Linea Prime Token | LPX ERC20 Token | [`0x668F584d27Ce86149d6162a94D0BCd3C643Cb525`](https://lineascan.build/address/0x668F584d27Ce86149d6162a94D0BCd3C643Cb525) |
| **Celo** | Daily GM CELO Streak | Daily GM CELO Streak System | [`0x5A2652Db9D2eb49C9c66f1952DD56ECd8ED915bc`](https://celoscan.io/address/0x5A2652Db9D2eb49C9c66f1952DD56ECd8ED915bc) |
| **Base** | Daily GM USDC Streak | Daily GM USDC Streak System | [`0x220160fad5f6f5c2Af2674469dD99e132759D9Ca`](https://basescan.org/address/0x220160fad5f6f5c2Af2674469dD99e132759D9Ca) |
| **Linea** | Daily GM mUSD Streak | Daily GM mUSD Streak System | [`0x4e4F31986aB5eCf851F5a5321eE83C501cd1D4a8`](https://lineascan.build/address/0x4e4F31986aB5eCf851F5a5321eE83C501cd1D4a8) |
| **Polygon** | Message Protocol Token | MSG Token (ERC20) | [`0x139E53FC21f5B95e88dA8Ef9Da57cA5d143f2163`](https://polygonscan.com/address/0x139E53FC21f5B95e88dA8Ef9Da57cA5d143f2163) |
| **Polygon** | Daily GM POL Streak | Daily GM POL Streak System | [`0x12F9003d35e30D6Cec22C3E618CE4d4Cd87F8444`](https://polygonscan.com/address/0x12F9003d35e30D6Cec22C3E618CE4d4Cd87F8444) |

---

## ✨ Features

### 💬 Intelligent Messaging System
- **Public Chat** - Community conversations with instant delivery and reply system
- **Real-time Synchronization** - Messages appear instantly across all devices
- **Multi-Chain Rewards** - Earn tokens on Base, Celo, Linea, and Polygon networks
- **Admin Tools** - Message moderation and embedded content for administrators
- **Genesis NFT Bonus** - Exclusive rewards for NFT holders

---

## 🎁 Advanced Token Reward System

### 🔷 Polygon Network – Message Protocol Token (MSG)

#### MSG Token Mining System
- **Token Name**: Message Protocol
- **Token Symbol**: MSG
- **Decimals**: 18
- **Reward per Message**: 1 MSG
- **Daily Limit**: 100 messages per day
- **Max Supply**: 1,000,000,000 MSG
- **Initial Supply**: 150,000,000 MSG (15% for ecosystem development)
- **Message Length**: 2-560 characters
- **Contract:** [`0x139E53FC21f5B95e88dA8Ef9Da57cA5d143f2163`](https://polygonscan.com/address/0x139E53FC21f5B95e88dA8Ef9Da57cA5d143f2163)

#### Key Features:
- **Anti-spam Protection**: 100 message daily limit per wallet
- **User Blocking System**: Admins can block/unblock users
- **Message Storage**: All messages stored on-chain with timestamp and length
- **Gas Optimization**: `sendMessageLight()` function for reduced gas costs
- **Admin Management**: Multi-admin system with owner controls
- **Pausable Contract**: Emergency pause functionality
- **Daily Reset**: UTC-based daily message counter reset
- **Comprehensive Statistics**: Detailed user stats and analytics

#### Message Types:
1. **Full Message** (`sendMessage()`): Stores complete message content on-chain
2. **Light Message** (`sendMessageLight()`): Stores only metadata (sender, timestamp, length) for gas savings

#### Contract Functions:
- `sendMessage()` - Send full message and earn 1 MSG reward
- `sendMessageLight()` - Send gas-optimized message (stores only metadata)
- `getUserStats()` - View complete user statistics and earnings
- `remainingRewards()` - Check remaining messages for today
- `canSendMessage()` - Verify if user can send message (returns boolean + reason)
- `getMessagesPaginated()` - Paginated message viewing
- `getAllMessages()` - View all chat messages (use with caution for large arrays)
- `getMessageLimits()` - Get minimum and maximum message lengths
- `getContractStats()` - View contract-wide statistics
- `getNextResetTime()` - Check when daily counter resets for a user
- `getTokenInfo()` - Get complete token information

#### Admin Features:
- `addAdmin()` / `removeAdmin()` - Manage admin addresses
- `blockUser()` / `unblockUser()` - User moderation tools
- `pause()` / `unpause()` - Emergency contract control
- `adminBurn()` - Burn tokens from any address
- `rescueERC20()` - Rescue accidentally sent ERC20 tokens
- `transferOwnership()` - Transfer contract ownership

#### Tokenomics:
- **Total Supply**: 1,000,000,000 MSG
- **Initial Mint**: 150,000,000 MSG (15%) to HUB Ecosystem development
- **Mining Rewards**: 1 MSG per message from remaining supply
- **Daily Cap**: 100 messages per user = max 100 MSG daily
- **Max Supply Protection**: Minting stops when MAX_SUPPLY is reached

### 🔶 Daily GM POL Streak (Polygon Network)

**Daily GM Streak System for Polygon:**
- **Send daily GM** to maintain your streak with POL (MATIC) fees
- **On-chain streak tracking** with longest streak records
- **Configurable fee system** with owner controls (0.1-2 POL range)
- **Private fee collector address** for enhanced security

#### How it works:
1. **Send your daily GM** to keep your streak alive
2. **Streak continues** if you GM within 24h window
3. **Miss 24h?** Your streak resets to 1
4. **Longer streak = bigger rewards!**

#### Key Features:
- Simple 1-click GM sending with POL (MATIC)
- Real-time streak statistics
- Configurable POL fee (0.1 - 2 POL)
- Private fee collector system
- Gas paid by user separately

#### Contract Features:
- **Dynamic Fee Management**: Owner can adjust GM fee within limits (0.1-2 POL)
- **Initial Fee**: 0.1 POL per GM
- **Enhanced Privacy**: Private fee collector address
- **Full Statistics**: Complete user streak and spending tracking
- **Ownership Control**: Transferable ownership with event logging
- **Emergency Functions**: POL withdrawal capabilities for contract owner

**Contract:** [`0x12F9003d35e30D6Cec22C3E618CE4d4Cd87F8444`](https://polygonscan.com/address/0x12F9003d35e30D6Cec22C3E618CE4d4Cd87F8444)

#### Contract Functions:
- `sendGM()` - Send daily GM with POL fee
- `getUserStats()` - Get comprehensive user statistics
- `canSendGM()` - Check if user can send GM now
- `timeUntilNextGM()` - Get time until next GM can be sent
- `setGMFee()` - Owner can adjust GM fee (0.1-2 POL)
- `updateFeeCollector()` - Update fee collector address
- `transferOwnership()` - Transfer contract ownership

---

### 🌉 Base Network – Tiered Subscription Model

#### HUB Token Mining with Smart Limits
- **Tiered Messaging** - Choose from FREE, BASIC, or PREMIUM subscription tiers
- **Earn 1 HUB per message**
- **Smart Daily Limits**
- **30-second cooldown**
- **Flexible Tiers:**
  - FREE: 10 messages/day
  - BASIC: 50 messages/day
  - PREMIUM: Unlimited
- **Rewards Contract:** `0x8ea3818294887376673e4e64fBd518598e3a2306`

---

### 💎 Daily GM USDC Streak (Base Network)

**New Daily GM Streak System:**
- **Send daily GM** to maintain your streak
- **On-chain streak tracking** with longest streak records
- **Configurable fee system** with owner controls
- **Private fee collector address** for enhanced security

#### How it works:
1. **Send your daily GM** to keep your streak alive
2. **Streak continues** if you GM within 24h window
3. **Miss 24h?** Your streak resets to 1
4. **Longer streak = bigger rewards!**

#### Key Features:
- Simple 1-click GM sending
- Real-time streak statistics
- Configurable USDC fee (0.01 - 0.2 USDC)
- Private fee collector system
- Gas paid by user separately

#### Contract Features:
- **Dynamic Fee Management**: Owner can adjust GM fee within limits
- **Enhanced Privacy**: Private fee collector address
- **Full Statistics**: Complete user streak tracking
- **Ownership Control**: Transferable ownership with event logging

**Contract:** `0x220160fad5f6f5c2Af2674469dD99e132759D9Ca`

---

### 🏦 HUB Token Staking (Base Network)

HUB staking enables users to lock HUB tokens in time-based tiers and earn protocol rewards.

#### Staking Tiers

| Lock Period | APR |
|-------------|-----|
| 3 Months    | 3%  |
| 6 Months    | 5%  |
| 12 Months   | 9%  |

- Minimum stake: 1 HUB
- Multiple active stakes per wallet
- Rewards accrue continuously
- Claim rewards at any time
- Pending rewards system in case of temporary pool shortage
- Unstake available after lock expiration
- Public funding of rewards pool
- Full on-chain statistics and user tracking
- Integrated event system for HUB Portal Chat

**Staking Contract:**  
`0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB`

---

### 🏅 HUB Badge System (Base Network)

HUB Badge System allows users to earn **badges for staking HUB tokens** with real benefits, including **increased allocation in future airdrops**.  

#### Badge Levels & Staking Requirements

| Badge | Minimum Stake | Lock Period | Future Airdrop Multiplier |
|-------|---------------|------------|---------------------------|
| 🥉 Bronze | 20,000 HUB | 12 months | x3 |
| 🥈 Silver | 50,000 HUB | 12 months | x10 |
| 🥇 Gold   | 100,000 HUB | 12 months | x20 |

#### Features & Benefits
- Badge visible in user profile  
- Proof of long-term engagement ✅  
- Exclusive Discord role *(coming soon)* 👑  
- Priority access to new features ⭐  
- Increased allocation in future HUB Portal airdrops  

**Staking Contract:** [`0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB`](https://basescan.org/address/0xd4ca2b40cEAEC7006Fa38c3Bb07ceD449b9bF7DB)

---

### 📱 Celo Network – Classic Mining System

#### HC Token Mining
- 1 HC per message
- 10 messages daily limit
- Direct on-chain minting
- **Contract:** `0x12b6e1f30cb714e8129F6101a7825a910a9982F2`

#### Daily GM CELO Streak
- **Send daily GM** to maintain streak
- **24-hour cooldown** between GMs
- **On-chain streak tracking**
- **Configurable CELO fee system**
- **Contract:** `0x5A2652Db9D2eb49C9c66f1952DD56ECd8ED915bc`

#### How Daily GM CELO Works:
1. **Send your daily GM** to keep your streak alive
2. **Streak continues** if you GM within 24h window
3. **Miss 24h?** Your streak resets to 1
4. **Longer streak = bigger rewards!**

---

### 🔷 Linea Network – Linea Prime Token (LPX)

#### LPX Token Mining
- **Token Name**: Linea Prime
- **Token Symbol**: LPX
- **Decimals**: 18
- **Reward per Message**: 1 LPX
- **Daily Limit**: 100 messages per day
- **Max Supply**: 1,000,000,000 LPX
- **Dev Allocation**: 150,000,000 LPX (15%)
- **Contract:** [`0x668F584d27Ce86149d6162a94D0BCd3C643Cb525`](https://lineascan.build/address/0x668F584d27Ce86149d6162a94D0BCd3C643Cb525)

#### Daily GM mUSD Streak (Linea Network)
- **Send daily GM** to maintain streak
- **24-hour cooldown** between GMs
- **On-chain streak tracking**
- **Contract:** `0x4e4F31986aB5eCf851F5a5321eE83C501cd1D4a8`

#### Key Features:
- **Anti-spam Protection**: 100 message daily limit per wallet
- **User Blocking System**: Admins can block/unblock users
- **Message Storage**: All messages stored on-chain
- **Admin Management**: Multi-admin system with owner controls
- **Pausable Contract**: Emergency pause functionality
- **Daily Reset**: UTC-based daily message counter reset
- **Statistics Tracking**: Comprehensive user stats and analytics

#### Contract Functions:
- `sendMessage()` - Send message and earn 1 LPX reward
- `getUserStats()` - View user statistics and earnings
- `remainingRewards()` - Check remaining messages for today
- `canSendMessage()` - Verify if user can send message
- `getAllMessages()` - View all chat messages
- `getMessagesPaginated()` - Paginated message viewing

---

## 🎭 Genesis NFT Collection

### HUB Ecosystem Genesis NFT
- **Contract:** `0xdAf7B15f939F6a8faf87d338010867883AAB366a`
- **Purpose:** Exclusive access to enhanced rewards
- **Benefits:**
  - 10x daily USDC rewards (0.11 vs 0.01)
  - Priority access to new features
  - Future ecosystem airdrop multipliers
  - VIP Discord roles
  - Special profile badges

#### NFT Utility:
- Automatic bonus detection in V2 rewards contract
- No additional steps required
- Permanent ownership benefits
- Transferable rewards access

---

## 💎 Token Ecosystems

### 🪙 HUB Token (Base Network)
- Name: HUB Ecosystem
- Symbol: HUB
- Standard: ERC20 + ERC677
- Total Supply: 10,000,000,000 HUB
- Contract: `0x58EFDe38eF2B12392BFB3dc4E503493C46636B3E`
- Utility:
  - Chat rewards
  - Subscriptions
  - Staking
  - Governance
  - Rewards pool funding
  - Genesis NFT bonus eligibility

### 💫 HC Token (Celo Network)
- Supply: 1,000,000 HC
- Utility: Chat mining and CELO streak access
- **Increased requirement**: 200 HC needed for CELO streaks (up from 100)

### 🔷 LPX Token (Linea Network)
- Name: Linea Prime
- Symbol: LPX
- Decimals: 18
- Total Supply: 1,000,000,000 LPX
- Utility: Linea network chat rewards with daily limits
- Features: Anti-spam protection, admin controls, on-chain messaging

### 🔶 MSG Token (Polygon Network)
- Name: Message Protocol
- Symbol: MSG
- Decimals: 18
- Total Supply: 1,000,000,000 MSG
- Initial Supply: 150,000,000 MSG (15% for ecosystem)
- Reward per Message: 1 MSG
- Daily Limit: 100 messages per user
- Message Length: 2-560 characters
- Utility: Polygon network chat rewards with advanced features
- Features: Gas-optimized light messages, comprehensive admin tools, full on-chain statistics

---

## 🏗️ Technical Architecture

### Base Network Contracts
- HUB Token
- HUB Chat Mining System
- HUB Multi-Tier Staking
- Genesis NFT Collection
- Daily GM USDC Streak System (GMHUBEcosystem)

### Celo Network Contracts
- HC Token
- Daily GM CELO Streak System (GMHUBEcosystem)

### Linea Network Contracts
- Linea Prime Token (LPX) - Chat Rewards System
- Daily GM mUSD Streak System

### Polygon Network Contracts
- Message Protocol Token (MSG) - Advanced Chat Rewards System with gas optimization
- Daily GM POL Streak System (GMHUBEcosystem)

---

## 🔥 Daily GM Streak System (All Networks)

### Unified Daily Streak Experience
HUB Portal now features **Daily GM Streak** across all 4 networks with enhanced GMHUBEcosystem contracts:

| Network | Token | Contract | Features |
|---------|-------|----------|----------|
| **Base** | USDC | `0x220160fad5f6f5c2Af2674469dD99e132759D9Ca` | Configurable fee (0.01-0.2 USDC), private collector |
| **Celo** | CELO | `0x5A2652Db9D2eb49C9c66f1952DD56ECd8ED915bc` | Configurable fee (0.1-10 CELO), private collector |
| **Linea** | mUSD | `0x4e4F31986aB5eCf851F5a5321eE83C501cd1D4a8` | Fixed fee, public prize pool |
| **Polygon** | POL (MATIC) | `0x12F9003d35e30D6Cec22C3E618CE4d4Cd87F8444` | Configurable fee (0.1-2 POL), private collector |

#### How Daily GM Streak Works:
1. **Connect Wallet** on supported network
2. **Send GM** to maintain your streak
3. **Track streak** on-chain (current & longest)

#### Key Benefits:
- Send your daily GM to keep your streak alive
- Streak continues if you GM within 24h window
- Miss 24h? Your streak resets to 1
- Longer streak = bigger rewards!

#### GMHUBEcosystem Contract Features (Base, Celo & Polygon):
- **Dynamic Fee Adjustment**: Owner can change GM fee within predefined limits
- **Private Fee Collector**: Enhanced privacy for fee collection
- **Full Ownership Control**: Transferable ownership with event tracking
- **Comprehensive Statistics**: Complete user streak and spending tracking
- **Emergency Functions**: Token withdrawal capabilities for contract owner

---

## 🌐 HUB Ecosystem Integration

HUB Portal is the flagship social application within the **HUB Ecosystem**.

- Multi-chain identity (Base, Celo, Linea, Polygon)
- NFT-integrated rewards
- Governance readiness
- Growing dApp suite
- HelloVote integration
- Future DeFi modules

[🌐 HUB Ecosystem Portal](https://hubecosystem.xyz/)

---

## 🚀 Live Applications
- **Main Application:** https://hub-portal-chat.vercel.app  
- **Farcaster Mini App:** https://farcaster.xyz/miniapps/7USxyPewQ2B8/hub-chat  

---

## 📄 License
MIT License

---

<div align="center">

**Building the Future of Social Web3** • **HUB Ecosystem** • **© 2025 Mysticpol**

[![Visit HUB Ecosystem](https://img.shields.io/badge/🌐_Visit_HUB_Ecosystem-00ff88?style=for-the-badge&logo=vercel)](https://hub-ecosystem.vercel.app)
[![Use HUB Chat](https://img.shields.io/badge/💬_Use_HUB_Chat-8844ff?style=for-the-badge)](https://hub-portal-chat.vercel.app)
[![Base Network](https://img.shields.io/badge/🌉_Base_Network-0052FF?style=for-the-badge)](https://base.org)
[![Celo Network](https://img.shields.io/badge/📱_Celo_Network-FCFF52?style=for-the-badge)](https://celo.org)
[![Linea Network](https://img.shields.io/badge/🔷_Linea_Network-61DBFB?style=for-the-badge)](https://linea.build)
[![Polygon Network](https://img.shields.io/badge/🔶_Polygon_Network-8247E5?style=for-the-badge)](https://polygon.technology)
[![Genesis NFT](https://img.shields.io/badge/🎭_Genesis_NFT-FF6B8B?style=for-the-badge)](https://opensea.io/collection/hub-ecosystem-genesis-nft)
[![Daily GM Streak](https://img.shields.io/badge/🔥_Daily_GM_Streak-FF6A00?style=for-the-badge)](https://hub-portal-chat.vercel.app)

</div>