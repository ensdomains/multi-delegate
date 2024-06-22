import { useQuery } from '@tanstack/react-query'
import { erc20MultiDelegateContract } from 'shared/contracts'
import { Address, PublicClient, isAddress, toHex } from 'viem'
import { usePublicClient } from 'wagmi'

import { PONDER_URL } from '../lib/env'
import { wagmiConfig } from '../lib/web3'

// TODO: this should probably be specified in the `indexer` package and imported here
type DelegateApiResponse = {
  delegate: Address
  tokenId: string
  amount: string
}

export function useDelegates(address?: Address | null) {
  const viemClient = usePublicClient({ config: wagmiConfig })

  return useQuery<DelegateApiResponse[]>({
    queryKey: ['delegates', address],
    queryFn: async () => {
      if (!address || !isAddress(address)) return

      if (PONDER_URL) {
        return getDelegatesFromIndexer(address)
      }

      return getDelegatesFromEventLogs(viemClient, address)
    },
  })
}

async function getDelegatesFromIndexer(address: Address) {
  // @ts-expect-error: This function is not called unless PONDER_URL is defined
  const response = await fetch(`${new URL(PONDER_URL).origin}/${address}`)
  const data = await response.json()

  if (data.error) {
    throw new Error(data.error)
  }

  return data
}

// This is better in some ways because it reads directly from an RPC, but
// will become increasingly slow as the age of the contract increases
async function getDelegatesFromEventLogs(
  client: PublicClient,
  address: Address
): Promise<DelegateApiResponse[]> {
  const logs = await client.getLogs({
    address: erc20MultiDelegateContract.address,
    event: erc20MultiDelegateContract.abi[5],
    args: {
      to: address,
    },
    fromBlock: BigInt(erc20MultiDelegateContract.deployedBock),
    toBlock: 'latest',
  })

  const _tokenIds = new Set(logs.map((log) => log.args.ids!).flat())
  const tokenIds = Array.from(_tokenIds)

  const balanceOf = await client.readContract({
    ...erc20MultiDelegateContract,
    functionName: 'balanceOfBatch',
    args: [new Array(tokenIds.length).fill(address), tokenIds],
  })

  const data = tokenIds.map((tokenId, index) => ({
    delegate: toHex(tokenId),
    tokenId: tokenId.toString(),
    amount: balanceOf[index].toString(),
  }))

  return data.filter((item) => item.amount !== '0')
}
