import { useQuery } from '@tanstack/react-query'
import { createContractConfigs } from 'shared/contracts'
import { Address, PublicClient, isAddress, toHex, zeroAddress } from 'viem'
import { usePublicClient, useChainId } from 'wagmi'

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
  const chainId = useChainId()
  const contracts = createContractConfigs(chainId)

  return useQuery({
    queryKey: ['delegates', address, chainId],
    queryFn: async () => {
      if (!address || !isAddress(address)) {
        return {}
      }

      const multiDelegates = PONDER_URL
        ? await getDelegatesFromIndexer(address)
        : await getDelegatesFromEventLogs(viemClient, address, contracts)

      const [_delegateFromTokenContract, _balance, _allowance] =
        await viemClient.multicall({
          contracts: [
            {
              ...contracts.ensToken,
              functionName: 'delegates',
              args: [address],
            },
            {
              ...contracts.ensToken,
              functionName: 'balanceOf',
              args: [address],
            },
            {
              ...contracts.ensToken,
              functionName: 'allowance',
              args: [address, contracts.erc20MultiDelegate.address],
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
  // @ts-expect-error: This function is not called unless PONDER_URL is defined
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
  address: Address,
  contracts: ReturnType<typeof createContractConfigs>
): Promise<DelegateApiResponse[]> {
  const logs = await client.getLogs({
    address: contracts.erc20MultiDelegate.address,
    event: contracts.erc20MultiDelegate.abi[5],
    args: {
      to: address,
    },
    fromBlock: BigInt(contracts.erc20MultiDelegate.deployedBlock),
    toBlock: 'latest',
  })

  const _tokenIds = new Set(logs.map((log) => log.args.ids!).flat())
  const tokenIds = Array.from(_tokenIds)

  const balanceOf = await client.readContract({
    ...contracts.erc20MultiDelegate,
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
