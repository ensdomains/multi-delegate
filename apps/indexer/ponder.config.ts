import { createConfig } from '@ponder/core'
import { contractAddresses, erc20MultiDelegateAbi } from 'shared/contracts'
import { http } from 'viem'

const MAINNET_CHAIN_ID = 1
const TEST_CHAIN_ID = 31337 // This is for testing on the Tenderly fork

// Use the chain ID based on environment
const chainId = process.env.NODE_ENV === 'test' ? TEST_CHAIN_ID : MAINNET_CHAIN_ID

// Get contract config for the current chain
const contractConfig = contractAddresses.erc20MultiDelegate[MAINNET_CHAIN_ID]

export default createConfig({
  networks: {
    mainnet: {
      chainId, // Will be 31337 for testing, 1 for mainnet
      transport: http(process.env.PONDER_RPC_URL_1),
    },
  },
  contracts: {
    MultiDelegate: {
      network: 'mainnet',
      abi: erc20MultiDelegateAbi.abi,
      address: contractConfig.address,
      startBlock: contractConfig.deployedBlock,
    },
  },
})
