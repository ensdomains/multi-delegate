import { createConfig } from '@ponder/core'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { http } from 'viem'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 31337, // This is for testing on the Tenderly fork. Will be `1` for mainnet.
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    MultiDelegate: {
      ...erc20MultiDelegateContract,
      network: 'mainnet',
      startBlock: 19520101,
    },
  },
})
