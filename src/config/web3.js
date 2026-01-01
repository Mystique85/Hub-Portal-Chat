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

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [celo, base, linea, polygon, soneiumNetwork, arbitrumNetwork],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
    [linea.id]: http(),
    [polygon.id]: http(),
    [soneiumNetwork.id]: http('https://rpc.soneium.org'),
    [arbitrumNetwork.id]: http('https://arb1.arbitrum.io/rpc'),
  },
  ssr: false
})

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo, base, linea, polygon, soneiumNetwork, arbitrumNetwork],
  projectId,
  metadata,
  enableMobileWalletLink: true,
  enableCoinbase: true,
  features: {
    analytics: true
  }
})

export const config = wagmiAdapter.wagmiConfig