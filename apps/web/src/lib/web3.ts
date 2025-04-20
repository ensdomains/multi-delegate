import { connectorsForWallets, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { frameWallet } from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { REOWN_PROJECT_ID, RPC_URL } from './env'

if (!REOWN_PROJECT_ID) {
  throw new Error('VITE_PUBLIC_REOWN_PROJECT_ID is not set')
}

const { wallets: defaultWallets } = getDefaultWallets({
  appName: 'ENS Delegation Manager',
  projectId: REOWN_PROJECT_ID,
})

const [firstGroup, ...otherGroups] = defaultWallets

const wallets = [
  {
    ...firstGroup,
    wallets: firstGroup.wallets.concat(frameWallet),
  },
  ...otherGroups,
]

const connectors = connectorsForWallets(wallets, {
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
