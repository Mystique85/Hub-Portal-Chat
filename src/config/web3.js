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

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [celo, base, linea, polygon],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
    [linea.id]: http(),
    [polygon.id]: http()
  },
  ssr: false
})

export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo, base, linea, polygon],
  projectId,
  metadata,
  enableMobileWalletLink: true,
  enableCoinbase: true,
  features: {
    analytics: true
  }
})

export const config = wagmiAdapter.wagmiConfig