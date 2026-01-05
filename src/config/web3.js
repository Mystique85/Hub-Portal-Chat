import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { celo, base, linea, polygon } from '@reown/appkit/networks'
import { http } from 'wagmi'

const projectId = "e67a3e08b76fbba39a1f1fe1bbe6d287"

const metadata = {
  name: 'HUB Chat',
  description: 'Decentralized Social Chat',
  url: 'https://hub-portal-chat.vercel.app',
  icons: ['https://hub-portal-chat.vercel.app/hublogo.svg']
}

const soneiumNetwork = {
  id: 1868,
  name: 'Soneium',
  network: 'soneium',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc.soneium.org'] },
    public: { http: ['https://rpc.soneium.org'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://soneium.blockscout.com' },
  },
  testnet: false,
}

const arbitrumNetwork = {
  id: 42161,
  name: 'Arbitrum',
  network: 'arbitrum',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://arb1.arbitrum.io/rpc'] },
    public: { http: ['https://arb1.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  },
  testnet: false,
}

const monadNetwork = {
  id: 143, // Chain ID: 143 (0x8f)
  name: 'Monad',
  network: 'monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { 
      http: [
        'https://rpc.monad.xyz',
        'https://rpc1.monad.xyz',
        'https://rpc2.monad.xyz',
        'https://rpc3.monad.xyz',
        'https://rpc4.monad.xyz',
        'https://monad-mainnet.api.onfinality.io/public'
      ] 
    },
  },
  blockExplorers: {
    default: { name: 'MonadScan', url: 'https://monadscan.com' },
  },
  testnet: false,
}

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [celo, base, linea, polygon, soneiumNetwork, arbitrumNetwork, monadNetwork],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
    [linea.id]: http(),
    [polygon.id]: http(),
    [soneiumNetwork.id]: http('https://rpc.soneium.org'),
    [arbitrumNetwork.id]: http('https://arb1.arbitrum.io/rpc'),
    [monadNetwork.id]: http('https://rpc.monad.xyz'), // Możesz zmienić na inny RPC jeśli chcesz
  },
  ssr: false
})

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo, base, linea, polygon, soneiumNetwork, arbitrumNetwork, monadNetwork],
  projectId,
  metadata,
  enableMobileWalletLink: true,
  enableCoinbase: true,
  features: {
    analytics: true
  }
})

export const config = wagmiAdapter.wagmiConfig