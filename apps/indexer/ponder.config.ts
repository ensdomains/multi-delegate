import { createConfig } from 'ponder'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { http } from 'viem'

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1,
    },
  },
  contracts: {
    MultiDelegate: {
      ...erc20MultiDelegateContract,
      chain: 'mainnet',
      startBlock: erc20MultiDelegateContract.deployedBock,
    },
  },
})
