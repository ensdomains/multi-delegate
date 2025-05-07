import { createConfig } from 'ponder'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { http } from 'viem'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    MultiDelegate: {
      ...erc20MultiDelegateContract,
      network: 'mainnet',
      startBlock: erc20MultiDelegateContract.deployedBock,
    },
  },
})
