import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { celo, base, linea } from '@reown/appkit/networks'
import { http } from 'wagmi'

// Konfiguracja AppKit
const projectId = "e67a3e08b76fbba39a1f1fe1bbe6d287"

// METADATA dla deep linking
const metadata = {
  name: 'HUB Chat',
  description: 'Decentralized Social Chat',
  url: 'https://hub-portal-chat.vercel.app',
  icons: ['https://hub-portal-chat.vercel.app/hublogo.svg']
}

// Konfiguracja Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [celo, base, linea],
  transports: {
    [celo.id]: http(),
    [base.id]: http(),
    [linea.id]: http()
  },
  ssr: false
})

// Konfiguracja AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [celo, base, linea],
  projectId,
  metadata,
  enableMobileWalletLink: true,
  enableCoinbase: true,
  features: {
    analytics: true
  }
})

// Eksportujemy konfigurację Wagmi
export const config = wagmiAdapter.wagmiConfig