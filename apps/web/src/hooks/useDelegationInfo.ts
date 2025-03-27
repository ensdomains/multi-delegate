import { useQuery } from '@tanstack/react-query'
import { ensTokenContract, erc20MultiDelegateContract } from 'shared/contracts'
import { Address, PublicClient, isAddress, toHex, zeroAddress } from 'viem'
import { usePublicClient } from 'wagmi'

import { PONDER_URL } from '../lib/env'
import { wagmiConfig } from '../lib/web3'

// TODO: this should probably be specified in the `indexer` package and imported here
export type DelegateApiResponse = {
  delegate: Address
  tokenId: string
  amount: string
}

export function useDelegationInfo(address?: Address | null) {
  const viemClient = usePublicClient({ config: wagmiConfig })

  return useQuery({
    queryKey: ['delegates', address],
    queryFn: async () => {
      if (!address || !isAddress(address)) {
        return {}
      }

      const multiDelegates = PONDER_URL
        ? await getDelegatesFromIndexer(address)
        : await getDelegatesFromEventLogs(viemClient, address)

      const [_delegateFromTokenContract, _balance, _allowance] =
        await viemClient.multicall({
          contracts: [
            {
              ...ensTokenContract,
              functionName: 'delegates',
              args: [address],
            },
            {
              ...ensTokenContract,
              functionName: 'balanceOf',
              args: [address],
            },
            {
              ...ensTokenContract,
              functionName: 'allowance',
              args: [address, erc20MultiDelegateContract.address],
            },
          ],
        })

      const delegateFromTokenContractWithEmpty =
        _delegateFromTokenContract?.result
      const delegateFromTokenContract =
        delegateFromTokenContractWithEmpty === zeroAddress
          ? null
          : delegateFromTokenContractWithEmpty
      const balance = _balance?.result
      const allowance = _allowance?.result

      return { multiDelegates, delegateFromTokenContract, balance, allowance }
    },
  })
}

async function getDelegatesFromIndexer(address: Address) {
  const response = await fetch(`${new URL(PONDER_URL).origin}/${address}`)
  const data = await response.json()

  if (data.error) {
    throw new Error(data.error)
  }

  return data as DelegateApiResponse[]
}

// This is better in some ways because it reads directly from an RPC, but
// will become increasingly slow as the age of the contract increases
async function getDelegatesFromEventLogs(
  client: PublicClient,
  address: Address
): Promise<DelegateApiResponse[]> {
  const transferBatchedLogs = await client.getLogs({
    address: erc20MultiDelegateContract.address,
    event: erc20MultiDelegateContract.abi[16],
    args: {
      to: address,
    },
    fromBlock: BigInt(erc20MultiDelegateContract.deployedBock),
    toBlock: 'latest',
  })

  const _transferSingleLogs = await client.getLogs({
    address: erc20MultiDelegateContract.address,
    event: erc20MultiDelegateContract.abi[17],
    args: {
      to: address,
    },
    fromBlock: BigInt(erc20MultiDelegateContract.deployedBock),
    toBlock: 'latest',
  })

  const transferSingleLogs = _transferSingleLogs
    .filter((log) => !!log.args.id)
    .map((log) => ({
      ...log,
      args: {
        ...log.args,
        ids: [log.args.id!],
      },
    }))

  const logs = [...transferBatchedLogs, ...transferSingleLogs]

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
