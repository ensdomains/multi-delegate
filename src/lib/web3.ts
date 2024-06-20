import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { RPC_URL } from './env'

const { connectors } = getDefaultWallets({
  appName: 'Multi-Delegate',
  projectId: 'd6c989fb5e87a19a4c3c14412d5a7672',
})

const chains = [mainnet] as const

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(RPC_URL),
  },
})
