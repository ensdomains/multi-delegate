import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { REOWN_PROJECT_ID, RPC_URL } from './env'

if (!REOWN_PROJECT_ID) {
  throw new Error('REOWN_PROJECT_ID is not set')
}

const { connectors } = getDefaultWallets({
  appName: 'ENS Delegation Manager',
  projectId: REOWN_PROJECT_ID,
})

const chains = [mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(RPC_URL),
  },
})
